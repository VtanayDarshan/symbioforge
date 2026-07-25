import { IAgent, AgentStatus, AgentResult } from '../types/agent.types.js';
import { EventType, SwarmEvent } from '../types/events.types.js';
import { SymbioticMatch } from '../types/match.types.js';
import { EventBus } from '../orchestrator/event-bus.js';
import { StateManager } from '../orchestrator/state-manager.js';

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
      const totalFactories = this.stateManager.getAllFactories().length;

      this.eventBus.addActivityLog(this.name, this.emoji,
        `Scanning ${totalFactories} factories for new symbioses...`
      );

      // TODO (Member 2): Implement matching algorithm
      // INPUT: All factory profiles + waste streams from stateManager
      // LOGIC:
      //   1. Get all factories: stateManager.getAllFactories()
      //   2. Get all waste profiles: stateManager.getWasteProfile(factoryId) for each
      //   3. Load compatibility-matrix.json from data/
      //   4. For each pair of factories (A, B):
      //      a. For each waste stream from A:
      //         - Check if B's industry can use this material (compatibility-matrix.json)
      //         - Score materialCompatibility (0-100): how well waste fits as input
      //         - Score proximityScore (0-100): based on distance between factories (closer = higher)
      //         - Score volumeAlignment (0-100): does A produce enough for B's needs?
      //         - Score seasonalSync (0-100): do production cycles align?
      //         - Score contaminationFeasibility (0-100): can B handle A's contamination level?
      //         - compositeScore = material(40%) + proximity(25%) + volume(20%) + seasonal(15%)
      //   5. Discover multi-hop chains: A→B→C where B processes A's waste into input for C
      //   6. Filter: only keep matches with compositeScore > 70
      //   7. Store matches in stateManager
      //   8. Emit MATCHES_FOUND with the new matches
      // OUTPUT: SymbioticMatch[]

      const matches: SymbioticMatch[] = [];
      // Placeholder: Member 2 fills in matching logic

      if (matches.length > 0) {
        this.stateManager.addMatches(matches);
      }

      this.eventBus.addActivityLog(this.name, this.emoji,
        `Found ${matches.length} new matches`
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
