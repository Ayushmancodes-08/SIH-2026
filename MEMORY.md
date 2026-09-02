# SIPER — AI Agent Memory

> **Purpose:** Persistent project memory for AI agents working on SIPER.  
> **Project:** SIPER — AI-Powered Criminal Network Analysis System  
> **SIH Problem Statement:** PS 26189  
> **Organization:** Ministry of Home Affairs / NCRB  
> **Current phase:** MVP planning → UI/UX generation → implementation  
> **Memory version:** 1.0  
> **Last updated:** 2026-08-30

---

# 1. Agent Mission

The agent is helping build **SIPER**, an investigator-first AI-powered criminal network analysis platform.

The agent must preserve continuity across:

- product planning;
- Stitch UI generation;
- frontend implementation;
- backend/API implementation;
- graph analytics;
- AI/NLP pipelines;
- database design;
- security;
- testing;
- SIH demonstration preparation.

The agent must **not treat every new prompt as a blank project**.

Before making changes, consult this memory and the project's:

```text
PRD.md
DRD.md
TECH_STACK.md
```

These documents have different responsibilities:

```text
PRD
= What SIPER is and why it exists.

DRD
= How SIPER should behave/look from a product and design perspective.

TECH_STACK
= How SIPER should be technically implemented.

MEMORY
= Persistent decisions, current state, conventions, constraints and agent instructions.
```

---

# 2. Product Identity

## Product Name

**SIPER**

Working expansion:

**AI-Powered Criminal Network Analysis System**

## Product Category

Law-enforcement intelligence / investigative decision-support platform.

## Primary User

Investigator / authorized law-enforcement personnel.

## Secondary Users

```text
Supervisor
Analyst
Administrator
Auditor
```

## Product Tone

```text
authoritative
precise
trustworthy
analytical
secure
evidence-driven
investigator-first
```

Never make SIPER look like:

```text
consumer social media
gaming UI
generic AI chatbot
marketing website
playful SaaS
```

---

# 3. Core Product Thesis

SIPER exists to solve a specific investigative problem:

> Crime-related information is fragmented across documents, communications, financial records, locations, vehicles, organizations and other sources. Investigators need a system that can connect these signals into an explainable network without replacing human judgment.

SIPER should therefore transform:

```text
Fragmented data
        ↓
Structured entities
        ↓
Resolved identities
        ↓
Relationships
        ↓
Graph
        ↓
Graph analytics
        ↓
Suspicious patterns
        ↓
Evidence-backed findings
        ↓
Investigator decision support
```

---

# 4. MVP Scope

The MVP must focus on six core capabilities.

## 1. Data ingestion

Support synthetic/demo versions of:

```text
FIR / police reports
CDR data
financial transactions
surveillance reports
social-media intelligence
criminal-history-style records
```

## 2. Entity extraction

Extract:

```text
Person
Phone
Vehicle
Location
Organization
Financial Account
Incident
Document
```

## 3. Entity resolution

Detect when multiple records may represent the same real-world entity.

Examples:

```text
Raj Kumar
Rajkumar
R. Kumar
Raj Kumar S.
```

must be treated as potentially related records, not blindly merged.

## 4. Relationship graph

Build an interactive network graph showing:

```text
who is connected to whom
how they are connected
when they were connected
which source supports the relationship
how confident the relationship is
```

## 5. Pattern detection

Detect patterns such as:

```text
communication bursts
temporal proximity to incidents
circular financial movement
shared intermediaries
cross-case relationships
high-betweenness bridge entities
```

## 6. Investigation/reporting

Investigator can:

```text
search entity
inspect profile
explore graph
review timeline
review source evidence
inspect AI findings
add entity/finding to case
generate report
```

Do not expand MVP scope unnecessarily.

---

# 5. Critical Product Principle

## SIPER is decision support, not an autonomous enforcement system.

The system:

```text
collects
structures
connects
analyzes
explains
surfaces signals
provides evidence
assists investigators
```

The system must NOT imply:

```text
AI proves guilt
AI determines criminality
AI automatically authorizes enforcement
AI replaces investigator judgment
```

Use terminology such as:

```text
risk signal
relationship confidence
analytical finding
pattern detected
supporting evidence
investigative lead
```

Avoid unsupported claims such as:

```text
criminal probability
guilt score
confirmed criminal
AI convicted
```

unless the underlying authorized data explicitly supports such terminology.

---

# 6. Design System Memory

## Visual Direction

Dark-mode-first command-center interface.

Reference characteristics:

```text
Palantir Gotham
Linear
Vercel dashboards
enterprise intelligence platforms
```

Do not copy proprietary interfaces. Use them only as high-level visual inspiration.

## Core Colors

```text
Background:       #0A0B0D
Surface:          #141518
Primary Blue:     #3B82F6
Amber:            #F59E0B
Danger Red:       #EF4444
Success Green:    #22C55E
Primary Text:     #E5E7EB
Secondary Text:   #9CA3AF
```

## Typography

Preferred:

```text
Inter
```

Alternative:

```text
Geist
```

Hierarchy:

```text
Page heading: 24–32px bold
Body:         ~14px
Metadata:     ~12px
Labels:       uppercase + tracked letter spacing
```

## Components

Use:

```text
8–12px border radius
subtle 1px borders
minimal shadows
dark elevated surfaces
clear spacing
dense but readable tables
```

Glassmorphism should be restricted to:

```text
modals
overlays
floating contextual panels
```

Do not make the entire application glassmorphic.

---

# 7. Entity Colors

The graph uses stable semantic colors.

```text
Person         → blue
Phone          → purple
Vehicle        → orange
Location       → green
Organization   → cyan
```

Do not randomly change entity colors between screens.

Risk colors:

```text
Low / verified → green
Medium / review → amber
High / critical → red
```

Risk color must never be the only visual indicator.

---

# 8. Core Navigation

Primary sidebar:

```text
Dashboard
Cases
Entity Search
Graph Explorer
Reports
Audit Log
Settings
```

Active navigation item:

```text
blue left-border accent
subtle surface highlight
```

---

# 9. Core Screen Inventory

## Authentication

```text
Login
MFA / OTP
Session / access state
```

## Main application

```text
Dashboard
Cases
Case Detail
Entity Search
Graph Explorer
Entity Profile
Reports
Audit Log
Settings
```

## Data workflow

```text
Upload / Ingestion
Processing status
Analysis result
Evidence review
```

---

# 10. Dashboard Memory

Dashboard should communicate:

```text
current operational state
active investigations
high-risk analytical signals
recent activity
network intelligence
```

KPI cards:

```text
Active Cases
Entities Tracked
High-Risk Flags
Patterns Detected This Week
```

Dashboard sections:

```text
Recent Cases
Recent Alerts
Network Snapshot
```

Avoid excessive charts.

---

# 11. Investigation Screen Memory

The primary investigation screen is a three-panel workspace.

```text
┌────────────────┬──────────────────────────────┬────────────────────┐
│ Search &       │                              │ Entity Profile     │
│ Filters        │       Network Graph          │ / Context          │
│                │                              │                    │
│ 280px          │       flexible width         │ 320px              │
└────────────────┴──────────────────────────────┴────────────────────┘
```

## Left panel

Contains:

```text
entity search
entity-type filters
date range
source filters
recent searches
```

## Center

Contains:

```text
force-directed graph
node selection
node expansion
edge confidence
zoom
pan
layout controls
pattern detection
```

## Right

Contains:

```text
selected entity
risk/confidence context
connections
timeline
source documents
AI explanation
```

The graph must never become an unreadable wall of nodes.

---

# 12. Graph UX Rules

## Node size

Node size represents:

```text
centrality / importance
```

not criminality.

## Edge thickness/opacity

Represents:

```text
relationship confidence / strength
```

## Selected node

Use:

```text
blue glow
ring
expanded label
context panel
```

## Graph controls

Include:

```text
zoom in
zoom out
fit graph
expand network
run pattern detection
layout toggle
```

Layouts:

```text
force
hierarchical
timeline
```

## Progressive loading

Never load unlimited graph data.

Use:

```text
initial neighborhood
→ user expands node
→ fetch additional neighbors
```

Recommended initial viewport:

```text
~50–150 nodes
```

depending on device/performance.

---

# 13. Edge Confidence

Relationships are not binary.

Every important relationship should support:

```text
confidence %
source count
source references
first seen
last seen
verification state
```

Example:

```text
87% confidence
3 supporting sources
First observed: 2026-04-12
Last observed: 2026-08-19
```

Confidence means:

> confidence in the evidence/relationship analysis.

It does NOT mean:

> probability that a person is guilty.

---

# 14. Entity Profile Memory

Entity profile should show:

```text
Entity name
Entity type
Risk/analytical status
Key attributes
Network position
Connections
Timeline
Financial activity
Source documents
AI insights
```

Network metrics:

```text
Degree Centrality
Betweenness Centrality
PageRank
```

These metrics indicate network structure, not criminal guilt.

---

# 15. AI Insights UX

AI findings should be presented as evidence-backed analytical assistance.

Each finding should show:

```text
finding title
confidence
affected entities
reason codes
supporting evidence
source references
timestamp
```

Example:

```text
Unusual transaction pattern detected

Confidence: 84%

Reason:
Transaction volume increased significantly during
a short period surrounding an incident.

Evidence:
3 financial records
2 timeline events
```

Never display unsupported model conclusions as facts.

---

# 16. Explainability Rule

Every meaningful AI-generated conclusion should answer:

```text
What was detected?
Why was it detected?
Which entities are involved?
Which sources support it?
How confident is the relationship/finding?
```

Preferred UI section:

**Why This Connection**

Use concise plain-language explanation.

Do not expose hidden chain-of-thought.

Store evidence and reason codes instead.

---

# 17. Source Provenance

Every extracted entity/relationship/finding should preserve provenance.

Minimum provenance:

```text
source document
source record
page/row where applicable
extraction timestamp
processing run
confidence
```

The investigator must be able to move from:

```text
finding
→ evidence
→ source
```

This is a core product differentiator.

---

# 18. Technology Stack Memory

## Frontend

```text
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
Radix UI
Lucide React
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
SQLAlchemy 2.x
Alembic
asyncpg
```

## Databases

```text
PostgreSQL
Neo4j
```

## Graph analytics

```text
Neo4j Graph Data Science
```

## AI/NLP

```text
spaCy
Hugging Face Transformers
sentence-transformers
provider-agnostic LLM adapter
```

## Vector search

```text
pgvector
```

## Async jobs

```text
Redis
Celery
```

## Object storage

```text
S3-compatible storage
MinIO locally
```

## Authentication

```text
Keycloak
OIDC
MFA
```

## Testing

```text
Pytest
Vitest
Playwright
```

## Deployment

```text
Docker
Docker Compose
Nginx/Caddy
```

## CI/CD

```text
GitHub Actions
```

## Observability

```text
OpenTelemetry
structured logs
```

---

# 19. Database Responsibility

Do not mix responsibilities unnecessarily.

## PostgreSQL = application/system truth

Use for:

```text
users
roles
permissions
cases
case memberships
documents
ingestion jobs
processing runs
findings
timeline events
notes
reports
audit events
entity metadata
```

## Neo4j = network truth

Use for:

```text
entities
relationships
network structure
graph-derived relationships
graph analytics
```

## Object storage = source document truth

Use for:

```text
PDF
DOCX
CSV
XLSX
JSON
other source files
```

## Redis = temporary state

Use for:

```text
job queues
cache
rate limiting
processing state
```

---

# 20. Neo4j Node Memory

Core node labels:

```text
Person
Phone
Vehicle
Location
Organization
FinancialAccount
Incident
Document
```

Example:

```text
(:Person {
    id: "ent_001",
    canonicalName: "Synthetic Person A"
})
```

Core relationships:

```text
CONTACTED
USED
ASSOCIATED_WITH
VISITED
WORKS_FOR
TRANSFERRED_TO
INVOLVED_IN
MENTIONED_IN
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

# 21. Entity Resolution Memory

Entity resolution is a core SIPER capability.

Use a hybrid pipeline:

```text
Exact identifiers
      ↓
Normalization
      ↓
Deterministic similarity
      ↓
Semantic similarity
      ↓
Combined score
      ↓
Candidate match
      ↓
Human review where uncertain
```

Never silently merge uncertain identities.

Use:

```text
ENTITY_RESOLUTION_CANDIDATE
```

when confidence is insufficient.

---

# 22. NLP Pipeline Memory

Pipeline:

```text
Raw source
 ↓
Parse
 ↓
Normalize
 ↓
NER
 ↓
Relationship extraction
 ↓
Entity resolution
 ↓
Confidence scoring
 ↓
Provenance attachment
 ↓
Graph write
 ↓
Graph analytics
 ↓
Pattern detection
 ↓
Finding
```

Deterministic rules should be preferred for structured identifiers.

Examples:

```text
phone numbers
vehicle registrations
case IDs
dates
account identifiers
```

Use NLP/LLMs for contextual extraction.

---

# 23. LLM Rules

LLMs must not directly write arbitrary graph data.

Required pipeline:

```text
LLM
 ↓
structured JSON
 ↓
Pydantic validation
 ↓
normalization
 ↓
confidence
 ↓
provenance
 ↓
graph writer
```

LLM provider must be abstracted.

Never hard-code the application to a single vendor.

Environment configuration:

```text
LLM_PROVIDER
LLM_MODEL
LLM_API_KEY
```

API keys stay server-side.

---

# 24. Pattern Detection Memory

Initial rules:

## Communication burst

Detect unusually high communication volume.

## Temporal proximity

Detect activity close to an incident.

## Circular financial movement

Detect:

```text
A → B → C → A
```

## Shared intermediary

Detect entities connected through a common intermediary.

## Cross-case connection

Detect authorized entities appearing across multiple cases.

## Community bridge

Use betweenness centrality to identify structural bridge nodes.

Pattern result:

```text
pattern
confidence
entities
evidence
reason codes
timestamp
```

---

# 25. Authentication / Authorization Memory

Authentication:

```text
Keycloak / OIDC
```

Roles:

```text
INVESTIGATOR
SUPERVISOR
ANALYST
ADMIN
AUDITOR
```

Important rule:

> Frontend visibility is not authorization.

Every protected operation must be checked by the backend.

Use:

```text
user
→ role
→ permissions
→ case membership
→ resource authorization
```

---

# 26. Audit Memory

Audit logging is mandatory.

Track:

```text
login
logout
search
entity access
document access
graph expansion
analysis execution
finding access
finding changes
report generation
exports
permission changes
```

Example event:

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

Never log secrets.

Avoid unnecessary raw sensitive information in logs.

---

# 27. Synthetic Data Rule

For SIH development and demonstration:

**Use synthetic/mock data unless officially authorized data is supplied.**

The demo dataset should contain coherent relationships.

Recommended:

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

Seed intentional patterns:

```text
high-centrality person
bridge intermediary
circular transaction
communication burst
duplicate aliases
cross-source relationship
```

The data should tell a believable investigative story.

---

# 28. Repository Memory

Recommended structure:

```text
siper/
│
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
├── database/
│   ├── postgres/
│   └── neo4j/
│
├── data/
│   └── synthetic/
│
├── infra/
│   ├── docker/
│   └── scripts/
│
└── docs/
    ├── PRD.md
    ├── DRD.md
    ├── TECH_STACK.md
    └── MEMORY.md
```

---

# 29. Service Boundaries

Keep MVP architecture simple.

Application services:

```text
1. Web
2. API
3. Analysis Worker
```

Infrastructure:

```text
PostgreSQL
Neo4j
Redis
Object Storage
Keycloak
```

Do not create unnecessary microservices.

---

# 30. Frontend Architecture Memory

Feature-oriented structure is preferred.

Example:

```text
features/
├── dashboard/
├── cases/
├── entities/
├── graph/
├── findings/
├── reports/
├── audit/
└── auth/
```

Shared:

```text
components/
hooks/
lib/
ui/
types/
```

Keep graph-specific state close to the graph feature.

Use TanStack Query for server state.

Do not introduce Redux unless a real requirement appears.

---

# 31. API Conventions

Base path:

```text
/api/v1
```

Use REST and OpenAPI.

Example:

```text
GET    /cases
POST   /cases
GET    /cases/{case_id}

GET    /entities/search
GET    /entities/{entity_id}
GET    /entities/{entity_id}/connections
GET    /entities/{entity_id}/timeline

POST   /graph/query
POST   /graph/expand
POST   /graph/path

POST   /analysis/jobs
GET    /analysis/jobs/{job_id}

GET    /findings
GET    /findings/{finding_id}

POST   /reports
GET    /reports/{report_id}

GET    /audit-events
```

Never expose unrestricted Cypher directly to the browser.

---

# 32. UI ↔ API Contract

Preferred flow:

```text
Pydantic schemas
       ↓
FastAPI OpenAPI
       ↓
TypeScript API types
       ↓
TanStack Query
       ↓
React UI
```

Do not invent frontend data structures that contradict backend schemas.

If the API changes, update the contract and affected UI.

---

# 33. Stitch AI Memory

SIPER UI is being planned/generated with **Stitch AI**.

Stitch is the design-generation environment.

The agent must use the DRD as the design source of truth.

Every Stitch prompt should preserve:

```text
SIPER identity
dark command-center aesthetic
design tokens
navigation
component language
information hierarchy
accessibility
responsive behavior
investigator workflow
```

Do not generate isolated screens that visually contradict existing SIPER screens.

---

# 34. Stitch Prompt Discipline

Every screen-generation prompt should specify:

```text
1. Screen purpose
2. User role
3. Layout
4. Components
5. Data displayed
6. Interactions
7. States
8. Design tokens
9. Accessibility
10. Responsive behavior
```

When refining an existing Stitch screen:

```text
preserve existing design system
preserve navigation
preserve established component language
change only requested areas
```

Do not redesign unrelated areas unless necessary for consistency.

---

# 35. UI State Requirements

Every major data-driven component should consider:

```text
loading
skeleton
empty
error
success
permission denied
partial data
stale data
processing
```

Graph-specific:

```text
initial loading
graph empty
too many nodes
failed query
node selected
node expanded
analysis running
analysis complete
```

---

# 36. Motion Memory

Motion should communicate state, not decoration.

Use:

```text
subtle node hover glow
selection transitions
drawer fade/slide
graph expansion
loading skeletons
progress indicators
```

Avoid:

```text
large animations
constant movement
attention-grabbing effects
consumer-app microinteractions
```

---

# 37. Accessibility

Minimum:

```text
keyboard navigation
visible focus states
semantic buttons
accessible labels
sufficient contrast
tooltips for unfamiliar analytical metrics
non-color indicators for risk
```

Never communicate critical meaning only through color.

Example:

```text
High Risk
+ red badge
+ text label
+ warning icon where appropriate
```

---

# 38. Performance Rules

Do not:

```text
render thousands of graph nodes
fetch entire datasets unnecessarily
perform heavy AI inference synchronously in request handlers
send full documents to frontend unnecessarily
```

Use:

```text
pagination
progressive graph expansion
background jobs
caching
lazy loading
server-side filtering
```

Target:

```text
common API request < 500ms
entity search < 1 sec
graph expansion < 2 sec
initial graph < 3 sec
```

Targets are measured against the synthetic SIH dataset.

---

# 39. Security Rules

Never commit:

```text
API keys
passwords
database credentials
JWT secrets
cloud credentials
```

Use:

```text
.env
secret manager
environment configuration
```

Never expose AI credentials in frontend code.

Validate file uploads.

Protect source documents.

Use TLS outside local development.

Use least-privilege access.

---

# 40. What Not to Add Without Explicit Reason

Do not introduce these casually:

```text
MongoDB
Elasticsearch
Kafka
Kubernetes
dedicated vector DB
large microservice architecture
multiple state-management libraries
multiple graph libraries
```

Current decisions:

```text
PostgreSQL over MongoDB
pgvector over separate vector DB
Redis + Celery over Kafka
Docker Compose over Kubernetes
Neo4j for graph
react-force-graph for visualization
```

These decisions may change only after a documented requirement.

---

# 41. Current MVP Development Sequence

## Phase 1

```text
Repository
Docker
PostgreSQL
Neo4j
Redis
FastAPI
Next.js
Authentication
Design system
```

## Phase 2

```text
Cases
Users
Roles
Case membership
Audit logging
```

## Phase 3

```text
Upload
Object storage
Parsing
Normalization
Processing jobs
```

## Phase 4

```text
NER
Relationship extraction
Entity resolution
Graph construction
```

## Phase 5

```text
Entity search
Graph Explorer
Entity Profile
Centrality
Path analysis
```

## Phase 6

```text
Pattern detection
Confidence scoring
Explainability
Evidence linking
```

## Phase 7

```text
Reports
PDF export
Audit
Demo hardening
```

---

# 42. Current UI/UX Sequence

Preferred screen generation order:

```text
1. Login
2. MFA
3. Dashboard
4. Cases
5. Case Detail
6. Data Ingestion
7. Processing / Analysis
8. Entity Search
9. Graph Explorer
10. Entity Profile
11. Findings / Alerts
12. Reports
13. Audit Log
14. Settings
```

Generate each screen consistently with the previous ones.

---

# 43. Investigator Journey

The primary demo journey should be:

```text
Login
 ↓
Dashboard
 ↓
Open active case
 ↓
Upload / inspect intelligence
 ↓
Processing completes
 ↓
Search entity
 ↓
Open Entity Profile
 ↓
Open Graph Explorer
 ↓
Expand network
 ↓
Identify influential/bridge entity
 ↓
Run Pattern Detection
 ↓
Review finding
 ↓
Open supporting evidence
 ↓
Add relevant entity/finding to case
 ↓
Generate report
```

This is the canonical SIPER demonstration flow.

---

# 44. SIH Demo Story

The demo should tell one coherent investigative story.

Example structure:

```text
An incident occurs.

Investigators have:
- FIR
- communication records
- transaction records
- vehicle/location records

SIPER ingests the data.

AI extracts entities.

Entity resolution discovers duplicate identities.

Neo4j builds the network.

Graph analytics identifies a structurally important intermediary.

Pattern detection discovers an unusual communication/financial pattern.

SIPER explains why the relationship was flagged.

Investigator opens source evidence.

Investigator adds the finding to the case.

SIPER generates an evidence-linked report.
```

The demo should demonstrate the full pipeline, not merely the graph.

---

# 45. High-Value Differentiators

The following capabilities should receive priority because they distinguish SIPER from a simple graph demo:

## 1. Entity resolution

Same entity across different records.

## 2. Explainable confidence

Why a relationship exists.

## 3. Provenance

Where the evidence came from.

## 4. Graph analytics

PageRank / betweenness / communities.

## 5. Timeline correlation

Connect events to network relationships.

## 6. Investigator-first UX

Graph + profile + timeline + evidence in one workflow.

## 7. Auditability

Who accessed what and when.

---

# 46. Agent Behavior Rules

The AI agent should:

### Always

```text
read MEMORY.md
respect PRD
respect DRD
respect TECH_STACK
preserve existing decisions
reuse existing components
maintain naming consistency
consider security
consider provenance
consider auditability
```

### Before changing architecture

Ask:

```text
Does the existing architecture already solve this?
Is the change actually necessary?
Will it create infrastructure complexity?
Does it contradict TECH_STACK.md?
```

### Before creating a new component

Check:

```text
Does a reusable component already exist?
Can an existing component be extended?
```

### Before changing visual design

Check:

```text
Does the change match the SIPER design system?
Does it preserve established screen patterns?
```

---

# 47. Agent Change Protocol

When making a significant change:

```text
1. Identify affected document.
2. Identify affected architecture.
3. Implement change.
4. Update documentation.
5. Update MEMORY.md if the decision is persistent.
6. Check downstream impact.
```

Examples requiring memory update:

```text
database changed
authentication changed
graph library changed
LLM provider architecture changed
major UI pattern introduced
new core workflow introduced
MVP scope changed
security rule changed
```

Do not put every tiny implementation detail into memory.

Memory should contain durable information.

---

# 48. Decision Log

## Decision 001

**PostgreSQL + Neo4j**

Reason:

```text
relational application data and graph data have different access patterns.
```

## Decision 002

**FastAPI + Python**

Reason:

```text
NLP/AI/graph processing naturally integrates with Python.
```

## Decision 003

**Next.js + React + TypeScript**

Reason:

```text
interactive enterprise dashboard + graph-heavy UI.
```

## Decision 004

**Neo4j GDS**

Reason:

```text
centrality, path analysis and community detection are core SIPER capabilities.
```

## Decision 005

**pgvector initially**

Reason:

```text
semantic retrieval without introducing another database.
```

## Decision 006

**Docker Compose for MVP**

Reason:

```text
fast, reproducible, easy to demo and maintain.
```

## Decision 007

**Synthetic data for SIH demo**

Reason:

```text
avoids exposing real sensitive information while preserving a realistic analytical story.
```

---

# 49. Things That Must Stay Consistent

The following are considered stable unless explicitly changed:

```text
Product name: SIPER
Primary user: Investigator
Visual mode: dark-first
Primary accent: electric blue
Graph database: Neo4j
Application DB: PostgreSQL
Backend: FastAPI/Python
Frontend: Next.js/React/TypeScript
Graph visualization: react-force-graph
Graph analytics: Neo4j GDS
Async jobs: Celery + Redis
Vector search: pgvector
Auth: Keycloak/OIDC
Deployment: Docker-based MVP
```

---

# 50. Unknowns / Future Decisions

Do not invent decisions for unresolved items.

Potential future decisions:

```text
official government identity integration
production cloud/on-prem deployment
enterprise secret management
SIEM integration
advanced multilingual NLP
real-time CDR ingestion
large-scale streaming architecture
dedicated search infrastructure
Kubernetes
high availability
formal model evaluation framework
```

These should be documented when actually decided.

---

# 51. Quality Gate

Before considering a major feature complete, verify:

```text
[ ] UI matches SIPER design system
[ ] UX follows investigator workflow
[ ] API contract is defined
[ ] authorization is enforced
[ ] audit implications are handled
[ ] provenance is preserved
[ ] loading/empty/error states exist
[ ] synthetic test data exists
[ ] automated tests exist
[ ] performance is acceptable
[ ] documentation is updated
```

---

# 52. Final Agent Instruction

When working on SIPER:

> **Do not optimize for producing the most code. Optimize for producing a coherent, demonstrable, explainable investigative platform.**

The agent should continuously preserve this chain:

```text
SIH Problem
     ↓
Investigator Workflow
     ↓
UI/UX
     ↓
API Contract
     ↓
Data Model
     ↓
AI/NLP Pipeline
     ↓
Graph Model
     ↓
Evidence/Provenance
     ↓
Auditability
     ↓
Report
```

A feature is not truly complete if it only looks good.

A SIPER feature should connect:

```text
UI
↔ API
↔ Data
↔ AI
↔ Graph
↔ Evidence
↔ Security
↔ Audit
```

---

# 53. Source-of-Truth Hierarchy

When documents conflict, use this order:

```text
1. Explicit latest user decision
2. Current project architecture decision
3. TECH_STACK.md
4. DRD.md
5. PRD.md
6. MEMORY.md historical assumptions
```

Memory must never override a newer explicit project decision.

When a persistent decision changes:

```text
update the relevant source document
→ update MEMORY.md
→ propagate the change to affected implementation/design work
```

---

# 54. End State

The successful SIPER MVP should feel like:

> **A secure, evidence-linked intelligence command center where investigators can move from fragmented records to explainable network relationships and actionable analytical leads.**

It should not feel like:

> **A generic AI dashboard with a graph pasted into it.**

That distinction is central to the entire project.
