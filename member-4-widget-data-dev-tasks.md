# Member 4: Widget Developer + Data Engineer — Tasks & Milestones

**Role:** Build all 8 UI widgets, mock data fixtures, and prepare demo assets

## Phase 1: Foundation (2-3 Hours) ✅ COMPLETE
- [x] Create all mock data fixtures in JSON format:
  - [x] 15 realistic factory profiles (`factory-profiles.json`)
  - [x] Materials properties database (`materials-properties.json`)
  - [x] Compatibility matrix (`compatibility-matrix.json`)
  - [x] Manufacturing processes list (`manufacturing-processes.json`)
  - [x] Emission factors - CO₂, CH₄, water, particulates (`emission-factors.json`)
  - [x] Market pricing data (`market-pricing.json`)
  - [x] FixtureLoader utility (`src/utils/fixture-loader.ts`)
  - [x] Comprehensive documentation (`data/fixtures/README.md`)

**Deliverables Location:** `data/fixtures/`

## Phase 2: Core Agents (Discovery) (3 Hours) ✅ COMPLETE
- [x] Continue refining data fixtures and the simulated incoming factory stream.
  - [x] FactoryStreamSimulator (`member-4/src/services/factory-stream-simulator.ts`)
  - [x] 8 factory templates with realistic waste profiles
  - [x] Continuous stream generation with configurable intervals
  - [x] Activity logging and statistics
- [x] Build **Widget 1:** Agent Swarm Monitor (visualizing live agent activity)
  - [x] AgentSwarmMonitor.tsx - Complete visualization component
  - [x] useAgentSwarm hook - React state management
  - [x] AgentSwarmSimulator - 9-agent orchestration engine
  - [x] Real-time metrics dashboard
  - [x] Activity feed with 10 most recent events
  - [x] Agent pool with live status monitoring
  - [x] Complete CSS styling with responsive design
  - [x] Type definitions and interfaces

**Location:** `member-4/` folder with all Phase 1 & 2 content

## Phase 3: Core Agents (Matching) (3 Hours) ✅ COMPLETE
- [x] Build **Widget 2:** Ecosystem Map (node-edge graph of factories and connections).
  - [x] EcosystemMap.tsx component (500 LOC)
  - [x] useEcosystemMap hook (250 LOC)
  - [x] ecosystem-simulator service (420 LOC)
  - [x] ecosystem-map.css (450 LOC)
  - [x] Interactive canvas visualization
  - [x] Node selection and details
  - [x] Zoom/pan navigation
  - [x] Real-time metrics
- [x] Build **Widget 3:** Compliance Dashboard (factory-facing status and PDF download).
  - [x] ComplianceDashboard.tsx component (550 LOC)
  - [x] useCompliance hook (220 LOC)
  - [x] compliance-simulator service (400 LOC)
  - [x] pdf-export service (300 LOC)
  - [x] compliance-dashboard.css (500 LOC)
  - [x] Compliance metrics & cards
  - [x] Issue management
  - [x] ESG tracking
  - [x] PDF report generation

**Location:** `member-4/` folder  
**Total Phase 3 LOC:** ~3740  
**New Files:** 10 (components, hooks, services, types, styles)

## Phase 4: Core Agents (Intelligence) (3 Hours)
- [ ] Build **Widget 4:** Opportunity Feed (ranked list of matches and products).
- [ ] Build **Widget 5:** Product Concept Cards (AI-invented product details).

## Phase 5: MCP Layer (3 Hours)
- [ ] Build **Widget 6:** Waste Profile Cards (per-factory waste breakdown).
- [ ] Build **Widget 7:** Pathway Viewer (step-by-step manufacturing blueprints).
- [ ] Build **Widget 8:** Carbon Dashboard (cluster-wide ESG impact metrics).

## Phase 6: Integration (2 Hours)
- [ ] Polish all widgets and fix UI bugs.
- [ ] Ensure live data streams properly update the UI components during the agent loop.

## Phase 7: Deploy & Demo (2 Hours)
- [ ] Record the fallback demo video (crucial for hackathons).
- [ ] Prepare the project README and final submission documentation.
