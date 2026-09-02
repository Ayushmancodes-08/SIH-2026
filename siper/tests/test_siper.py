"""
SIPER Automated Test Suite
Unit and Integration tests for Database, Graph Analytics, Pattern Detection,
Entity Resolution, NLP Extraction, REST APIs, and RBAC Security.
"""
import unittest
import json
import sqlite3
import os
import sys
import secrets
from pathlib import Path

# Ensure siper is on sys.path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR.parent))

from siper.backend.core.config import DB_PATH
from siper.backend.core.database import init_db, get_db
from siper.backend.core.seed_data import seed_database
from siper.backend.core.graph import (
    build_networkx_graph, compute_graph_metrics, get_graph_data,
    expand_entity_neighborhood, find_shortest_path
)
from siper.backend.core.pattern_detector import (
    detect_circular_financial_movements, detect_communication_bursts,
    detect_shared_intermediaries, detect_temporal_proximity,
    detect_financial_smurfing, detect_sim_churn, run_all_pattern_detectors
)
from siper.backend.core.entity_resolver import (
    string_similarity, compare_entities, run_entity_resolution_scan,
    get_pending_resolution_candidates, resolve_candidate
)
from siper.backend.core.nlp_engine import extract_structured_entities
from siper.backend.core.auth import (
    hash_password, initiate_2fa, verify_2fa_otp, create_session,
    get_session, has_permission, ROLE_PERMISSIONS
)
from siper.backend.core.audit import log_audit_event, get_audit_events
from siper.backend.core.report_generator import generate_intelligence_report, get_all_reports
from siper.backend.api.router import handle_api_request

class TestSiperSystem(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        """Initialize database and seed baseline dataset."""
        seed_database()

    def test_01_database_tables_and_counts(self):
        """Verify all relational tables exist and contain seeded records."""
        conn = get_db()
        try:
            users_count = conn.execute("SELECT COUNT(*) as c FROM users").fetchone()["c"]
            cases_count = conn.execute("SELECT COUNT(*) as c FROM cases").fetchone()["c"]
            entities_count = conn.execute("SELECT COUNT(*) as c FROM entities").fetchone()["c"]
            rel_count = conn.execute("SELECT COUNT(*) as c FROM relationships").fetchone()["c"]
            docs_count = conn.execute("SELECT COUNT(*) as c FROM documents").fetchone()["c"]

            self.assertGreaterEqual(users_count, 5, "Users table should have at least 5 accounts")
            self.assertGreaterEqual(cases_count, 4, "Cases table should have at least 4 seeded cases")
            self.assertGreaterEqual(entities_count, 20, "Entities table should have at least 20 records")
            self.assertGreaterEqual(rel_count, 20, "Relationships table should have at least 20 links")
            self.assertGreaterEqual(docs_count, 4, "Documents table should have at least 4 source files")
        finally:
            conn.close()

    def test_02_graph_centrality_and_path(self):
        """Verify NetworkX graph building, centrality metrics, and shortest path finding."""
        metrics = compute_graph_metrics()
        self.assertGreater(metrics["nodes_count"], 0)
        self.assertGreater(metrics["edges_count"], 0)

        # Verify shortest path between Ravi Kumar (ent_p_001) and Vikram Malhotra (ent_p_004)
        path_res = find_shortest_path("ent_p_001", "ent_p_004")
        self.assertTrue(path_res["found"], "Should discover shortest path between Ravi Kumar and Vikram Malhotra")
        self.assertGreaterEqual(path_res["path_length"], 1)

    def test_03_pattern_detection_engines(self):
        """Verify all 6 pattern detection algorithms find validated signals."""
        # 1. Circular Financial Movements
        cycles = detect_circular_financial_movements()
        self.assertGreater(len(cycles), 0, "Should detect circular financial layering loop")
        self.assertEqual(cycles[0]["type"], "CIRCULAR_TRANSACTION")
        self.assertGreaterEqual(cycles[0]["confidence"], 0.90)

        # 2. Communication Bursts
        bursts = detect_communication_bursts()
        self.assertGreater(len(bursts), 0, "Should detect high-frequency communication bursts in CDRs")
        self.assertEqual(bursts[0]["type"], "BURST_COMMUNICATION")

        # 3. Shared Intermediaries
        bridges = detect_shared_intermediaries()
        self.assertGreater(len(bridges), 0, "Should detect high-betweenness bridge entities")

        # 4. Temporal Proximity
        temporal = detect_temporal_proximity()
        self.assertGreater(len(temporal), 0, "Should detect event-correlated temporal surges")

        # 5. Financial Smurfing
        smurfing = detect_financial_smurfing()
        self.assertGreaterEqual(len(smurfing), 1, "Should detect financial smurfing structuring")

        # 6. Burner SIM Churn
        sim_churn = detect_sim_churn()
        self.assertGreaterEqual(len(sim_churn), 1, "Should detect burner SIM churn anomaly")

    def test_04_entity_resolution_pipeline(self):
        """Verify fuzzy string similarity and candidate generation."""
        # String similarity test
        sim_high = string_similarity("Ravi Kumar", "Rajkumar")
        self.assertGreater(sim_high, 0.60)
        
        sim_exact = string_similarity("Ravi Kumar", "Ravi Kumar")
        self.assertEqual(sim_exact, 1.0)

        # Candidate scan
        candidates = run_entity_resolution_scan()
        self.assertGreater(len(candidates), 0, "Should detect identity candidate proposal")

        pending = get_pending_resolution_candidates()
        self.assertGreater(len(pending), 0)

    def test_05_nlp_entity_extraction(self):
        """Verify regex and rule-based entity extraction on Indian legal texts."""
        sample_fir = "Accused Ravi Kumar (+91-9876543210) observed near Warehouse 4 driving Scorpio OD-02-AB-1234. Proceeds of INR 1,85,00,000 wired to SBIN0001234."
        extracted = extract_structured_entities(sample_fir)

        self.assertGreater(len(extracted["phones"]), 0, "Should extract +91 phone number")
        self.assertGreater(len(extracted["vehicles"]), 0, "Should extract vehicle plate OD-02-AB-1234")
        self.assertGreater(len(extracted["locations"]), 0, "Should extract Warehouse 4 location")
        self.assertGreater(len(extracted["amounts"]), 0, "Should extract currency amount")

    def test_06_auth_and_2fa(self):
        """Verify authentication challenge and 2FA OTP verification."""
        user = {"id": "usr_test", "email": "test@siper.gov.in", "name": "Test Officer", "role": "INVESTIGATOR"}
        challenge = initiate_2fa(user)
        self.assertIn("challenge_id", challenge)

        # Verify correct OTP
        token = verify_2fa_otp(challenge["challenge_id"], "261890")
        self.assertIsNotNone(token, "Valid OTP should return a session token")

        # Retrieve session
        session = get_session(token)
        self.assertIsNotNone(session)
        self.assertEqual(session["name"], "Test Officer")

    def test_07_audit_logging(self):
        """Verify immutable audit event insertion and query."""
        action_tag = f"UNIT_TEST_ACTION_{secrets.token_hex(4)}"
        event_id = log_audit_event(
            user_id="usr_001",
            user_name="Investigator-7",
            role="INVESTIGATOR",
            action=action_tag,
            resource="TEST_SUITE"
        )
        self.assertTrue(event_id.startswith("aud_"))

        events = get_audit_events(limit=10, action_filter=action_tag)
        self.assertEqual(len(events), 1)
        self.assertEqual(events[0]["action"], action_tag)

    def test_08_rest_api_endpoints(self):
        """Verify all major REST API endpoints return HTTP 200/201 and valid schemas."""
        # 1. Dashboard KPIs
        status, data = handle_api_request("GET", "/api/v1/dashboard/kpis", {}, None, None)
        self.assertEqual(status, 200)
        self.assertIn("kpis", data)
        self.assertEqual(len(data["kpis"]), 4)

        # 2. Cases List
        status, data = handle_api_request("GET", "/api/v1/cases", {}, None, None)
        self.assertEqual(status, 200)
        self.assertIn("cases", data)

        # 3. Entity Search
        status, data = handle_api_request("GET", "/api/v1/entities/search", {"query": ["Ravi"]}, None, None)
        self.assertEqual(status, 200)
        self.assertIn("entities", data)
        self.assertGreater(len(data["entities"]), 0)

        # 4. Graph Data
        status, data = handle_api_request("GET", "/api/v1/graph/data", {}, None, None)
        self.assertEqual(status, 200)
        self.assertIn("nodes", data)
        self.assertIn("links", data)

        # 5. AI Findings
        status, data = handle_api_request("GET", "/api/v1/findings", {}, None, None)
        self.assertEqual(status, 200)
        self.assertIn("findings", data)

        # 6. Report Generation
        status, data = handle_api_request("POST", "/api/v1/reports/generate", {}, {"case_id": "CASE-26189", "title": "API Test Report"}, None)
        self.assertEqual(status, 201)
        self.assertIn("report_number", data)

        # 7. Graph Export Cytoscape
        status, data = handle_api_request("GET", "/api/v1/graph/export/cytoscape", {}, None, None)
        self.assertEqual(status, 200)
        self.assertIn("nodes", data)
        self.assertIn("edges", data)

        # 8. Graph Export GraphML
        status, data = handle_api_request("GET", "/api/v1/graph/export/graphml", {}, None, None)
        self.assertEqual(status, 200)
        self.assertIn("graphml", data)
        self.assertTrue("<graphml" in data["graphml"])

    def test_09_cases_module_integration(self):
        """Verify comprehensive Cases module CRUD, filtering, grouped entities, and audit logging."""
        # 1. Cases list with filters & summary
        status, data = handle_api_request("GET", "/api/v1/cases", {"status": ["ACTIVE"]}, None, None)
        self.assertEqual(status, 200)
        self.assertIn("cases", data)
        self.assertIn("summary", data)
        self.assertGreaterEqual(data["summary"]["active_cases"], 1)

        # 2. Case Search
        status, data = handle_api_request("GET", "/api/v1/cases", {"search": ["Cyber"]}, None, None)
        self.assertEqual(status, 200)
        self.assertGreaterEqual(len(data["cases"]), 1)

        # 3. Create New Case (POST)
        new_case_payload = {
            "title": "Integration Test Narcotics Network",
            "description": "Cross-border logistics tracking test case.",
            "case_type": "Drug Distribution",
            "priority": "CRITICAL",
            "assigned_investigator": "Investigator-7",
            "location": "Bhubaneswar Regional Hub",
            "tags": ["Narcotics", "Test"]
        }
        status, res = handle_api_request("POST", "/api/v1/cases", {}, new_case_payload, None)
        self.assertEqual(status, 201)
        self.assertTrue(res["success"])
        test_case_id = res["case_id"]

        # Verify persisted in database
        conn = get_db()
        c_row = conn.execute("SELECT * FROM cases WHERE id = ?", (test_case_id,)).fetchone()
        self.assertIsNotNone(c_row)
        self.assertEqual(c_row["title"], new_case_payload["title"])
        self.assertEqual(c_row["case_type"], "Drug Distribution")
        conn.close()

        # 4. Case Detail Retrieval (GET)
        status, detail = handle_api_request("GET", f"/api/v1/cases/{test_case_id}", {}, None, None)
        self.assertEqual(status, 200)
        self.assertIn("case", detail)
        self.assertEqual(detail["case"]["id"], test_case_id)
        self.assertIn("entities_by_type", detail)

        # 5. Check primary case CASE-26189 details & related cases
        status, p_detail = handle_api_request("GET", "/api/v1/cases/CASE-26189", {}, None, None)
        self.assertEqual(status, 200)
        self.assertIn("related_cases", p_detail)
        self.assertGreaterEqual(len(p_detail["related_cases"]), 1)
        self.assertIn("shared_entities", p_detail["related_cases"][0])

        # 6. Update Case Status (PUT)
        status, u_res = handle_api_request("PUT", f"/api/v1/cases/{test_case_id}", {}, {"status": "CLOSED"}, None)
        self.assertEqual(status, 200)
        self.assertTrue(u_res["success"])

        conn = get_db()
        c_status = conn.execute("SELECT status FROM cases WHERE id = ?", (test_case_id,)).fetchone()["status"]
        self.assertEqual(c_status, "CLOSED")

        # Verify audit event for status change
        audit_row = conn.execute(
            "SELECT * FROM audit_events WHERE case_id = ? AND action = 'CHANGE_CASE_STATUS'",
            (test_case_id,)
        ).fetchone()
        self.assertIsNotNone(audit_row, "Status change must be recorded in immutable audit log")
        conn.close()

        # 7. Archive Case (DELETE)
        status, del_res = handle_api_request("DELETE", f"/api/v1/cases/{test_case_id}", {}, None, None)
        self.assertEqual(status, 200)

        conn = get_db()
        arch_status = conn.execute("SELECT status FROM cases WHERE id = ?", (test_case_id,)).fetchone()["status"]
        self.assertEqual(arch_status, "ARCHIVED")
        conn.close()

        # 8. Dashboard Active Cases synchronization check
        status, dash_kpis = handle_api_request("GET", "/api/v1/dashboard/kpis", {}, None, None)
        self.assertEqual(status, 200)
        active_kpi = next((k for k in dash_kpis["kpis"] if k["id"] == "active_cases"), None)
        self.assertIsNotNone(active_kpi)

        conn = get_db()
        expected_active = conn.execute("SELECT COUNT(*) as c FROM cases WHERE status = 'ACTIVE'").fetchone()["c"]
        conn.close()
        self.assertEqual(active_kpi["value"], expected_active)

if __name__ == "__main__":
    unittest.main()
