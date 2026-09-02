"""
SIPER Vercel Serverless Function API Entrypoint
Dispatches all REST API requests to the SIPER core backend router.
"""
import sys
import os
import json
import urllib.parse
from http.server import BaseHTTPRequestHandler
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from siper.backend.api.router import handle_api_request
from siper.backend.core.seed_data import seed_database

# Ensure database is initialized and seeded on serverless cold start
try:
    seed_database()
except Exception as e:
    print(f"Database seed notice: {e}")

class handler(BaseHTTPRequestHandler):
    """Vercel Python serverless HTTP handler."""

    def _set_cors_headers(self, status_code: int = 200, content_type: str = "application/json"):
        self.send_response(status_code)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        self.send_header("Content-Type", content_type)
        self.end_headers()

    def do_OPTIONS(self):
        self._set_cors_headers(204)

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query_params = urllib.parse.parse_qs(parsed_url.query)
        auth_header = self.headers.get("Authorization")
        client_ip = self.headers.get("X-Forwarded-For", self.client_address[0] if hasattr(self, 'client_address') and self.client_address else "127.0.0.1")

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

    def do_POST(self):
        self._handle_with_body("POST")

    def do_PUT(self):
        self._handle_with_body("PUT")

    def do_DELETE(self):
        self._handle_with_body("DELETE")

    def _handle_with_body(self, method: str):
        parsed_url = urllib.parse.urlparse(self.path)
        path = parsed_url.path
        query_params = urllib.parse.parse_qs(parsed_url.query)
        auth_header = self.headers.get("Authorization")
        client_ip = self.headers.get("X-Forwarded-For", self.client_address[0] if hasattr(self, 'client_address') and self.client_address else "127.0.0.1")

        body_data = None
        content_length = int(self.headers.get("Content-Length", 0))
        if content_length > 0:
            raw_body = self.rfile.read(content_length).decode("utf-8")
            try:
                body_data = json.loads(raw_body)
            except Exception:
                body_data = {"raw": raw_body}

        status_code, data = handle_api_request(
            method=method,
            path=path,
            query_params=query_params,
            body_data=body_data,
            auth_header=auth_header,
            client_ip=client_ip
        )
        self._set_cors_headers(status_code, "application/json")
        self.wfile.write(json.dumps(data).encode("utf-8"))
