"""Entry point for the modular AI bot framework."""

from pathlib import Path
import yaml

from brain.thoughts import log_thought
from tools.code_tester import run_tests

from inputs.web_scraper import scrape_site
from brain.planner import plan
from tools.code_writer import write_file
from tools.evaluate import evaluate_thoughts

CONFIG_FILE = Path(__file__).with_name("core_config.yaml")


def load_config() -> dict:
    if CONFIG_FILE.exists():
        return yaml.safe_load(CONFIG_FILE.read_text()) or {}
    return {}


def main() -> None:
    config = load_config()
    testing_enabled = config.get("testing_enabled", True)
    log_thoughts = config.get("log_thoughts", False)
    auto_evaluate = config.get("auto_evaluate", False)
    url = config.get("start_url", "https://example.com")
    data = scrape_site(url)
    if log_thoughts:
        log_thought(f"Scraped data from {url}\n\n{data}", tag="scrape")
    action_plan = plan(data)
    if log_thoughts:
        log_thought(str(action_plan), tag="plan")

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


if __name__ == "__main__":
    main()

