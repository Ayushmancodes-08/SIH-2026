"""
SIPER Top-Level Application Launcher
Initializes the database, runs seed data & AI analytics pipeline, and launches the server.
"""
import sys
import os
import webbrowser
import threading
import time
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT_ROOT.parent))

from siper.backend.core.config import PORT, HOST
from siper.backend.server import start_server

def main():
    """Main launcher."""
    port = PORT
    host = HOST

    # Open browser automatically after a short delay
    def open_browser():
        time.sleep(1.2)
        url = f"http://localhost:{port}"
        print(f"  -> Opening browser at {url} ...")
        try:
            webbrowser.open(url)
        except Exception:
            pass

    threading.Thread(target=open_browser, daemon=True).start()
    start_server(port=port, host=host)

if __name__ == "__main__":
    main()
