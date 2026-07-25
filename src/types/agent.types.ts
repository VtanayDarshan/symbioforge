import { EventType, SwarmEvent } from './events.types.js';

export type AgentStatus = 'idle' | 'processing' | 'completed' | 'error';

export interface AgentResult {
  agentName: string;
  status: AgentStatus;
  timestamp: string;
  data: unknown;
  triggeredEvents: EventType[];
  durationMs: number;
}

export interface IAgent {
  readonly name: string;
  readonly emoji: string;
  process(event: SwarmEvent): Promise<AgentResult>;
  getStatus(): AgentStatus;
  getLastResult(): AgentResult | null;
}
