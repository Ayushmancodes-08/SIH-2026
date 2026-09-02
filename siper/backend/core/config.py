"""
SIPER Configuration Module
Defines server parameters, paths, security keys, and system defaults.
"""
import os
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent.parent
BACKEND_DIR = BASE_DIR / "backend"
FRONTEND_DIR = BASE_DIR / "frontend"

# Use /tmp directory if running in Vercel / Serverless environment
if os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"):
    DATA_DIR = Path("/tmp/siper_data")
else:
    DATA_DIR = BASE_DIR / "data"

UPLOADS_DIR = DATA_DIR / "uploads"
DB_PATH = DATA_DIR / "siper.db"

# Ensure runtime directories exist
try:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
except Exception:
    DATA_DIR = Path("/tmp/siper_data")
    UPLOADS_DIR = DATA_DIR / "uploads"
    DB_PATH = DATA_DIR / "siper.db"
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# Server settings
PORT = int(os.environ.get("SIPER_PORT", 8000))
HOST = os.environ.get("SIPER_HOST", "127.0.0.1")
API_PREFIX = "/api/v1"
SECRET_KEY = os.environ.get("SIPER_SECRET_KEY", "siper-sih-2026-mha-ncrb-investigator-key-4096")

# Roles definition
ROLES = ["INVESTIGATOR", "SUPERVISOR", "ANALYST", "ADMIN", "AUDITOR"]

# Entity semantic colors
ENTITY_COLORS = {
    "Person": "#3B82F6",       # Blue
    "Phone": "#A855F7",        # Purple
    "Vehicle": "#F97316",      # Orange
    "Location": "#22C55E",     # Green
    "Organization": "#06B6D4", # Cyan
    "FinancialAccount": "#EAB308", # Amber/Yellow
    "Incident": "#EF4444",     # Red
    "Document": "#9CA3AF",     # Neutral Gray
}

# Risk thresholds
RISK_LEVELS = {
    "LOW": {"color": "#22C55E", "label": "Low Risk Signal"},
    "MEDIUM": {"color": "#F59E0B", "label": "Review Required"},
    "HIGH": {"color": "#EF4444", "label": "High Priority Signal"},
}
