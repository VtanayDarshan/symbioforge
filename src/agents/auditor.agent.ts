import { IAgent, AgentStatus, AgentResult } from '../types/agent.types.js';
import { EventType, SwarmEvent } from '../types/events.types.js';
import { OpportunityRanking } from '../types/impact.types.js';
import { SymbioticMatch } from '../types/match.types.js';
import { ProductConcept } from '../types/product.types.js';
import { EventBus } from '../orchestrator/event-bus.js';
import { StateManager } from '../orchestrator/state-manager.js';

export class AuditorAgent implements IAgent {
  readonly name = 'Auditor';
  readonly emoji = '📊';
  private status: AgentStatus = 'idle';
  private lastResult: AgentResult | null = null;

  constructor(
    private eventBus: EventBus,
    private stateManager: StateManager
  ) {}

  async process(event: SwarmEvent): Promise<AgentResult> {
    this.status = 'processing';
    const start = Date.now();

    try {
      // TODO (Member 3): Implement impact calculation and opportunity ranking
      // INPUT: New matches (from MATCHES_FOUND) or products (from PRODUCTS_GENERATED)
      // LOGIC:
      //   1. Load emission-factors.json and market-data.json from data/
      //   2. For each match from event payload or stateManager:
      //      a. Calculate CO2 saved: waste diverted from landfill (methane reduction) + reduced virgin extraction
      //         Use IPCC factors: landfill methane = 1.2 kg CO2eq per kg organic waste
      //      b. Calculate landfill diverted: volume * days * 365
      //      c. Calculate water saved: based on virgin material production water usage
      //      d. Calculate energy saved: based on recycling vs virgin production energy delta
      //      e. Calculate financial: disposal cost saved + raw material cost saved
      //      f. Calculate ROI and payback period
      //   3. For each product concept:
      //      a. Same environmental calculations based on waste inputs
      //      b. Add revenue potential: (marketPrice - productionCost) * estimatedUnitsPerYear
      //      c. Calculate ROI including CAPEX for manufacturing setup
      //   4. Rank all opportunities by composite score:
      //      compositeScore = environmental(40%) + financial(35%) + feasibility(25%)
      //   5. Store rankings in stateManager
      //   6. Emit IMPACT_CALCULATED with top opportunities
      // OUTPUT: OpportunityRanking[]

      let itemCount = 0;
      if (event.type === EventType.MATCHES_FOUND) {
        const payload = event.payload as { matches: SymbioticMatch[] };
        itemCount = payload.matches.length;
      } else if (event.type === EventType.PRODUCTS_GENERATED) {
        const payload = event.payload as { products: ProductConcept[] };
        itemCount = payload.products.length;
      }

      this.eventBus.addActivityLog(this.name, this.emoji,
        `Calculating impact for ${itemCount} opportunities...`
      );

      const rankings: OpportunityRanking[] = [];
      // Placeholder: Member 3 fills in impact calculation logic

      if (rankings.length > 0) {
        this.stateManager.setRankings(rankings);
      }

      this.eventBus.addActivityLog(this.name, this.emoji,
        `Ranked ${rankings.length} opportunities`
      );

      await this.eventBus.emit(EventType.IMPACT_CALCULATED, { rankings }, this.name);

      this.status = 'completed';
      this.lastResult = {
        agentName: this.name,
        status: this.status,
        timestamp: new Date().toISOString(),
        data: { rankingCount: rankings.length },
        triggeredEvents: [EventType.IMPACT_CALCULATED],
        durationMs: Date.now() - start,
      };
      return this.lastResult;
    } catch (error) {
      this.status = 'error';
      throw error;
    }
  }

  getStatus(): AgentStatus { return this.status; }
  getLastResult(): AgentResult | null { return this.lastResult; }
}
