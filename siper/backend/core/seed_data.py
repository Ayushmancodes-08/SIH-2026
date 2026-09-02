"""
SIPER Synthetic Investigation Dataset Initializer (SIH PS 26189)
Populates realistic, interconnected case intelligence for demo and testing.
"""
import json
import time
from .database import get_db, init_db
from .auth import hash_password
from .graph import compute_graph_metrics
from .pattern_detector import run_all_pattern_detectors
from .entity_resolver import run_entity_resolution_scan

def ensure_case_metadata_and_links(conn):
    """Ensure cases have proper case_type, location, and entity associations."""
    with conn:
        # Update case_type and location
        updates = [
            ("Organized Crime", "Cuttack & Eastern Corridor", "CASE-26189"),
            ("Financial Crime", "Delhi-Kolkata Corridor", "CASE-25410"),
            ("Cross-Border Crime", "Paradip Port Terminal", "CASE-24902"),
            ("Cyber Crime", "Bhubaneswar Hub", "CASE-23118"),
        ]
        for ctype, loc, cid in updates:
            conn.execute(
                "UPDATE cases SET case_type = ?, location = ? WHERE id = ?",
                (ctype, loc, cid)
            )

        # Ensure case_entities mappings exist
        ce_count = conn.execute("SELECT COUNT(*) as c FROM case_entities").fetchone()["c"]
        if ce_count == 0:
            now = "2026-08-10 10:00:00"
            entity_rows = conn.execute("SELECT id FROM entities").fetchall()
            all_entity_ids = [r["id"] for r in entity_rows]
            
            # Map all entities to primary case CASE-26189
            ce_records = [("CASE-26189", eid, "PRIMARY_SUSPECT" if "ent_p_" in eid else "ASSOCIATED_NODE", now) for eid in all_entity_ids]
            
            # Map overlapping entities for CASE-25410 (Financial Crime / Hawala Hub)
            hawala_entities = [
                "ent_p_005", "ent_org_002", "ent_org_004", "ent_fa_002", "ent_fa_003",
                "ent_ph_005", "ent_loc_002"
            ]
            for eid in hawala_entities:
                if eid in all_entity_ids:
                    ce_records.append(("CASE-25410", eid, "FINANCIAL_LINK", now))

            # Map overlapping entities for CASE-24902 (Maritime Smuggling via Paradip Port)
            port_entities = [
                "ent_p_007", "ent_p_002", "ent_v_003", "ent_loc_003", "ent_org_001", "ent_p_006"
            ]
            for eid in port_entities:
                if eid in all_entity_ids:
                    ce_records.append(("CASE-24902", eid, "PORT_LOGISTICS_LINK", now))

            # Map overlapping entities for CASE-23118 (Cyber Crime / Forgery)
            counterfeit_entities = [
                "ent_org_004", "ent_p_004", "ent_fa_003", "ent_p_008"
            ]
            for eid in counterfeit_entities:
                if eid in all_entity_ids:
                    ce_records.append(("CASE-23118", eid, "FRAUD_INFRASTRUCTURE", now))

            conn.executemany(
                "INSERT OR IGNORE INTO case_entities (case_id, entity_id, role_in_case, created_at) VALUES (?, ?, ?, ?)",
                ce_records
            )

        # Update entity counts and findings counts on cases
        case_rows = conn.execute("SELECT id FROM cases").fetchall()
        for crow in case_rows:
            cid = crow["id"]
            ecount = conn.execute("SELECT COUNT(DISTINCT entity_id) as c FROM case_entities WHERE case_id = ?", (cid,)).fetchone()["c"]
            fcount = conn.execute("SELECT COUNT(*) as c FROM findings WHERE case_id = ?", (cid,)).fetchone()["c"]
            conn.execute(
                "UPDATE cases SET entity_count = ?, findings_count = ? WHERE id = ?",
                (ecount if ecount > 0 else 0, fcount, cid)
            )

def seed_database():
    """Seed comprehensive investigative dataset for SIH demonstration."""
    init_db()
    conn = get_db()
    
    # Check if already seeded
    existing_entities = conn.execute("SELECT COUNT(*) as count FROM entities").fetchone()["count"]
    if existing_entities > 0:
        ensure_case_metadata_and_links(conn)
        conn.close()
        return

    with conn:
        # 1. Seed Users
        users = [
            ("usr_001", "investigator@siper.gov.in", hash_password("Sentinel@2026"), "Investigator-7", "INVESTIGATOR", "NCRB-INV-26189", "Special Intelligence Wing"),
            ("usr_001b", "investigator@ncrb.gov.in", hash_password("Investigator@2026"), "Investigator-7", "INVESTIGATOR", "NCRB-INV-26189", "Special Intelligence Wing"),
            ("usr_002", "supervisor@siper.gov.in", hash_password("Sentinel@2026"), "Supervisor-1", "SUPERVISOR", "MHA-SUP-1004", "Operational Command"),
            ("usr_003", "analyst@siper.gov.in", hash_password("Sentinel@2026"), "Analyst-3", "ANALYST", "NCRB-ANA-5521", "Graph Analytics Unit"),
            ("usr_004", "admin@siper.gov.in", hash_password("Sentinel@2026"), "Admin-Root", "ADMIN", "NCRB-ADM-0001", "Security & IT Infrastructure"),
            ("usr_005", "auditor@siper.gov.in", hash_password("Sentinel@2026"), "Auditor-01", "AUDITOR", "MHA-AUD-9912", "Compliance & Audit Directorate")
        ]
        conn.executemany(
            "INSERT INTO users (id, email, password_hash, name, role, badge_number, unit, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, '2026-08-01 08:00:00')",
            users
        )

        # 2. Seed Cases
        cases = [
            (
                "CASE-26189",
                "Organized Cyber-Financial Fraud & Drug Distribution Syndicate",
                "Cross-state criminal network operating high-volume cyber fraud, automated laundering through shell corporations, and narcotic logistics via eastern transit corridors.",
                "CRITICAL", "ACTIVE", "Investigator-7",
                json.dumps(["Investigator-7", "Analyst-3", "Supervisor-1"]),
                34, 6, "2026-08-10 10:00:00", "2026-08-30 18:30:00",
                json.dumps(["Cyber Fraud", "Hawala", "Narcotics", "Shell Companies", "PS-26189"])
            ),
            (
                "CASE-25410",
                "Cross-Border Hawala Layering & Illicit Telecom Hub",
                "Investigation into illegal SIM box routing hubs and multi-tier banking structuring across Delhi-Kolkata corridors.",
                "HIGH", "ACTIVE", "Investigator-7",
                json.dumps(["Investigator-7", "Supervisor-1"]),
                18, 3, "2026-07-22 09:15:00", "2026-08-28 14:20:00",
                json.dumps(["Hawala", "SIM Box", "Banking"])
            ),
            (
                "CASE-24902",
                "Maritime Smuggling & Contraband Transit via Paradip Port",
                "Interception of freight containers with illicit contraband falsely manifested as industrial chemicals.",
                "HIGH", "UNDER_REVIEW", "Supervisor-1",
                json.dumps(["Supervisor-1", "Analyst-3"]),
                14, 2, "2026-06-15 11:30:00", "2026-08-25 16:45:00",
                json.dumps(["Maritime", "Port Security", "Smuggling"])
            ),
            (
                "CASE-23118",
                "Counterfeit Financial Instruments Ring",
                "Archived case tracking forged bank guarantees and fraudulent invoice financing.",
                "MEDIUM", "CLOSED", "Investigator-7",
                json.dumps(["Investigator-7"]),
                11, 1, "2026-04-05 08:00:00", "2026-07-10 17:00:00",
                json.dumps(["Counterfeit", "Forgery", "Closed"])
            )
        ]
        conn.executemany(
            """
            INSERT INTO cases (
                id, title, description, priority, status, owner,
                assigned_investigators, entity_count, findings_count, created_at, updated_at, tags
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            cases
        )

        # 3. Seed Entities (Persons, Phones, Vehicles, Locations, Orgs, Accounts, Incidents)
        entities = [
            # Persons
            (
                "ent_p_001", "Ravi Kumar", "Person", "HIGH", 88, 0.94,
                json.dumps(["Rajkumar", "The Shadow", "R. Kumar", "RK"]),
                json.dumps({"phone": "9876543210", "vehicle_plate": "OD-02-AB-1234", "address": "Plot 42, Sector 9, CDA, Cuttack", "role": "Key Intermediary / Coordinator"}),
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                "Identified as primary operational coordinator connecting transport fleet to offshore financing entities.",
                "2026-08-10 10:30:00", "2026-08-30 18:00:00"
            ),
            (
                "ent_p_002", "Amit Verma", "Person", "HIGH", 79, 0.91,
                json.dumps(["Verma Ji", "AV"]),
                json.dumps({"phone": "9876543211", "vehicle_plate": "OD-02-CD-5678", "address": "Flat 302, Royal Residency, Bhubaneswar", "role": "Logistics & Transport Manager"}),
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
                "Manages Garuda Logistics transport fleet. Multiple calls logged prior to warehouse shipment.",
                "2026-08-10 10:30:00", "2026-08-30 18:00:00"
            ),
            (
                "ent_p_003", "Neha Sharma", "Person", "HIGH", 84, 0.89,
                json.dumps(["Neha S.", "NS"]),
                json.dumps({"phone": "9876543212", "account_number": "38291049281", "address": "Cyber Towers, Sector 5, Salt Lake, Kolkata", "role": "Financial Controller / Account Signatory"}),
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
                "Director in Apex Shell Holdings. Controls 4 offshore bank accounts receiving structured funds.",
                "2026-08-10 10:30:00", "2026-08-30 18:00:00"
            ),
            (
                "ent_p_004", "Vikram Malhotra", "Person", "HIGH", 92, 0.95,
                json.dumps(["V. Malhotra", "The Boss", "VM"]),
                json.dumps({"phone": "9876543213", "address": "Bungalow 18, Golf Links, New Delhi", "role": "Syndicate Beneficiary"}),
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
                "Ultimate beneficial owner identified across multiple shell corporate filings.",
                "2026-08-10 10:30:00", "2026-08-30 18:00:00"
            ),
            (
                "ent_p_005", "Kabir Singhania", "Person", "MEDIUM", 68, 0.86,
                json.dumps(["K. Singhania", "KS"]),
                json.dumps({"phone": "9876543214", "address": "Park Street Suite 4B, Kolkata", "role": "Hawala Broker"}),
                "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
                "Operates intermediary accounts used in 3-tier layering transactions.",
                "2026-08-10 10:30:00", "2026-08-30 18:00:00"
            ),
            (
                "ent_p_006", "Suresh Jena", "Person", "MEDIUM", 58, 0.88,
                json.dumps(["Jena Driver", "SJ"]),
                json.dumps({"phone": "9876543215", "vehicle_plate": "WB-01-EF-9988", "address": "Jagatpur Industrial Area, Cuttack", "role": "Warehouse Fleet Driver"}),
                "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
                "Driver intercepted during Warehouse 4 raid transporting undisclosed consignment.",
                "2026-08-10 10:30:00", "2026-08-30 18:00:00"
            ),
            (
                "ent_p_007", "Deepak Pattnaik", "Person", "LOW", 35, 0.82,
                json.dumps(["D. Pattnaik"]),
                json.dumps({"phone": "9876543216", "address": "Paradip Port Colony, Jagatsinghpur", "role": "Customs Clearing Agent"}),
                "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150",
                "Clearing agent for Garuda Logistics maritime consignments.",
                "2026-08-10 10:30:00", "2026-08-30 18:00:00"
            ),
            (
                "ent_p_008", "Manoj Das", "Person", "HIGH", 76, 0.89,
                json.dumps(["MD", "Manoj Cyber"]),
                json.dumps({"phone": "9876543217", "address": "Chandrasekharpur, Bhubaneswar", "role": "Cyber Infrastructure Operator"}),
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
                "Manages mule accounts and crypto-fiat off-ramps.",
                "2026-08-10 10:30:00", "2026-08-30 18:00:00"
            ),
            (
                "ent_p_011", "R. Kumar S.", "Person", "MEDIUM", 62, 0.80,
                json.dumps(["Raj Kumar S."]),
                json.dumps({"phone": "9876543210", "vehicle_plate": "OD-02-AB-1234", "address": "Plot 42, Sector 9, CDA, Cuttack", "role": "Commercial Trader"}),
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
                "Duplicate identity profile flagged by Entity Resolution engine (same phone & vehicle as Ravi Kumar).",
                "2026-08-12 14:00:00", "2026-08-30 18:00:00"
            ),

            # Organizations
            (
                "ent_org_001", "Garuda Logistics Pvt Ltd", "Organization", "HIGH", 82, 0.96,
                json.dumps(["Garuda Freight", "GLPL"]),
                json.dumps({"cin": "U60200OR2020PTC034123", "address": "Sector 5, Industrial Area, Cuttack", "directors": ["Amit Verma", "Ravi Kumar"]}),
                "",
                "Front transport corporation used to physically move narcotics and illicit freight.",
                "2026-08-10 10:30:00", "2026-08-30 18:00:00"
            ),
            (
                "ent_org_002", "Apex Shell Holdings", "Organization", "HIGH", 89, 0.95,
                json.dumps(["Apex Corp", "ASH Ltd"]),
                json.dumps({"cin": "U65999WB2021PTC089456", "address": "Park Street Suite 4B, Kolkata", "directors": ["Neha Sharma", "Kabir Singhania"]}),
                "",
                "Paper corporation receiving structured funds from cyber fraud operations.",
                "2026-08-10 10:30:00", "2026-08-30 18:00:00"
            ),
            (
                "ent_org_003", "Kalinga Trading Syndicate", "Organization", "MEDIUM", 65, 0.88,
                json.dumps(["KTS"]),
                json.dumps({"address": "Station Road, Bhubaneswar"}),
                "",
                "Wholesale trading firm linked to cash structuring deposits.",
                "2026-08-10 10:30:00", "2026-08-30 18:00:00"
            ),
            (
                "ent_org_004", "Shadow FinTech Corp", "Organization", "HIGH", 85, 0.92,
                json.dumps(["Shadow Pay", "SFTC"]),
                json.dumps({"address": "Cyber Hub, Gurugram"}),
                "",
                "Unregistered payment aggregation platform routing funds back to Garuda Logistics.",
                "2026-08-10 10:30:00", "2026-08-30 18:00:00"
            ),

            # Phones
            (
                "ent_ph_001", "+91-9876543210", "Phone", "HIGH", 85, 0.98,
                json.dumps(["Ravi Main SIM"]),
                json.dumps({"carrier": "Airtel Odisha", "imei": "864291049281726", "holder": "Ravi Kumar"}),
                "",
                "Primary communication device for operational coordination.",
                "2026-08-10 10:30:00", "2026-08-30 18:00:00"
            ),
            (
                "ent_ph_002", "+91-9876543211", "Phone", "MEDIUM", 65, 0.98,
                json.dumps(["Amit Verma Phone"]),
                json.dumps({"carrier": "Jio Odisha", "imei": "864291049281727", "holder": "Amit Verma"}),
                "",
                "Logistics coordination contact number.",
                "2026-08-10 10:30:00", "2026-08-30 18:00:00"
            ),
            (
                "ent_ph_003", "+91-9876543212", "Phone", "HIGH", 80, 0.98,
                json.dumps(["Neha Kolkata Phone"]),
                json.dumps({"carrier": "Vodafone WB", "imei": "864291049281728", "holder": "Neha Sharma"}),
                "",
                "Direct contact point for offshore wire authorizations.",
                "2026-08-10 10:30:00", "2026-08-30 18:00:00"
            ),
            (
                "ent_ph_004", "+91-9876543213", "Phone", "HIGH", 90, 0.99,
                json.dumps(["Vikram VIP Line"]),
                json.dumps({"carrier": "Airtel Delhi", "imei": "864291049281729", "holder": "Vikram Malhotra"}),
                "",
                "Encrypted device used solely for high-value directives.",
                "2026-08-10 10:30:00", "2026-08-30 18:00:00"
            ),

            # Vehicles
            (
                "ent_v_001", "OD-02-AB-1234", "Vehicle", "HIGH", 82, 0.95,
                json.dumps(["Black Scorpio", "Ravi SUV"]),
                json.dumps({"make": "Mahindra Scorpio", "color": "Black", "registered_owner": "Ravi Kumar"}),
                "",
                "Repeatedly sighted at Warehouse 4 before nocturnal dispatches.",
                "2026-08-10 10:30:00", "2026-08-30 18:00:00"
            ),
            (
                "ent_v_002", "OD-02-CD-5678", "Vehicle", "MEDIUM", 60, 0.94,
                json.dumps(["White Fortuner"]),
                json.dumps({"make": "Toyota Fortuner", "color": "White", "registered_owner": "Garuda Logistics"}),
                "",
                "Escort vehicle for container shipments.",
                "2026-08-10 10:30:00", "2026-08-30 18:00:00"
            ),
            (
                "ent_v_003", "WB-01-EF-9988", "Vehicle", "HIGH", 85, 0.96,
                json.dumps(["Container Truck 14-Wheeler"]),
                json.dumps({"make": "Tata Prima", "color": "Blue/Silver", "driver": "Suresh Jena"}),
                "",
                "Intercepted at Warehouse 4 containing concealed false floor compartments.",
                "2026-08-10 10:30:00", "2026-08-30 18:00:00"
            ),

            # Locations
            (
                "ent_loc_001", "Warehouse 4, Industrial Area Sector 5, Cuttack", "Location", "HIGH", 88, 0.95,
                json.dumps(["Warehouse 4", "Cuttack Depot"]),
                json.dumps({"lat": 20.4625, "lng": 85.8828, "type": "Industrial Storage"}),
                "",
                "Primary sorting and packing hub raided by Special Task Force on 2026-08-18.",
                "2026-08-10 10:30:00", "2026-08-30 18:00:00"
            ),
            (
                "ent_loc_002", "Cyber Hub Tower B, Bhubaneswar", "Location", "MEDIUM", 55, 0.90,
                json.dumps(["Infocity Office"]),
                json.dumps({"lat": 20.2961, "lng": 85.8245, "type": "Commercial Office"}),
                "",
                "Registered office address for Garuda Logistics Pvt Ltd.",
                "2026-08-10 10:30:00", "2026-08-30 18:00:00"
            ),
            (
                "ent_loc_003", "Port Area Terminal 2, Paradip", "Location", "HIGH", 78, 0.92,
                json.dumps(["Paradip Terminal"]),
                json.dumps({"lat": 20.2644, "lng": 86.6083, "type": "Maritime Terminal"}),
                "",
                "Entry port for shipping containers manifested under chemical classifications.",
                "2026-08-10 10:30:00", "2026-08-30 18:00:00"
            ),

            # Financial Accounts
            (
                "ent_fa_001", "SBI A/C 38291049281", "FinancialAccount", "HIGH", 85, 0.97,
                json.dumps(["Garuda Current Account"]),
                json.dumps({"account_number": "38291049281", "bank": "State Bank of India", "ifsc": "SBIN0001234", "branch": "Cuttack Main"}),
                "",
                "Originating account for structured fund dispersion.",
                "2026-08-10 10:30:00", "2026-08-30 18:00:00"
            ),
            (
                "ent_fa_002", "HDFC A/C 99182736451", "FinancialAccount", "HIGH", 88, 0.98,
                json.dumps(["Apex Shell Account"]),
                json.dumps({"account_number": "99182736451", "bank": "HDFC Bank", "ifsc": "HDFC0005678", "branch": "Park Street Kolkata"}),
                "",
                "Intermediary account in 3-tier circular laundering loop.",
                "2026-08-10 10:30:00", "2026-08-30 18:00:00"
            ),
            (
                "ent_fa_003", "ICICI A/C 77665544332", "FinancialAccount", "HIGH", 84, 0.96,
                json.dumps(["Shadow FinTech Account"]),
                json.dumps({"account_number": "77665544332", "bank": "ICICI Bank", "ifsc": "ICIC0009988", "branch": "Cyber Hub Gurugram"}),
                "",
                "Receiving node completing circular fund loop back to Garuda Logistics.",
                "2026-08-10 10:30:00", "2026-08-30 18:00:00"
            ),

            # Incidents
            (
                "ent_inc_001", "FIR 104/2026: Raid at Warehouse 4", "Incident", "HIGH", 95, 0.99,
                json.dumps(["Warehouse 4 Raid", "STF Operation"]),
                json.dumps({"fir_no": "FIR-104/2026", "date": "2026-08-18", "location": "Cuttack Industrial Area", "police_station": "Jagatpur PS"}),
                "",
                "Tactical law enforcement raid seizing 120kg contraband and vehicle WB-01-EF-9988.",
                "2026-08-18 22:00:00", "2026-08-30 18:00:00"
            ),
            (
                "ent_inc_002", "FIR 042/2026: ₹4.2 Cr Cyber Fraud & Layering", "Incident", "HIGH", 92, 0.98,
                json.dumps(["Cyber Phishing Case", "Kolkata Hawala FIR"]),
                json.dumps({"fir_no": "FIR-042/2026", "date": "2026-08-12", "amount": "₹4,20,00,000", "police_station": "Cyber Crime PS Kolkata"}),
                "",
                "Major cyber fraud operation routing illicit funds into Apex Shell Holdings accounts.",
                "2026-08-12 11:00:00", "2026-08-30 18:00:00"
            )
        ]

        conn.executemany(
            """
            INSERT INTO entities (
                id, canonical_name, type, risk_level, risk_score, confidence,
                aliases, identifiers, primary_photo, notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            entities
        )

        # 4. Seed Relationships
        relationships = [
            # Person to Person
            ("rel_001", "ent_p_001", "ent_p_002", "CONTACTED", 0.95, 42, "2026-04-10", "2026-08-28", 1, json.dumps(["doc_001", "doc_002"]), "42 direct telephone calls and joint coordination meetings documented in CDR files."),
            ("rel_002", "ent_p_001", "ent_p_003", "CONTACTED", 0.91, 28, "2026-05-02", "2026-08-27", 1, json.dumps(["doc_002", "doc_004"]), "28 communication records correlating with financial wire transfer approvals."),
            ("rel_003", "ent_p_001", "ent_p_004", "WORKS_FOR", 0.94, 18, "2026-03-15", "2026-08-29", 1, json.dumps(["doc_001", "doc_005"]), "Frequent encrypted calls and direct operational briefings received from Vikram Malhotra."),
            ("rel_004", "ent_p_002", "ent_p_006", "ASSOCIATED_WITH", 0.96, 35, "2026-06-01", "2026-08-18", 1, json.dumps(["doc_001", "doc_003"]), "Supervised dispatch instructions given to truck driver Suresh Jena."),
            ("rel_005", "ent_p_003", "ent_p_005", "ASSOCIATED_WITH", 0.88, 15, "2026-05-10", "2026-08-20", 1, json.dumps(["doc_004"]), "Joint account signatories and co-directors in Apex Shell Holdings."),
            ("rel_006", "ent_p_002", "ent_p_007", "CONTACTED", 0.85, 12, "2026-06-20", "2026-08-22", 1, json.dumps(["doc_002"]), "Customs clearance tracking calls for Paradip freight shipments."),
            ("rel_007", "ent_p_004", "ent_p_008", "CONTACTED", 0.89, 22, "2026-07-01", "2026-08-25", 1, json.dumps(["doc_002"]), "Direct instructions on mule account acquisitions and crypto off-ramping."),

            # Person to Phone
            ("rel_008", "ent_p_001", "ent_ph_001", "USED", 0.99, 120, "2026-01-01", "2026-08-30", 1, json.dumps(["doc_002"]), "Registered subscriber and verified user of Airtel Odisha MSISDN."),
            ("rel_009", "ent_p_002", "ent_ph_002", "USED", 0.98, 90, "2026-02-15", "2026-08-30", 1, json.dumps(["doc_002"]), "Jio telecom subscription in name of Amit Verma."),
            ("rel_010", "ent_p_003", "ent_ph_003", "USED", 0.97, 85, "2026-03-01", "2026-08-30", 1, json.dumps(["doc_002"]), "Vodafone line utilized for Kolkata operations."),
            ("rel_011", "ent_p_004", "ent_ph_004", "USED", 0.99, 50, "2026-01-10", "2026-08-30", 1, json.dumps(["doc_002"]), "Private executive line used by Vikram Malhotra."),

            # Person to Vehicle
            ("rel_012", "ent_p_001", "ent_v_001", "ASSOCIATED_WITH", 0.95, 24, "2026-04-01", "2026-08-25", 1, json.dumps(["doc_003"]), "Registered owner of Black Scorpio OD-02-AB-1234."),
            ("rel_013", "ent_p_002", "ent_v_002", "ASSOCIATED_WITH", 0.90, 16, "2026-05-12", "2026-08-20", 1, json.dumps(["doc_003"]), "Frequent driver and custodian of Fortuner OD-02-CD-5678."),
            ("rel_014", "ent_p_006", "ent_v_003", "USED", 0.98, 10, "2026-08-10", "2026-08-18", 1, json.dumps(["doc_001"]), "Driver apprehended operating container truck WB-01-EF-9988 during raid."),

            # Person to Org
            ("rel_015", "ent_p_001", "ent_org_001", "WORKS_FOR", 0.94, 30, "2026-01-01", "2026-08-30", 1, json.dumps(["doc_001", "doc_005"]), "Authorized signatory and operational coordinator at Garuda Logistics."),
            ("rel_016", "ent_p_002", "ent_org_001", "WORKS_FOR", 0.96, 45, "2026-01-01", "2026-08-30", 1, json.dumps(["doc_001"]), "Designated Director and Fleet Manager at Garuda Logistics."),
            ("rel_017", "ent_p_003", "ent_org_002", "WORKS_FOR", 0.95, 20, "2026-03-01", "2026-08-30", 1, json.dumps(["doc_004"]), "Managing Director and majority shareholder of Apex Shell Holdings."),
            ("rel_018", "ent_p_004", "ent_org_002", "ASSOCIATED_WITH", 0.92, 14, "2026-03-01", "2026-08-30", 1, json.dumps(["doc_004"]), "Beneficial owner directing Apex Shell Holdings investments."),

            # Person / Org to Location
            ("rel_019", "ent_p_001", "ent_loc_001", "VISITED", 0.92, 18, "2026-06-01", "2026-08-18", 1, json.dumps(["doc_003"]), "18 physical sightings recorded by surveillance team at Warehouse 4."),
            ("rel_020", "ent_org_001", "ent_loc_001", "USED", 0.98, 1, "2026-01-01", "2026-08-30", 1, json.dumps(["doc_001"]), "Lease agreement held by Garuda Logistics for Warehouse 4 premises."),
            ("rel_021", "ent_p_002", "ent_loc_003", "VISITED", 0.88, 8, "2026-07-01", "2026-08-20", 1, json.dumps(["doc_002"]), "Cell tower triangulation confirms presence at Paradip Port Terminal 2."),

            # Financial Flow Links
            ("rel_022", "ent_org_001", "ent_fa_001", "TRANSFERRED_TO", 0.98, 50, "2026-01-01", "2026-08-30", 1, json.dumps(["doc_004"]), "Official corporate current account of Garuda Logistics."),
            ("rel_023", "ent_fa_001", "ent_fa_002", "TRANSFERRED_TO", 0.96, 12, "2026-08-01", "2026-08-15", 1, json.dumps(["doc_004"]), "₹1.85 Cr transferred from Garuda SBI account to Apex Shell HDFC account (Step 1 of cycle)."),
            ("rel_024", "ent_fa_002", "ent_fa_003", "TRANSFERRED_TO", 0.95, 8, "2026-08-03", "2026-08-17", 1, json.dumps(["doc_004"]), "₹1.80 Cr transferred from Apex Shell HDFC account to Shadow FinTech ICICI account (Step 2 of cycle)."),
            ("rel_025", "ent_fa_003", "ent_fa_001", "TRANSFERRED_TO", 0.94, 6, "2026-08-05", "2026-08-19", 1, json.dumps(["doc_004"]), "₹1.75 Cr returned to Garuda Logistics SBI account as 'Tech Service Fees' (Completing circular laundering loop)."),

            # Incidents
            ("rel_026", "ent_p_006", "ent_inc_001", "INVOLVED_IN", 0.99, 1, "2026-08-18", "2026-08-18", 1, json.dumps(["doc_001"]), "Arrested on-site during tactical warehouse raid."),
            ("rel_027", "ent_p_001", "ent_inc_001", "INVOLVED_IN", 0.92, 1, "2026-08-18", "2026-08-18", 1, json.dumps(["doc_001", "doc_003"]), "Key suspect named in FIR 104/2026; fled minutes before entry."),
            ("rel_028", "ent_p_003", "ent_inc_002", "INVOLVED_IN", 0.94, 1, "2026-08-12", "2026-08-12", 1, json.dumps(["doc_005"]), "Primary accused signatory in ₹4.2 Cr cyber fraud FIR 042/2026.")
        ]

        conn.executemany(
            """
            INSERT INTO relationships (
                id, source_id, target_id, type, confidence, source_count,
                first_seen, last_seen, verified, provenance_ids, explanation
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            relationships
        )

        # 5. Seed Ingested Documents
        documents = [
            (
                "doc_001", "FIR_104_2026_Warehouse_Raid.pdf", "PDF", 245000, "CASE-26189", "Investigator-7", "2026-08-19 09:30:00",
                "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", 14,
                "FIRST INFORMATION REPORT (Under Section 154 Cr.P.C.). Police Station: Jagatpur PS, Cuttack. FIR No: 104/2026. Date: 18/08/2026. Accused: Ravi Kumar alias 'The Shadow', Amit Verma, Suresh Jena (Driver). Acts: NDPS Act Sec 20(b), IPC 120B. Summary: On credible intelligence, STF conducted a raid on Warehouse 4, Sector 5 Industrial Area. Seized 120kg contraband concealed inside container vehicle WB-01-EF-9988. Driver Suresh Jena apprehended on spot. Suspect Ravi Kumar observed fleeing in black Scorpio OD-02-AB-1234.",
                "FIR"
            ),
            (
                "doc_002", "CDR_Analysis_RaviKumar_Aug2026.csv", "CSV", 185000, "CASE-26189", "Investigator-7", "2026-08-20 14:15:00",
                "5d41402abc4b2a76b9719d911017c592b23a9d94943f9a7465f1f9e2b109e3e2", 22,
                "Call Detail Records analysis for MSISDN +91-9876543210 (Ravi Kumar) spanning 01-Aug-2026 to 20-Aug-2026. Identifies frequent communication bursts with +91-9876543211 (Amit Verma, 42 calls) and +91-9876543213 (Vikram Malhotra, 18 calls). Spike in communication observed on 17-Aug and 18-Aug immediately prior to raid execution.",
                "CDR"
            ),
            (
                "doc_003", "Surveillance_Log_Industrial_Area_Cuttack.docx", "DOCX", 92000, "CASE-26189", "Investigator-7", "2026-08-21 11:00:00",
                "7d793037a0760186574b0282f2f435e7b1e0f09800a98f12a200f6c2e399a9a3", 8,
                "PHYSICAL SURVEILLANCE LOG: Target Location: Warehouse 4, Cuttack. Operational Period: 01-Aug-2026 to 18-Aug-2026. Log entry: Black Scorpio OD-02-AB-1234 observed arriving at 22:30 on multiple occasions. Ravi Kumar observed meeting Amit Verma and coordinating with container trucks. Security cameras noted around perimeter.",
                "Surveillance"
            ),
            (
                "doc_004", "Bank_Statement_Garuda_Logistics_SBI.xlsx", "XLSX", 412000, "CASE-26189", "Analyst-3", "2026-08-22 16:45:00",
                "a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0", 18,
                "BANK STATEMENT: State Bank of India, Account 38291049281 (Garuda Logistics Pvt Ltd). High-value structured debits totaling ₹1.85 Cr transferred to Apex Shell Holdings (HDFC A/C 99182736451). Corresponding credits of ₹1.75 Cr received back from Shadow FinTech Corp (ICICI A/C 77665544332) within 14 days under invoice label 'Consulting & Software Licensing'.",
                "Financial"
            ),
            (
                "doc_005", "FIR_042_2026_Cyber_Phishing_Kolkata.pdf", "PDF", 198000, "CASE-26189", "Investigator-7", "2026-08-23 10:20:00",
                "b4c5d6e7f8091a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d5e6f708192a3", 12,
                "FIR No. 042/2026, Cyber Crime PS Kolkata. Complainant: Eastern Power Grid Corp. Accused: Neha Sharma, Kabir Singhania, Apex Shell Holdings. Acts: IT Act Sec 66D, IPC 420, 468. Summary: Sophisticated spear-phishing attack intercepted corporate payout of ₹4.2 Crore routed into mule accounts controlled by Apex Shell Holdings.",
                "FIR"
            )
        ]

        conn.executemany(
            """
            INSERT INTO documents (
                id, title, file_type, file_size, case_id, uploader,
                timestamp, sha256_hash, extracted_entities_count, raw_text, source_category
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            documents
        )

        # 6. Seed CDR Records
        cdr_records = [
            ("cdr_001", "9876543210", "9876543211", "Ravi Kumar", "Amit Verma", "2026-08-17 19:42:10", 340, "Tower-Sector5-Cuttack", "CASE-26189"),
            ("cdr_002", "9876543210", "9876543211", "Ravi Kumar", "Amit Verma", "2026-08-17 21:15:30", 185, "Tower-Sector5-Cuttack", "CASE-26189"),
            ("cdr_003", "9876543210", "9876543211", "Ravi Kumar", "Amit Verma", "2026-08-18 01:20:00", 520, "Tower-Jagatpur-Cuttack", "CASE-26189"),
            ("cdr_004", "9876543210", "9876543211", "Ravi Kumar", "Amit Verma", "2026-08-18 03:45:12", 210, "Tower-Jagatpur-Cuttack", "CASE-26189"),
            ("cdr_005", "9876543210", "9876543211", "Ravi Kumar", "Amit Verma", "2026-08-18 05:10:44", 415, "Tower-Sector5-Cuttack", "CASE-26189"),
            ("cdr_006", "9876543210", "9876543213", "Ravi Kumar", "Vikram Malhotra", "2026-08-17 22:30:15", 620, "Tower-Sector9-Cuttack", "CASE-26189"),
            ("cdr_007", "9876543210", "9876543213", "Ravi Kumar", "Vikram Malhotra", "2026-08-18 06:15:00", 380, "Tower-Jagatpur-Cuttack", "CASE-26189"),
            ("cdr_008", "9876543211", "9876543215", "Amit Verma", "Suresh Jena", "2026-08-18 02:00:10", 190, "Tower-Jagatpur-Cuttack", "CASE-26189"),
            ("cdr_009", "9876543211", "9876543215", "Amit Verma", "Suresh Jena", "2026-08-18 04:30:00", 145, "Tower-Warehouse4-Cuttack", "CASE-26189"),
            ("cdr_010", "9876543210", "9876543212", "Ravi Kumar", "Neha Sharma", "2026-08-15 14:20:00", 410, "Tower-Bhubaneswar-Main", "CASE-26189"),
            ("cdr_011", "9876543210", "9876543212", "Ravi Kumar", "Neha Sharma", "2026-08-16 11:10:00", 295, "Tower-Bhubaneswar-Main", "CASE-26189")
        ]
        conn.executemany(
            """
            INSERT INTO cdr_records (
                id, caller_number, receiver_number, caller_name, receiver_name,
                timestamp, duration_seconds, tower_location, case_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            cdr_records
        )

        # 7. Seed Financial Transactions
        transactions = [
            ("tx_001", "38291049281", "99182736451", "Garuda Logistics Pvt Ltd", "Apex Shell Holdings", 18500000.0, "2026-08-01 11:30:00", "INR", "NEFT_TRANSFER", 1, "CASE-26189"),
            ("tx_002", "99182736451", "77665544332", "Apex Shell Holdings", "Shadow FinTech Corp", 18000000.0, "2026-08-03 14:15:00", "INR", "RTGS_TRANSFER", 1, "CASE-26189"),
            ("tx_003", "77665544332", "38291049281", "Shadow FinTech Corp", "Garuda Logistics Pvt Ltd", 17500000.0, "2026-08-05 16:45:00", "INR", "IMPS_SETTLEMENT", 1, "CASE-26189"),
            ("tx_004", "38291049281", "99182736451", "Garuda Logistics Pvt Ltd", "Apex Shell Holdings", 9500000.0, "2026-08-12 10:00:00", "INR", "NEFT_TRANSFER", 1, "CASE-26189"),
            ("tx_005", "99182736451", "77665544332", "Apex Shell Holdings", "Shadow FinTech Corp", 9200000.0, "2026-08-14 12:30:00", "INR", "RTGS_TRANSFER", 1, "CASE-26189"),
            ("tx_006", "77665544332", "38291049281", "Shadow FinTech Corp", "Garuda Logistics Pvt Ltd", 8900000.0, "2026-08-16 15:20:00", "INR", "IMPS_SETTLEMENT", 1, "CASE-26189")
        ]
        conn.executemany(
            """
            INSERT INTO financial_transactions (
                id, source_account, target_account, sender_name, receiver_name,
                amount, timestamp, currency, transaction_type, suspicious, case_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            transactions
        )

        # 8. Seed Timeline Events
        timeline_events = [
            ("tl_001", "2026-08-18 22:00:00", json.dumps(["ent_p_001", "ent_p_006", "ent_inc_001", "ent_v_003"]), "INCIDENT", "STF Tactical Raid at Warehouse 4", "Special Task Force executed entry into Sector 5 warehouse. 120kg contraband recovered; driver Suresh Jena apprehended.", "FIR-104/2026", 0.99, "CASE-26189"),
            ("tl_002", "2026-08-18 05:10:44", json.dumps(["ent_p_001", "ent_p_002"]), "CALL", "Pre-Dispatch Coordination Call Burst", "Finalized transport routes between Ravi Kumar and Amit Verma 16 hours prior to raid.", "CDR_Analysis", 0.95, "CASE-26189"),
            ("tl_003", "2026-08-16 15:20:00", json.dumps(["ent_org_001", "ent_org_004", "ent_fa_001", "ent_fa_003"]), "TRANSACTION", "Layered Fund Return to Garuda Logistics", "₹89,00,000 received by Garuda Logistics completing 2nd circular transaction cycle.", "Bank_Statement", 0.96, "CASE-26189"),
            ("tl_004", "2026-08-12 11:00:00", json.dumps(["ent_p_003", "ent_org_002", "ent_inc_002"]), "INCIDENT", "₹4.2 Cr Cyber Phishing Diversion Logged", "Corporate fraud proceeds diverted into Apex Shell Holdings HDFC account.", "FIR-042/2026", 0.94, "CASE-26189"),
            ("tl_005", "2026-08-01 11:30:00", json.dumps(["ent_org_001", "ent_org_002", "ent_fa_001", "ent_fa_002"]), "TRANSACTION", "Initial Wire Transfer to Apex Shell Holdings", "₹1,85,00,000 transferred out of Garuda SBI account initiating money laundering cycle.", "Bank_Statement", 0.98, "CASE-26189")
        ]
        conn.executemany(
            """
            INSERT INTO timeline_events (
                id, timestamp, entity_ids, event_type, title,
                description, source, confidence, case_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            timeline_events
        )

        # 9. Seed Initial Audit Events
        audit_events = [
            ("aud_init_01", "2026-08-30 09:15:00", "usr_001", "Investigator-7", "INVESTIGATOR", "LOGIN", "CASE-26189", None, "AUTH_SYSTEM", "SUCCESS", json.dumps({"ip": "127.0.0.1", "auth_method": "2FA_VERIFIED"}), "127.0.0.1"),
            ("aud_init_02", "2026-08-30 09:20:00", "usr_001", "Investigator-7", "INVESTIGATOR", "VIEW_CASE", "CASE-26189", None, "CASE_WORKSPACE", "SUCCESS", json.dumps({"case_id": "CASE-26189"}), "127.0.0.1"),
            ("aud_init_03", "2026-08-30 09:35:00", "usr_001", "Investigator-7", "INVESTIGATOR", "VIEW_ENTITY", "CASE-26189", "ent_p_001", "ENTITY_PROFILE", "SUCCESS", json.dumps({"entity_name": "Ravi Kumar"}), "127.0.0.1"),
            ("aud_init_04", "2026-08-30 10:05:00", "usr_001", "Investigator-7", "INVESTIGATOR", "EXPAND_GRAPH", "CASE-26189", "ent_p_001", "GRAPH_EXPLORER", "SUCCESS", json.dumps({"hops": 2, "resulting_nodes": 24}), "127.0.0.1")
        ]
        conn.executemany(
            """
            INSERT INTO audit_events (
                id, timestamp, user_id, user_name, role, action,
                case_id, entity_id, resource, result, details, ip_address
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            audit_events
        )

    conn.close()

    # Run graph metric computations, pattern detection, and entity resolution scan
    compute_graph_metrics()
    run_all_pattern_detectors()
    run_entity_resolution_scan()
