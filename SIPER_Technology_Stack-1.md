# SIPER — Full Technology Stack Decision

**Project:** SIPER — AI-Powered Criminal Network Analysis System  
**SIH Problem Statement:** PS 26189  
**Organization:** Ministry of Home Affairs / NCRB  
**Document:** Technology Stack Decision  
**Version:** 1.0 — MVP Baseline  
**Status:** Approved for MVP architecture  
**Primary objective:** Build a credible, explainable, secure, investigator-first criminal-network intelligence platform that can be demonstrated reliably during SIH and evolved toward production.

---

# 1. Executive Technology Decision

## Recommended stack

| Layer | Technology | Decision |
|---|---|---|
| Frontend | Next.js + React + TypeScript | **Use** |
| Styling | Tailwind CSS | **Use** |
| UI primitives | shadcn/ui + Radix UI | **Use** |
| Icons | Lucide React | **Use** |
| Graph visualization | `react-force-graph` / `react-force-graph-2d` | **Use** |
| Graph engine | Neo4j | **Use** |
| Graph analytics | Neo4j Graph Data Science (GDS) | **Use** |
| Primary relational DB | PostgreSQL | **Use** |
| ORM / DB access | Drizzle ORM | **Use** |
| Cache / jobs | Redis | **Use** |
| Background jobs | BullMQ | **Use** |
| Backend API | FastAPI | **Use** |
| AI/ML services | Python | **Use** |
| NLP | spaCy + Transformers | **Use** |
| LLM extraction | Provider-agnostic structured-output adapter | **Use** |
| Embeddings | sentence-transformers | **Use** |
| Vector search | pgvector | **Use initially** |
| Document parsing | PyMuPDF + python-docx + pandas/openpyxl | **Use** |
| Object/file storage | S3-compatible storage / MinIO for local MVP | **Use** |
| Authentication | Keycloak / OIDC-compatible identity provider | **Use** |
| Authorization | RBAC + case-scoped authorization in backend | **Use** |
| API contract | REST + OpenAPI | **Use** |
| Frontend data fetching | TanStack Query | **Use** |
| Validation | Zod frontend / Pydantic backend | **Use** |
| Testing | Vitest + Playwright + Pytest | **Use** |
| Containerization | Docker + Docker Compose | **Use** |
| Reverse proxy | Nginx or Caddy | **Use for deployment** |
| Observability | OpenTelemetry + structured logs | **Use** |
| CI/CD | GitHub Actions | **Use** |
| Deployment | Docker-based VPS/cloud/on-prem environment | **Use** |
| Infrastructure orchestration | Kubernetes | **Do not use for MVP** |

---

# 2. Architecture Decision

SIPER should use a **polyglot architecture**, because its core problem is inherently multi-model:

```text
                         ┌──────────────────────┐
                         │      SIPER UI        │
                         │ Next.js / React / TS  │
                         └──────────┬───────────┘
                                    │
                              REST / OpenAPI
                                    │
                         ┌──────────▼───────────┐
                         │      API Layer       │
                         │       FastAPI        │
                         └──────┬─────┬─────┬───┘
                                │     │     │
                 ┌──────────────┘     │     └──────────────┐
                 │                    │                    │
          ┌──────▼──────┐      ┌─────▼─────┐       ┌──────▼──────┐
          │ PostgreSQL  │      │   Neo4j   │       │    Redis    │
          │ cases/users │      │  network  │       │ cache/jobs  │
          │ evidence    │      │ relations │       │             │
          └─────────────┘      └─────┬─────┘       └──────┬──────┘
                                     │                    │
                              ┌──────▼──────┐      ┌──────▼──────┐
                              │ Neo4j GDS   │      │   BullMQ    │
                              │ centrality  │      │ async jobs  │
                              │ communities │      │             │
                              └─────────────┘      └──────┬──────┘
                                                         │
                                                  ┌──────▼──────┐
                                                  │ AI/NLP      │
                                                  │ Python      │
                                                  │ spaCy/LLM   │
                                                  └──────┬──────┘
                                                         │
                                                  ┌──────▼──────┐
                                                  │ Object      │
                                                  │ Storage     │
                                                  └─────────────┘
```

---

# 3. Why This Stack

## 3.1 Why Next.js + React + TypeScript

SIPER has a highly interactive enterprise UI:

- graph exploration;
- filtering;
- dashboards;
- tables;
- timelines;
- drawers;
- modals;
- report builders;
- authentication;
- real-time job status.

React is suitable for this component-heavy interface.

Next.js provides:

- routing;
- application structure;
- server-side capabilities where useful;
- production build tooling;
- strong TypeScript ecosystem.

TypeScript is mandatory because the product has complex objects such as:

```text
Entity
Relationship
Case
Evidence
Finding
TimelineEvent
AnalysisJob
AuditEvent
```

Strong typing reduces UI/backend contract drift.

---

# 4. Frontend Stack

## Core

```text
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
Radix UI
Lucide React
```

## Application data

```text
TanStack Query
Zod
React Hook Form
```

## Visualization

```text
react-force-graph
D3 utilities where necessary
Recharts for conventional charts
```

## Why not build the graph using raw D3?

Raw D3 gives maximum control but increases implementation complexity.

For MVP:

`react-force-graph` provides a faster path to:

- force simulation;
- node interactions;
- edge rendering;
- zoom;
- pan;
- selection;
- dynamic expansion.

D3 can be introduced later for specialized analytical visualizations.

---

# 5. Backend Stack

## API

**FastAPI + Python**

Reason:

SIPER's backend is tightly coupled to:

- NLP;
- entity extraction;
- embeddings;
- graph analytics;
- document processing;
- AI inference.

Keeping the primary analytical backend in Python avoids unnecessary cross-language AI orchestration.

FastAPI provides:

- async API support;
- automatic OpenAPI;
- Pydantic validation;
- excellent Python integration.

---

# 6. Database Architecture

SIPER should **not** attempt to store everything in Neo4j.

Use two primary databases for different responsibilities.

## PostgreSQL

System-of-record for:

- users;
- roles;
- cases;
- case memberships;
- source documents;
- ingestion jobs;
- AI findings;
- investigator notes;
- reports;
- audit records;
- application settings;
- entity metadata that does not require graph traversal.

## Neo4j

System-of-record for:

- entities;
- relationships;
- network structure;
- graph-derived relationships;
- graph projections;
- graph analytics.

---

# 7. PostgreSQL

Recommended:

**PostgreSQL 16+**

Core tables:

```text
users
roles
permissions
user_roles
cases
case_members
documents
document_versions
ingestion_jobs
processing_runs
entities
entity_aliases
entity_identifiers
findings
finding_evidence
timeline_events
investigator_notes
reports
report_items
audit_events
```

PostgreSQL should also store:

- workflow state;
- permissions;
- ownership;
- timestamps;
- provenance references;
- application metadata.

---

# 8. Neo4j Data Model

## Nodes

```text
(:Person)
(:Phone)
(:Vehicle)
(:Location)
(:Organization)
(:FinancialAccount)
(:Incident)
(:Document)
```

Example:

```text
(:Person {
  id: "ent_001",
  canonicalName: "Synthetic Person A"
})
```

## Relationships

```text
(:Person)-[:CONTACTED]->(:Person)
(:Person)-[:USED]->(:Phone)
(:Person)-[:ASSOCIATED_WITH]->(:Vehicle)
(:Person)-[:VISITED]->(:Location)
(:Person)-[:WORKS_FOR]->(:Organization)
(:Person)-[:TRANSFERRED_TO]->(:FinancialAccount)
(:Person)-[:INVOLVED_IN]->(:Incident)
(:Entity)-[:MENTIONED_IN]->(:Document)
```

Relationship properties:

```text
confidence
sourceCount
firstSeen
lastSeen
verified
provenanceIds
```

---

# 9. Graph Analytics

Use:

**Neo4j Graph Data Science (GDS)**

MVP analytics:

### Degree Centrality

Identifies highly connected nodes.

### PageRank

Identifies structurally important nodes.

### Betweenness Centrality

Identifies potential bridge/intermediary nodes.

### Community Detection

Useful for identifying clusters.

Recommended initial algorithm:

**Louvain**

Potential later addition:

**Leiden**

### Shortest Path

Used for investigator questions such as:

> What is the shortest known relationship path between Entity A and Entity B?

---

# 10. AI / NLP Architecture

The AI system must be modular.

```text
Raw Data
   ↓
Document Parsing
   ↓
Normalization
   ↓
Entity Extraction
   ↓
Relationship Extraction
   ↓
Entity Resolution
   ↓
Confidence Scoring
   ↓
Graph Construction
   ↓
Graph Analytics
   ↓
Pattern Detection
   ↓
Explainable Finding
```

---

# 11. Document Processing

## PDF

Use:

**PyMuPDF**

Capabilities:

- text extraction;
- page-level metadata;
- document coordinates where needed.

## DOCX

Use:

**python-docx**

## CSV/XLSX

Use:

**pandas**
+
**openpyxl**

## JSON

Use native Python JSON tooling + Pydantic schemas.

---

# 12. Entity Extraction

Use a hybrid strategy.

## Layer 1 — deterministic extraction

For identifiers such as:

- phone numbers;
- vehicle registration;
- dates;
- account numbers;
- case IDs.

Use:

- regex;
- normalization;
- rule-based parsers.

## Layer 2 — NLP

Use:

**spaCy**

Extract:

- PERSON;
- ORG;
- GPE/LOCATION;
- custom domain entities.

## Layer 3 — transformer/LLM extraction

Use structured-output inference for difficult contextual relationships.

Example:

```json
{
  "entities": [],
  "relationships": [],
  "events": []
}
```

The model must never be allowed to directly write arbitrary graph data.

All AI output passes through:

```text
schema validation
→ normalization
→ confidence scoring
→ provenance attachment
→ graph writer
```

---

# 13. Entity Resolution

This is one of SIPER's highest-value capabilities.

Use a hybrid matching system.

## Stage 1 — exact identifiers

Examples:

```text
same normalized phone
same vehicle registration
same account identifier
```

## Stage 2 — deterministic similarity

Examples:

```text
name normalization
alias matching
address similarity
date-of-birth matching where lawfully available
```

## Stage 3 — embeddings

Use:

**sentence-transformers**

For semantic similarity of:

- names;
- aliases;
- addresses;
- organization names;
- contextual descriptions.

## Stage 4 — combined score

Example conceptual model:

```text
match_score =
    identifier_score * 0.45
  + name_score       * 0.20
  + address_score    * 0.15
  + contextual_score * 0.20
```

Weights should be configurable and evaluated against synthetic validation data.

Do not silently merge entities.

All uncertain matches should become:

`ENTITY_RESOLUTION_CANDIDATE`

for investigator review.

---

# 14. LLM Architecture

Do not hard-code SIPER to one LLM vendor.

Implement:

```text
LLMProvider
├── extract_entities()
├── extract_relationships()
├── summarize_finding()
└── explain_connection()
```

Possible providers can be plugged in later.

The MVP should use an environment-configured provider.

Example:

```text
LLM_PROVIDER=...
LLM_MODEL=...
```

Never expose provider API keys to the frontend.

---

# 15. AI Explainability

Every AI finding should store:

```text
finding_id
finding_type
confidence
affected_entities
reason_codes
supporting_evidence
model/provider metadata
created_at
```

Example reason codes:

```text
HIGH_CONTACT_FREQUENCY
TEMPORAL_PROXIMITY
SHARED_IDENTIFIER
UNUSUAL_TRANSACTION_VOLUME
CROSS_CASE_ASSOCIATION
COMMUNITY_BRIDGE
```

This allows the UI to explain:

> Why was this flagged?

without exposing hidden chain-of-thought or unsupported conclusions.

---

# 16. Pattern Detection Engine

Pattern detection should be implemented as explicit analytical rules + graph algorithms.

MVP patterns:

## 1. Communication burst

```text
unusually high communication volume
within a configured time window
```

## 2. Temporal proximity

```text
communication/activity
close to a defined incident
```

## 3. Circular financial movement

```text
A → B → C → A
```

## 4. Shared intermediary

```text
A ↔ B
A ↔ C
B and C otherwise weakly connected
```

## 5. Cross-case connection

Entity appears across multiple authorized cases.

## 6. Community bridge

Node has high betweenness between clusters.

Pattern detection output:

```text
Pattern
Confidence
Entities
Evidence
Reason codes
Timestamp
```

---

# 17. Confidence Model

Confidence is not guilt probability.

Use terminology:

**Evidence/relationship confidence**

not:

**Probability of criminality**

A confidence score can combine:

```text
source reliability
identifier agreement
temporal consistency
relationship frequency
entity-resolution confidence
analytical consistency
```

Every score should be explainable.

---

# 18. Redis

Use Redis for:

- job queues;
- short-lived caching;
- processing progress;
- rate limiting;
- temporary state where appropriate.

Do not use Redis as the authoritative database.

---

# 19. Background Jobs

Use:

**BullMQ**

For the MVP, the cleanest implementation is:

```text
FastAPI
   ↓
job submission
   ↓
Redis
   ↓
worker
   ↓
Python processing service
```

If using BullMQ specifically, isolate queue orchestration from Python workers through a stable job contract.

Alternative if the team prefers a pure-Python architecture:

**Celery + Redis**

Do not implement both.

### Final MVP choice

**Celery + Redis**

Reason:

The core processing workers are Python, so Celery minimizes unnecessary Node/Python queue orchestration.

---

# 20. Object Storage

Uploaded source documents should not be stored directly inside PostgreSQL.

Use S3-compatible object storage.

For local development:

**MinIO**

For deployment:

- AWS S3;
- Azure Blob Storage;
- Google Cloud Storage;
- approved government/on-prem object storage.

Database stores:

```text
document_id
object_key
checksum
mime_type
size
source
created_at
```

---

# 21. Vector Search

Start with:

**pgvector**

inside PostgreSQL.

Use for:

- document embeddings;
- semantic search;
- entity similarity;
- evidence retrieval.

Do not introduce a dedicated vector database during MVP unless benchmarks show a real need.

This keeps infrastructure manageable.

---

# 22. Authentication

Use an OIDC-compatible identity system.

Recommended:

**Keycloak**

Capabilities:

- user authentication;
- roles;
- groups;
- MFA;
- OIDC;
- session management.

Future government identity integration can be added behind the same identity abstraction.

The MVP should include:

```text
email/password
MFA
role-based access
session management
logout
```

---

# 23. Authorization

RBAC is mandatory.

Example roles:

```text
INVESTIGATOR
SUPERVISOR
ANALYST
ADMIN
AUDITOR
```

Authorization must exist at the backend.

Frontend hiding a button is **not authorization**.

Use:

```text
user
→ role
→ permissions
→ case membership
→ resource access
```

Case-level access should be enforced server-side.

---

# 24. API Architecture

Use REST.

Base:

```text
/api/v1
```

Example routes:

```text
POST   /auth/login
POST   /auth/mfa/verify

GET    /cases
POST   /cases
GET    /cases/{case_id}

POST   /cases/{case_id}/documents
GET    /documents/{document_id}

POST   /analysis/jobs
GET    /analysis/jobs/{job_id}

GET    /entities/search
GET    /entities/{entity_id}

GET    /entities/{entity_id}/connections
GET    /entities/{entity_id}/timeline

POST   /graph/query
POST   /graph/expand
POST   /graph/path

GET    /findings
GET    /findings/{finding_id}

POST   /reports
GET    /reports/{report_id}

GET    /audit-events
```

---

# 25. API Contract

FastAPI generates OpenAPI.

Frontend types should be generated or maintained against the API contract.

Recommended flow:

```text
Pydantic schema
      ↓
OpenAPI
      ↓
TypeScript API types
      ↓
TanStack Query hooks
      ↓
React UI
```

This minimizes data-model mismatch between Stitch implementation and backend.

---

# 26. Frontend State Management

Do not put everything into a global state store.

Use:

### TanStack Query

For:

- server state;
- cases;
- entities;
- findings;
- graph data;
- timelines.

Use local React state for:

- selected graph node;
- modal visibility;
- temporary filters;
- UI state.

Only introduce Zustand if genuinely required for complex cross-component UI state.

### MVP decision

**No Redux. No Zustand initially.**

---

# 27. Graph Data Loading Strategy

Do not load an entire case graph by default.

Use progressive loading.

```text
Initial entity
      ↓
Load direct neighborhood
      ↓
User expands node
      ↓
Fetch next neighborhood
```

Backend should support:

```text
depth
limit
entity types
relationship types
confidence threshold
date range
```

Example:

```text
depth = 2
limit = 100
confidence >= 0.65
```

---

# 28. Security Architecture

Minimum requirements:

## Transport

TLS everywhere outside local development.

## Secrets

Use environment variables/secrets manager.

Never commit:

```text
API keys
passwords
JWT secrets
database credentials
```

## Database

- private network;
- authenticated connections;
- least-privilege database users.

## File uploads

Validate:

- MIME type;
- extension;
- file size;
- checksum;
- malware scanning before production deployment.

## Logs

Do not log:

- passwords;
- access tokens;
- raw sensitive documents;
- unnecessary personal identifiers.

---

# 29. Audit Architecture

Audit events should be append-oriented.

Example:

```json
{
  "event": "ENTITY_VIEWED",
  "userId": "user_001",
  "caseId": "case_001",
  "entityId": "ent_001",
  "timestamp": "...",
  "result": "SUCCESS"
}
```

Audit:

- searches;
- entity access;
- document access;
- graph expansion;
- analysis runs;
- exports;
- finding actions;
- permission changes.

---

# 30. Observability

Use:

**OpenTelemetry**

Track:

- API latency;
- background-job duration;
- ingestion failures;
- graph query duration;
- AI inference duration;
- database errors.

Structured logs:

```json
{
  "timestamp": "...",
  "level": "INFO",
  "service": "analysis-worker",
  "job_id": "job_123",
  "event": "ENTITY_EXTRACTION_COMPLETED"
}
```

---

# 31. Testing Strategy

## Frontend unit tests

**Vitest**

Test:

- components;
- utility functions;
- confidence formatting;
- filtering;
- permission logic.

## End-to-end

**Playwright**

Critical workflow:

```text
Login
→ Dashboard
→ Open Case
→ Upload Dataset
→ Wait for Processing
→ Search Entity
→ Open Graph
→ Expand Network
→ Review Finding
→ Open Evidence
→ Generate Report
```

## Backend

**Pytest**

Test:

- APIs;
- authorization;
- entity extraction;
- relationship extraction;
- resolution;
- scoring;
- graph queries;
- pattern detection.

---

# 32. CI/CD

Use:

**GitHub Actions**

Pipeline:

```text
Pull Request
    ↓
Lint
    ↓
Type Check
    ↓
Frontend Tests
    ↓
Backend Tests
    ↓
Build
    ↓
Security Checks
    ↓
Docker Build
```

Main branch:

```text
merge
 ↓
build image
 ↓
deploy staging
 ↓
smoke tests
```

---

# 33. Code Quality

Frontend:

```text
ESLint
Prettier
TypeScript strict mode
```

Backend:

```text
Ruff
Pytest
MyPy where useful
```

Commit conventions:

```text
feat:
fix:
refactor:
docs:
test:
chore:
```

---

# 34. Monorepo Recommendation

Use a monorepo.

Recommended:

```text
siper/
├── apps/
│   ├── web/
│   └── api/
│
├── workers/
│   └── analysis/
│
├── packages/
│   ├── ui/
│   ├── types/
│   └── config/
│
├── infra/
│   ├── docker/
│   └── scripts/
│
├── docs/
│   ├── PRD.md
│   ├── DRD.md
│   └── TECH_STACK.md
│
└── docker-compose.yml
```

---

# 35. Recommended Repository Structure

```text
siper/
│
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── styles/
│   │
│   └── api/
│       ├── app/
│       │   ├── api/
│       │   ├── core/
│       │   ├── models/
│       │   ├── schemas/
│       │   ├── services/
│       │   ├── repositories/
│       │   └── workers/
│       └── tests/
│
├── workers/
│   └── analysis/
│       ├── extraction/
│       ├── resolution/
│       ├── patterns/
│       ├── embeddings/
│       └── pipelines/
│
├── packages/
│   ├── ui/
│   ├── types/
│   └── config/
│
├── database/
│   ├── postgres/
│   └── neo4j/
│
├── data/
│   └── synthetic/
│
├── infra/
│   ├── docker/
│   ├── nginx/
│   └── scripts/
│
└── docs/
    ├── PRD.md
    ├── DRD.md
    ├── TECH_STACK.md
    ├── API.md
    └── DATA_MODEL.md
```

---

# 36. Local Development Environment

Use Docker Compose for infrastructure.

Services:

```text
web
api
worker
postgres
neo4j
redis
minio
keycloak
```

Optional:

```text
otel-collector
```

Local command target:

```bash
docker compose up -d
```

The project should become runnable without manually installing databases.

---

# 37. Development Environment Variables

Example:

```text
DATABASE_URL=
NEO4J_URI=
NEO4J_USERNAME=
NEO4J_PASSWORD=

REDIS_URL=

S3_ENDPOINT=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_BUCKET=

KEYCLOAK_URL=
KEYCLOAK_REALM=
KEYCLOAK_CLIENT_ID=
KEYCLOAK_CLIENT_SECRET=

LLM_PROVIDER=
LLM_MODEL=
LLM_API_KEY=

APP_ENV=
JWT_SECRET=
```

Never commit `.env`.

Commit:

```text
.env.example
```

with empty/example values.

---

# 38. Deployment Strategy

## SIH MVP

Recommended:

```text
Docker Compose
+
single Linux server / cloud VM
```

Architecture:

```text
Internet
   ↓
Nginx
   ↓
Next.js
   ↓
FastAPI
   ├── PostgreSQL
   ├── Neo4j
   ├── Redis
   ├── MinIO
   └── Analysis Worker
```

This is much easier to operate than Kubernetes during a hackathon.

---

# 39. Kubernetes Decision

**Do not use Kubernetes for MVP.**

Reason:

- operational complexity;
- unnecessary infrastructure overhead;
- slower debugging;
- limited SIH benefit.

Consider Kubernetes only after:

- multi-instance scaling is required;
- multiple workers need orchestration;
- high availability is required;
- deployment environments demand it.

---

# 40. What NOT to Use

Avoid introducing unnecessary technologies.

### No MongoDB

PostgreSQL handles application data well.

### No separate vector database initially

Use pgvector.

### No Elasticsearch initially

PostgreSQL full-text + pgvector are sufficient for MVP.

### No Kafka

Redis/Celery is enough for the initial workload.

### No Kubernetes

Docker Compose is sufficient for MVP.

### No microservice explosion

Keep:

```text
web
api
analysis worker
```

as the primary application services.

---

# 41. Service Boundaries

SIPER should initially have only three application services.

## 1. Web

Responsibilities:

- UI;
- authentication client;
- API calls;
- visualization.

## 2. API

Responsibilities:

- authorization;
- CRUD;
- graph queries;
- orchestration;
- case management;
- audit.

## 3. Analysis Worker

Responsibilities:

- document parsing;
- NLP;
- entity extraction;
- entity resolution;
- relationship extraction;
- embeddings;
- pattern detection;
- graph writes.

Infrastructure services:

```text
PostgreSQL
Neo4j
Redis
Object Storage
Identity Provider
```

---

# 42. Data Processing Pipeline

```text
                UPLOAD
                   │
                   ▼
              Object Store
                   │
                   ▼
              Ingestion Job
                   │
                   ▼
              Parse Document
                   │
                   ▼
              Normalize Data
                   │
          ┌────────┴────────┐
          ▼                 ▼
     NER Extraction    Identifier Rules
          │                 │
          └────────┬────────┘
                   ▼
          Relationship Extraction
                   │
                   ▼
           Entity Resolution
                   │
                   ▼
            Confidence Scoring
                   │
                   ▼
             PostgreSQL
                   │
                   ▼
                Neo4j
                   │
                   ▼
             Graph Analytics
                   │
                   ▼
            Pattern Detection
                   │
                   ▼
             AI Findings
                   │
                   ▼
             Investigator UI
```

---

# 43. Graph Query Strategy

Use Neo4j for graph traversal.

Example conceptual query:

```cypher
MATCH (p:Person {id: $entityId})-[r*1..2]-(neighbor)
RETURN p, r, neighbor
LIMIT $limit
```

Never expose unrestricted arbitrary Cypher from the frontend.

The backend must generate/validate graph queries.

---

# 44. Performance Targets

MVP targets:

| Operation | Target |
|---|---:|
| Dashboard load | < 2 sec |
| Entity search | < 1 sec for common queries |
| Entity profile | < 2 sec |
| Graph initial load | < 3 sec |
| Graph expansion | < 2 sec |
| Normal API request | < 500 ms |
| UI interaction feedback | < 100 ms |
| Small document ingestion | < 30 sec |
| Typical analysis job | < 2 min |

Targets should be measured against the synthetic SIH dataset.

---

# 45. Graph Scalability Strategy

Do not render thousands of nodes simultaneously.

Use:

- server-side graph filtering;
- pagination;
- neighborhood expansion;
- confidence threshold;
- date range;
- entity type filters;
- maximum node count.

Recommended initial graph viewport:

```text
50–150 nodes
```

Large networks should be progressively explored.

---

# 46. AI Safety / Reliability Requirements

The AI layer must:

- preserve source provenance;
- return structured output;
- validate model output;
- assign confidence separately from guilt;
- allow human review;
- never silently merge entities;
- never fabricate evidence;
- distinguish extracted facts from inferred relationships.

For unsupported AI output:

```text
INSUFFICIENT EVIDENCE
```

is preferable to invented certainty.

---

# 47. Synthetic Data Requirement

For SIH demonstration:

**Use synthetic/mock datasets only unless officially authorized data is provided.**

Create a coherent synthetic network containing:

```text
20–50 persons
20+ phones
10+ vehicles
10+ locations
5+ organizations
100+ communication records
50+ financial transactions
20+ incidents
20+ source documents
```

Include deliberately designed patterns:

- one high-centrality person;
- one intermediary;
- one circular transaction;
- one communication burst;
- duplicate/alias entity records;
- cross-source relationships.

This lets SIPER demonstrate its complete pipeline.

---

# 48. Recommended MVP Technology Matrix

| Capability | MVP Technology |
|---|---|
| UI | Next.js |
| Components | shadcn/ui |
| Graph | react-force-graph |
| API | FastAPI |
| Relational DB | PostgreSQL |
| Graph DB | Neo4j |
| Graph algorithms | Neo4j GDS |
| Cache | Redis |
| Jobs | Celery |
| NLP | spaCy |
| Transformers | Hugging Face |
| Embeddings | sentence-transformers |
| Vector search | pgvector |
| LLM | Provider adapter |
| File parsing | PyMuPDF / python-docx / pandas |
| Storage | S3 / MinIO |
| Auth | Keycloak |
| API schema | OpenAPI |
| Frontend server state | TanStack Query |
| Testing | Pytest / Vitest / Playwright |
| Deployment | Docker Compose |
| CI/CD | GitHub Actions |
| Observability | OpenTelemetry |

---

# 49. Final Approved Stack

## Frontend

```text
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
Radix UI
Lucide
TanStack Query
React Hook Form
Zod
react-force-graph
Recharts
```

## Backend

```text
Python
FastAPI
Pydantic
SQLAlchemy/SQLModel-compatible repository pattern
```

### Database access decision

**Use SQLAlchemy 2.x + Alembic** rather than introducing multiple ORM abstractions.

Recommended:

```text
SQLAlchemy 2.x
Alembic
asyncpg
```

## Graph

```text
Neo4j
Neo4j Python Driver
Neo4j GDS
```

## AI/ML

```text
spaCy
Hugging Face Transformers
sentence-transformers
Provider-agnostic LLM adapter
```

## Infrastructure

```text
PostgreSQL
Redis
Celery
MinIO/S3
Keycloak
Docker Compose
Nginx
```

## Engineering

```text
GitHub
GitHub Actions
Pytest
Vitest
Playwright
Ruff
ESLint
Prettier
OpenTelemetry
```

---

# 50. Architecture Principle

The most important architecture decision is:

> **Use the right database for the right problem.**

```text
PostgreSQL
    =
system/application truth

Neo4j
    =
relationship/network truth

Object Storage
    =
source document truth

Redis
    =
temporary state + job coordination

AI/ML
    =
analytical assistance

Investigator
    =
final decision-maker
```

This separation keeps SIPER understandable, testable and extensible.

---

# 51. MVP Build Order

## Phase 1 — Foundation

```text
Repository
Docker Compose
PostgreSQL
Neo4j
Redis
FastAPI
Next.js
Authentication
Design system
```

## Phase 2 — Case Management

```text
Cases
Users
Roles
Case membership
Audit logging
```

## Phase 3 — Ingestion

```text
File upload
Document storage
Parsing
Normalization
Processing jobs
```

## Phase 4 — Intelligence

```text
NER
Relationship extraction
Entity resolution
Neo4j graph construction
```

## Phase 5 — Graph UX

```text
Entity search
Graph explorer
Entity profile
Centrality
Path analysis
```

## Phase 6 — AI Findings

```text
Pattern detection
Confidence scoring
Explainability
Evidence linking
```

## Phase 7 — Reporting

```text
Report builder
PDF generation
Export
Audit
```

---

# 52. Definition of Done for Technology Foundation

The technology foundation is complete when:

- [ ] `docker compose up` starts the core stack.
- [ ] Frontend communicates with FastAPI.
- [ ] FastAPI communicates with PostgreSQL.
- [ ] FastAPI communicates with Neo4j.
- [ ] Worker consumes processing jobs.
- [ ] Redis job state is visible.
- [ ] Source files are stored in object storage.
- [ ] Authentication works.
- [ ] RBAC is enforced server-side.
- [ ] Audit events are generated.
- [ ] OpenAPI is available.
- [ ] Synthetic data can be seeded.
- [ ] Graph nodes and relationships can be created.
- [ ] Entity search works.
- [ ] Graph neighborhood can be retrieved.
- [ ] AI findings can reference source evidence.
- [ ] CI runs automated tests.
- [ ] No secrets are committed.

---

# 53. Important Product/Architecture Boundary

SIPER is an **intelligence-analysis and decision-support system**.

The architecture must not turn analytical outputs into autonomous enforcement decisions.

The system should:

```text
collect
→ structure
→ connect
→ analyze
→ explain
→ surface signals
→ provide evidence
→ assist investigator
```

The investigator remains responsible for interpretation and action.

---

# 54. Technology Decision Summary

### Choose

**Next.js + TypeScript**  
for the investigator UI.

**FastAPI + Python**  
for API and analytical services.

**PostgreSQL**  
for application/system data.

**Neo4j + GDS**  
for criminal-network relationships and graph analytics.

**Redis + Celery**  
for asynchronous processing.

**spaCy + Transformers + sentence-transformers**  
for NLP and entity intelligence.

**Provider-agnostic LLM adapter**  
for structured extraction and explanation.

**pgvector**  
for initial semantic search and similarity.

**S3/MinIO**  
for source documents.

**Keycloak/OIDC**  
for authentication and identity.

**Docker Compose**  
for MVP deployment.

---

# 55. Final Rule for the Team

Do not select technology because it is fashionable.

Select it because it solves a SIPER-specific problem.

```text
Need relational integrity?      → PostgreSQL
Need graph traversal?           → Neo4j
Need graph algorithms?          → Neo4j GDS
Need NLP?                       → Python
Need background processing?     → Celery + Redis
Need semantic similarity?      → pgvector
Need source documents?          → S3/MinIO
Need enterprise UI?             → Next.js + React
Need interactive graph?         → react-force-graph
Need authentication?            → Keycloak/OIDC
Need reproducible deployment?  → Docker
```

**SIPER Technology Stack Version 1.0 — MVP Baseline**
