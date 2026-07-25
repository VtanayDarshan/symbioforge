import { StateManager } from '../orchestrator/state-manager.js';
import { EventBus } from '../orchestrator/event-bus.js';
import { WasteClassifier } from '../core/waste-classifier.js';
import { WasteStream } from '../core/types.js';

export class ProfilerAgent {
  private stateManager: StateManager;
  private eventBus: EventBus;
  private wasteClassifier: WasteClassifier;

  constructor() {
    this.stateManager = StateManager.getInstance();
    this.eventBus = EventBus.getInstance();
    this.wasteClassifier = new WasteClassifier();
    this.setupListeners();
  }

  private setupListeners() {
    this.eventBus.subscribe('FACTORY_PROFILED', (event) => {
      if (event.type !== 'FACTORY_PROFILED') return;
      this.profileFactoryWastes(event.payload.factoryId);
    });
  }

  public profileFactoryWastes(factoryId: string) {
    const factory = this.stateManager.getFactory(factoryId);
    if (!factory) return;

    this.stateManager.addLog('Profiler', `Activating deep inference profiling for "${factory.name}"`, 'info');

    const wasteStreams: WasteStream[] = factory.declaredWastes.map(wasteName => {
      return this.wasteClassifier.classifyWaste(factory.id, factory.name, wasteName);
    });

    this.stateManager.updateFactoryWastes(factory.id, wasteStreams);

    this.stateManager.addLog(
      'Profiler',
      `Classified ${wasteStreams.length} waste streams for "${factory.name}": ${wasteStreams.map(w => `${w.name} (${w.category}/${w.physicalForm})`).join(', ')}`,
      'success'
    );

    // Trigger Matchmaker and Inventor
    this.eventBus.publish({
      type: 'MATCHES_DISCOVERED',
      payload: { matchIds: [] }
    });
  }
}
