from __future__ import annotations

"""Dynamic plugin loader and dispatcher."""

import importlib
from pathlib import Path
from typing import Any, Dict

PLUGIN_DIR = Path(__file__).resolve().parent.parent / "plugins"


class PluginManager:
    """Manage discovery and invocation of plugins."""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.plugins: Dict[str, Any] = {}
        self.load_plugins()

    # ------------------------------------------------------------------
    def load_plugins(self) -> None:
        enabled = self.config.get("plugins", {}).get("enabled", [])
        for name in enabled:
            try:
                module = importlib.import_module(f"ai_bot.plugins.{name}")
                self.plugins[name] = module
            except Exception as exc:
                print(f"Failed to load plugin {name}: {exc}")

    # ------------------------------------------------------------------
    def invoke(self, name: str) -> Any:
        module = self.plugins.get(name)
        if module is None:
            raise ValueError(f"Plugin {name} is not loaded")
        plugin_conf = self.config.get("plugins", {}).get(name, {})
        if hasattr(module, "fetch"):
            return module.fetch(plugin_conf)
        if hasattr(module, "run"):
            return module.run(plugin_conf)
        raise AttributeError(f"Plugin {name} has no fetch or run method")

    # ------------------------------------------------------------------
    def check_all(self) -> Dict[str, Any]:
        results = {}
        for name in list(self.plugins):
            try:
                results[name] = self.invoke(name)
            except Exception as exc:
                print(f"Plugin {name} error: {exc}")
        return results
