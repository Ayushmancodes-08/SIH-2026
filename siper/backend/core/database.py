"""
SIPER Relational & Operational Database Engine
SQLite-backed system of record for cases, entities, relationships, documents, findings, timeline, and reports.
"""
import sqlite3
import json
import time
from typing import Dict, Any, List, Optional
from .config import DB_PATH

_db_initialized = False

def get_db():
    """Return a configured SQLite connection, ensuring schema exists."""
    global _db_initialized
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    if not _db_initialized:
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
            if not cursor.fetchone():
                init_db()
            _db_initialized = True
        except Exception:
            pass
    return conn

def init_db():
    """Initialize database tables and indexes."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    with conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name TEXT NOT NULL,
                role TEXT NOT NULL,
                badge_number TEXT,
                unit TEXT,
                active INTEGER DEFAULT 1,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS cases (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                description TEXT,
                case_type TEXT DEFAULT 'Organized Crime',
                priority TEXT NOT NULL,
                status TEXT NOT NULL,
                owner TEXT NOT NULL,
                assigned_investigators TEXT, -- JSON array
                location TEXT DEFAULT 'National Jurisdiction',
                entity_count INTEGER DEFAULT 0,
                findings_count INTEGER DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                tags TEXT -- JSON array
            );

            CREATE TABLE IF NOT EXISTS case_entities (
                case_id TEXT NOT NULL,
                entity_id TEXT NOT NULL,
                role_in_case TEXT,
                created_at TEXT NOT NULL,
                PRIMARY KEY (case_id, entity_id),
                FOREIGN KEY (case_id) REFERENCES cases (id) ON DELETE CASCADE,
                FOREIGN KEY (entity_id) REFERENCES entities (id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS entities (
                id TEXT PRIMARY KEY,
                canonical_name TEXT NOT NULL,
                type TEXT NOT NULL,
                risk_level TEXT NOT NULL,
                risk_score INTEGER NOT NULL,
                confidence REAL NOT NULL,
                aliases TEXT, -- JSON array
                identifiers TEXT, -- JSON object
                primary_photo TEXT,
                notes TEXT,
                degree_centrality REAL DEFAULT 0.0,
                betweenness_centrality REAL DEFAULT 0.0,
                pagerank REAL DEFAULT 0.0,
                community_id INTEGER DEFAULT 0,
                status TEXT DEFAULT 'ACTIVE',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS relationships (
                id TEXT PRIMARY KEY,
                source_id TEXT NOT NULL,
                target_id TEXT NOT NULL,
                type TEXT NOT NULL,
                confidence REAL NOT NULL,
                source_count INTEGER DEFAULT 1,
                first_seen TEXT,
                last_seen TEXT,
                verified INTEGER DEFAULT 0,
                provenance_ids TEXT, -- JSON array
                explanation TEXT,
                FOREIGN KEY (source_id) REFERENCES entities (id) ON DELETE CASCADE,
                FOREIGN KEY (target_id) REFERENCES entities (id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS documents (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                file_type TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                case_id TEXT,
                uploader TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                sha256_hash TEXT NOT NULL,
                extracted_entities_count INTEGER DEFAULT 0,
                raw_text TEXT,
                source_category TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS findings (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                type TEXT NOT NULL,
                confidence REAL NOT NULL,
                affected_entities TEXT NOT NULL, -- JSON array
                severity TEXT NOT NULL,
                reason_codes TEXT NOT NULL, -- JSON array
                supporting_evidence TEXT NOT NULL, -- JSON array
                timestamp TEXT NOT NULL,
                status TEXT NOT NULL,
                case_id TEXT,
                investigator_notes TEXT
            );

            CREATE TABLE IF NOT EXISTS timeline_events (
                id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                entity_ids TEXT NOT NULL, -- JSON array
                event_type TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                source TEXT,
                confidence REAL,
                case_id TEXT
            );

            CREATE TABLE IF NOT EXISTS financial_transactions (
                id TEXT PRIMARY KEY,
                source_account TEXT NOT NULL,
                target_account TEXT NOT NULL,
                sender_name TEXT,
                receiver_name TEXT,
                amount REAL NOT NULL,
                timestamp TEXT NOT NULL,
                currency TEXT DEFAULT 'INR',
                transaction_type TEXT NOT NULL,
                suspicious INTEGER DEFAULT 0,
                case_id TEXT
            );

            CREATE TABLE IF NOT EXISTS cdr_records (
                id TEXT PRIMARY KEY,
                caller_number TEXT NOT NULL,
                receiver_number TEXT NOT NULL,
                caller_name TEXT,
                receiver_name TEXT,
                timestamp TEXT NOT NULL,
                duration_seconds INTEGER NOT NULL,
                tower_location TEXT,
                case_id TEXT
            );

            CREATE TABLE IF NOT EXISTS reports (
                id TEXT PRIMARY KEY,
                report_number TEXT NOT NULL,
                title TEXT NOT NULL,
                case_id TEXT NOT NULL,
                created_by TEXT NOT NULL,
                created_at TEXT NOT NULL,
                executive_summary TEXT,
                content_json TEXT,
                status TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS audit_events (
                id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                user_id TEXT NOT NULL,
                user_name TEXT NOT NULL,
                role TEXT NOT NULL,
                action TEXT NOT NULL,
                case_id TEXT,
                entity_id TEXT,
                resource TEXT,
                result TEXT NOT NULL,
                details TEXT,
                ip_address TEXT
            );

            CREATE TABLE IF NOT EXISTS resolution_candidates (
                id TEXT PRIMARY KEY,
                candidate_a_id TEXT NOT NULL,
                candidate_b_id TEXT NOT NULL,
                match_confidence REAL NOT NULL,
                match_factors TEXT NOT NULL, -- JSON array
                status TEXT DEFAULT 'PENDING',
                created_at TEXT NOT NULL,
                resolved_by TEXT,
                resolution_decision TEXT,
                FOREIGN KEY (candidate_a_id) REFERENCES entities (id) ON DELETE CASCADE,
                FOREIGN KEY (candidate_b_id) REFERENCES entities (id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_entities_type ON entities (type);
            CREATE INDEX IF NOT EXISTS idx_entities_name ON entities (canonical_name);
            CREATE INDEX IF NOT EXISTS idx_rel_source ON relationships (source_id);
            CREATE INDEX IF NOT EXISTS idx_rel_target ON relationships (target_id);
            CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_events (timestamp);
            CREATE INDEX IF NOT EXISTS idx_timeline_timestamp ON timeline_events (timestamp);
            CREATE INDEX IF NOT EXISTS idx_case_entities_case ON case_entities (case_id);
            CREATE INDEX IF NOT EXISTS idx_case_entities_entity ON case_entities (entity_id);
            """
        )
        # Non-destructive schema migration for existing cases table
        cursor = conn.execute("PRAGMA table_info(cases)")
        existing_cols = {row["name"] for row in cursor.fetchall()}
        if "case_type" not in existing_cols:
            conn.execute("ALTER TABLE cases ADD COLUMN case_type TEXT DEFAULT 'Organized Crime'")
        if "location" not in existing_cols:
            conn.execute("ALTER TABLE cases ADD COLUMN location TEXT DEFAULT 'National Jurisdiction'")
    conn.close()
