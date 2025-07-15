use std::collections::HashMap;
use std::fs;

use serde::Deserialize;
use serde_json::Value;

// Trait for node execution
trait NodeExecutor {
    fn run(&self, node: &Node, ctx: &mut GraphContext, node_map: &HashMap<&str, &Node>) -> Option<String>;
}

// Registry for node executors
#[derive(Default)]
struct NodeRegistry {
    executors: HashMap<String, Box<dyn NodeExecutor>>,
    default_executor: Option<Box<dyn NodeExecutor>>,
}

impl NodeRegistry {
    fn new() -> Self {
        Self::default()
    }
    
    fn register<T: NodeExecutor + 'static>(&mut self, node_type: &str, executor: T) {
        self.executors.insert(node_type.to_string(), Box::new(executor));
    }
    
    fn set_default_executor<T: NodeExecutor + 'static>(&mut self, executor: T) {
        self.default_executor = Some(Box::new(executor));
    }
    
    fn get_executor(&self, node_type: &str) -> Option<&Box<dyn NodeExecutor>> {
        self.executors.get(node_type)
    }
    
    fn get_default_executor(&self) -> Option<&Box<dyn NodeExecutor>> {
        self.default_executor.as_ref()
    }
    
    fn create_default_registry() -> Self {
        let mut registry = NodeRegistry::new();
        registry.register("start", StartExecutor);
        registry.register("value", ValueExecutor);
        registry.register("math:add", MathAddExecutor);
        registry.register("if", IfExecutor);
        registry.register("print", PrintExecutor);
        registry.set_default_executor(DefaultExecutor);
        registry
    }
}

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
}

fn resolve_input(spec: &InputSpec, ctx: &GraphContext) -> Option<Value> {
    match spec {
        InputSpec::From { from } => ctx.get(from).cloned(),
        InputSpec::Value(v) => Some(v.clone()),
    }
}

// Node executor implementations
struct StartExecutor;
impl NodeExecutor for StartExecutor {
    fn run(&self, node: &Node, _ctx: &mut GraphContext, _node_map: &HashMap<&str, &Node>) -> Option<String> {
        node.next.clone()
    }
}

struct ValueExecutor;
impl NodeExecutor for ValueExecutor {
    fn run(&self, node: &Node, ctx: &mut GraphContext, _node_map: &HashMap<&str, &Node>) -> Option<String> {
        let val = node.value.clone().unwrap_or(Value::Null);
        ctx.set(&node.id, val);
        node.next.clone()
    }
}

struct MathAddExecutor;
impl NodeExecutor for MathAddExecutor {
    fn run(&self, node: &Node, ctx: &mut GraphContext, _node_map: &HashMap<&str, &Node>) -> Option<String> {
        let a = node.inputs.get("a").and_then(|s| resolve_input(s, ctx));
        let b = node.inputs.get("b").and_then(|s| resolve_input(s, ctx));
        let a = a.and_then(|v| v.as_i64());
        let b = b.and_then(|v| v.as_i64());
        if let (Some(x), Some(y)) = (a, b) {
            let sum = x + y;
            println!("Add {} + {} = {}", x, y, sum);
            ctx.set(&node.id, Value::from(sum));
        } else {
            println!("Add node missing inputs");
        }
        node.next.clone()
    }
}

struct IfExecutor;
impl NodeExecutor for IfExecutor {
    fn run(&self, node: &Node, ctx: &mut GraphContext, _node_map: &HashMap<&str, &Node>) -> Option<String> {
        let cond = node.inputs.get("condition").and_then(|s| resolve_input(s, ctx));
        let cond = cond.and_then(|v| v.as_bool()).unwrap_or(false);
        ctx.set(&node.id, Value::Bool(cond));
        if cond {
            node.next_then.clone()
        } else {
            node.next_else.clone()
        }
    }
}

struct PrintExecutor;
impl NodeExecutor for PrintExecutor {
    fn run(&self, node: &Node, ctx: &mut GraphContext, _node_map: &HashMap<&str, &Node>) -> Option<String> {
        if let Some(spec) = node.inputs.get("value") {
            if let Some(v) = resolve_input(spec, ctx) {
                println!("Print: {}", v);
            } else {
                println!("Print: null");
            }
        } else {
            println!("Print node with no input");
        }
        node.next.clone()
    }
}

// Default fallback executor for unknown node types
struct DefaultExecutor;
impl NodeExecutor for DefaultExecutor {
    fn run(&self, node: &Node, _ctx: &mut GraphContext, _node_map: &HashMap<&str, &Node>) -> Option<String> {
        println!("Unknown node type: {}", node.node_type);
        None
    }
}

fn run_graph(graph: &Graph) {
    let map = graph.node_map();
    let mut ctx = GraphContext::default();
    
    // Create registry with default node types
    let registry = NodeRegistry::create_default_registry();
    
    let mut current = graph
        .nodes
        .iter()
        .find(|n| n.node_type == "start");

    while let Some(node) = current {
        let next_id = if let Some(executor) = registry.get_executor(&node.node_type) {
            executor.run(node, &mut ctx, &map)
        } else if let Some(default_executor) = registry.get_default_executor() {
            default_executor.run(node, &mut ctx, &map)
        } else {
            println!("No executor found for node type: {}", node.node_type);
            None
        };
        
        current = next_id.as_deref()
            .and_then(|n| map.get(n))
            .copied();
    }
}

fn main() {
    let graph = Graph::from_file("graph.json").expect("failed to parse graph");
    run_graph(&graph);
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    // Custom test node executor
    struct TestExecutor;
    impl NodeExecutor for TestExecutor {
        fn run(&self, node: &Node, ctx: &mut GraphContext, _node_map: &HashMap<&str, &Node>) -> Option<String> {
            // Test node that doubles the input value
            if let Some(spec) = node.inputs.get("value") {
                if let Some(v) = resolve_input(spec, ctx) {
                    if let Some(num) = v.as_i64() {
                        let result = num * 2;
                        ctx.set(&node.id, Value::from(result));
                        return node.next.clone();
                    }
                }
            }
            ctx.set(&node.id, Value::Null);
            node.next.clone()
        }
    }

    #[test]
    fn test_registry_basic_functionality() {
        let mut registry = NodeRegistry::new();
        registry.register("test", TestExecutor);
        
        // Verify the executor is registered
        assert!(registry.get_executor("test").is_some());
        assert!(registry.get_executor("nonexistent").is_none());
    }

    #[test]
    fn test_custom_node_execution() {
        let mut registry = NodeRegistry::new();
        registry.register("test", TestExecutor);
        
        let node = Node {
            id: "test_node".to_string(),
            node_type: "test".to_string(),
            inputs: vec![("value".to_string(), InputSpec::Value(json!(5)))].into_iter().collect(),
            next: None,
            next_then: None,
            next_else: None,
            value: None,
        };
        
        let mut ctx = GraphContext::default();
        let map = HashMap::new();
        
        let executor = registry.get_executor("test").unwrap();
        executor.run(&node, &mut ctx, &map);
        
        // Test node should double the input (5 * 2 = 10)
        assert_eq!(ctx.get("test_node"), Some(&json!(10)));
    }

    #[test]
    fn test_default_fallback_executor() {
        let default_executor = DefaultExecutor;
        
        let node = Node {
            id: "unknown_node".to_string(),
            node_type: "unknown".to_string(),
            inputs: HashMap::new(),
            next: None,
            next_then: None,
            next_else: None,
            value: None,
        };
        
        let mut ctx = GraphContext::default();
        let map = HashMap::new();
        
        let result = default_executor.run(&node, &mut ctx, &map);
        assert_eq!(result, None);
    }

    #[test]
    fn test_existing_node_types() {
        let mut registry = NodeRegistry::new();
        registry.register("math:add", MathAddExecutor);
        registry.register("print", PrintExecutor);
        
        // Test math:add executor
        let add_node = Node {
            id: "add_test".to_string(),
            node_type: "math:add".to_string(),
            inputs: vec![
                ("a".to_string(), InputSpec::Value(json!(3))),
                ("b".to_string(), InputSpec::Value(json!(5))),
            ].into_iter().collect(),
            next: None,
            next_then: None,
            next_else: None,
            value: None,
        };
        
        let mut ctx = GraphContext::default();
        let map = HashMap::new();
        
        let executor = registry.get_executor("math:add").unwrap();
        executor.run(&add_node, &mut ctx, &map);
        
        // Should compute 3 + 5 = 8
        assert_eq!(ctx.get("add_test"), Some(&json!(8)));
    }

    #[test]
    fn test_runtime_registration() {
        let mut registry = NodeRegistry::new();
        
        // Verify initially empty
        assert!(registry.get_executor("custom").is_none());
        
        // Register at runtime
        registry.register("custom", TestExecutor);
        
        // Verify now registered
        assert!(registry.get_executor("custom").is_some());
    }

    #[test]
    fn test_math_subtract_node() {
        // Example of how to add a new node type at runtime
        struct MathSubtractExecutor;
        impl NodeExecutor for MathSubtractExecutor {
            fn run(&self, node: &Node, ctx: &mut GraphContext, _node_map: &HashMap<&str, &Node>) -> Option<String> {
                let a = node.inputs.get("a").and_then(|s| resolve_input(s, ctx));
                let b = node.inputs.get("b").and_then(|s| resolve_input(s, ctx));
                let a = a.and_then(|v| v.as_i64());
                let b = b.and_then(|v| v.as_i64());
                if let (Some(x), Some(y)) = (a, b) {
                    let result = x - y;
                    ctx.set(&node.id, Value::from(result));
                } else {
                    ctx.set(&node.id, Value::Null);
                }
                node.next.clone()
            }
        }
        
        let mut registry = NodeRegistry::new();
        registry.register("math:subtract", MathSubtractExecutor);
        
        let node = Node {
            id: "subtract_test".to_string(),
            node_type: "math:subtract".to_string(),
            inputs: vec![
                ("a".to_string(), InputSpec::Value(json!(10))),
                ("b".to_string(), InputSpec::Value(json!(3))),
            ].into_iter().collect(),
            next: None,
            next_then: None,
            next_else: None,
            value: None,
        };
        
        let mut ctx = GraphContext::default();
        let map = HashMap::new();
        
        let executor = registry.get_executor("math:subtract").unwrap();
        executor.run(&node, &mut ctx, &map);
        
        // Should compute 10 - 3 = 7
        assert_eq!(ctx.get("subtract_test"), Some(&json!(7)));
    }
    
    #[test]
    fn test_default_registry_creation() {
        let registry = NodeRegistry::create_default_registry();
        
        // Verify all default node types are registered
        assert!(registry.get_executor("start").is_some());
        assert!(registry.get_executor("value").is_some());
        assert!(registry.get_executor("math:add").is_some());
        assert!(registry.get_executor("if").is_some());
        assert!(registry.get_executor("print").is_some());
        
        // Verify default executor is set
        assert!(registry.get_default_executor().is_some());
    }
}

