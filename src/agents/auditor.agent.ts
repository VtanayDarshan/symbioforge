import { IAgent, AgentStatus, AgentResult } from '../types/agent.types.js';
import { EventType, SwarmEvent } from '../types/events.types.js';
import { OpportunityRanking } from '../types/impact.types.js';
import { SymbioticMatch } from '../types/match.types.js';
import { ProductConcept } from '../types/product.types.js';
import { EventBus } from '../orchestrator/event-bus.js';
import { StateManager } from '../orchestrator/state-manager.js';
import { rankOpportunities } from '../core/impact-calculator.js';

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
      const allMatches = this.stateManager.getAllMatches();
      const allProducts = this.stateManager.getAllProducts();

      this.eventBus.addActivityLog(this.name, this.emoji,
        `Calculating impact for ${allMatches.length} matches + ${allProducts.length} products...`
      );

      const rankings: OpportunityRanking[] = rankOpportunities(allMatches, allProducts);

      if (rankings.length > 0) {
        this.stateManager.setRankings(rankings);
      }

      this.eventBus.addActivityLog(this.name, this.emoji,
        `Ranked ${rankings.length} opportunities — top score: ${rankings[0]?.compositeScore ?? 0}`
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
