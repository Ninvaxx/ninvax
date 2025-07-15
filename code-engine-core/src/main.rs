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
    #[serde(default)]
    count: Option<i64>,
    #[serde(default)]
    ticks: Option<i64>,
    #[serde(default)]
    next_body: Option<String>,
    #[serde(default)]
    next_exit: Option<String>,
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

use std::collections::VecDeque;

struct Engine {
    graph: Graph,
    ctx: GraphContext,
    map: HashMap<String, usize>,
    current: Option<String>,
    loop_state: HashMap<String, i64>,
    delay_queue: Vec<(i64, String)>,
    ready: VecDeque<String>,
    tick: u64,
}

impl Engine {
    fn new(graph: Graph) -> Self {
        let map = graph
            .nodes
            .iter()
            .enumerate()
            .map(|(i, n)| (n.id.clone(), i))
            .collect();
        let current = graph
            .nodes
            .iter()
            .find(|n| n.node_type == "start")
            .map(|n| n.id.clone());
        Engine {
            graph,
            ctx: GraphContext::default(),
            map,
            current,
            loop_state: HashMap::new(),
            delay_queue: Vec::new(),
            ready: VecDeque::new(),
            tick: 0,
        }
    }

    fn with_context(graph: Graph, ctx: GraphContext) -> Self {
        let mut eng = Engine::new(graph);
        eng.ctx = ctx;
        eng
    }

    fn get_node(&self, id: &str) -> Option<&Node> {
        self.map.get(id).and_then(|&i| self.graph.nodes.get(i))
    }

    fn process_node(&mut self, id: String) -> bool {
        let node = match self.get_node(&id) {
            Some(n) => n,
            None => return false,
        };
        match node.node_type.as_str() {
            "start" => {
                self.current = node.next.clone();
            }
            "value" => {
                let val = node.value.clone().unwrap_or(Value::Null);
                self.ctx.set(&node.id, val);
                self.current = node.next.clone();
            }
            "math:add" => {
                let a = node.inputs.get("a").and_then(|s| resolve_input(s, &self.ctx));
                let b = node.inputs.get("b").and_then(|s| resolve_input(s, &self.ctx));
                let a = a.and_then(|v| v.as_i64());
                let b = b.and_then(|v| v.as_i64());
                if let (Some(x), Some(y)) = (a, b) {
                    let sum = x + y;
                    println!("[tick {}] Add {} + {} = {}", self.tick, x, y, sum);
                    self.ctx.set(&node.id, Value::from(sum));
                } else {
                    println!("[tick {}] Add node missing inputs", self.tick);
                }
                self.current = node.next.clone();
            }
            "if" => {
                let cond = node.inputs.get("condition").and_then(|s| resolve_input(s, &self.ctx));
                let cond = cond.and_then(|v| v.as_bool()).unwrap_or(false);
                self.ctx.set(&node.id, Value::Bool(cond));
                let next_id = if cond { node.next_then.as_deref() } else { node.next_else.as_deref() };
                self.current = next_id.map(|s| s.to_string());
            }
            "print" => {
                if let Some(spec) = node.inputs.get("value") {
                    if let Some(v) = resolve_input(spec, &self.ctx) {
                        println!("[tick {}] Print: {}", self.tick, v);
                    } else {
                        println!("[tick {}] Print: null", self.tick);
                    }
                } else {
                    println!("[tick {}] Print node with no input", self.tick);
                }
                self.current = node.next.clone();
            }
            "script:lua" => {
                let code = node.code.as_deref().unwrap_or("");
                let lua = Lua::new();
                {
                    let globals = lua.globals();
                    for (name, spec) in &node.variables {
                        if let Some(val) = resolve_input(spec, &self.ctx) {
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
                self.ctx.set(&node.id, json_val);
                self.current = node.next.clone();
            }
            "delay" => {
                let ticks = node.ticks.unwrap_or(0);
                if let Some(next) = node.next.clone() {
                    self.delay_queue.push((ticks, next));
                }
                self.current = None;
                return false;
            }
            "loop" => {
                let total = node.count.unwrap_or(0);
                let entry = self.loop_state.entry(node.id.clone()).or_insert(total);
                if *entry > 0 {
                    *entry -= 1;
                    self.current = node.next_body.clone();
                } else {
                    self.loop_state.remove(&node.id);
                    self.current = node.next_exit.clone();
                }
            }
            other => {
                println!("[tick {}] Unknown node type: {}", self.tick, other);
                self.current = None;
            }
        }
        true
    }

    fn tick(&mut self) -> bool {
        self.tick += 1;
        // update delay queue
        let mut ready = Vec::new();
        for i in 0..self.delay_queue.len() {
            if self.delay_queue[i].0 > 0 {
                self.delay_queue[i].0 -= 1;
            }
            if self.delay_queue[i].0 <= 0 {
                ready.push(i);
            }
        }
        // extract ready nodes in reverse order
        for idx in ready.into_iter().rev() {
            let (_t, id) = self.delay_queue.remove(idx);
            self.ready.push_back(id);
        }

        if self.current.is_none() {
            if let Some(id) = self.ready.pop_front() {
                self.current = Some(id);
            }
        }

        while let Some(id) = self.current.clone() {
            if !self.process_node(id) {
                break;
            }
            if self.current.is_none() {
                if let Some(next_id) = self.ready.pop_front() {
                    self.current = Some(next_id);
                }
            }
        }

        self.current.is_some() || !self.delay_queue.is_empty() || !self.ready.is_empty()
    }

    fn run(&mut self) {
        while self.tick() {}
    }
}

fn inspect(engine: &Option<Engine>) {
    match engine {
        Some(e) => {
            println!("Graph nodes:");
            for n in &e.graph.nodes {
                if let Some(v) = e.ctx.get(&n.id) {
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
    let mut engine: Option<Engine> = None;
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
                            engine = Some(Engine::new(g));
                            println!("Loaded {}", path);
                        }
                        Err(e) => println!("Error loading graph: {}", e),
                    }
                } else {
                    println!("Usage: load <file>");
                }
            }
            "run" => {
                if let Some(e) = engine.as_mut() {
                    e.run();
                } else {
                    println!("No graph loaded");
                }
            }
            "tick" => {
                if let Some(e) = engine.as_mut() {
                    if !e.tick() {
                        println!("Graph finished");
                    }
                } else {
                    println!("No graph loaded");
                }
            }
            "inspect" => {
                inspect(&engine);
            }
            "set" => {
                let key = parts.next();
                let value_str = parts.collect::<Vec<_>>().join(" ");
                if let Some(e) = engine.as_mut() {
                    if let (Some(k), true) = (key, !value_str.is_empty()) {
                        match serde_json::from_str(&value_str) {
                            Ok(v) => {
                                e.ctx.set(k, v);
                                println!("Set {}", k);
                            }
                            Err(e2) => println!("Failed to parse value: {}", e2),
                        }
                    } else {
                        println!("Usage: set <key> <json value>");
                    }
                } else {
                    println!("No graph loaded");
                }
            }
            "save" => {
                if let Some(path) = parts.next() {
                    if let Some(e) = &engine {
                        match fs::write(path, serde_json::to_string_pretty(&e.ctx.values).unwrap_or_default()) {
                            Ok(_) => println!("Context saved to {}", path),
                            Err(e2) => println!("Failed to save: {}", e2),
                        }
                    } else {
                        println!("No graph loaded");
                    }
                } else {
                    println!("Usage: save <file>");
                }
            }
            "exit" | "quit" => break,
            "help" => {
                println!("Commands: load <file>, run, tick, inspect, set <key> <value>, save <file>, quit");
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
        let mut engine = Engine::new(graph);
        engine.run();
    }
}

