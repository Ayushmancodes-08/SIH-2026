# SIPER — Design Requirements Document (DRD)

**Project:** SIPER — AI-Powered Criminal Network Analysis System  
**SIH Problem Statement:** PS 26189  
**Organization:** Ministry of Home Affairs / NCRB  
**Document Type:** Design Requirements Document  
**Purpose:** Design-to-development synchronization reference for Stitch-generated UI designs  
**Status:** MVP Design Baseline  
**Design Priority:** Desktop-first, investigator-grade intelligence workspace

---

## 0. Purpose of This DRD

This document is the **single source of truth for SIPER UI/UX implementation**.

It is intended to be used together with:
- the SIPER PRD;
- Stitch-generated screen designs;
- the application's component library;
- frontend implementation;
- backend/API contracts.

The goal is to prevent a common failure mode:

> **Stitch generates visually attractive screens, but implementation gradually diverges from the intended product structure, interactions, data model, and design system.**

Every Stitch screen must therefore be treated as a **design specification**, not merely a visual reference.

### Design-to-code synchronization rule

For every generated Stitch screen:

1. Identify the screen ID in this DRD.
2. Map every visible component to a reusable SIPER component.
3. Preserve the design tokens defined here.
4. Preserve the information hierarchy.
5. Preserve interaction states, not only the default state.
6. Map visible data to a defined API/data object.
7. Never invent a new visual pattern when an existing SIPER component can be reused.
8. If Stitch introduces a new component, document it here before production implementation.
9. Any implementation change that materially changes UX must update this DRD.

---

# 1. Product Design Philosophy

SIPER is an **investigator's intelligence workstation**, not a consumer application.

The interface must communicate:

- authority;
- precision;
- evidence;
- traceability;
- controlled access;
- analytical depth;
- operational clarity.

### Avoid

- playful illustrations;
- excessive gradients;
- oversized marketing typography;
- unnecessary animations;
- card-heavy consumer-dashboard patterns;
- decorative glassmorphism;
- ambiguous AI claims;
- unexplained risk scores;
- visual clutter in graph analysis.

### Prefer

- information density with strong hierarchy;
- dark command-center surfaces;
- restrained blue interaction accents;
- evidence-linked intelligence;
- compact metadata;
- predictable navigation;
- progressive disclosure;
- explicit states;
- analyst-controlled actions.

---

# 2. Design System

## 2.1 Color Tokens

| Token | Hex | Usage |
|---|---|---|
| `bg-primary` | `#0A0B0D` | Application background |
| `bg-surface` | `#141518` | Cards/panels |
| `bg-surface-2` | `#191B20` | Elevated sections |
| `bg-hover` | `#202329` | Hover states |
| `border-default` | `rgba(255,255,255,0.08)` | Default borders |
| `border-strong` | `rgba(255,255,255,0.14)` | Important separation |
| `accent-primary` | `#3B82F6` | Primary actions / selection |
| `accent-primary-soft` | `rgba(59,130,246,0.12)` | Selected backgrounds |
| `risk-high` | `#EF4444` | High-risk states |
| `risk-medium` | `#F59E0B` | Medium-risk / warning |
| `success` | `#22C55E` | Verified / low-risk |
| `text-primary` | `#E5E7EB` | Main text |
| `text-secondary` | `#9CA3AF` | Secondary text |
| `text-muted` | `#6B7280` | Metadata |
| `text-inverse` | `#0A0B0D` | Text on bright controls |

### Color semantics

Color must communicate **state**, not decoration.

Risk colors:
- Green = verified / low concern
- Amber = requires review / elevated
- Red = high-priority signal

Important:

> A red risk badge must never mean “this person is guilty.”

Use terminology such as:
- `High Risk Signal`
- `Elevated`
- `Review Required`
- `High Priority Finding`

---

# 3. Typography

Primary font:

**Inter**

Fallback:

`system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

## Type Scale

| Style | Size | Weight | Usage |
|---|---:|---:|---|
| Display | 32px | 700 | Major screen title |
| H1 | 24px | 700 | Page heading |
| H2 | 18px | 650 | Section heading |
| H3 | 15px | 600 | Card/panel heading |
| Body | 14px | 400 | Normal content |
| Body Medium | 14px | 500 | Important labels |
| Metadata | 12px | 400 | Secondary information |
| Label | 11px | 600 | Uppercase metadata |
| Micro | 10px | 500 | Dense graph/table metadata |

Metadata labels should generally use:

`font-size: 11–12px; text-transform: uppercase; letter-spacing: 0.06–0.1em`

---

# 4. Spacing System

Use a 4px base unit.

| Token | Value |
|---|---:|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |

Default panel padding:

`16–20px`

Dense analytical panel padding:

`12–16px`

---

# 5. Shape & Elevation

## Border Radius

- Small controls: `6px`
- Inputs/buttons: `8px`
- Cards/panels: `10px`
- Large modal: `12px`

Avoid excessive rounded/pill UI.

Pills should be reserved for:
- risk;
- confidence;
- entity type;
- status;
- role.

## Elevation

Default:

**1px subtle border**

Do not rely on large shadows.

Modal/overlay:

- backdrop blur;
- approximately 10% white surface overlay;
- subtle border;
- restrained shadow.

---

# 6. Application Shell

## Desktop Layout

```text
┌──────────────────────────────────────────────────────────────────────┐
│ SIPER       Global Search                    Notifications  User     │
├──────────────┬───────────────────────────────────────────┬───────────┤
│              │                                           │           │
│ Navigation   │               Main Workspace              │ Context   │
│ 240px        │                                           │ Panel     │
│              │                                           │ optional  │
│              │                                           │           │
└──────────────┴───────────────────────────────────────────┴───────────┘
```

### Sidebar

Default width:

`240px`

Collapsed width:

`64px`

Navigation:

1. Dashboard
2. Cases
3. Entity Search
4. Graph Explorer
5. Reports
6. Audit Log
7. Settings

Active state:

- 3px blue left accent;
- blue-tinted background;
- bright text;
- icon highlighted.

---

# 7. Global Components

The following are canonical SIPER components.

## `AppShell`

Responsible for:
- sidebar;
- top navigation;
- page container;
- responsive desktop behavior;
- global notifications.

## `GlobalSearch`

Placeholder:

> Search person, phone, vehicle, case ID...

Search categories:
- Person
- Phone
- Vehicle
- Organization
- Location
- Case
- Document

Support:
- keyboard shortcut;
- recent searches;
- categorized results;
- empty state;
- loading state.

---

## `RiskBadge`

Variants:

- Low
- Medium
- High
- Critical / Priority

Example:

`72 · HIGH RISK SIGNAL`

Never display risk without semantic context.

---

## `ConfidenceBadge`

Example:

`87% CONFIDENCE`

Tooltip must explain:

> Confidence reflects the strength of available supporting evidence and analytical signals. It is not a determination of criminality.

---

## `EntityTypeBadge`

Entity types:

- Person
- Phone
- Vehicle
- Location
- Organization
- Financial Account
- Incident
- Document

---

## `SourceBadge`

Sources:

- FIR
- CDR
- Financial
- Surveillance
- Social Intelligence
- Criminal History
- Intelligence Report

---

## `LoadingSkeleton`

Use for:
- dashboard cards;
- graph panel;
- entity profile;
- timelines;
- tables.

Never display an empty blank screen during processing.

---

## `EmptyState`

Every data component must define:
- title;
- explanation;
- next action.

Example:

> No connections found  
> This entity currently has no verified relationships within the selected case scope.

---

## `ErrorState`

Must provide:
- what failed;
- whether data was saved;
- retry action;
- support/debug reference where appropriate.

---

# 8. Screen Inventory

| ID | Screen | Priority |
|---|---|---|
| AUTH-01 | Login | P0 |
| AUTH-02 | Two-Factor Verification | P0 |
| DASH-01 | Dashboard | P0 |
| CASE-01 | Case List | P0 |
| CASE-02 | Case Overview | P0 |
| CASE-03 | Create Case | P0 |
| ING-01 | Data Ingestion | P0 |
| ING-02 | Processing / AI Pipeline | P0 |
| SEARCH-01 | Entity Search | P0 |
| GRAPH-01 | Graph Explorer | P0 |
| ENTITY-01 | Entity Profile | P0 |
| FIND-01 | AI Findings | P0 |
| EVID-01 | Evidence Explorer | P0 |
| REPORT-01 | Report Builder | P0 |
| AUDIT-01 | Audit Log | P0 |
| SETTINGS-01 | Settings | P1 |

---

# 9. AUTH-01 — Secure Login

## Objective

Provide secure, authoritative access to SIPER.

## Layout

Centered authentication card on `#0A0B0D`.

Background:

Subtle network graph:
- nodes;
- connecting lines;
- approximately 8% opacity;
- no distracting animation.

## Content

1. SIPER wordmark
2. `Ministry of Home Affairs — Authorized Personnel Only`
3. Email field
4. Password field
5. Primary `Sign In`
6. Divider
7. `Sign in with Government ID`
8. Trust badge:
   `Role-Based Access · Audit Logged`

## States

- default;
- focused;
- password visibility;
- loading;
- invalid credentials;
- locked/blocked;
- network error.

---

# 10. AUTH-02 — Two-Factor Verification

Heading:

`Verify your identity`

Subtext:

`Enter the 6-digit verification code to continue.`

Components:

- six OTP inputs;
- countdown/resend;
- Verify button;
- Back / change authentication method.

States:
- incomplete;
- invalid;
- expired;
- verifying;
- success.

---

# 11. DASH-01 — Investigator Dashboard

## Objective

Answer:

> What needs my attention right now?

## Layout

Top:
- 4 KPI cards.

KPIs:

1. Active Cases
2. Entities Tracked
3. High-Risk Flags
4. Patterns Detected This Week

Each KPI:
- value;
- label;
- trend;
- optional comparison period.

## Main

Two columns:

### Recent Cases

Each case:
- Case ID;
- title;
- entity count;
- updated time;
- risk level;
- status.

### Recent Alerts

Each alert:
- finding title;
- affected entity;
- timestamp;
- confidence;
- View button.

## Bottom

`Network Snapshot`

Includes:
- compact graph;
- highlighted central node;
- node count;
- CTA:

`Open Full Graph Explorer`

---

# 12. CASE-01 — Case List

## Primary actions

- Search cases
- Filter
- Sort
- Create Case

## Table columns

- Case ID
- Case Name
- Status
- Priority
- Entities
- Findings
- Last Updated
- Owner

## States

- default;
- filtered;
- no results;
- loading;
- pagination.

---

# 13. CASE-02 — Case Overview

Header:

- Case ID
- Case title
- status;
- priority;
- owner;
- last updated.

Actions:

- Add Evidence
- Add Entity
- Run Analysis
- Generate Report

Tabs:

1. Overview
2. Evidence
3. Entities
4. Network
5. Timeline
6. AI Findings
7. Reports

---

# 14. CASE-03 — Create Case

Use a structured multi-step flow.

```text
01 Case Details
       ↓
02 Data Sources
       ↓
03 Initial Analysis
       ↓
04 Review & Create
```

### Case Details

- title;
- description;
- priority;
- tags;
- assigned investigators.

### Data Sources

Allow:
- FIR;
- CDR;
- Financial;
- Surveillance;
- Social Intelligence.

### Review

Show:
- files;
- expected processing;
- permissions;
- analysis options.

---

# 15. ING-01 — Data Ingestion

## Objective

Make data processing understandable and controlled.

## Layout

Left:

Source types.

Center:

Upload area.

Right:

Processing summary.

Supported examples:

- PDF
- DOCX
- TXT
- CSV
- XLSX
- JSON

Each uploaded file:

- filename;
- source type;
- size;
- status;
- record count;
- error count.

Actions:

- Upload
- Validate
- Remove
- Start Analysis

---

# 16. ING-02 — AI Processing Pipeline

Pipeline:

```text
UPLOAD
  ↓
VALIDATE
  ↓
NORMALIZE
  ↓
EXTRACT ENTITIES
  ↓
EXTRACT RELATIONSHIPS
  ↓
RESOLVE ENTITIES
  ↓
BUILD GRAPH
  ↓
DETECT PATTERNS
  ↓
READY FOR REVIEW
```

Each stage displays:

- status;
- progress;
- processed count;
- warnings/errors.

Never hide AI processing behind a generic spinner.

---

# 17. SEARCH-01 — Entity Search

## Search

Examples:

- person name;
- phone number;
- vehicle registration;
- organization;
- case ID.

## Filters

- Entity type;
- Case;
- Source;
- Date range;
- Risk;
- Verification state.

## Result Table

Columns:

- Entity
- Type
- Risk Signal
- Connections
- Cases
- Last Seen
- Sources

Selecting a result opens:

`Entity Profile`

---

# 18. GRAPH-01 — Graph Explorer

This is the **flagship SIPER screen**.

## Layout

```text
┌──────────────┬───────────────────────────────────┬──────────────┐
│ Search &     │                                   │ Selected     │
│ Filters      │          GRAPH CANVAS             │ Entity       │
│              │                                   │ Context      │
│ 280px        │           flex-grow               │ 320px        │
└──────────────┴───────────────────────────────────┴──────────────┘
```

## Left Panel

Title:

`Search & Filters`

Controls:

- entity search;
- entity-type chips;
- date range;
- source filter;
- risk filter;
- confidence threshold;
- Recent Searches.

## Center

Force-directed graph.

### Node colors

| Type | Color |
|---|---|
| Person | Blue |
| Phone | Purple |
| Vehicle | Orange |
| Location | Green |
| Organization | Cyan |
| Financial | Amber |
| Incident | Red |

Node size:

scaled by importance/centrality.

## Edges

Edge width/opacity:

scaled by relationship confidence.

Key edges can display:

`87%`

## Selected Node

Selected node:
- blue glow;
- ring;
- expanded label;
- summary tooltip.

## Floating Toolbar

- Zoom In
- Zoom Out
- Fit
- Expand Network
- Run Pattern Detection
- Layout
- Path Analysis
- Export

Layout options:

- Force
- Hierarchical
- Timeline

---

# 19. GRAPH-01 — Graph Interaction Rules

### Hover

Display:

- entity name;
- type;
- importance;
- connection count.

### Click

Select entity.

Right context panel updates.

### Double-click / Expand

Load additional neighbors.

### Edge click

Open relationship details:

- relationship type;
- confidence;
- supporting sources;
- first seen;
- last seen;
- explanation.

### Multi-select

Allow comparison or path analysis where supported.

### Progressive disclosure

Do not render unlimited nodes at once.

Default:

show relevant local neighborhood.

---

# 20. ENTITY-01 — Entity Profile

## Header

- Entity icon
- Name
- Entity type
- Risk signal
- Add to Case
- Export Profile

## Left Column — Profile Summary

Attributes:

- aliases;
- known addresses;
- phone numbers;
- vehicles;
- organizations;
- associated cases.

## Network Position

Metrics:

- Degree Centrality
- Betweenness Centrality
- PageRank

Display as:

horizontal bars + numerical value.

Tooltips must explain each metric.

---

# 21. ENTITY-01 — Entity Tabs

### Connections Graph

Mini network centered on selected entity.

### Timeline

Chronological event list.

Event types:

- Call
- Transaction
- Sighting
- Incident
- Document

Each event:

- date;
- time where available;
- description;
- source;
- confidence.

### Financial Activity

If applicable:

- transaction volume;
- transaction count;
- time range;
- anomalies.

### Source Documents

Accordion document cards.

Each document:

- source;
- date;
- case;
- extracted entities;
- relevant passages.

---

# 22. AI Insights Panel

Location:

Bottom of Entity Profile.

Style:

Amber-accented border.

Heading:

`AI Insights`

Example findings:

- Frequent contact with 3 flagged entities.
- Unusual transaction pattern detected within the selected period.
- Entity appears across multiple authorized case datasets.

Every insight requires:

- confidence;
- explanation;
- evidence links.

Use:

`Review Finding`

rather than:

`Confirm Suspicion`

---

# 23. FIND-01 — AI Findings

## List View

Filters:

- status;
- confidence;
- type;
- case;
- date.

Finding card:

- title;
- affected entities;
- confidence;
- severity/priority;
- timestamp;
- status.

Statuses:

- New
- Reviewing
- Saved
- Dismissed
- Verified by Investigator

`Verified` means the investigator verified the finding/evidence, not that criminality was established.

---

# 24. FIND-01 — Finding Detail

Sections:

1. Finding Summary
2. Why SIPER Flagged This
3. Affected Entities
4. Relationship Graph
5. Timeline
6. Supporting Evidence
7. Confidence Factors
8. Investigator Notes
9. Audit History

Primary actions:

- Save
- Dismiss
- Add Note
- Add to Report

---

# 25. EVID-01 — Evidence Explorer

## Layout

Left:

document list.

Center:

document viewer.

Right:

extracted intelligence/context.

Document metadata:

- source;
- document ID;
- case;
- date;
- uploader;
- processing status.

Extracted entities should be visually marked.

Important:

**Never visually make AI-extracted text appear identical to original source text.**

Use separate styling.

---

# 26. REPORT-01 — Report Builder

## Report Flow

```text
01 Report Details
       ↓
02 Entities
       ↓
03 Findings
       ↓
04 Timeline
       ↓
05 Evidence
       ↓
06 Preview & Export
```

Report contents:

- case information;
- executive summary;
- selected entities;
- network snapshot;
- important relationships;
- findings;
- timeline;
- supporting evidence;
- analyst notes;
- report metadata.

Export:

`PDF`

---

# 27. AUDIT-01 — Audit Log

## Objective

Demonstrate accountability.

Table:

- Timestamp
- User
- Role
- Action
- Case
- Entity
- Resource
- Result

Actions include:

- login;
- search;
- profile access;
- document access;
- graph expansion;
- analysis;
- finding review;
- report generation;
- export.

Audit records should be visually neutral and information-dense.

---

# 28. SETTINGS-01 — Settings

Sections:

1. Profile
2. Security
3. Access & Roles
4. Notifications
5. Data Sources
6. System Preferences

Administrative controls should be clearly separated from ordinary investigator settings.

---

# 29. Responsive Strategy

Primary target:

**Desktop / laptop**

Minimum design target:

`1280px`

Recommended:

`1440px`

At widths below desktop:

- sidebar collapses;
- right context panel becomes drawer;
- graph remains primary workspace;
- dense tables gain horizontal scrolling.

Do not attempt to force the full three-pane graph workspace into a narrow mobile layout.

---

# 30. Interaction States

Every Stitch screen must include, where applicable:

### Default

Normal loaded state.

### Hover

Subtle surface highlight/glow.

### Focus

Visible blue focus ring.

### Active

Clear selected state.

### Loading

Skeleton/progress.

### Empty

Explanation + next action.

### Error

Actionable error + retry.

### Disabled

Reduced emphasis, but still readable.

### Permission Denied

Explain access restriction without revealing protected information.

---

# 31. Motion Design

Motion should communicate system state.

Allowed:

- subtle panel transitions;
- graph node expansion;
- context panel slide/fade;
- hover glow;
- skeleton shimmer;
- progress transitions.

Avoid:

- excessive bouncing;
- decorative animations;
- large screen transitions;
- continuous background motion.

Graph physics should settle quickly.

---

# 32. AI UX Rules

SIPER's AI is assistive.

Every AI-generated result must answer:

1. What was detected?
2. Why was it detected?
3. What evidence supports it?
4. How confident is the system?
5. What can the investigator do next?

Recommended pattern:

```text
AI FINDING

Unusual communication cluster detected

Confidence
87%

Why this was flagged
• 14 communications within configured time window
• 3 entities repeatedly co-occur
• Activity increased before incident event

Supporting evidence
[FIR-042] [CDR-018] [Timeline]

[Review Finding]
```

Never show:

> `Person is Criminal — 92%`

---

# 33. Graph Visualization Semantics

Graph is an analytical workspace, not decorative art.

## Node

```text
Entity
├── type
├── label
├── centrality
├── risk/priority signal
├── verification state
└── source count
```

## Edge

```text
Relationship
├── type
├── confidence
├── source count
├── first seen
├── last seen
└── verification state
```

## Visual hierarchy

Selected entity:

highest emphasis.

Direct neighbors:

medium emphasis.

Peripheral entities:

lower opacity.

Filtered-out entities:

hidden rather than visually cluttering the graph.

---

# 34. Data Provenance UX

Every important analytical object should support:

`Where did this come from?`

Provide a provenance drawer/modal containing:

- source document;
- source type;
- record ID;
- date;
- extraction method;
- confidence;
- relationship derivation.

Example:

```text
RELATIONSHIP
Person A → Person B
Type: CONTACTED
Confidence: 87%

Evidence
CDR-018
14 matching communication records
Last observed: 2026-08-21

[Open Source Record]
```

---

# 35. Entity Resolution UX

Entity resolution is one of SIPER's key differentiators.

When possible duplicates are found:

```text
POTENTIAL ENTITY MATCH

Candidate A
Rahul Kumar
Phone: ***7821
Vehicle: OD-XX-1234

Candidate B
R. Kumar
Phone: ***7821
Vehicle: OD-XX-1234

Match confidence
94%

Factors
✓ Same phone
✓ Same vehicle
✓ Name similarity
✓ Overlapping observations

[Confirm Match]
[Keep Separate]
[Review Evidence]
```

Never silently merge entities.

---

# 36. Notifications

Notification types:

- AI processing completed;
- high-priority finding;
- ingestion error;
- report ready;
- permission/access event.

Notifications should link directly to the relevant resource.

---

# 37. Search Behavior

Global search must support:

- exact search;
- fuzzy search;
- identifier search;
- entity-type filtering;
- case-scoped search.

Examples:

```text
+91XXXXXXXXXX
OD-XX-1234
CASE-26189
Rahul Kumar
```

Search results should display:

- match type;
- case;
- confidence where applicable;
- last observed;
- source count.

---

# 38. Component Naming Convention

Use consistent implementation names.

```text
SiperAppShell
SiperSidebar
SiperTopbar
SiperGlobalSearch

SiperCard
SiperKpiCard
SiperEntityCard
SiperCaseCard
SiperAlertCard

SiperRiskBadge
SiperConfidenceBadge
SiperEntityTypeBadge
SiperSourceBadge

SiperDataTable
SiperTimeline
SiperEvidenceViewer

SiperGraphCanvas
SiperGraphToolbar
SiperGraphNode
SiperGraphEdge
SiperEntityContext

SiperAiInsight
SiperFindingCard
SiperProvenanceDrawer

SiperModal
SiperCommandPalette
SiperToast
SiperSkeleton
SiperEmptyState
SiperErrorState
```

---

# 39. Stitch Generation Rules

When generating a Stitch screen, include the following principles in the prompt:

> Design this as part of the existing SIPER enterprise intelligence design system. Do not create a new visual language.

> Reuse the established dark-mode palette, typography, spacing, borders, badges, tables, navigation, graph semantics and interaction patterns.

> The screen must look like a professional law-enforcement/intelligence analysis workstation, not a consumer dashboard.

> Prioritize information hierarchy, evidence traceability and investigator workflow over decoration.

> Include realistic synthetic data and complete UI states where relevant.

> Do not imply that AI findings establish guilt or criminality.

---

# 40. Stitch Screen Prompt Template

Use this template for every screen.

```text
Create the SIPER [SCREEN NAME] screen.

Product:
SIPER — AI-Powered Criminal Network Analysis System.

Context:
This is an authorized investigator-facing criminal network intelligence platform for SIH PS 26189.

Design system:
- Dark background #0A0B0D
- Surface #141518
- Electric blue #3B82F6
- Amber #F59E0B
- Red #EF4444
- Green #22C55E
- Primary text #E5E7EB
- Secondary text #9CA3AF
- Inter typography
- 8–12px radius
- Subtle 1px borders
- Minimal shadows
- No playful consumer-app styling

UX:
- Desktop-first
- Enterprise intelligence command-center aesthetic
- Dense but highly scannable
- Strong hierarchy
- Clear states
- Evidence/provenance visible where relevant
- AI outputs must be framed as analytical signals requiring investigator review

Screen objective:
[DESCRIBE OBJECTIVE]

Layout:
[DESCRIBE EXACT PANELS/COLUMNS]

Components:
[LIST COMPONENTS]

Interactions:
[LIST CLICK/HOVER/EXPAND/FILTER BEHAVIOR]

Data:
[LIST SYNTHETIC DATA TO DISPLAY]

States:
- Default
- Loading
- Empty
- Error
- Hover
- Selected
- Disabled
- Permission restricted where applicable

Do not redesign the SIPER design system.
Do not introduce unnecessary gradients or decorative effects.
Do not make risk scores look like criminality verdicts.
```

---

# 41. Stitch-to-Code Handoff Checklist

Before implementing a Stitch design:

### Structure

- [ ] Screen has a DRD screen ID.
- [ ] Layout matches information architecture.
- [ ] Navigation is consistent.
- [ ] Main content hierarchy is correct.

### Components

- [ ] Existing components reused.
- [ ] New components documented.
- [ ] Component states identified.
- [ ] Interactive elements have defined behavior.

### Visuals

- [ ] Colors match tokens.
- [ ] Typography matches tokens.
- [ ] Spacing follows 4px system.
- [ ] Border radius follows system.
- [ ] No unexplained visual styles.

### Data

- [ ] Every visible value has a data source.
- [ ] Synthetic data is clearly appropriate for demo.
- [ ] Entity types are consistent.
- [ ] Confidence/risk semantics are correct.
- [ ] Source provenance is available where required.

### UX

- [ ] Loading state exists.
- [ ] Empty state exists.
- [ ] Error state exists.
- [ ] Permission state exists where needed.
- [ ] Keyboard/focus behavior is considered.
- [ ] Destructive actions have confirmation.

---

# 42. Frontend Architecture Mapping

Recommended frontend structure:

```text
src/
├── app/
│   ├── auth/
│   ├── dashboard/
│   ├── cases/
│   ├── search/
│   ├── graph/
│   ├── entities/
│   ├── findings/
│   ├── evidence/
│   ├── reports/
│   ├── audit/
│   └── settings/
│
├── components/
│   ├── layout/
│   ├── navigation/
│   ├── cards/
│   ├── badges/
│   ├── tables/
│   ├── forms/
│   ├── graph/
│   ├── timeline/
│   ├── evidence/
│   ├── ai/
│   └── feedback/
│
├── features/
│   ├── authentication/
│   ├── cases/
│   ├── ingestion/
│   ├── entities/
│   ├── graph-analysis/
│   ├── pattern-detection/
│   ├── reports/
│   └── audit/
│
├── lib/
│   ├── api/
│   ├── graph/
│   ├── permissions/
│   └── utils/
│
└── styles/
    └── tokens/
```

---

# 43. API-to-UI Contract Principles

Frontend must not directly depend on raw database structures.

Use application-level DTOs.

Example:

```ts
type EntitySummary = {
  id: string;
  type: EntityType;
  displayName: string;
  aliases?: string[];
  riskSignal?: RiskSignal;
  confidence?: number;
  connectionCount: number;
  sourceCount: number;
};
```

Example relationship:

```ts
type EntityRelationship = {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  type: RelationshipType;
  confidence: number;
  sourceCount: number;
  firstSeen?: string;
  lastSeen?: string;
  provenance: ProvenanceRef[];
};
```

The visual layer should consume these stable contracts.

---

# 44. Core UI Data States

All data-driven components should support:

```text
idle
loading
success
empty
partial
error
permission_denied
```

Long-running AI jobs additionally support:

```text
queued
processing
completed
failed
cancelled
```

---

# 45. Security UX

The UI must reinforce secure handling without becoming visually distracting.

Display where relevant:

- Authorized Personnel Only
- Role
- Case scope
- Access level
- Audit status

Do not expose:

- full sensitive identifiers unnecessarily;
- hidden case information;
- data from unauthorized cases;
- API keys;
- internal system secrets.

Mask sensitive identifiers when full values are unnecessary.

---

# 46. Investigator Workflow Principle

Every major screen should answer:

### Where am I?

Case / module / selected entity.

### What am I looking at?

Clear title and object type.

### Why does it matter?

Risk, confidence, network importance or finding explanation.

### Where did it come from?

Source/provenance.

### What can I do next?

Clear primary action.

This is the core UX rule for SIPER.

---

# 47. MVP Design Priority

If implementation time becomes constrained, prioritize in this order:

```text
P0
Authentication
Dashboard
Cases
Ingestion
Entity Search
Graph Explorer
Entity Profile
AI Findings
Evidence
Report

P1
Audit Log
Advanced filtering
Advanced path analysis
Financial visualization

P2
Cross-case intelligence
Advanced community detection
Advanced layouts
Custom dashboards
Production administration
```

Never sacrifice:

- evidence traceability;
- human review;
- auditability;
- entity-resolution transparency;
- core graph usability.

---

# 48. SIH Demo Design Principle

The entire product should support one uninterrupted story:

```text
LOGIN
  ↓
DASHBOARD
  ↓
OPEN CASE
  ↓
UPLOAD DATA
  ↓
AI PROCESSING
  ↓
ENTITY RESOLUTION
  ↓
GRAPH EXPLORER
  ↓
SELECT ENTITY
  ↓
ENTITY PROFILE
  ↓
AI FINDING
  ↓
SOURCE EVIDENCE
  ↓
REPORT
  ↓
AUDIT LOG
```

The judge should never need the team to explain what to click next.

The interface should make the investigation workflow self-evident.

---

# 49. Final Design Definition

SIPER's UI is successful when:

1. An investigator can understand the application within seconds.
2. The graph is useful rather than decorative.
3. AI findings are explainable.
4. Relationships are traceable to evidence.
5. Entity resolution is reviewable.
6. Risk signals do not masquerade as guilt judgments.
7. Case context is always visible.
8. The interface remains usable with dense data.
9. Security and auditability are visible parts of the product.
10. Stitch designs and implementation share the same component and token vocabulary.

---

# 50. Change Management

When a Stitch design changes:

```text
STITCH CHANGE
     ↓
Compare against DRD
     ↓
Is existing component sufficient?
     ├── YES → update screen implementation
     │
     └── NO → document new component
                    ↓
             update component system
                    ↓
             update DRD
                    ↓
             implement
```

When implementation changes UX:

```text
CODE CHANGE
     ↓
Does it affect user-visible behavior?
     ├── NO → normal implementation
     │
     └── YES
          ↓
      Update DRD
          ↓
      Update Stitch/design reference
          ↓
      Implement
```

The DRD therefore acts as the **contract between Stitch, frontend, backend and product decisions**.

---

## Appendix A — Canonical Status Vocabulary

| Status | Meaning |
|---|---|
| Draft | Created but not finalized |
| Active | Currently active |
| Processing | Background processing underway |
| Ready | Processing complete |
| Reviewing | Investigator review underway |
| Verified | Investigator verified the analytical item/evidence |
| Dismissed | Investigator determined the item is not useful/relevant |
| Failed | Processing failed |
| Restricted | User lacks access |

---

## Appendix B — Canonical Entity Vocabulary

```text
PERSON
PHONE
VEHICLE
LOCATION
ORGANIZATION
FINANCIAL_ACCOUNT
INCIDENT
DOCUMENT
```

---

## Appendix C — Canonical Relationship Vocabulary

```text
CONTACTED
KNOWS
ASSOCIATED_WITH
VISITED
SEEN_AT
WORKS_FOR
TRANSFERRED_TO
INVOLVED_IN
MENTIONED_IN
SUPPORTS
```

---

## Appendix D — Canonical AI Finding Vocabulary

```text
COMMUNICATION_BURST
TEMPORAL_PROXIMITY
SHARED_INTERMEDIARY
CIRCULAR_TRANSACTION
COMMUNITY_CLUSTER
CROSS_CASE_CONNECTION
UNUSUAL_TRANSACTION
UNUSUAL_COMMUNICATION
ENTITY_RESOLUTION_CANDIDATE
```

---

## Appendix E — Design Quality Gate

A Stitch design is **not ready for implementation** unless:

- [ ] It has a screen ID.
- [ ] It uses SIPER tokens.
- [ ] It uses canonical components.
- [ ] It defines its primary user goal.
- [ ] It defines its data.
- [ ] It defines interactions.
- [ ] It defines important states.
- [ ] It preserves evidence/provenance semantics.
- [ ] It does not introduce unsupported product behavior.
- [ ] It can be mapped to an API/data contract.
- [ ] It supports the end-to-end investigator workflow.

**SIPER DRD Version: 1.0 — MVP Design Baseline**
