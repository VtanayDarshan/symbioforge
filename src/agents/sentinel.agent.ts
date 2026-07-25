import { StateManager } from '../orchestrator/state-manager.js';
import { EventBus } from '../orchestrator/event-bus.js';
import { Factory } from '../core/types.js';

export class SentinelAgent {
  private stateManager: StateManager;
  private eventBus: EventBus;
  private volumeBaseline: Map<string, number> = new Map();

  constructor() {
    this.stateManager = StateManager.getInstance();
    this.eventBus = EventBus.getInstance();
    this.setupListeners();
    this.captureBaseline();
  }

  private captureBaseline() {
    const factories = this.stateManager.getFactories();
    for (const f of factories) {
      if (f.wasteStreams) {
        const total = f.wasteStreams.reduce((sum, w) => sum + w.volume, 0);
        this.volumeBaseline.set(f.id, total);
      }
    }
  }

  private setupListeners() {
    this.eventBus.subscribe('SENTINEL_TRIGGERED', (event) => {
      if (event.type !== 'SENTINEL_TRIGGERED') return;
      this.handleDisruption(event.payload.reason);
    });

    this.eventBus.subscribe('ECOSYSTEM_STABLE', (event) => {
      if (event.type !== 'ECOSYSTEM_STABLE') return;
      this.runHealthChecks();
    });
  }

  private handleDisruption(reason: string) {
    this.stateManager.addLog('Sentinel', `Disruption detected: ${reason}. Initiating self-healing protocol...`, 'warning');

    setTimeout(() => {
      this.eventBus.publish({
        type: 'MATCHES_DISCOVERED',
        payload: { matchIds: [] }
      });
    }, 1000);
  }

  private runHealthChecks() {
    this.monitorVolumes();
    this.trackPerformance();
    this.checkComplianceDeadlines();
    this.stateManager.addLog('Sentinel', 'Health checks complete. Ecosystem stable. Monitoring active.', 'success');
  }

  private monitorVolumes() {
    const factories = this.stateManager.getFactories();
    for (const f of factories) {
      if (!f.wasteStreams) continue;
      const current = f.wasteStreams.reduce((sum, w) => sum + w.volume, 0);
      const baseline = this.volumeBaseline.get(f.id);
      if (baseline && baseline > 0) {
        const change = ((current - baseline) / baseline) * 100;
        if (Math.abs(change) > 25) {
          this.stateManager.addLog(
            'Sentinel',
            `Volume anomaly at "${f.name}": ${change > 0 ? '+' : ''}${change.toFixed(0)}% change from baseline. Investigating...`,
            'warning'
          );
        }
      }
      this.volumeBaseline.set(f.id, current);
    }
  }

  private trackPerformance() {
    const state = this.stateManager.getState();
    const activeMatches = state.matches.filter(m => m.status === 'Blueprint Ready' || m.status === 'Active').length;
    const totalMatches = state.matches.length;
    const conversionRate = totalMatches > 0 ? Math.round((activeMatches / totalMatches) * 100) : 0;

    if (conversionRate < 10 && totalMatches > 5) {
      this.stateManager.addLog(
        'Sentinel',
        `Low conversion rate: only ${conversionRate}% of ${totalMatches} matches have advanced past "New". Consider reviewing match quality thresholds.`,
        'warning'
      );
    }
  }

  private checkComplianceDeadlines() {
    const factories = this.stateManager.getFactories();
    const now = new Date();

    for (const f of factories) {
      if (f.complianceStatus === 'overdue') {
        this.stateManager.addLog(
          'Sentinel',
          `COMPLIANCE ALERT: "${f.name}" has overdue SPCB filing. Immediate action required.`,
          'error'
        );
        continue;
      }

      if (f.lastFiledDate) {
        const filed = new Date(f.lastFiledDate);
        const monthsSinceFiled = (now.getFullYear() - filed.getFullYear()) * 12 + (now.getMonth() - filed.getMonth());
        if (monthsSinceFiled >= 10) {
          this.stateManager.addLog(
            'Sentinel',
            `Compliance reminder: "${f.name}" last filed ${monthsSinceFiled} months ago. Annual SPCB renewal due within ${12 - monthsSinceFiled} month(s).`,
            'warning'
          );
        }
      }
    }
  }
}
