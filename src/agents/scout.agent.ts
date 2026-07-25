import { IAgent, AgentStatus, AgentResult } from '../types/agent.types.js';
import { EventType, SwarmEvent } from '../types/events.types.js';
import { Factory } from '../types/factory.types.js';
import { EventBus } from '../orchestrator/event-bus.js';
import { StateManager } from '../orchestrator/state-manager.js';

export class ScoutAgent implements IAgent {
  readonly name = 'Scout';
  readonly emoji = '🔍';
  private status: AgentStatus = 'idle';
  private lastResult: AgentResult | null = null;
  private feedIndex = 0;
  private factoryFeed: Factory[] = [];

  constructor(
    private eventBus: EventBus,
    private stateManager: StateManager
  ) {}

  loadFeed(feed: Factory[]): void {
    this.factoryFeed = feed;
    this.feedIndex = 0;
  }

  async process(event: SwarmEvent): Promise<AgentResult> {
    this.status = 'processing';
    const start = Date.now();

    try {
      if (event.type === EventType.FACTORY_REGISTERED) {
        // TODO (Member 2): Process newly registered factory
        // INPUT: event.payload.factory — the factory that was just registered
        // LOGIC:
        //   1. Read the factory profile from the event payload
        //   2. Enrich with any additional data from external sources (mock for hackathon)
        //   3. Log the ingestion activity
        //   4. Emit FACTORY_DATA_INGESTED so the Profiler picks it up
        // OUTPUT: The enriched factory profile
        const payload = event.payload as { factory: Factory };
        const factory = payload.factory;

        this.eventBus.addActivityLog(this.name, this.emoji,
          `Ingesting factory profile: "${factory.name}" (${factory.industry})`
        );

        await this.eventBus.emit(EventType.FACTORY_DATA_INGESTED, { factory }, this.name);
      }

      this.status = 'completed';
      this.lastResult = {
        agentName: this.name,
        status: this.status,
        timestamp: new Date().toISOString(),
        data: null,
        triggeredEvents: [EventType.FACTORY_DATA_INGESTED],
        durationMs: Date.now() - start,
      };
      return this.lastResult;
    } catch (error) {
      this.status = 'error';
      throw error;
    }
  }

  // TODO (Member 2): Implement feed monitor
  // Called by the Scheduler on a timer to simulate new factory registrations arriving
  // LOGIC:
  //   1. Check if there are more factories in the feed
  //   2. If yes, pick the next one and register it through the Clerk agent
  //   3. This simulates autonomous discovery during the demo
  async checkFeed(): Promise<Factory | null> {
    if (this.feedIndex >= this.factoryFeed.length) {
      return null;
    }

    const factory = this.factoryFeed[this.feedIndex];
    this.feedIndex++;

    this.eventBus.addActivityLog(this.name, this.emoji,
      `Feed monitor discovered: "${factory.name}"`
    );

    return factory;
  }

  getFeedStatus(): { total: number; processed: number; remaining: number } {
    return {
      total: this.factoryFeed.length,
      processed: this.feedIndex,
      remaining: this.factoryFeed.length - this.feedIndex,
    };
  }

  getStatus(): AgentStatus { return this.status; }
  getLastResult(): AgentResult | null { return this.lastResult; }
}
