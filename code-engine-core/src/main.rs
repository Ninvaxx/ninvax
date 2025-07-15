use std::collections::HashMap;
use std::fs;

use serde::Deserialize;

#[derive(Deserialize, Debug)]
struct Graph {
    nodes: Vec<Node>,
}

#[derive(Deserialize, Debug)]
struct Node {
    id: String,
    #[serde(flatten)]
    kind: NodeKind,
}

#[derive(Deserialize, Debug)]
#[serde(tag = "type")]
enum NodeKind {
    #[serde(rename = "start")]
    Start { next: String },
    #[serde(rename = "print")]
    Print { next: Option<String> },
    #[serde(rename = "math:add")]
    MathAdd { inputs: Vec<i64>, next: String },
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

fn run_graph(graph: &Graph) {
    let map = graph.node_map();
    // find start node
    let mut current = graph.nodes.iter().find(|n| matches!(n.kind, NodeKind::Start { .. }));
    let mut value: Option<i64> = None;

    while let Some(node) = current {
        match &node.kind {
            NodeKind::Start { next } => {
                println!("Start -> {}", next);
                current = map.get(next.as_str()).copied();
            }
            NodeKind::MathAdd { inputs, next } => {
                let sum: i64 = inputs.iter().sum();
                println!("Add {:?} = {}", inputs, sum);
                value = Some(sum);
                current = map.get(next.as_str()).copied();
            }
            NodeKind::Print { next } => {
                if let Some(v) = value {
                    println!("Print: {}", v);
                } else {
                    println!("Print node with no value");
                }
                current = next.as_deref().and_then(|n| map.get(n)).copied();
            }
        }
    }
}

fn main() {
    let graph = Graph::from_file("graph.json").expect("failed to parse graph");
    run_graph(&graph);
}

