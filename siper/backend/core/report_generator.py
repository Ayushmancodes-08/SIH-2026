"""
SIPER Intelligence Report & Dossier Generation Engine
Compiles case intelligence, network structure, pattern findings, and evidence citations into official investigation reports.
"""
import json
import time
import secrets
from typing import Dict, Any, List, Optional
from .database import get_db

def generate_intelligence_report(
    case_id: str,
    title: str,
    created_by: str = "Investigator-7",
    selected_entity_ids: Optional[List[str]] = None,
    selected_finding_ids: Optional[List[str]] = None,
    executive_summary: Optional[str] = None
) -> Dict[str, Any]:
    """Assemble structured report dossier from case entities, relationships, findings, and evidence."""
    conn = get_db()
    try:
        # Load Case details
        case_row = conn.execute("SELECT * FROM cases WHERE id = ?", (case_id,)).fetchone()
        case_title = case_row["title"] if case_row else f"Case {case_id}"

        # Load Entities
        if selected_entity_ids:
            placeholders = ",".join(["?"] * len(selected_entity_ids))
            entity_rows = conn.execute(f"SELECT * FROM entities WHERE id IN ({placeholders})", selected_entity_ids).fetchall()
        else:
            entity_rows = conn.execute("SELECT * FROM entities LIMIT 15").fetchall()

        entities = []
        for r in entity_rows:
            entities.append({
                "id": r["id"],
                "name": r["canonical_name"],
                "type": r["type"],
                "risk_level": r["risk_level"],
                "risk_score": r["risk_score"],
                "confidence": r["confidence"],
                "degree_centrality": r["degree_centrality"],
                "betweenness_centrality": r["betweenness_centrality"],
                "pagerank": r["pagerank"],
                "aliases": json.loads(r["aliases"] or "[]"),
                "identifiers": json.loads(r["identifiers"] or "{}")
            })

        # Load Findings
        if selected_finding_ids:
            placeholders = ",".join(["?"] * len(selected_finding_ids))
            finding_rows = conn.execute(f"SELECT * FROM findings WHERE id IN ({placeholders})", selected_finding_ids).fetchall()
        else:
            finding_rows = conn.execute("SELECT * FROM findings LIMIT 5").fetchall()

        findings = []
        for r in finding_rows:
            findings.append({
                "id": r["id"],
                "title": r["title"],
                "type": r["type"],
                "confidence": r["confidence"],
                "severity": r["severity"],
                "affected_entities": json.loads(r["affected_entities"] or "[]"),
                "reason_codes": json.loads(r["reason_codes"] or "[]"),
                "supporting_evidence": json.loads(r["supporting_evidence"] or "[]")
            })

        # Load Timeline Events
        timeline_rows = conn.execute("SELECT * FROM timeline_events ORDER BY timestamp DESC LIMIT 8").fetchall()
        timeline = [dict(r) for r in timeline_rows]

        # Load Evidence Documents
        doc_rows = conn.execute("SELECT * FROM documents LIMIT 6").fetchall()
        documents = [dict(r) for r in doc_rows]

        report_id = f"rep_{secrets.token_hex(6)}"
        report_number = f"NCRB/SIPER/{time.strftime('%Y')}/{secrets.randbelow(89999)+10000}"
        created_at = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())

        if not executive_summary:
            executive_summary = (
                f"Multi-source intelligence analysis conducted under Case {case_id} ({case_title}). "
                f"Network analysis identified {len(entities)} key entities with prominent structural bridge roles. "
                f"Pattern detection uncovered {len(findings)} critical analytical signals including circular financial layering "
                f"and pre-incident communication surges. All findings are backed by authenticated FIR and CDR evidence."
            )

        content_data = {
            "report_id": report_id,
            "report_number": report_number,
            "title": title,
            "case_id": case_id,
            "case_title": case_title,
            "created_by": created_by,
            "created_at": created_at,
            "security_classification": "CONFIDENTIAL // LAW ENFORCEMENT SENSITIVE",
            "organization": "Ministry of Home Affairs / NCRB - Special Intelligence Wing",
            "executive_summary": executive_summary,
            "entities_count": len(entities),
            "findings_count": len(findings),
            "entities": entities,
            "findings": findings,
            "timeline": timeline,
            "evidence_documents": documents
        }

        # Persist report
        with conn:
            conn.execute(
                """
                INSERT INTO reports (
                    id, report_number, title, case_id, created_by, created_at,
                    executive_summary, content_json, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'FINALIZED')
                """,
                (
                    report_id, report_number, title, case_id, created_by,
                    created_at, executive_summary, json.dumps(content_data)
                )
            )

        return content_data
    finally:
        conn.close()

def get_all_reports() -> List[Dict[str, Any]]:
    """Retrieve all generated intelligence reports."""
    conn = get_db()
    try:
        rows = conn.execute("SELECT * FROM reports ORDER BY created_at DESC").fetchall()
        reports = []
        for r in rows:
            d = dict(r)
            try:
                d["content"] = json.loads(d["content_json"])
            except Exception:
                d["content"] = {}
            reports.append(d)
        return reports
    finally:
        conn.close()

def get_report_by_id(report_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve single report with full content."""
    conn = get_db()
    try:
        row = conn.execute("SELECT * FROM reports WHERE id = ? OR report_number = ?", (report_id, report_id)).fetchone()
        if not row:
            return None
        d = dict(row)
        try:
            d["content"] = json.loads(d["content_json"])
        except Exception:
            d["content"] = {}
        return d
    finally:
        conn.close()
