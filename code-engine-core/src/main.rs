use std::collections::HashMap;
use std::fs;
use std::io::{self, Write};

use serde::{Deserialize, Serialize};
use serde_json::Value;
use mlua::{Lua, LuaSerdeExt, Value as LuaValue};
use clap::Parser;

#[derive(Deserialize, Serialize, Debug)]
struct Graph {
    nodes: Vec<Node>,
}

#[derive(Deserialize, Serialize, Debug)]
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

#[derive(Deserialize, Serialize, Debug, Clone)]
#[serde(untagged)]
enum InputSpec {
    From { from: String },
    Value(Value),
}

impl Graph {
    fn from_file(path: &str) -> Result<Self, String> {
        let data = fs::read_to_string(path)
            .map_err(|e| format!("Failed to read file '{}': {}", path, e))?;
        serde_json::from_str(&data)
            .map_err(|e| format!("Failed to parse JSON: {}", e))
    }

    fn save_to_file(&self, path: &str) -> Result<(), String> {
        let data = serde_json::to_string_pretty(self)
            .map_err(|e| format!("Failed to serialize graph: {}", e))?;
        fs::write(path, data)
            .map_err(|e| format!("Failed to write file '{}': {}", path, e))
    }

    fn node_map(&self) -> HashMap<&str, &Node> {
        self.nodes.iter().map(|n| (n.id.as_str(), n)).collect()
    }

    fn get_node_by_id(&self, id: &str) -> Option<&Node> {
        self.nodes.iter().find(|n| n.id == id)
    }

    fn get_node_by_id_mut(&mut self, id: &str) -> Option<&mut Node> {
        self.nodes.iter_mut().find(|n| n.id == id)
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

fn run_graph(graph: &Graph) -> Result<(), String> {
    let map = graph.node_map();
    let mut ctx = GraphContext::default();
    run_graph_with_context(graph, &map, &mut ctx)
}

fn run_graph_with_context(graph: &Graph, map: &HashMap<&str, &Node>, ctx: &mut GraphContext) -> Result<(), String> {
    let mut current = graph
        .nodes
        .iter()
        .find(|n| n.node_type == "start");

    while let Some(node) = current {
        match node.node_type.as_str() {
            "start" => {
                println!("Starting execution from node: {}", node.id);
                current = node
                    .next
                    .as_deref()
                    .and_then(|n| map.get(n))
                    .copied();
            }
            "value" => {
                let val = node.value.clone().unwrap_or(Value::Null);
                println!("Setting value '{}' = {}", node.id, val);
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
                println!("If condition: {}", cond);
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
                println!("Running Lua script: {}", code);
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
                println!("Lua result: {}", json_val);
                ctx.set(&node.id, json_val);
                current = node
                    .next
                    .as_deref()
                    .and_then(|n| map.get(n))
                    .copied();
            }
            other => {
                return Err(format!("Unknown node type: {}", other));
            }
        }
    }
    Ok(())
}

#[derive(Parser)]
#[command(name = "code-engine-core")]
#[command(about = "A node-based code execution engine")]
struct Args {
    /// Start in interactive REPL mode
    #[arg(long)]
    repl: bool,

    /// Graph file to load (default: graph.json)
    #[arg(short, long, default_value = "graph.json")]
    file: String,
}

#[derive(Debug)]
enum ReplCommand {
    Load(String),
    Run,
    Inspect,
    SetInput(String, Value),
    Save(String),
    Help,
    Quit,
}

struct ReplState {
    graph: Option<Graph>,
    context: GraphContext,
}

impl ReplState {
    fn new() -> Self {
        ReplState {
            graph: None,
            context: GraphContext::default(),
        }
    }

    fn load_graph(&mut self, path: &str) -> Result<(), String> {
        let graph = Graph::from_file(path)?;
        println!("Loaded graph with {} nodes", graph.nodes.len());
        self.graph = Some(graph);
        self.context = GraphContext::default();
        Ok(())
    }

    fn run_graph(&mut self) -> Result<(), String> {
        match &self.graph {
            Some(graph) => {
                let map = graph.node_map();
                run_graph_with_context(graph, &map, &mut self.context)
            }
            None => Err("No graph loaded. Use 'load <filename>' first.".to_string()),
        }
    }

    fn inspect(&self) -> Result<(), String> {
        match &self.graph {
            Some(graph) => {
                println!("Graph structure:");
                for node in &graph.nodes {
                    println!("  Node '{}' (type: {})", node.id, node.node_type);
                    if !node.inputs.is_empty() {
                        println!("    Inputs:");
                        for (key, input) in &node.inputs {
                            match input {
                                InputSpec::From { from } => println!("      {}: from '{}'", key, from),
                                InputSpec::Value(val) => println!("      {}: value {}", key, val),
                            }
                        }
                    }
                    if let Some(next) = &node.next {
                        println!("    Next: {}", next);
                    }
                    if let Some(next_then) = &node.next_then {
                        println!("    Next (then): {}", next_then);
                    }
                    if let Some(next_else) = &node.next_else {
                        println!("    Next (else): {}", next_else);
                    }
                }
                
                println!("\nContext state:");
                if self.context.values.is_empty() {
                    println!("  No values set");
                } else {
                    for (key, value) in &self.context.values {
                        println!("  {}: {}", key, value);
                    }
                }
                Ok(())
            }
            None => Err("No graph loaded. Use 'load <filename>' first.".to_string()),
        }
    }

    fn set_input(&mut self, name: &str, value: Value) -> Result<(), String> {
        match &mut self.graph {
            Some(graph) => {
                if let Some(node) = graph.get_node_by_id_mut(name) {
                    node.value = Some(value.clone());
                    println!("Set node '{}' value to {}", name, value);
                    Ok(())
                } else {
                    // Set it in context instead
                    self.context.set(name, value.clone());
                    println!("Set context value '{}' to {}", name, value);
                    Ok(())
                }
            }
            None => Err("No graph loaded. Use 'load <filename>' first.".to_string()),
        }
    }

    fn save_graph(&self, path: &str) -> Result<(), String> {
        match &self.graph {
            Some(graph) => {
                graph.save_to_file(path)?;
                println!("Saved graph to '{}'", path);
                Ok(())
            }
            None => Err("No graph loaded. Use 'load <filename>' first.".to_string()),
        }
    }
}

fn parse_repl_command(line: &str) -> Result<ReplCommand, String> {
    let parts: Vec<&str> = line.trim().split_whitespace().collect();
    if parts.is_empty() {
        return Err("Empty command".to_string());
    }

    match parts[0] {
        "load" => {
            if parts.len() != 2 {
                return Err("Usage: load <filename>".to_string());
            }
            Ok(ReplCommand::Load(parts[1].to_string()))
        }
        "run" => {
            if parts.len() != 1 {
                return Err("Usage: run".to_string());
            }
            Ok(ReplCommand::Run)
        }
        "inspect" => {
            if parts.len() != 1 {
                return Err("Usage: inspect".to_string());
            }
            Ok(ReplCommand::Inspect)
        }
        "set" => {
            if parts.len() < 4 || parts[1] != "input" {
                return Err("Usage: set input <name> <value>".to_string());
            }
            let name = parts[2].to_string();
            let value_str = parts[3..].join(" ");
            
            // Try to parse as different types
            let value = if let Ok(num) = value_str.parse::<i64>() {
                Value::Number(num.into())
            } else if let Ok(num) = value_str.parse::<f64>() {
                Value::Number(serde_json::Number::from_f64(num).unwrap_or(0.into()))
            } else if let Ok(bool_val) = value_str.parse::<bool>() {
                Value::Bool(bool_val)
            } else if value_str == "null" {
                Value::Null
            } else {
                Value::String(value_str)
            };
            
            Ok(ReplCommand::SetInput(name, value))
        }
        "save" => {
            if parts.len() != 2 {
                return Err("Usage: save <filename>".to_string());
            }
            Ok(ReplCommand::Save(parts[1].to_string()))
        }
        "help" => Ok(ReplCommand::Help),
        "quit" | "exit" => Ok(ReplCommand::Quit),
        _ => Err(format!("Unknown command: {}", parts[0])),
    }
}

fn print_help() {
    println!("Available commands:");
    println!("  load <filename>      - Load a graph from JSON file");
    println!("  run                  - Execute the current graph");
    println!("  inspect              - Show graph structure and current state");
    println!("  set input <name> <value> - Set a node or context value");
    println!("  save <filename>      - Save current graph to JSON file");
    println!("  help                 - Show this help message");
    println!("  quit, exit           - Exit the REPL");
}

fn run_repl() -> Result<(), String> {
    let mut state = ReplState::new();
    
    println!("=== Code Engine Interactive Shell ===");
    println!("Type 'help' for available commands.");
    
    loop {
        print!(">> ");
        io::stdout().flush().unwrap();
        
        let mut line = String::new();
        if io::stdin().read_line(&mut line).is_err() {
            break;
        }
        
        let line = line.trim();
        if line.is_empty() {
            continue;
        }
        
        match parse_repl_command(line) {
            Ok(ReplCommand::Load(file)) => {
                if let Err(e) = state.load_graph(&file) {
                    println!("Error: {}", e);
                }
            }
            Ok(ReplCommand::Run) => {
                if let Err(e) = state.run_graph() {
                    println!("Error: {}", e);
                }
            }
            Ok(ReplCommand::Inspect) => {
                if let Err(e) = state.inspect() {
                    println!("Error: {}", e);
                }
            }
            Ok(ReplCommand::SetInput(name, value)) => {
                if let Err(e) = state.set_input(&name, value) {
                    println!("Error: {}", e);
                }
            }
            Ok(ReplCommand::Save(file)) => {
                if let Err(e) = state.save_graph(&file) {
                    println!("Error: {}", e);
                }
            }
            Ok(ReplCommand::Help) => {
                print_help();
            }
            Ok(ReplCommand::Quit) => {
                println!("Goodbye!");
                break;
            }
            Err(e) => {
                println!("Error: {}", e);
            }
        }
    }
    
    Ok(())
}

fn main() {
    let args = Args::parse();
    
    if args.repl {
        if let Err(e) = run_repl() {
            eprintln!("REPL error: {}", e);
            std::process::exit(1);
        }
    } else {
        match Graph::from_file(&args.file) {
            Ok(graph) => {
                if let Err(e) = run_graph(&graph) {
                    eprintln!("Execution error: {}", e);
                    std::process::exit(1);
                }
            }
            Err(e) => {
                eprintln!("Error loading graph: {}", e);
                std::process::exit(1);
            }
        }
    }
}

