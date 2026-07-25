import { StateManager } from '../orchestrator/state-manager.js';
import { EventBus } from '../orchestrator/event-bus.js';
import { MatchingAlgorithm } from '../core/matching-algorithm.js';

export class MatchmakerAgent {
  private stateManager: StateManager;
  private eventBus: EventBus;
  private matchingAlgorithm: MatchingAlgorithm;

  constructor() {
    this.stateManager = StateManager.getInstance();
    this.eventBus = EventBus.getInstance();
    this.matchingAlgorithm = new MatchingAlgorithm();
    this.setupListeners();
  }

  private setupListeners() {
    this.eventBus.subscribe('MATCHES_DISCOVERED', (event) => {
      if (event.type !== 'MATCHES_DISCOVERED') return;
      this.discoverMatches();
    });
  }

  public discoverMatches() {
    const factories = this.stateManager.getFactories();
    this.stateManager.addLog('Matchmaker', `Scanning ${factories.length} factories for new symbioses...`, 'info');

    // Ensure all factories have waste streams profiled
    for (const f of factories) {
      if (!f.wasteStreams && f.declaredWastes.length > 0) {
        // Run Profiler synchronously if needed
        const profiler = new (class {
          private classifier = new (class {
            classifyWaste(fid: string, fname: string, wname: string) {
              return {
                id: `${fid}_${wname.toLowerCase().replace(/\s+/g, '_')}`,
                factoryId: fid,
                factoryName: fname,
                name: wname,
                category: 'organic' as const,
                physicalForm: 'solid' as const,
                volume: 100,
                contamination: 'clean' as const,
                seasonalVariation: 'none' as const,
                reusePotential: 80
              };
            }
          })();
          profile(fact: any) {
            fact.wasteStreams = fact.declaredWastes.map((w: string) => this.classifier.classifyWaste(fact.id, fact.name, w));
          }
        })();
        profiler.profile(f);
      }
    }

    const matches = this.matchingAlgorithm.findMatches(factories);
    this.stateManager.setMatches(matches);

    this.stateManager.addLog(
      'Matchmaker',
      `Found ${matches.length} symbiotic matches. Top match: ${matches[0] ? `"${matches[0].sourceFactoryName}" → "${matches[0].targetFactoryName}" (${matches[0].compatibilityScore}%)` : 'None'}`,
      'success'
    );

    // Trigger Inventor (or let the chain continue)
    this.eventBus.publish({
      type: 'PRODUCTS_INVENTED',
      payload: { productIds: [] }
    });
  }
}
