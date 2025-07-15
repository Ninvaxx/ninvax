use std::collections::HashMap;
use std::fs;
use std::io::{self, Write};

use clap::Parser;

use serde::Deserialize;
use serde_json::Value;
use mlua::{Lua, LuaSerdeExt, Value as LuaValue};

#[derive(Deserialize, Debug)]
struct Graph {
    nodes: Vec<Node>,
}

#[derive(Deserialize, Debug)]
struct Node {
    id: String,
    #[serde(rename = "type")]
    node_type: String,
    #[serde(default)]
    inputs: HashMap<String, InputSpec>,
    #[serde(default)]
    variables: HashMap<String, InputSpec>,
    code: Option<String>,
    next: Option<String>,
    #[serde(default)]
    next_then: Option<String>,
    #[serde(default)]
    next_else: Option<String>,
    value: Option<Value>,
}

#[derive(Deserialize, Debug, Clone)]
#[serde(untagged)]
enum InputSpec {
    From { from: String },
    Value(Value),
}

impl Graph {
    fn from_file(path: &str) -> serde_json::Result<Self> {
        let data = fs::read_to_string(path).map_err(|e| serde_json::Error::io(e))?;
        serde_json::from_str(&data)
    }

    fn node_map(&self) -> HashMap<&str, &Node> {
        self.nodes.iter().map(|n| (n.id.as_str(), n)).collect()
    }
}

#[derive(Default)]
struct GraphContext {
    values: HashMap<String, Value>,
}

impl GraphContext {
    fn set(&mut self, key: &str, value: Value) {
        self.values.insert(key.to_string(), value);
    }

    fn get(&self, key: &str) -> Option<&Value> {
        self.values.get(key)
    }

    fn get_bool(&self, key: &str) -> Option<bool> {
        self.get(key).and_then(|v| v.as_bool())
    }
}

fn resolve_input(spec: &InputSpec, ctx: &GraphContext) -> Option<Value> {
    match spec {
        InputSpec::From { from } => ctx.get(from).cloned(),
        InputSpec::Value(v) => Some(v.clone()),
    }
}

fn run_graph(graph: &Graph, ctx: &mut GraphContext) {
    let map = graph.node_map();
    let mut current = graph
        .nodes
        .iter()
        .find(|n| n.node_type == "start");

    while let Some(node) = current {
        match node.node_type.as_str() {
            "start" => {
                current = node
                    .next
                    .as_deref()
                    .and_then(|n| map.get(n))
                    .copied();
            }
            "value" => {
                let val = node.value.clone().unwrap_or(Value::Null);
                ctx.set(&node.id, val.clone());
                current = node
                    .next
                    .as_deref()
                    .and_then(|n| map.get(n))
                    .copied();
            }
            "math:add" => {
                let a = node.inputs.get("a").and_then(|s| resolve_input(s, &ctx));
                let b = node.inputs.get("b").and_then(|s| resolve_input(s, &ctx));
                let a = a.and_then(|v| v.as_i64());
                let b = b.and_then(|v| v.as_i64());
                if let (Some(x), Some(y)) = (a, b) {
                    let sum = x + y;
                    println!("Add {} + {} = {}", x, y, sum);
                    ctx.set(&node.id, Value::from(sum));
                } else {
                    println!("Add node missing inputs");
                }
                current = node
                    .next
                    .as_deref()
                    .and_then(|n| map.get(n))
                    .copied();
            }
            "if" => {
                let cond = node.inputs.get("condition").and_then(|s| resolve_input(s, &ctx));
                let cond = cond.and_then(|v| v.as_bool()).unwrap_or(false);
                ctx.set(&node.id, Value::Bool(cond));
                let next_id = if cond {
                    node.next_then.as_deref()
                } else {
                    node.next_else.as_deref()
                };
                current = next_id.and_then(|n| map.get(n)).copied();
            }
            "print" => {
                if let Some(spec) = node.inputs.get("value") {
                    if let Some(v) = resolve_input(spec, &ctx) {
                        println!("Print: {}", v);
                    } else {
                        println!("Print: null");
                    }
                } else {
                    println!("Print node with no input");
                }
                current = node
                    .next
                    .as_deref()
                    .and_then(|n| map.get(n))
                    .copied();
            }
            "script:lua" => {
                let code = node.code.as_deref().unwrap_or("");
                let lua = Lua::new();
                {
                    let globals = lua.globals();
                    for (name, spec) in &node.variables {
                        if let Some(val) = resolve_input(spec, &ctx) {
                            if let Ok(lua_val) = lua.to_value(&val) {
                                let _ = globals.set(name.as_str(), lua_val);
                            }
                        }
                    }
                }
                let result = lua
                    .load(code)
                    .eval::<LuaValue>()
                    .unwrap_or(LuaValue::Nil);
                let json_val: Value = lua
                    .from_value(result)
                    .unwrap_or(Value::Null);
                ctx.set(&node.id, json_val);
                current = node
                    .next
                    .as_deref()
                    .and_then(|n| map.get(n))
                    .copied();
            }
            other => {
                println!("Unknown node type: {}", other);
                current = None;
            }
        }
    }
}

fn inspect(graph: &Option<Graph>, ctx: &GraphContext) {
    match graph {
        Some(g) => {
            println!("Graph nodes:");
            for n in &g.nodes {
                if let Some(v) = ctx.get(&n.id) {
                    println!("- {} ({}) => {}", n.id, n.node_type, v);
                } else {
                    println!("- {} ({})", n.id, n.node_type);
                }
            }
        }
        None => println!("No graph loaded"),
    }
}

fn repl() {
    let mut graph: Option<Graph> = None;
    let mut ctx = GraphContext::default();
    let stdin = io::stdin();
    loop {
        print!("repl> ");
        let _ = io::stdout().flush();
        let mut line = String::new();
        if stdin.read_line(&mut line).is_err() {
            println!("Error reading input");
            continue;
        }
        let trimmed = line.trim();
        if trimmed.is_empty() {
            continue;
        }
        let mut parts = trimmed.split_whitespace();
        let cmd = parts.next().unwrap_or("");
        match cmd {
            "load" => {
                if let Some(path) = parts.next() {
                    match Graph::from_file(path) {
                        Ok(g) => {
                            graph = Some(g);
                            ctx = GraphContext::default();
                            println!("Loaded {}", path);
                        }
                        Err(e) => println!("Error loading graph: {}", e),
                    }
                } else {
                    println!("Usage: load <file>");
                }
            }
            "run" => {
                if let Some(ref g) = graph {
                    run_graph(g, &mut ctx);
                } else {
                    println!("No graph loaded");
                }
            }
            "inspect" => {
                inspect(&graph, &ctx);
            }
            "set" => {
                let key = parts.next();
                let value_str = parts.collect::<Vec<_>>().join(" ");
                if let (Some(k), true) = (key, !value_str.is_empty()) {
                    match serde_json::from_str(&value_str) {
                        Ok(v) => {
                            ctx.set(k, v);
                            println!("Set {}", k);
                        }
                        Err(e) => println!("Failed to parse value: {}", e),
                    }
                } else {
                    println!("Usage: set <key> <json value>");
                }
            }
            "save" => {
                if let Some(path) = parts.next() {
                    match fs::write(path, serde_json::to_string_pretty(&ctx.values).unwrap_or_default()) {
                        Ok(_) => println!("Context saved to {}", path),
                        Err(e) => println!("Failed to save: {}", e),
                    }
                } else {
                    println!("Usage: save <file>");
                }
            }
            "exit" | "quit" => break,
            "help" => {
                println!("Commands: load <file>, run, inspect, set <key> <value>, save <file>, quit");
            }
            _ => println!("Unknown command"),
        }
    }
}

#[derive(Parser)]
struct Cli {
    /// Run in interactive REPL mode
    #[arg(long)]
    repl: bool,
    /// Graph json file to execute when not in REPL mode
    #[arg(default_value = "graph.json")]
    file: String,
}

fn main() {
    let cli = Cli::parse();
    if cli.repl {
        repl();
    } else {
        let graph = Graph::from_file(&cli.file).expect("failed to parse graph");
        let mut ctx = GraphContext::default();
        run_graph(&graph, &mut ctx);
    }
}

