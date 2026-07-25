import { IAgent, AgentStatus, AgentResult } from '../types/agent.types.js';
import { EventType, SwarmEvent } from '../types/events.types.js';
import { EventBus } from '../orchestrator/event-bus.js';
import { StateManager } from '../orchestrator/state-manager.js';

export class SentinelAgent implements IAgent {
  readonly name = 'Sentinel';
  readonly emoji = '👁️';
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
      if (event.type === EventType.FACTORY_SHUTDOWN) {
        // TODO (Member 3): Handle factory shutdown — self-heal the ecosystem
        // INPUT: event.payload contains { factoryId, reason, durationDays }
        // LOGIC:
        //   1. Identify all symbiotic chains that include this factory
        //   2. Calculate impact of the disruption (cluster score drop)
        //   3. Remove broken matches from stateManager
        //   4. Emit CHAIN_BROKEN with affected matches and factories
        //   5. The Matchmaker will re-trigger to find replacement connections
        // OUTPUT: Log the disruption and recovery attempt

        const payload = event.payload as { factoryId: string; reason: string };
        const factory = this.stateManager.getFactory(payload.factoryId);
        const factoryName = factory?.name ?? payload.factoryId;

        this.eventBus.addActivityLog(this.name, this.emoji,
          `Factory "${factoryName}" reported shutdown: ${payload.reason}`
        );

        const brokenMatches = this.stateManager.removeMatchesForFactory(payload.factoryId);
        if (brokenMatches.length > 0) {
          const affectedFactoryIds = new Set<string>();
          const brokenMatchIds: string[] = [];
          for (const m of brokenMatches) {
            brokenMatchIds.push(m.id);
            affectedFactoryIds.add(m.sourceFactoryId);
            affectedFactoryIds.add(m.targetFactoryId);
          }

          this.eventBus.addActivityLog(this.name, this.emoji,
            `${brokenMatches.length} symbiotic chains affected, re-triggering Matchmaker...`
          );

          await this.eventBus.emit(EventType.CHAIN_BROKEN, {
            brokenMatchIds,
            affectedFactoryIds: Array.from(affectedFactoryIds),
          }, this.name);
        }
      }

      if (event.type === EventType.ECOSYSTEM_UPDATED) {
        // Sentinel monitors ecosystem health on each update
        // This is where continuous monitoring happens
      }

      if (event.type === EventType.PATHWAY_DESIGNED) {
        const metrics = this.stateManager.getClusterMetrics();
        this.eventBus.addActivityLog(this.name, this.emoji,
          `Ecosystem updated — circular score: ${metrics.circularScore}%, ` +
          `${metrics.activeMatches} active matches, ${metrics.productConcepts} products`
        );
      }

      this.status = 'completed';
      this.lastResult = {
        agentName: this.name,
        status: this.status,
        timestamp: new Date().toISOString(),
        data: this.stateManager.getClusterMetrics(),
        triggeredEvents: [],
        durationMs: Date.now() - start,
      };
      return this.lastResult;
    } catch (error) {
      this.status = 'error';
      throw error;
    }
  }

  // TODO (Member 3): Implement ecosystem health check
  // Called by the Scheduler on a timer to run continuous monitoring
  // LOGIC:
  //   1. Check if any factories have become inactive (no updates in 30 days)
  //   2. Check if any symbiosis volumes have dropped below threshold
  //   3. Check for upcoming SPCB filing deadlines and emit COMPLIANCE_DUE
  //   4. Check for seasonal volume shifts that might create new opportunities
  //   5. If any issues found, emit appropriate events (SENTINEL_ALERT, COMPLIANCE_DUE)
  async runHealthCheck(): Promise<void> {
    this.eventBus.addActivityLog(this.name, this.emoji, 'Running ecosystem health check...');

    const metrics = this.stateManager.getClusterMetrics();
    this.eventBus.addActivityLog(this.name, this.emoji,
      `Health: ${metrics.activeFactories}/${metrics.totalFactories} factories active, ` +
      `circular score: ${metrics.circularScore}%`
    );
  }

  getStatus(): AgentStatus { return this.status; }
  getLastResult(): AgentResult | null { return this.lastResult; }
}
