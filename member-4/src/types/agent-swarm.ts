/**
 * Agent Swarm Monitor Types
 * Defines data structures for tracking agent activity and state
 */

export enum AgentType {
  SCOUT = 'scout',
  CLERK = 'clerk',
  PROFILER = 'profiler',
  MATCHMAKER = 'matchmaker'
}

export enum AgentStatus {
  IDLE = 'idle',
  PROCESSING = 'processing',
  ANALYZING = 'analyzing',
  MATCHING = 'matching',
  ERROR = 'error',
  COMPLETE = 'complete'
}

export enum ActivityType {
  FACTORY_INTAKE = 'factory_intake',
  WASTE_PROFILING = 'waste_profiling',
  COMPATIBILITY_SCAN = 'compatibility_scan',
  MATCH_GENERATION = 'match_generation',
  EFFICIENCY_CHECK = 'efficiency_check',
  ERROR_HANDLING = 'error_handling'
}

export interface AgentActivity {
  id: string;
  agentType: AgentType;
  status: AgentStatus;
  activityType: ActivityType;
  factoryId?: string;
  factoryName?: string;
  wasteStreamId?: string;
  targetFactoryId?: string;
  timestamp: Date;
  durationMs: number;
  matchesGenerated?: number;
  confidenceScore?: number;
  message: string;
  metadata?: Record<string, any>;
}

export interface AgentState {
  id: string;
  type: AgentType;
  status: AgentStatus;
  currentActivity?: AgentActivity;
  completedTasks: number;
  failedTasks: number;
  successRate: number;
  averageProcessingTimeMs: number;
  lastUpdated: Date;
}

export interface SwarmMetrics {
  totalAgents: number;
  activeAgents: number;
  idleAgents: number;
  agentStats: {
    [key in AgentType]: {
      count: number;
      activeCount: number;
      totalTasks: number;
      successRate: number;
    };
  };
  totalMatchesGenerated: number;
  averageConfidenceScore: number;
  systemHealthScore: number; // 0-100
  lastActivity: Date;
}

export interface SimulatedFactoryStream {
  id: string;
  factoryId: string;
  factoryName: string;
  industryType: string;
  timestamp: Date;
  wasteStreams: {
    id: string;
    name: string;
    category: string;
    volume: number;
    contamination: string;
  }[];
  processingStatus: 'pending' | 'in_progress' | 'complete';
}

export interface ActivityFeedItem {
  id: string;
  timestamp: Date;
  agent: AgentType;
  status: AgentStatus;
  title: string;
  description: string;
  factoryName?: string;
  matchCount?: number;
  confidence?: number;
  icon?: string;
}
