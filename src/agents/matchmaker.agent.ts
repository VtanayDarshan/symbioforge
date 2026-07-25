import { StateManager } from '../orchestrator/state-manager.js';
import { EventBus } from '../orchestrator/event-bus.js';
import { MatchingAlgorithm } from '../core/matching-algorithm.js';
import { WasteClassifier } from '../core/waste-classifier.js';
import { SymbioticMatch } from '../core/types.js';

export class MatchmakerAgent {
  private stateManager: StateManager;
  private eventBus: EventBus;
  private matchingAlgorithm: MatchingAlgorithm;
  private wasteClassifier: WasteClassifier;

  constructor() {
    this.stateManager = StateManager.getInstance();
    this.eventBus = EventBus.getInstance();
    this.matchingAlgorithm = new MatchingAlgorithm();
    this.wasteClassifier = new WasteClassifier();
    this.setupListeners();
  }

  private setupListeners() {
    this.eventBus.subscribe('MATCHES_DISCOVERED', (event) => {
      if (event.type !== 'MATCHES_DISCOVERED') return;
      this.discoverMatches();
    });
  }

  private discoverMultiHopChains(directMatches: SymbioticMatch[]): string[] {
    const chains: string[] = [];
    const bySource = new Map<string, SymbioticMatch[]>();
    for (const m of directMatches) {
      const list = bySource.get(m.sourceFactoryId) || [];
      list.push(m);
      bySource.set(m.sourceFactoryId, list);
    }

    for (const hop1 of directMatches) {
      const hop2List = bySource.get(hop1.targetFactoryId);
      if (!hop2List) continue;
      for (const hop2 of hop2List) {
        if (hop2.targetFactoryId === hop1.sourceFactoryId) continue;
        chains.push(
          `${hop1.sourceFactoryName} →[${hop1.wasteStreamName}]→ ${hop1.targetFactoryName} →[${hop2.wasteStreamName}]→ ${hop2.targetFactoryName}`
        );
      }
    }
    return chains;
  }

  public discoverMatches() {
    const factories = this.stateManager.getFactories();
    this.stateManager.addLog('Matchmaker', `Scanning ${factories.length} factories for new symbioses...`, 'info');

    for (const f of factories) {
      if (!f.wasteStreams && f.declaredWastes.length > 0) {
        f.wasteStreams = f.declaredWastes.map(w =>
          this.wasteClassifier.classifyWaste(f.id, f.name, w)
        );
      }
    }

    const matches = this.matchingAlgorithm.findMatches(factories);
    this.stateManager.setMatches(matches);

    this.stateManager.addLog(
      'Matchmaker',
      `Found ${matches.length} symbiotic matches. Top match: ${matches[0] ? `"${matches[0].sourceFactoryName}" → "${matches[0].targetFactoryName}" (${matches[0].compatibilityScore}%)` : 'None'}`,
      'success'
    );

    const chains = this.discoverMultiHopChains(matches);
    if (chains.length > 0) {
      this.stateManager.addLog(
        'Matchmaker',
        `Discovered ${chains.length} multi-hop supply chains. Example: ${chains[0]}`,
        'success'
      );
    }

    this.eventBus.publish({
      type: 'PRODUCTS_INVENTED',
      payload: { productIds: [] }
    });
  }
}
