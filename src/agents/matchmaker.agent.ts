import { IAgent, AgentStatus, AgentResult } from '../types/agent.types.js';
import { EventType, SwarmEvent } from '../types/events.types.js';
import { SymbioticMatch } from '../types/match.types.js';
import { WasteStream } from '../types/factory.types.js';
import { EventBus } from '../orchestrator/event-bus.js';
import { StateManager } from '../orchestrator/state-manager.js';
import { findMatches } from '../core/matching-algorithm.js';

export class MatchmakerAgent implements IAgent {
  readonly name = 'Matchmaker';
  readonly emoji = '🤝';
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
      const factories = this.stateManager.getAllFactories();

      this.eventBus.addActivityLog(this.name, this.emoji,
        `Scanning ${factories.length} factories for new symbioses...`
      );

      const wasteProfiles = new Map<string, WasteStream[]>();
      for (const f of factories) {
        const ws = this.stateManager.getWasteProfile(f.id);
        if (ws.length > 0) wasteProfiles.set(f.id, ws);
      }

      const matches: SymbioticMatch[] = findMatches(factories, wasteProfiles);

      if (matches.length > 0) {
        this.stateManager.addMatches(matches);
      }

      this.eventBus.addActivityLog(this.name, this.emoji,
        `Found ${matches.length} symbiotic connections across ${factories.length} factories`
      );

      await this.eventBus.emit(EventType.MATCHES_FOUND, { matches }, this.name);

      this.status = 'completed';
      this.lastResult = {
        agentName: this.name,
        status: this.status,
        timestamp: new Date().toISOString(),
        data: { matchCount: matches.length },
        triggeredEvents: [EventType.MATCHES_FOUND],
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
