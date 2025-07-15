"""Entry point for the modular AI bot framework."""

from pathlib import Path
import yaml

from inputs.web_scraper import scrape_site
from brain.planner import plan
from tools.code_writer import write_file

CONFIG_FILE = Path(__file__).with_name("core_config.yaml")


def load_config() -> dict:
    if CONFIG_FILE.exists():
        return yaml.safe_load(CONFIG_FILE.read_text()) or {}
    return {}


def main() -> None:
    config = load_config()
    url = config.get("start_url", "https://example.com")
    data = scrape_site(url)
    action_plan = plan(data)

    if action_plan.get("action") == "write_code":
        output_path = Path(__file__).with_name("generated.txt")
        write_file(output_path, action_plan.get("content", ""))
        print(f"Wrote plan output to {output_path}")


if __name__ == "__main__":
    main()
