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
