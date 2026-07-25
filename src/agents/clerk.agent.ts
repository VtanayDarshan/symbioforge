import { StateManager } from '../orchestrator/state-manager.js';
import { EventBus } from '../orchestrator/event-bus.js';
import { ComplianceGenerator } from '../core/compliance-generator.js';
import { Factory } from '../core/types.js';

export class ClerkAgent {
  private stateManager: StateManager;
  private eventBus: EventBus;
  private complianceGenerator: ComplianceGenerator;

  constructor() {
    this.stateManager = StateManager.getInstance();
    this.eventBus = EventBus.getInstance();
    this.complianceGenerator = new ComplianceGenerator();
  }

  public registerFactory(factoryData: Omit<Factory, 'savingsEarned' | 'co2Avoided'>): { factory: Factory; report: string } {
    const factory: Factory = {
      ...factoryData,
      savingsEarned: 0,
      co2Avoided: 0,
      complianceStatus: 'filed',
      lastFiledDate: new Date().toISOString().split('T')[0]
    };

    this.stateManager.addFactory(factory);
    this.stateManager.addLog('Clerk', `New registration: "${factory.name}"`, 'success');

    const report = this.complianceGenerator.generateSbcbReport(factory);
    this.stateManager.addLog('Clerk', `SPCB Annual Statement generated for "${factory.name}" (PDF ready for download)`, 'success');

    // Trigger Scout
    this.eventBus.publish({
      type: 'FACTORY_REGISTERED',
      payload: { factoryId: factory.id }
    });

    return { factory, report };
  }

  public generateComplianceReport(factoryId: string): string | null {
    const factory = this.stateManager.getFactory(factoryId);
    if (!factory) return null;

    return this.complianceGenerator.generateSbcbReport(factory);
  }
}
