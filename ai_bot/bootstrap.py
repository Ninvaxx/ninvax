"""Entry point for the modular AI bot framework."""

from pathlib import Path
import yaml

from brain.thoughts import log_thought
from tools.code_tester import run_tests
from brain.recursive_planner import (
    PROPOSAL_DIFF,
    PROPOSAL_PY,
    propose_self_update,
)
from tools.code_reviewer import review_update

from inputs.web_scraper import scrape_site
from brain.planner import plan
from brain.plugin_manager import PluginManager
from tools.code_writer import write_file
from tools.evaluate import evaluate_thoughts

CONFIG_FILE = Path(__file__).with_name("core_config.yaml")


def load_config() -> dict:
    if CONFIG_FILE.exists():
        return yaml.safe_load(CONFIG_FILE.read_text()) or {}
    return {}


def main() -> None:
    config = load_config()
    plugin_mgr = PluginManager(config)
    testing_enabled = config.get("testing_enabled", True)
    log_thoughts = config.get("log_thoughts", False)
    auto_evaluate = config.get("auto_evaluate", False)
    enable_recursive_planning = config.get("enable_recursive_planning", False)
    allow_self_rewrites = config.get("allow_self_rewrites", False)
    url = config.get("start_url", "https://example.com")
    data = scrape_site(url)
    if log_thoughts:
        log_thought(f"Scraped data from {url}\n\n{data}", tag="scrape")
    action_plan = plan(data, config={"enable_recursive_planning": enable_recursive_planning})
    if log_thoughts:
        log_thought(str(action_plan), tag="plan")

    plugin_results = plugin_mgr.check_all()
    for name, pdata in plugin_results.items():
        if not pdata:
            continue
        if log_thoughts:
            log_thought(str(pdata), tag=f"plugin_{name}")
        plugin_plan = plan(str(pdata), config={"enable_recursive_planning": enable_recursive_planning})
        if log_thoughts:
            log_thought(str(plugin_plan), tag=f"plan_{name}")
        if plugin_plan.get("action") == "write_code":
            output_path = Path(__file__).with_name(f"{name}_output.txt")
            content = plugin_plan.get("content", "")
            write_file(output_path, content)
            print(f"Wrote plan output to {output_path}")
            if log_thoughts:
                log_thought(content, tag=f"code_{name}")
            if testing_enabled and plugin_plan.get("testable"):
                run_tests(output_path)

    if action_plan.get("action") == "write_code":
        output_path = Path(__file__).with_name("generated.txt")
        content = action_plan.get("content", "")
        write_file(output_path, content)
        print(f"Wrote plan output to {output_path}")
        if log_thoughts:
            log_thought(content, tag="code")
        if testing_enabled and action_plan.get("testable"):
            run_tests(output_path)
    if auto_evaluate and log_thoughts:
        evaluate_thoughts(Path(__file__).with_name("brain").joinpath("thoughts"))

    if allow_self_rewrites:
        proposal_path = propose_self_update()
        if proposal_path is None:
            for p in (PROPOSAL_DIFF, PROPOSAL_PY):
                if p.exists():
                    proposal_path = p
                    break
        if proposal_path and proposal_path.exists():
            target = None
            content = proposal_path.read_text()
            if proposal_path.suffix == ".diff":
                for line in content.splitlines():
                    if line.startswith("+++"):
                        target = Path(line.split()[1].lstrip("b/"))
                        break
            else:
                first = content.splitlines()[0] if content else ""
                if first.startswith("# target:"):
                    target = Path(first.split(":",1)[1].strip())
            if target and review_update(proposal_path, target, run_tests=testing_enabled):
                print(f"Applied self update to {target}")
            else:
                print("Proposed self update failed validation")


if __name__ == "__main__":
    main()

