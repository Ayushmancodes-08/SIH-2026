"""
SIPER Authentication & Authorization (RBAC) Module
Handles secure session tokens, password hashing, role permissions, and 2FA verification.
"""
import hashlib
import hmac
import time
import secrets
import json
from typing import Dict, Any, Optional, List
from .config import SECRET_KEY, ROLES

# Permissions matrix by role
ROLE_PERMISSIONS = {
    "INVESTIGATOR": [
        "view_dashboard", "view_cases", "create_case", "edit_assigned_case",
        "search_entities", "view_entity_profile", "explore_graph",
        "ingest_data", "run_analysis", "view_findings", "verify_finding",
        "resolve_entities", "view_evidence", "generate_report", "view_own_audit"
    ],
    "SUPERVISOR": [
        "view_dashboard", "view_cases", "create_case", "edit_all_cases", "approve_case",
        "search_entities", "view_entity_profile", "explore_graph",
        "ingest_data", "run_analysis", "view_findings", "verify_finding",
        "resolve_entities", "view_evidence", "generate_report", "approve_report",
        "view_all_audit", "manage_assignments"
    ],
    "ANALYST": [
        "view_dashboard", "view_cases", "search_entities", "view_entity_profile",
        "explore_graph", "run_analysis", "view_findings", "resolve_entities",
        "view_evidence", "generate_report", "export_data"
    ],
    "ADMIN": [
        "view_dashboard", "view_cases", "create_case", "edit_all_cases", "delete_case",
        "search_entities", "view_entity_profile", "explore_graph",
        "ingest_data", "run_analysis", "view_findings", "resolve_entities",
        "view_evidence", "generate_report", "view_all_audit", "export_audit",
        "manage_users", "manage_roles", "manage_system_settings"
    ],
    "AUDITOR": [
        "view_dashboard", "view_cases_read_only", "search_entities_read_only",
        "view_entity_profile_read_only", "view_findings_read_only",
        "view_evidence_read_only", "view_all_audit", "export_audit", "verify_integrity"
    ]
}

# In-memory active session store: token -> session dict
ACTIVE_SESSIONS: Dict[str, Dict[str, Any]] = {}

# Active 2FA challenges: session_challenge_id -> { email, otp, expires_at, user_data }
ACTIVE_2FA: Dict[str, Dict[str, Any]] = {}

def hash_password(password: str) -> str:
    """Create SHA-256 salted hash of password."""
    salted = f"{SECRET_KEY}:{password}"
    return hashlib.sha256(salted.encode("utf-8")).hexdigest()

def create_session(user: Dict[str, Any]) -> str:
    """Generate a secure session token."""
    token = secrets.token_hex(32)
    ACTIVE_SESSIONS[token] = {
        "user_id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "badge_number": user.get("badge_number", "NCRB-26189"),
        "unit": user.get("unit", "Special Intelligence Wing"),
        "created_at": time.time(),
        "expires_at": time.time() + 86400 # 24 hours
    }
    return token

def get_session(token: str) -> Optional[Dict[str, Any]]:
    """Retrieve active session if valid."""
    if not token or token not in ACTIVE_SESSIONS:
        return None
    session = ACTIVE_SESSIONS[token]
    if time.time() > session["expires_at"]:
        del ACTIVE_SESSIONS[token]
        return None
    return session

def invalidate_session(token: str) -> bool:
    """Remove session on logout."""
    if token in ACTIVE_SESSIONS:
        del ACTIVE_SESSIONS[token]
        return True
    return False

def initiate_2fa(user: Dict[str, Any]) -> Dict[str, Any]:
    """Create a 2FA challenge with simulated OTP for development/demo."""
    challenge_id = secrets.token_hex(16)
    # Default demo OTP is 261890 (referencing SIH PS 26189) or random 6 digits
    otp = "261890"
    ACTIVE_2FA[challenge_id] = {
        "user": user,
        "otp": otp,
        "expires_at": time.time() + 300 # 5 minutes
    }
    return {
        "challenge_id": challenge_id,
        "email": user["email"],
        "expires_in": 300,
        "demo_otp_hint": "Demo 2FA OTP: 261890"
    }

def verify_2fa_otp(challenge_id: str, entered_otp: str) -> Optional[str]:
    """Verify 2FA OTP and return session token if valid."""
    if challenge_id not in ACTIVE_2FA:
        return None
    challenge = ACTIVE_2FA[challenge_id]
    if time.time() > challenge["expires_at"]:
        del ACTIVE_2FA[challenge_id]
        return None
    
    if challenge["otp"].strip() == entered_otp.strip() or entered_otp.strip() == "261890":
        user = challenge["user"]
        del ACTIVE_2FA[challenge_id]
        return create_session(user)
    return None

def has_permission(role: str, permission: str) -> bool:
    """Check if a role possesses the specified permission."""
    perms = ROLE_PERMISSIONS.get(role, [])
    return permission in perms or role == "ADMIN"
