"""
SIPER Document Ingestion & Provenance Engine
Ingests police reports, FIRs, CDR logs, bank statements, and extracts structured entities, linking provenance.
"""
import hashlib
import time
import json
import secrets
from pathlib import Path
from typing import Dict, Any, List, Optional
from .database import get_db
from .nlp_engine import extract_structured_entities
from .graph import compute_graph_metrics

def compute_sha256(content: bytes) -> str:
    """Compute cryptographic SHA-256 hash for document integrity and chain of custody."""
    return hashlib.sha256(content).hexdigest()

def process_uploaded_document(
    filename: str,
    file_bytes: bytes,
    source_category: str = "FIR",
    case_id: str = "CASE-26189",
    uploader: str = "Investigator-7"
) -> Dict[str, Any]:
    """Process uploaded file, extract entities, persist document metadata, and attach to graph."""
    doc_id = f"doc_{secrets.token_hex(6)}"
    sha256 = compute_sha256(file_bytes)
    file_size = len(file_bytes)
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())

    # Try decode text
    try:
        raw_text = file_bytes.decode("utf-8", errors="replace")
    except Exception:
        raw_text = f"[Binary Document content for {filename}]"

    # Extract entities using NLP engine
    extracted = extract_structured_entities(raw_text)
    total_extracted = (
        len(extracted["persons"]) +
        len(extracted["phones"]) +
        len(extracted["vehicles"]) +
        len(extracted["locations"]) +
        len(extracted["organizations"]) +
        len(extracted["financial_accounts"])
    )

    conn = get_db()
    try:
        with conn:
            # 1. Insert Document Record
            conn.execute(
                """
                INSERT INTO documents (
                    id, title, file_type, file_size, case_id, uploader,
                    timestamp, sha256_hash, extracted_entities_count, raw_text, source_category
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    doc_id, filename, Path(filename).suffix.upper().replace(".", ""),
                    file_size, case_id, uploader, timestamp, sha256, total_extracted, raw_text, source_category
                )
            )

            # 2. Insert or update newly extracted entities
            for p in extracted["persons"]:
                ent_id = f"ent_p_{secrets.token_hex(4)}"
                conn.execute(
                    """
                    INSERT OR IGNORE INTO entities (
                        id, canonical_name, type, risk_level, risk_score, confidence,
                        aliases, identifiers, notes, created_at, updated_at
                    ) VALUES (?, ?, 'Person', 'MEDIUM', 65, 0.85, '[]', '{}', ?, ?, ?)
                    """,
                    (ent_id, p["value"], f"Extracted from {filename}", timestamp, timestamp)
                )

            for ph in extracted["phones"]:
                ent_id = f"ent_ph_{secrets.token_hex(4)}"
                id_json = json.dumps({"phone": ph["value"]})
                conn.execute(
                    """
                    INSERT OR IGNORE INTO entities (
                        id, canonical_name, type, risk_level, risk_score, confidence,
                        aliases, identifiers, notes, created_at, updated_at
                    ) VALUES (?, ?, 'Phone', 'LOW', 35, 0.95, '[]', ?, ?, ?, ?)
                    """,
                    (ent_id, f"+91-{ph['value']}", id_json, f"Discovered in {filename}", timestamp, timestamp)
                )

            for v in extracted["vehicles"]:
                ent_id = f"ent_v_{secrets.token_hex(4)}"
                id_json = json.dumps({"vehicle_plate": v["value"]})
                conn.execute(
                    """
                    INSERT OR IGNORE INTO entities (
                        id, canonical_name, type, risk_level, risk_score, confidence,
                        aliases, identifiers, notes, created_at, updated_at
                    ) VALUES (?, ?, 'Vehicle', 'MEDIUM', 55, 0.92, '[]', ?, ?, ?, ?)
                    """,
                    (ent_id, v["value"], id_json, f"Vehicle referenced in {filename}", timestamp, timestamp)
                )

            for loc in extracted["locations"]:
                ent_id = f"ent_loc_{secrets.token_hex(4)}"
                conn.execute(
                    """
                    INSERT OR IGNORE INTO entities (
                        id, canonical_name, type, risk_level, risk_score, confidence,
                        aliases, identifiers, notes, created_at, updated_at
                    ) VALUES (?, ?, 'Location', 'LOW', 20, 0.90, '[]', '{}', ?, ?, ?)
                    """,
                    (ent_id, loc["value"], f"Location identified in {filename}", timestamp, timestamp)
                )

            for org in extracted["organizations"]:
                ent_id = f"ent_org_{secrets.token_hex(4)}"
                conn.execute(
                    """
                    INSERT OR IGNORE INTO entities (
                        id, canonical_name, type, risk_level, risk_score, confidence,
                        aliases, identifiers, notes, created_at, updated_at
                    ) VALUES (?, ?, 'Organization', 'HIGH', 78, 0.88, '[]', '{}', ?, ?, ?)
                    """,
                    (ent_id, org["value"], f"Organization identified in {filename}", timestamp, timestamp)
                )

        # Re-compute network metrics
        compute_graph_metrics()

        return {
            "document_id": doc_id,
            "filename": filename,
            "sha256_hash": sha256,
            "file_size": file_size,
            "source_category": source_category,
            "extracted_count": total_extracted,
            "extracted_entities": extracted,
            "status": "PROCESSED_SUCCESSFULLY"
        }
    finally:
        conn.close()

def get_all_documents(case_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Fetch all ingested investigative documents with metadata."""
    conn = get_db()
    try:
        query = "SELECT * FROM documents"
        params = []
        if case_id:
            query += " WHERE case_id = ?"
            params.append(case_id)
        query += " ORDER BY timestamp DESC"
        
        rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()
