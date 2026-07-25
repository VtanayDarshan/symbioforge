import { IAgent, AgentStatus, AgentResult } from '../types/agent.types.js';
import { EventType, SwarmEvent } from '../types/events.types.js';
import { Factory, WasteStream } from '../types/factory.types.js';
import { EventBus } from '../orchestrator/event-bus.js';
import { StateManager } from '../orchestrator/state-manager.js';
import { classifyWasteStreams } from '../core/waste-classifier.js';

export class ProfilerAgent implements IAgent {
  readonly name = 'Profiler';
  readonly emoji = '📋';
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
      if (event.type === EventType.FACTORY_DATA_INGESTED) {
        const payload = event.payload as { factory: Factory };
        const factory = payload.factory;

        this.eventBus.addActivityLog(this.name, this.emoji,
          `Classifying waste streams for "${factory.name}"`
        );

        const wasteStreams: WasteStream[] = classifyWasteStreams(factory);

        this.stateManager.setWasteProfile(factory.id, wasteStreams);

        this.eventBus.addActivityLog(this.name, this.emoji,
          `Classified ${wasteStreams.length} waste streams for "${factory.name}"`
        );

        await this.eventBus.emit(EventType.WASTE_PROFILED, {
          factoryId: factory.id,
          wasteStreams,
        }, this.name);
      }

      this.status = 'completed';
      this.lastResult = {
        agentName: this.name,
        status: this.status,
        timestamp: new Date().toISOString(),
        data: null,
        triggeredEvents: [EventType.WASTE_PROFILED],
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
