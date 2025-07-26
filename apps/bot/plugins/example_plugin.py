"""Example plugin used for testing the plugin loader."""

def fetch(config=None):
    """Return a static message."""
    return {"message": "Hello from plugin!"}
