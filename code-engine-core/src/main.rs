use std::collections::HashMap;
use std::fs;

use serde::Deserialize;
use serde_json::Value;

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
    next: Option<String>,
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
        let data = fs::read_to_string(path)?;
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
}

fn resolve_input(spec: &InputSpec, ctx: &GraphContext) -> Option<Value> {
    match spec {
        InputSpec::From { from } => ctx.get(from).cloned(),
        InputSpec::Value(v) => Some(v.clone()),
    }
}

fn run_graph(graph: &Graph) {
    let map = graph.node_map();
    let mut ctx = GraphContext::default();
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
            other => {
                println!("Unknown node type: {}", other);
                current = None;
            }
        }
    }
}

fn main() {
    let graph = Graph::from_file("graph.json").expect("failed to parse graph");
    run_graph(&graph);
}

