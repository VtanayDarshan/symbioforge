import { IAgent, AgentStatus, AgentResult } from '../types/agent.types.js';
import { EventType, SwarmEvent } from '../types/events.types.js';
import { ProductConcept } from '../types/product.types.js';
import { EventBus } from '../orchestrator/event-bus.js';
import { StateManager } from '../orchestrator/state-manager.js';
import { generateProductConcepts } from '../core/product-generator.js';

export class InventorAgent implements IAgent {
  readonly name = 'Inventor';
  readonly emoji = '💡';
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
      this.eventBus.addActivityLog(this.name, this.emoji,
        'Analyzing waste portfolio for novel product opportunities...'
      );

      const allWasteStreams = this.stateManager.getAllWasteStreams();
      const factoryLookup = new Map<string, string>();
      for (const f of this.stateManager.getAllFactories()) {
        factoryLookup.set(f.id, f.name);
      }

      const products: ProductConcept[] = generateProductConcepts(allWasteStreams, factoryLookup);

      if (products.length > 0) {
        this.stateManager.addProducts(products);
      }

      this.eventBus.addActivityLog(this.name, this.emoji,
        `Invented ${products.length} novel product concepts from ${allWasteStreams.length} waste streams`
      );

      await this.eventBus.emit(EventType.PRODUCTS_GENERATED, { products }, this.name);

      this.status = 'completed';
      this.lastResult = {
        agentName: this.name,
        status: this.status,
        timestamp: new Date().toISOString(),
        data: { productCount: products.length },
        triggeredEvents: [EventType.PRODUCTS_GENERATED],
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
