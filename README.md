# SIPER — AI-Powered Criminal Network Analysis System

> **Smart India Hackathon (SIH)** — Problem Statement: **PS 26189**  
> **Target Organization:** Ministry of Home Affairs / National Crime Records Bureau (NCRB)  
> **Domain:** Law Enforcement Intelligence & Investigative Decision Support

---

## 📌 Executive Overview

**SIPER** (*Smart Intelligence & Pattern Extraction Engine*) is an investigator-first, enterprise-grade AI decision-support platform engineered for law enforcement agencies, cybercrime cells, and criminal intelligence directorates. 

It automatically ingests unstructured FIRs, call detail records (CDRs), financial transaction ledgers, vehicle registries, and suspect dossiers to:
1. **Extract & Resolve Multi-source Entities** (Persons, Phones, Vehicles, Bank Accounts, Locations) with confidence-scored fuzzy resolution and alias linking.
2. **Construct Dynamic Intelligence Graphs** analyzing degree, betweenness, and eigenvector centrality to isolate kingpins, brokers, and logistics mules.
3. **Detect Complex Criminal Patterns** (Mule accounts, burner phone rotation, co-travel anomalies, cartel cell clusters, syndicates).
4. **Generate Court-Admissible Intelligence Reports & Case Timelines** with complete chain-of-custody audit logs.

---

## 🌟 Key Capabilities & Modules

| Module | Features & Capabilities |
| :--- | :--- |
| 🛡️ **Investigation Command Dashboard** | Real-time threat level gauge, high-risk syndicate alerts, entity distribution metrics, active case monitor, and quick navigation. |
| 📂 **Case Management System** | Full lifecycle investigation management, priority categorization, assigned investigator teams, linked entities, and case audit trails. |
| 🕸️ **Interactive Graph Explorer** | Physics-based network visualization, centrality filtering, shortest-path calculation between suspects, community detection, and exportable topologies. |
| 👤 **Entity 360° Profile & Resolution** | Dossier viewer, alias tracker, risk score decomposition, communication frequency matrices, and biometric/identity resolution candidate matching. |
| 🔍 **Federated Search Engine** | Global cross-case search across names, phone numbers, vehicle registrations, bank accounts, and case numbers with fuzzy match tolerance. |
| 📥 **Data Ingestion & Extraction** | Multi-format parser (FIR text, CDR CSVs, Bank Statements, Case notes) powered by rule-based NLP entity extraction and Indian legal taxonomy parsing. |
| 🤖 **AI Pattern Detection & Findings** | 6 automated pattern recognition algorithms detecting money laundering mule networks, burner phone hopping, geographic crime clusters, and syndicate hubs. |
| 📋 **Court-Ready Report Generator** | Automatic generation of executive intelligence summaries, entity relationship breakdowns, timeline exhibits, and prosecutorial export formats. |
| 🔒 **Security & Immutable Audit Trail** | Role-Based Access Control (RBAC), simulated 2FA OTP verification, SHA-256 session tokens, and tamper-evident audit logging for all queries. |

---

## 🏗️ Architecture & Technology Stack

```
                                  ┌────────────────────────────────┐
                                  │      Stitch / Tailwind CSS     │
                                  │   SPA Intelligence Dashboard   │
                                  └───────────────┬────────────────┘
                                                  │ HTTP / REST APIs
                                  ┌───────────────▼────────────────┐
                                  │      SIPER Core Server         │
                                  │    (Python 3.8+ Zero-Dep)      │
                                  └───────────────┬────────────────┘
                   ┌──────────────────────────────┼──────────────────────────────┐
                   │                              │                              │
        ┌──────────▼──────────┐        ┌──────────▼──────────┐        ┌──────────▼──────────┐
        │  Relational Database│        │ Graph & AI Engines  │        │   Security & Audit  │
        │  (SQLite3 Engine)   │        │ - Pattern Detector  │        │ - Session Tokens    │
        │  - Cases & Entities │        │ - Entity Resolver   │        │ - 2FA Verification  │
        │  - Documents & Logs │        │ - Graph Centrality  │        │ - Tamper Audit Log │
        └─────────────────────┘        └─────────────────────┘        └─────────────────────┘
```

- **Backend:** Python Standard Library (`http.server`, `sqlite3`, `hashlib`, `json`) — zero external dependencies needed to run immediately.
- **Frontend:** Responsive Single-Page Application (SPA) with Dark Mode Intelligence UI, Tailwind CSS, Google Material Symbols, and Vanilla JS architecture.
- **Graph & AI Analytics:** In-memory graph traversal, betweenness/degree centrality calculation, Jaro-Winkler / Levenshtein entity resolution, and regex legal NLP.
- **Data Persistence:** Relational schema with foreign key constraints, JSON attributes, and indices.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher installed on your system.

### Running the Application

1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd "SIH 2026"
   ```

2. Run the application launcher:
   ```bash
   python siper/run.py
   ```
   *This initializes the database, populates mock seed intelligence data, starts the server on `http://localhost:8000`, and opens your default browser automatically.*

3. Log in with the pre-seeded investigator credentials:
   - **Email:** `investigator@ncrb.gov.in`
   - **Password:** `Investigator@2026`
   - **2FA OTP:** `123456` *(or any 6-digit code for demonstration)*

---

## 🧪 Running Automated Tests

Run the complete test suite verifying database integrity, graph centrality, AI pattern detection, entity resolution, NLP pipelines, authentication, and REST APIs:

```bash
python -m unittest discover -s siper/tests -v
```

All 9 test suites will run and output verified test statuses:
- `test_01_database_tables_and_counts`
- `test_02_graph_centrality_and_path`
- `test_03_pattern_detection_engines`
- `test_04_entity_resolution_pipeline`
- `test_05_nlp_entity_extraction`
- `test_06_auth_and_2fa`
- `test_07_audit_logging`
- `test_08_rest_api_endpoints`
- `test_09_cases_module_integration`

---

## 📁 Project Structure

```
.
├── .gitignore                                # Git ignore rules
├── requirements.txt                          # Python dependencies specification
├── README.md                                 # Main project documentation
├── MEMORY.md                                 # Technical product context & decisions
├── SIPER_DRD.md                              # Detailed Requirements Document
├── SIPER_Technology_Stack-1.md               # Architecture & Tech Stack specifications
├── stitch_siper_intelligence_design_system/  # Design system specifications & prototypes
└── siper/
    ├── run.py                                # Main application entrypoint
    ├── data/                                 # Database storage directory
    ├── backend/
    │   ├── server.py                         # Production HTTP & REST Server
    │   ├── api/
    │   │   └── router.py                     # REST API Routing & Request Dispatcher
    │   └── core/
    │       ├── config.py                     # Configuration constants & paths
    │       ├── database.py                   # SQLite database schema & connection
    │       ├── seed_data.py                  # Realistic seed cases, entities & findings
    │       ├── graph.py                      # Network graph algorithms & metrics
    │       ├── pattern_detector.py           # 6 AI criminal pattern detection rules
    │       ├── entity_resolver.py            # Fuzzy entity resolution & deduplication
    │       ├── nlp_engine.py                 # Legal document entity extraction
    │       ├── report_generator.py           # Court-admissible report compiler
    │       ├── auth.py                       # JWT/token generation & 2FA simulator
    │       └── audit.py                      # Immutable audit trail logger
    ├── frontend/
    │   ├── index.html                        # SPA Entry HTML
    │   ├── styles/
    │   │   └── app.css                       # Design system CSS tokens & styles
    │   └── src/
    │       ├── app.js                        # State manager, router & event bus
    │       └── components/                   # View components (Dashboard, Graph, Cases, etc.)
    └── tests/
        └── test_siper.py                     # Unit and integration test suite
```

---

## ⚖️ License & Confidentiality

Built for the **Smart India Hackathon 2026** under Problem Statement **PS 26189**.  
Designed for law enforcement decision-support and academic evaluation.
