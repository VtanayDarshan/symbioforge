import { IAgent, AgentStatus, AgentResult } from '../types/agent.types.js';
import { EventType, SwarmEvent } from '../types/events.types.js';
import { OpportunityRanking } from '../types/impact.types.js';
import { EventBus } from '../orchestrator/event-bus.js';
import { StateManager } from '../orchestrator/state-manager.js';
import { designPathway } from '../core/pathway-planner.js';

export class ArchitectAgent implements IAgent {
  readonly name = 'Architect';
  readonly emoji = '🏗️';
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
      if (event.type === EventType.IMPACT_CALCULATED) {
        const payload = event.payload as { rankings: OpportunityRanking[] };
        const topOpportunities = payload.rankings
          .sort((a, b) => b.compositeScore - a.compositeScore)
          .slice(0, 5);

        this.eventBus.addActivityLog(this.name, this.emoji,
          `Generating manufacturing pathways for top ${topOpportunities.length} opportunities...`
        );

        for (const opportunity of topOpportunities) {
          const pathway = designPathway(opportunity);

          this.stateManager.addPathway(pathway);

          this.eventBus.addActivityLog(this.name, this.emoji,
            `Blueprint complete for "${pathway.title}"`
          );

          await this.eventBus.emit(EventType.PATHWAY_DESIGNED, { pathway }, this.name);
        }
      }

      this.status = 'completed';
      this.lastResult = {
        agentName: this.name,
        status: this.status,
        timestamp: new Date().toISOString(),
        data: null,
        triggeredEvents: [EventType.PATHWAY_DESIGNED],
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
