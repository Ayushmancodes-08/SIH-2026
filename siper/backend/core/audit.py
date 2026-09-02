"""
SIPER Immutable Audit Logging Engine
Tracks all investigator queries, entity views, graph expansions, pattern analysis, report generations, and exports.
"""
import time
import json
import sqlite3
import secrets
from typing import Dict, Any, List, Optional
from .config import DB_PATH

def log_audit_event(
    user_id: str,
    user_name: str,
    role: str,
    action: str,
    case_id: Optional[str] = None,
    entity_id: Optional[str] = None,
    resource: Optional[str] = None,
    result: str = "SUCCESS",
    details: Optional[Dict[str, Any]] = None,
    ip_address: str = "127.0.0.1"
) -> str:
    """Log an immutable audit event to SQLite database."""
    event_id = f"aud_{secrets.token_hex(8)}"
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())
    details_json = json.dumps(details or {})

    conn = sqlite3.connect(DB_PATH)
    try:
        with conn:
            conn.execute(
                """
                INSERT INTO audit_events (
                    id, timestamp, user_id, user_name, role, action,
                    case_id, entity_id, resource, result, details, ip_address
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    event_id, timestamp, user_id, user_name, role, action,
                    case_id, entity_id, resource, result, details_json, ip_address
                )
            )
    finally:
        conn.close()
    return event_id

def get_audit_events(
    limit: int = 100,
    action_filter: Optional[str] = None,
    user_filter: Optional[str] = None,
    case_filter: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Retrieve filtered audit trail events."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        query = "SELECT * FROM audit_events WHERE 1=1"
        params = []
        if action_filter:
            query += " AND action = ?"
            params.append(action_filter)
        if user_filter:
            query += " AND (user_id LIKE ? OR user_name LIKE ?)"
            params.extend([f"%{user_filter}%", f"%{user_filter}%"])
        if case_filter:
            query += " AND case_id LIKE ?"
            params.append(f"%{case_filter}%")
        
        query += " ORDER BY timestamp DESC LIMIT ?"
        params.append(limit)
        
        rows = conn.execute(query, params).fetchall()
        events = []
        for r in rows:
            d = dict(r)
            try:
                d["details"] = json.loads(d["details"])
            except Exception:
                d["details"] = {}
            events.append(d)
        return events
    finally:
        conn.close()
