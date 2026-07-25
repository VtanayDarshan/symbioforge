# SymBioForge

**Autonomous Circular Manufacturing Intelligence -- NitroStack MCP Server**

8 AI agents autonomously discover waste-to-resource symbioses across an industrial cluster in Coimbatore, India. Zero human-in-the-loop: factories register, agents chain, matches form, products get invented, blueprints get planned, and compliance reports get filed -- all driven by events.

Built on [NitroStack](https://nitrostack.ai) for the Manufacturing & Industry 4.0 hackathon track.

---

## Quick Start

```bash
npm install
npm run build
```

Open in [NitroStudio](https://nitrostack.ai/studio) to run the MCP server with the visual widget dashboard.

---

## Demo Walkthrough

### What happens at startup (zero interaction needed)

The server boots and autonomously:
1. Loads **15 factories** from `src/data/factories-initial.json`
2. **ProfilerAgent** classifies all declared waste streams + infers undeclared ones based on industry type
3. **MatchmakerAgent** finds pairwise symbiotic matches (Haversine distance + compatibility scoring) and discovers multi-hop supply chains (A->B->C)
4. **InventorAgent** generates novel product concepts from waste streams
5. **AuditorAgent** promotes top 3 matches and top 2 products to "Blueprint Ready"
6. **ArchitectAgent** plans step-by-step manufacturing pathways for promoted opportunities
7. **Scheduler** starts: drip-feeds a new factory every 60s, runs Sentinel health checks every 30s

### Tools to try in the chat

| Tool | What it does | Widget |
|------|-------------|--------|
| `get-cluster-state` | See the full live state -- factories, matches, products, logs | Agent Swarm Monitor |
| `get-ecosystem-map` | Visualize the factory network with symbiotic edges | Ecosystem Map |
| `get-opportunity-feed` | Ranked list of all matches and product concepts | Opportunity Feed |
| `get-carbon-metrics` | CO2 avoided, water/energy saved, financial value, circular score | Carbon Dashboard |
| `get-product-concepts` | AI-invented products from waste streams | Product Cards |
| `get-waste-profiles` | Every factory's classified waste streams | Waste Profiles |
| `get-pathway` | Step-by-step blueprint for a specific opportunity | Pathway Viewer |
| `register-factory` | Register a new factory -- triggers the full agent chain live | Compliance Dashboard |
| `get-compliance-report` | Generate SPCB FORM V PDF for any factory | Compliance Dashboard |
| `control-swarm` | Start, stop, or reset the autonomous swarm | Agent Swarm Monitor |
| `trigger-disruption` | Simulate a factory shutdown -- watch Sentinel self-heal | Agent Swarm Monitor |
| `trigger-compliance-check` | Force Sentinel to check all compliance deadlines | -- |

### Demo script (5-minute walkthrough)

1. **Open `get-cluster-state`** -- show the Agent Swarm Monitor with live activity logs. Point out the bootstrap messages from all 8 agents.

2. **Open `get-ecosystem-map`** -- show the network of 15 factories connected by symbiotic waste flows. Click nodes and edges to see details.

3. **Open `get-carbon-metrics`** -- show the Carbon Dashboard with circular economy score gauge, CO2 avoided, water saved, energy saved, financial value.

4. **Open `get-opportunity-feed`** -- show the ranked list of matches and products sorted by score.

5. **Run `register-factory`** with:
   ```json
   {
     "id": "fact_16",
     "name": "Demo Furniture Co",
     "industryType": "Furniture Manufacturing",
     "address": "SIDCO Phase III, Coimbatore",
     "lat": 11.025,
     "lng": 76.945,
     "productionCapacity": "2 tons/day furniture",
     "rawMaterials": ["Wood", "Adhesives", "Varnish"],
     "declaredWastes": ["Sawdust", "Wood scraps", "Varnish waste"]
   }
   ```
   Watch the Agent Swarm Monitor -- Clerk registers it, Scout profiles it, Profiler classifies wastes, Matchmaker finds new matches, Inventor checks for products.

6. **Run `trigger-disruption`** with `{"factoryId": "fact_1"}` -- watch Sentinel detect the disruption, log the affected chains, and re-trigger the Matchmaker to self-heal.

7. **Run `get-compliance-report`** with `{"factoryId": "fact_1"}` -- generates a real SPCB FORM V Annual Environmental Statement PDF.

---

## Architecture

```
Event Bus (Pub/Sub)
  |
  |-- Clerk -----> Scout -----> Profiler -----> Matchmaker -----> Inventor
  |                                                                   |
  |                                              Auditor <------------+
  |                                                |
  |                                           Architect -----> Sentinel
  |                                                              |
  |                                                    (self-healing loop)
  |
State Manager (singleton) <--- all agents read/write cluster state
Scheduler (singleton) -------- drip feed + sentinel health checks
```

### Event Chain
```
FACTORY_REGISTERED -> FACTORY_PROFILED -> MATCHES_DISCOVERED -> PRODUCTS_INVENTED
-> IMPACT_AUDITED -> PATHWAYS_DESIGNED -> ECOSYSTEM_STABLE
```

Additional events: `SENTINEL_TRIGGERED`, `VOLUME_UPDATE`, `COMPLIANCE_DUE`, `FACTORY_UPDATED`

---

## Project Structure

```
src/
|-- agents/                     # 8 autonomous agents
|   |-- clerk.agent.ts          #   registers factories, generates SPCB reports
|   |-- scout.agent.ts          #   profiles new/updated factories
|   |-- profiler.agent.ts       #   classifies + infers waste streams
|   |-- matchmaker.agent.ts     #   pairwise matching + multi-hop chains
|   |-- inventor.agent.ts       #   generates product concepts
|   |-- auditor.agent.ts        #   promotes top opportunities
|   |-- architect.agent.ts      #   plans manufacturing pathways
|   `-- sentinel.agent.ts       #   self-healing, volume monitoring, compliance
|
|-- core/                       # Business logic engines
|   |-- types.ts                #   all interfaces (single source of truth)
|   |-- waste-classifier.ts     #   classifies waste from materials-db
|   |-- compatibility-matrix.ts #   checks waste-to-industry compatibility
|   |-- matching-algorithm.ts   #   Haversine + composite scoring + multi-hop
|   |-- product-generator.ts    #   invents products from waste streams
|   |-- impact-calculator.ts    #   CO2, water, energy, financial metrics
|   |-- pathway-planner.ts      #   step-by-step blueprints
|   `-- compliance-generator.ts #   SPCB FORM V PDF generation
|
|-- orchestrator/               # Coordination layer
|   |-- event-bus.ts            #   pub/sub with 11 event types
|   |-- state-manager.ts        #   singleton cluster state + metrics
|   |-- scheduler.ts            #   drip feed (60s) + sentinel checks (30s)
|   `-- agent-chain.ts          #   chain definition (reference)
|
|-- modules/                    # NitroStack MCP modules (10 tool files)
|   |-- bootstrap.ts            #   agent instantiation + startup sequence
|   |-- symbioforge.module.ts   #   module registration
|   |-- register-factory.tools.ts
|   |-- compliance.tools.ts
|   |-- cluster-state.tools.ts
|   |-- swarm-control.tools.ts
|   |-- ecosystem-map.tools.ts
|   |-- opportunity-feed.tools.ts
|   |-- product-concepts.tools.ts
|   |-- waste-profiles.tools.ts
|   |-- pathway.tools.ts
|   |-- carbon-metrics.tools.ts
|   `-- calculator/             #   basic arithmetic (NitroStack sample)
|
|-- widgets/                    # 9 Next.js widget UIs
|   `-- app/
|       |-- agent-swarm-monitor/    # live agent activity + swarm controls
|       |-- ecosystem-map/          # factory network graph
|       |-- compliance-dashboard/   # SPCB FORM V report viewer
|       |-- opportunity-feed/       # ranked matches + products
|       |-- product-cards/          # product concept cards
|       |-- waste-profiles/         # factory waste stream profiles
|       |-- pathway-viewer/         # blueprint step-by-step viewer
|       |-- carbon-dashboard/       # CO2/water/energy/financial gauges
|       `-- calculator-result/      # basic calculator widget
|
`-- data/                       # Runtime JSON fixtures
    |-- factories-initial.json  #   15 Coimbatore factories
    |-- factory-feed.json       #   3 factories for drip feed
    |-- materials-db.json       #   45 waste material entries
    |-- compatibility-matrix.json # 10 rules + 2 fallbacks
    |-- manufacturing-processes.json
    |-- emission-factors.json   #   CO2, water, energy factors
    `-- market-data.json        #   3 product recipes
```

---

## Tech Stack

- **Runtime**: NitroStack MCP Framework (`@nitrostack/core`)
- **Language**: TypeScript (ES Modules, strict mode)
- **Validation**: Zod schemas on all MCP tool inputs
- **Widgets**: Next.js 14 + `@nitrostack/widgets` SDK + Lucide icons
- **PDF**: pdfkit for SPCB compliance reports
- **Protocol**: Model Context Protocol (MCP)

---

## Team

Built for the NitroStack hackathon by a 4-member team from Amrita University.

- [GitHub](https://github.com/kuchipudiyokshith9999-eng/SymBioForge)
- [NitroStack](https://nitrostack.ai)
