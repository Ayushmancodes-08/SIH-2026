"""
SIPER Production HTTP & REST API Server
Integrates RESTful API endpoints and serves the high-fidelity Stitch UI single page application.
"""
import http.server
import socketserver
import json
import urllib.parse
import mimetypes
import os
import sys
from pathlib import Path

from .core.config import PORT, HOST, FRONTEND_DIR, API_PREFIX
from .core.seed_data import seed_database
from .api.router import handle_api_request

class SiperHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Custom request handler dispatching REST APIs and serving SPA assets."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(FRONTEND_DIR), **kwargs)

    def _set_cors_headers(self, status_code: int = 200, content_type: str = "application/json"):
        """Send standard HTTP and CORS response headers."""
        self.send_response(status_code)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        self.send_header("Content-Type", content_type)
        self.end_headers()

    def do_OPTIONS(self):
        """Handle CORS pre-flight requests."""
        self._set_cors_headers(204)

    def do_GET(self):
        """Handle GET requests for APIs and frontend assets."""
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query_params = urllib.parse.parse_qs(parsed_url.query)

        # 1. API Route
        if path.startswith(API_PREFIX):
            auth_header = self.headers.get("Authorization")
            client_ip = self.client_address[0]
            status_code, data = handle_api_request(
                method="GET",
                path=path,
                query_params=query_params,
                body_data=None,
                auth_header=auth_header,
                client_ip=client_ip
            )
            self._set_cors_headers(status_code, "application/json")
            self.wfile.write(json.dumps(data).encode("utf-8"))
            return

        # 2. Static File Route
        # Strip leading slash
        clean_path = path.lstrip("/")
        if not clean_path:
            clean_path = "index.html"

        file_path = FRONTEND_DIR / clean_path
        if file_path.is_file():
            mime_type, _ = mimetypes.guess_type(str(file_path))
            mime_type = mime_type or "application/octet-stream"
            
            try:
                with open(file_path, "rb") as f:
                    content = f.read()
                self._set_cors_headers(200, mime_type)
                self.wfile.write(content)
                return
            except Exception as e:
                self._set_cors_headers(500, "text/plain")
                self.wfile.write(f"Error reading file: {e}".encode("utf-8"))
                return

        # 3. SPA Fallback: return index.html for frontend client routes
        index_file = FRONTEND_DIR / "index.html"
        if index_file.is_file():
            with open(index_file, "rb") as f:
                content = f.read()
            self._set_cors_headers(200, "text/html")
            self.wfile.write(content)
            return

        self._set_cors_headers(404, "text/plain")
        self.wfile.write(b"404 Not Found")

    def do_POST(self):
        """Handle POST requests for APIs."""
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query_params = urllib.parse.parse_qs(parsed_url.query)

        content_length = int(self.headers.get("Content-Length", 0))
        body_data = None
        if content_length > 0:
            raw_body = self.rfile.read(content_length)
            try:
                body_data = json.loads(raw_body.decode("utf-8"))
            except Exception:
                body_data = {"raw_content": raw_body.decode("utf-8", errors="replace")}

        if path.startswith(API_PREFIX):
            auth_header = self.headers.get("Authorization")
            client_ip = self.client_address[0]
            status_code, data = handle_api_request(
                method="POST",
                path=path,
                query_params=query_params,
                body_data=body_data,
                auth_header=auth_header,
                client_ip=client_ip
            )
            self._set_cors_headers(status_code, "application/json")
            self.wfile.write(json.dumps(data).encode("utf-8"))
            return

        self._set_cors_headers(404, "application/json")
        self.wfile.write(json.dumps({"error": "Resource not found"}).encode("utf-8"))

    def do_PUT(self):
        """Handle PUT requests for APIs."""
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query_params = urllib.parse.parse_qs(parsed_url.query)

        content_length = int(self.headers.get("Content-Length", 0))
        body_data = None
        if content_length > 0:
            raw_body = self.rfile.read(content_length)
            try:
                body_data = json.loads(raw_body.decode("utf-8"))
            except Exception:
                body_data = {"raw_content": raw_body.decode("utf-8", errors="replace")}

        if path.startswith(API_PREFIX):
            auth_header = self.headers.get("Authorization")
            client_ip = self.client_address[0]
            status_code, data = handle_api_request(
                method="PUT",
                path=path,
                query_params=query_params,
                body_data=body_data,
                auth_header=auth_header,
                client_ip=client_ip
            )
            self._set_cors_headers(status_code, "application/json")
            self.wfile.write(json.dumps(data).encode("utf-8"))
            return

        self._set_cors_headers(404, "application/json")
        self.wfile.write(json.dumps({"error": "Resource not found"}).encode("utf-8"))

    def do_DELETE(self):
        """Handle DELETE requests for APIs."""
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query_params = urllib.parse.parse_qs(parsed_url.query)

        if path.startswith(API_PREFIX):
            auth_header = self.headers.get("Authorization")
            client_ip = self.client_address[0]
            status_code, data = handle_api_request(
                method="DELETE",
                path=path,
                query_params=query_params,
                body_data=None,
                auth_header=auth_header,
                client_ip=client_ip
            )
            self._set_cors_headers(status_code, "application/json")
            self.wfile.write(json.dumps(data).encode("utf-8"))
            return

        self._set_cors_headers(404, "application/json")
        self.wfile.write(json.dumps({"error": "Resource not found"}).encode("utf-8"))

    def log_message(self, format, *args):
        """Clean log format."""
        sys.stdout.write(f"[{self.log_date_time_string()}] {format % args}\n")

def start_server(port: int = PORT, host: str = HOST):
    """Initialize database and start threaded HTTP server."""
    print("================================================================================")
    print("  SIPER — AI-Powered Criminal Network Analysis System (SIH PS 26189)")
    print("  Ministry of Home Affairs / NCRB — Special Intelligence Wing")
    print("================================================================================")
    print("  [1/3] Initializing SQLite Operational Database & Seeding Synthetic Case...")
    seed_database()
    print("  [2/3] Executed Graph Metrics & Analytical Pattern Detection Algorithms.")
    print(f"  [3/3] Launching SIPER Command Center Server on http://{host}:{port} ...")
    print("--------------------------------------------------------------------------------")
    print(f"  -> Web Application:   http://localhost:{port}")
    print(f"  -> REST API Root:     http://localhost:{port}/api/v1")
    print("  -> Default Sign-in:   investigator@siper.gov.in / Sentinel@2026")
    print("  -> Demo 2FA OTP:      261890")
    print("================================================================================")

    # Use ThreadingHTTPServer for concurrent non-blocking requests
    server_address = (host, port)
    httpd = http.server.ThreadingHTTPServer(server_address, SiperHTTPRequestHandler)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n  Shutting down SIPER server...")
        httpd.server_close()

if __name__ == "__main__":
    start_server()
