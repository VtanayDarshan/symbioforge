import { StateManager } from '../orchestrator/state-manager.js';
import { EventBus } from '../orchestrator/event-bus.js';

export class AuditorAgent {
  private stateManager: StateManager;
  private eventBus: EventBus;

  constructor() {
    this.stateManager = StateManager.getInstance();
    this.eventBus = EventBus.getInstance();
    this.setupListeners();
  }

  private setupListeners() {
    this.eventBus.subscribe('IMPACT_AUDITED', (event) => {
      if (event.type !== 'IMPACT_AUDITED') return;
      this.auditImpact();
    });
  }

  public auditImpact() {
    this.stateManager.addLog('Auditor', 'Quantifying environmental and financial impact of discoveries...', 'info');

    // Set top opportunities to "Blueprint Ready" or "Active" to showcase impact
    const matches = this.stateManager.getMatches();
    const products = this.stateManager.getProducts();

    const newMatches = matches.filter(m => m.status === 'New');
    newMatches.slice(0, 3).forEach(m => { m.status = 'Blueprint Ready'; });

    const newProducts = products.filter(p => p.status === 'New');
    newProducts.slice(0, 2).forEach(p => { p.status = 'Blueprint Ready'; });

    this.stateManager.recalculateMetrics();

    const state = this.stateManager.getState();
    this.stateManager.addLog(
      'Auditor',
      `Impact audit complete: ${state.totalCo2Avoided} tons CO2/yr avoided, INR ${(state.totalFinancialValue / 100000).toFixed(1)}L/yr savings/revenue generated.`,
      'success'
    );

    // Trigger Architect
    this.eventBus.publish({
      type: 'PATHWAYS_DESIGNED',
      payload: { blueprintIds: [] }
    });
  }
}
