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
      this.stateManager.addLog('Sentinel', 'Ecosystem stable. All chains operating within parameters. Monitoring active.', 'success');
    });

    this.eventBus.subscribe('VOLUME_UPDATE', (event) => {
      if (event.type !== 'VOLUME_UPDATE') return;
      this.monitorVolumes(event.payload.factoryId, event.payload.currentVolume);
    });
  }

  public monitorVolumes(factoryId: string, currentVolume: number) {
    const factory = this.stateManager.getFactory(factoryId);
    if (!factory) return;

    const totalCurrentWasteVolume = factory.wasteStreams?.reduce((sum, w) => sum + w.volume, 0) || 0;
    const baselineVolume = totalCurrentWasteVolume || 100;

    if (baselineVolume > 0) {
      const changePercent = Math.abs((currentVolume - baselineVolume) / baselineVolume);
      if (changePercent > 0.2) {
        this.stateManager.addLog(
          'Sentinel',
          `Volume anomaly detected in "${factory.name}": reported ${currentVolume} kg vs baseline ${baselineVolume} kg (${(changePercent * 100).toFixed(0)}% deviation).`,
          'error'
        );
        this.eventBus.publish({
          type: 'SENTINEL_TRIGGERED',
          payload: { reason: `volume_anomaly_${factory.id}` }
        });
      }
    }
  }

  public checkComplianceDeadlines() {
    const factories = this.stateManager.getFactories();
    const now = new Date();
    let reminded = 0;

    for (const factory of factories) {
      if (factory.lastFiledDate) {
        const lastFiled = new Date(factory.lastFiledDate);
        const diffTime = Math.abs(now.getTime() - lastFiled.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 330) {
          factory.complianceStatus = diffDays > 365 ? 'overdue' : 'pending';
          const label = diffDays > 365 ? `OVERDUE by ${diffDays - 365} days` : `due in ${365 - diffDays} days`;
          this.stateManager.addLog(
            'Sentinel',
            `Compliance filing reminder: "${factory.name}" — ${label}. Clerk notified.`,
            'warning'
          );

          this.eventBus.publish({
            type: 'COMPLIANCE_DUE',
            payload: { factoryId: factory.id, daysOverdue: diffDays - 365 }
          });
          reminded++;
        }
      }
    }

    if (reminded === 0) {
      this.stateManager.addLog('Sentinel', 'Compliance check complete. All factories are current on filings.', 'success');
    }
  }

  private handleDisruption(reason: string) {
    this.stateManager.addLog('Sentinel', `Disruption detected: ${reason}. Initiating self-healing protocol...`, 'warning');

    const state = this.stateManager.getState();
    const scoreBefore = state.circularScore;

    // --- 1. Identify affected factory from reason string ---
    const factoryIdMatch = reason.match(/halt_(.+)|volume_anomaly_(.+)|manual_halt_(.+)/);
    const disruptedId = factoryIdMatch
      ? (factoryIdMatch[1] || factoryIdMatch[2] || factoryIdMatch[3])
      : null;

    // --- 2. Remove or downgrade affected symbiotic chains ---
    let affectedCount = 0;
    if (disruptedId) {
      const allMatches = this.stateManager.getMatches();
      const affectedMatches = allMatches.filter(
        m => m.sourceFactoryId === disruptedId || m.targetFactoryId === disruptedId
      );
      affectedCount = affectedMatches.length;

      if (affectedCount > 0) {
        // Downgrade Blueprint Ready → New so the Architect won't re-use them
        for (const m of affectedMatches) {
          m.status = 'New';
        }

        // Remove multi-hop chains that route through the disrupted factory
        const allChains = this.stateManager.getChains();
        const survivingChains = allChains.filter(
          c => !c.hops.some(h => h.sourceFactoryId === disruptedId || h.targetFactoryId === disruptedId)
        );
        this.stateManager.setChains(survivingChains);

        this.stateManager.recalculateMetrics();
        const scoreAfter = this.stateManager.getState().circularScore;

        this.stateManager.addLog(
          'Sentinel',
          `Impact assessment: ${affectedCount} symbiotic chains disrupted. ` +
          `Cluster circular score: ${scoreBefore}% → ${scoreAfter}% (−${scoreBefore - scoreAfter}%).`,
          'warning'
        );
      }
    }

    // --- 3. Re-trigger the already-running Matchmaker via event bus (avoids re-instantiation) ---
    this.stateManager.addLog('Sentinel', 'Re-triggering Matchmaker to find replacement symbiotic connections...', 'info');

    setTimeout(() => {
      // Publishing MATCHES_DISCOVERED causes the existing MatchmakerAgent (registered at startup)
      // to call discoverMatches() — no new instance needed, no duplicate listeners.
      this.eventBus.publish({
        type: 'MATCHES_DISCOVERED',
        payload: { matchIds: [] }
      });

      // Allow time for the matchmaker to finish, then report recovery
      setTimeout(() => {
        const recoveredScore = this.stateManager.getState().circularScore;
        if (recoveredScore >= scoreBefore - 10) {
          this.stateManager.addLog(
            'Sentinel',
            `Self-healing complete. Replacement connections found. ` +
            `Cluster score recovered: → ${recoveredScore}%. Ecosystem stable.`,
            'success'
          );
        } else {
          this.stateManager.addLog(
            'Sentinel',
            `Self-healing partial. Current cluster score: ${recoveredScore}%. ` +
            `Some chains remain unresolved. Monitoring continues.`,
            'warning'
          );
        }

        this.eventBus.publish({
          type: 'ECOSYSTEM_STABLE',
          payload: { timestamp: new Date().toISOString() }
        });
      }, 1500);
    }, 1000);
  }
}
