from __future__ import annotations

"""Dynamic plugin loader and dispatcher."""

import importlib
from pathlib import Path
from typing import Any, Dict, Callable

PLUGIN_DIR = Path(__file__).resolve().parent.parent / "plugins"


def load_plugins() -> Dict[str, Any]:
    """Dynamically import all plugins and return a dict of modules."""
    plugins: Dict[str, Any] = {}
    for path in PLUGIN_DIR.glob("*.py"):
        if path.name == "__init__.py":
            continue
        name = path.stem
        try:
            module = importlib.import_module(f"ai_bot.plugins.{name}")
            plugins[name] = module
        except Exception as exc:  # pragma: no cover - import errors shouldn't crash
            print(f"Failed to import plugin {name}: {exc}")
    return plugins


class PluginManager:
    """Manage discovery and invocation of plugins."""

    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.plugins: Dict[str, Any] = load_plugins()
        self.methods: Dict[str, Dict[str, Callable]] = {}
        self._register_methods()

    # ------------------------------------------------------------------
    def load_plugins(self) -> Dict[str, Any]:
        """Compatibility wrapper returning loaded plugins."""
        self.plugins = load_plugins()
        self._register_methods()
        return self.plugins

    # ------------------------------------------------------------------
    def _register_methods(self) -> None:
        plug_conf = self.config.get("plugins", {})
        enabled_list = plug_conf.get("enabled", [])
        for name, module in list(self.plugins.items()):
            if enabled_list and name not in enabled_list:
                if not plug_conf.get(name, {}).get("enabled", False):
                    self.plugins.pop(name, None)
                    continue
            if plug_conf.get(name, {}).get("enabled", True) is False:
                self.plugins.pop(name, None)
                continue
            methods = {}
            for meth in ("fetch", "run"):
                if hasattr(module, meth):
                    methods[meth] = getattr(module, meth)
            if methods:
                self.methods[name] = methods

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

    # ------------------------------------------------------------------
    def get_schedule(self) -> Dict[str, Dict[str, Any]]:
        """Return scheduling info for loaded plugins."""
        schedule: Dict[str, Dict[str, Any]] = {}
        plug_conf = self.config.get("plugins", {})
        default_interval = int(plug_conf.get("polling_seconds", 0))
        for name in self.plugins:
            cfg = plug_conf.get(name, {})
            interval = int(cfg.get("poll_interval", default_interval))
            if interval > 0:
                schedule[name] = {"interval": interval, "enabled": True}
        return schedule
