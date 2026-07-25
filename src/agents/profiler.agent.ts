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

    this.stateManager.addLog('Profiler', `Activating deep inference profiling for "${factory.name}" (${factory.industryType})`, 'info');

    // --- 1. Classify explicitly declared wastes ---
    const declaredStreams: WasteStream[] = factory.declaredWastes.map(wasteName =>
      this.wasteClassifier.classifyWaste(factory.id, factory.name, wasteName)
    );

    // --- 2. Use industry-type inference to discover undeclared waste streams ---
    const inferredStreams = this.wasteClassifier.inferWastesFromIndustry(
      factory.id,
      factory.name,
      factory.industryType,
      factory.rawMaterials
    );

    // --- 3. Merge: declared streams take priority; add inferred ones not already declared ---
    const allStreams: WasteStream[] = [...declaredStreams];
    const declaredNames = new Set(declaredStreams.map(w => w.name.toLowerCase()));

    let inferredCount = 0;
    for (const inferred of inferredStreams) {
      if (!declaredNames.has(inferred.name.toLowerCase())) {
        allStreams.push(inferred);
        inferredCount++;
      }
    }

    this.stateManager.updateFactoryWastes(factory.id, allStreams);

    const summaryParts = allStreams.map(w =>
      `${w.name} (${w.category}/${w.physicalForm}, ${w.volume}kg/day, reuse: ${w.reusePotential}%)`
    );

    this.stateManager.addLog(
      'Profiler',
      `Classified ${declaredStreams.length} declared + inferred ${inferredCount} additional streams for "${factory.name}": ${summaryParts.join(' | ')}`,
      'success'
    );

    // Trigger Matchmaker and Inventor
    this.eventBus.publish({
      type: 'MATCHES_DISCOVERED',
      payload: { matchIds: [] }
    });
  }
}
