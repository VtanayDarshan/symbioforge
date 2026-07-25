import { EventBus } from './event-bus.js';
import { StateManager } from './state-manager.js';

export interface SchedulerConfig {
  scoutIntervalMs: number;
  sentinelIntervalMs: number;
}

const DEFAULT_CONFIG: SchedulerConfig = {
  scoutIntervalMs: 30_000,
  sentinelIntervalMs: 60_000,
};

export class Scheduler {
  private scoutTimer: ReturnType<typeof setInterval> | null = null;
  private sentinelTimer: ReturnType<typeof setInterval> | null = null;
  private running = false;
  private config: SchedulerConfig;
  private scoutCallback: (() => Promise<void>) | null = null;
  private sentinelCallback: (() => Promise<void>) | null = null;

  constructor(
    private eventBus: EventBus,
    private stateManager: StateManager,
    config?: Partial<SchedulerConfig>
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  setScoutCallback(cb: () => Promise<void>): void {
    this.scoutCallback = cb;
  }

  setSentinelCallback(cb: () => Promise<void>): void {
    this.sentinelCallback = cb;
  }

  start(): void {
    if (this.running) return;
    this.running = true;

    this.eventBus.addActivityLog('Scheduler', '⏰', 'Swarm scheduler started');

    if (this.scoutCallback) {
      this.scoutTimer = setInterval(async () => {
        try {
          await this.scoutCallback!();
        } catch (error) {
          console.error('[Scheduler] Scout tick error:', error);
        }
      }, this.config.scoutIntervalMs);
    }

    if (this.sentinelCallback) {
      this.sentinelTimer = setInterval(async () => {
        try {
          await this.sentinelCallback!();
        } catch (error) {
          console.error('[Scheduler] Sentinel tick error:', error);
        }
      }, this.config.sentinelIntervalMs);
    }
  }

  stop(): void {
    if (!this.running) return;
    this.running = false;

    if (this.scoutTimer) {
      clearInterval(this.scoutTimer);
      this.scoutTimer = null;
    }
    if (this.sentinelTimer) {
      clearInterval(this.sentinelTimer);
      this.sentinelTimer = null;
    }

    this.eventBus.addActivityLog('Scheduler', '⏰', 'Swarm scheduler stopped');
  }

  isRunning(): boolean {
    return this.running;
  }

  updateConfig(config: Partial<SchedulerConfig>): void {
    this.config = { ...this.config, ...config };
    if (this.running) {
      this.stop();
      this.start();
    }
  }

  getConfig(): SchedulerConfig {
    return { ...this.config };
  }
}
