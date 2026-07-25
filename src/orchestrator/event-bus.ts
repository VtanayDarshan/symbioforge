import { EventType, SwarmEvent, EventPayloadMap, ActivityLogEntry } from '../types/events.types.js';

type EventHandler<T extends EventType> = (event: SwarmEvent<T>) => Promise<void>;

let eventCounter = 0;
function generateEventId(): string {
  return `evt_${Date.now()}_${++eventCounter}`;
}

let logCounter = 0;
function generateLogId(): string {
  return `log_${Date.now()}_${++logCounter}`;
}

export class EventBus {
  private handlers: Map<EventType, Set<EventHandler<any>>> = new Map();
  private eventHistory: SwarmEvent[] = [];
  private activityLog: ActivityLogEntry[] = [];
  private maxHistory = 200;
  private maxActivityLog = 500;
  private processing = false;
  private queue: SwarmEvent[] = [];

  on<T extends EventType>(eventType: T, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
  }

  off<T extends EventType>(eventType: T, handler: EventHandler<T>): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
    }
  }

  async emit<T extends EventType>(
    eventType: T,
    payload: EventPayloadMap[T],
    sourceAgent: string
  ): Promise<void> {
    const event: SwarmEvent<T> = {
      id: generateEventId(),
      type: eventType,
      payload,
      timestamp: new Date().toISOString(),
      sourceAgent,
    };

    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistory) {
      this.eventHistory = this.eventHistory.slice(-this.maxHistory);
    }

    this.queue.push(event);
    if (!this.processing) {
      await this.processQueue();
    }
  }

  private async processQueue(): Promise<void> {
    this.processing = true;
    while (this.queue.length > 0) {
      const event = this.queue.shift()!;
      const handlers = this.handlers.get(event.type);
      if (handlers && handlers.size > 0) {
        const promises = Array.from(handlers).map(async (handler) => {
          try {
            await handler(event);
          } catch (error) {
            console.error(`[EventBus] Handler error for ${event.type}:`, error);
          }
        });
        await Promise.all(promises);
      }
    }
    this.processing = false;
  }

  addActivityLog(agentName: string, emoji: string, message: string, eventType: EventType | null = null): void {
    const entry: ActivityLogEntry = {
      id: generateLogId(),
      timestamp: new Date().toISOString(),
      agentName,
      emoji,
      message,
      eventType,
    };
    this.activityLog.push(entry);
    if (this.activityLog.length > this.maxActivityLog) {
      this.activityLog = this.activityLog.slice(-this.maxActivityLog);
    }
    const time = new Date().toLocaleTimeString('en-IN', { hour12: false });
    console.log(`[${time}] ${emoji} ${agentName}: ${message}`);
  }

  getEventHistory(limit = 50): SwarmEvent[] {
    return this.eventHistory.slice(-limit);
  }

  getActivityLog(limit = 100): ActivityLogEntry[] {
    return this.activityLog.slice(-limit);
  }

  getHandlerCount(eventType: EventType): number {
    return this.handlers.get(eventType)?.size ?? 0;
  }

  clear(): void {
    this.handlers.clear();
    this.eventHistory = [];
    this.activityLog = [];
    this.queue = [];
    this.processing = false;
  }
}
