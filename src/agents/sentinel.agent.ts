import { StateManager } from '../orchestrator/state-manager.js';
import { EventBus } from '../orchestrator/event-bus.js';

export class SentinelAgent {
  private stateManager: StateManager;
  private eventBus: EventBus;

  constructor() {
    this.stateManager = StateManager.getInstance();
    this.eventBus = EventBus.getInstance();
    this.setupListeners();
  }

  private setupListeners() {
    this.eventBus.subscribe('SENTINEL_TRIGGERED', (event) => {
      if (event.type !== 'SENTINEL_TRIGGERED') return;
      this.handleDisruption(event.payload.reason);
    });

    this.eventBus.subscribe('ECOSYSTEM_STABLE', (event) => {
      if (event.type !== 'ECOSYSTEM_STABLE') return;
      this.stateManager.addLog('Sentinel', 'Ecosystem stable. Monitoring active.', 'success');
    });

    this.eventBus.subscribe('VOLUME_UPDATE', (event) => {
      if (event.type !== 'VOLUME_UPDATE') return;
      this.monitorVolumes(event.payload.factoryId, event.payload.currentVolume);
    });
  }

  public monitorVolumes(factoryId: string, currentVolume: number) {
    const factory = this.stateManager.getFactory(factoryId);
    if (!factory) return;

    // Calculate baseline volume from declared wastes
    const baselineVolume = factory.declaredWastes.length > 0 ? 100 : 0; // Mock baseline
    const totalCurrentWasteVolume = factory.wasteStreams?.reduce((sum, w) => sum + w.volume, 0) || 0;
    
    // Check if the current volume deviates by > 20%
    const expectedVolume = baselineVolume || totalCurrentWasteVolume;
    if (expectedVolume > 0) {
      const changePercent = Math.abs((currentVolume - expectedVolume) / expectedVolume);
      if (changePercent > 0.2) {
        this.stateManager.addLog('Sentinel', `Volume anomaly detected in ${factory.name}: ${currentVolume} kg vs expected ${expectedVolume} kg.`, 'error');
        this.eventBus.publish({
          type: 'SENTINEL_TRIGGERED',
          payload: { reason: `Volume anomaly > 20% for factory ${factory.id}` }
        });
      }
    }
  }

  public checkComplianceDeadlines() {
    const factories = this.stateManager.getFactories();
    const now = new Date();
    
    for (const factory of factories) {
      if (factory.lastFiledDate) {
        const lastFiled = new Date(factory.lastFiledDate);
        const diffTime = Math.abs(now.getTime() - lastFiled.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Due every 365 days. Warning at 330 days.
        if (diffDays > 330) {
          factory.complianceStatus = diffDays > 365 ? 'overdue' : 'pending';
          this.stateManager.addLog('Sentinel', `Compliance deadline approaching/overdue for ${factory.name} (${diffDays} days).`, 'warning');
          
          this.eventBus.publish({
            type: 'COMPLIANCE_DUE',
            payload: { factoryId: factory.id, daysOverdue: diffDays - 365 }
          });
        }
      }
    }
  }

  private handleDisruption(reason: string) {
    this.stateManager.addLog('Sentinel', `Disruption detected: ${reason}. Initiating self-healing protocol...`, 'warning');

    // Re-trigger Matchmaker to find alternative connections
    setTimeout(() => {
      this.eventBus.publish({
        type: 'MATCHES_DISCOVERED',
        payload: { matchIds: [] }
      });
    }, 1000);
  }
}
