"""
SIPER Multi-Stage Entity Resolution Engine
Resolves fragmented identities across police FIRs, CDR records, bank statements, and intelligence documents.
Uses exact identifiers, deterministic string similarity, and contextual factor analysis.
"""
import re
import json
import secrets
import time
from typing import Dict, Any, List, Tuple, Optional
from .database import get_db

def normalize_name(name: str) -> str:
    """Normalize Indian names, removing titles, honorifics, and special characters."""
    if not name:
        return ""
    cleaned = name.lower().strip()
    # Remove common honorifics
    titles = [r"\bshri\b", r"\bmr\b", r"\bmrs\b", r"\bms\b", r"\bdr\b", r"\balias\b", r"\baka\b", r"\blate\b"]
    for t in titles:
        cleaned = re.sub(t, "", cleaned)
    cleaned = re.sub(r"[^\w\s]", "", cleaned)
    tokens = cleaned.split()
    return " ".join(tokens)

def normalize_phone(phone: str) -> str:
    """Extract standard last 10 digits for Indian phone numbers."""
    if not phone:
        return ""
    digits = re.sub(r"\D", "", phone)
    if len(digits) >= 10:
        return digits[-10:]
    return digits

def normalize_vehicle_plate(plate: str) -> str:
    """Standardize vehicle plate format (e.g. OD02AB1234)."""
    if not plate:
        return ""
    return re.sub(r"[^A-Z0-9]", "", plate.upper())

def levenshtein_distance(s1: str, s2: str) -> int:
    """Compute edit distance between two strings."""
    if len(s1) < len(s2):
        return levenshtein_distance(s2, s1)
    if len(s2) == 0:
        return len(s1)
    
    previous_row = range(len(s2) + 1)
    for i, c1 in enumerate(s1):
        current_row = [i + 1]
        for j, c2 in enumerate(s2):
            insertions = previous_row[j + 1] + 1
            deletions = current_row[j] + 1
            substitutions = previous_row[j] + (c1 != c2)
            current_row.append(min(insertions, deletions, substitutions))
        previous_row = current_row
    return previous_row[-1]

def string_similarity(s1: str, s2: str) -> float:
    """Compute normalized similarity ratio between 0.0 and 1.0."""
    n1 = normalize_name(s1)
    n2 = normalize_name(s2)
    if not n1 or not n2:
        return 0.0
    if n1 == n2:
        return 1.0
    max_len = max(len(n1), len(n2))
    dist = levenshtein_distance(n1, n2)
    return max(0.0, 1.0 - (dist / max_len))

def compare_entities(e1: Dict[str, Any], e2: Dict[str, Any]) -> Tuple[float, List[str]]:
    """Compare two entities and compute match confidence + contributing factors."""
    if e1["id"] == e2["id"]:
        return 0.0, []
    if e1["type"] != e2["type"]:
        return 0.0, []

    factors = []
    scores = []

    # 1. Exact Identifier Comparison (Phone, Vehicle, Account)
    id1 = e1.get("identifiers", {})
    id2 = e2.get("identifiers", {})

    # Phone match
    phone1 = normalize_phone(id1.get("phone") or "")
    phone2 = normalize_phone(id2.get("phone") or "")
    if phone1 and phone2 and phone1 == phone2:
        factors.append(f"Exact Phone Number Match (+91-{phone1})")
        scores.append(0.95)

    # Vehicle plate match
    plate1 = normalize_vehicle_plate(id1.get("vehicle_plate") or "")
    plate2 = normalize_vehicle_plate(id2.get("vehicle_plate") or "")
    if plate1 and plate2 and plate1 == plate2:
        factors.append(f"Identical Vehicle Registration ({plate1})")
        scores.append(0.95)

    # Bank account match
    acc1 = id1.get("account_number", "").strip()
    acc2 = id2.get("account_number", "").strip()
    if acc1 and acc2 and acc1 == acc2:
        factors.append(f"Matching Bank Account Number ({acc1})")
        scores.append(0.98)

    # 2. Name / Alias Similarity
    name_sim = string_similarity(e1["canonical_name"], e2["canonical_name"])
    if name_sim >= 0.80:
        pct = int(name_sim * 100)
        factors.append(f"High Name Phonetic/Spelling Similarity ({pct}%)")
        scores.append(name_sim)
    
    # Check aliases
    aliases1 = [normalize_name(a) for a in e1.get("aliases", [])]
    aliases2 = [normalize_name(a) for a in e2.get("aliases", [])]
    if any(a in aliases2 for a in aliases1 if a):
        factors.append("Matching Known Alias / Moniker")
        scores.append(0.90)

    # 3. Address / Location Proximity
    addr1 = normalize_name(id1.get("address") or "")
    addr2 = normalize_name(id2.get("address") or "")
    if addr1 and addr2:
        addr_sim = string_similarity(addr1, addr2)
        if addr_sim >= 0.70:
            factors.append(f"Overlapping Registered Address ({int(addr_sim*100)}% match)")
            scores.append(addr_sim * 0.85)

    if not scores:
        return 0.0, []

    # Weighted calculation
    composite_confidence = min(0.99, max(scores) * 0.8 + (sum(scores) / len(scores)) * 0.2)
    return round(composite_confidence, 2), factors

def run_entity_resolution_scan() -> List[Dict[str, Any]]:
    """Scan database for candidate entity matches and store proposals for human review."""
    conn = get_db()
    try:
        rows = conn.execute("SELECT * FROM entities").fetchall()
        entities = []
        for r in rows:
            entities.append({
                "id": r["id"],
                "canonical_name": r["canonical_name"],
                "type": r["type"],
                "risk_level": r["risk_level"],
                "aliases": json.loads(r["aliases"] or "[]"),
                "identifiers": json.loads(r["identifiers"] or "{}"),
                "primary_photo": r["primary_photo"]
            })

        candidate_pairs = []
        with conn:
            for i in range(len(entities)):
                for j in range(i + 1, len(entities)):
                    e1 = entities[i]
                    e2 = entities[j]
                    conf, factors = compare_entities(e1, e2)
                    if conf >= 0.70:
                        cand_id = f"cand_{e1['id']}_{e2['id']}"
                        created_at = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())
                        factors_json = json.dumps(factors)
                        
                        # Upsert candidate
                        conn.execute(
                            """
                            INSERT OR REPLACE INTO resolution_candidates (
                                id, candidate_a_id, candidate_b_id, match_confidence, match_factors, status, created_at
                            ) VALUES (?, ?, ?, ?, ?, 'PENDING', ?)
                            """,
                            (cand_id, e1["id"], e2["id"], conf, factors_json, created_at)
                        )
                        candidate_pairs.append({
                            "candidate_id": cand_id,
                            "entity_a": e1,
                            "entity_b": e2,
                            "match_confidence": conf,
                            "match_factors": factors
                        })
        return candidate_pairs
    finally:
        conn.close()

def get_pending_resolution_candidates() -> List[Dict[str, Any]]:
    """Retrieve all pending identity resolution proposals with entity details."""
    conn = get_db()
    try:
        query = """
            SELECT rc.*,
                   ea.canonical_name as name_a, ea.type as type_a, ea.risk_level as risk_a, ea.identifiers as id_a, ea.aliases as aliases_a, ea.primary_photo as photo_a,
                   eb.canonical_name as name_b, eb.type as type_b, eb.risk_level as risk_b, eb.identifiers as id_b, eb.aliases as aliases_b, eb.primary_photo as photo_b
            FROM resolution_candidates rc
            JOIN entities ea ON rc.candidate_a_id = ea.id
            JOIN entities eb ON rc.candidate_b_id = eb.id
            WHERE rc.status = 'PENDING'
            ORDER BY rc.match_confidence DESC
        """
        rows = conn.execute(query).fetchall()
        candidates = []
        for r in rows:
            factors = json.loads(r["match_factors"] or "[]")
            candidates.append({
                "id": r["id"],
                "match_confidence": r["match_confidence"],
                "match_factors": factors,
                "created_at": r["created_at"],
                "candidate_a": {
                    "id": r["candidate_a_id"],
                    "name": r["name_a"],
                    "type": r["type_a"],
                    "risk_level": r["risk_a"],
                    "identifiers": json.loads(r["id_a"] or "{}"),
                    "aliases": json.loads(r["aliases_a"] or "[]"),
                    "photo": r["photo_a"]
                },
                "candidate_b": {
                    "id": r["candidate_b_id"],
                    "name": r["name_b"],
                    "type": r["type_b"],
                    "risk_level": r["risk_b"],
                    "identifiers": json.loads(r["id_b"] or "{}"),
                    "aliases": json.loads(r["aliases_b"] or "[]"),
                    "photo": r["photo_b"]
                }
            })
        return candidates
    finally:
        conn.close()

def resolve_candidate(candidate_id: str, decision: str, operator_name: str = "Investigator-7") -> Dict[str, Any]:
    """Apply investigator resolution decision (MERGE or KEEP_SEPARATE)."""
    conn = get_db()
    try:
        with conn:
            cand = conn.execute("SELECT * FROM resolution_candidates WHERE id = ?", (candidate_id,)).fetchone()
            if not cand:
                return {"success": False, "message": "Candidate proposal not found."}

            resolved_at = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())
            
            if decision == "MERGE":
                # Merge candidate B into candidate A
                e_a_id = cand["candidate_a_id"]
                e_b_id = cand["candidate_b_id"]

                e_a = conn.execute("SELECT * FROM entities WHERE id = ?", (e_a_id,)).fetchone()
                e_b = conn.execute("SELECT * FROM entities WHERE id = ?", (e_b_id,)).fetchone()

                if e_a and e_b:
                    aliases_a = set(json.loads(e_a["aliases"] or "[]"))
                    aliases_b = set(json.loads(e_b["aliases"] or "[]"))
                    aliases_a.add(e_b["canonical_name"])
                    aliases_a.update(aliases_b)

                    id_a = json.loads(e_a["identifiers"] or "{}")
                    id_b = json.loads(e_b["identifiers"] or "{}")
                    id_a.update(id_b)

                    # Update A
                    conn.execute(
                        """
                        UPDATE entities
                        SET aliases = ?, identifiers = ?, updated_at = ?
                        WHERE id = ?
                        """,
                        (json.dumps(list(aliases_a)), json.dumps(id_a), resolved_at, e_a_id)
                    )

                    # Point relationships from B to A
                    conn.execute("UPDATE relationships SET source_id = ? WHERE source_id = ? AND target_id != ?", (e_a_id, e_b_id, e_a_id))
                    conn.execute("UPDATE relationships SET target_id = ? WHERE target_id = ? AND source_id != ?", (e_a_id, e_b_id, e_a_id))
                    conn.execute("DELETE FROM relationships WHERE source_id = target_id")

                    # Mark candidate B as MERGED
                    conn.execute("UPDATE entities SET status = 'MERGED', updated_at = ? WHERE id = ?", (resolved_at, e_b_id))

            conn.execute(
                """
                UPDATE resolution_candidates
                SET status = 'RESOLVED', resolved_by = ?, resolution_decision = ?
                WHERE id = ?
                """,
                (operator_name, decision, candidate_id)
            )
        return {"success": True, "decision": decision, "candidate_id": candidate_id}
    finally:
        conn.close()
