/**
 * Agent Swarm Simulator
 * Simulates agent activities, interactions, and status changes
 * Provides realistic activity streams for visualization
 */

import {
  AgentActivity,
  AgentState,
  SwarmMetrics,
  AgentType,
  AgentStatus,
  ActivityType,
  ActivityFeedItem
} from '../types/agent-swarm';
import { SimulatedFactoryStream } from '../types/agent-swarm';

/**
 * Agent Swarm Simulator
 * Orchestrates agent activities and state management
 */
export class AgentSwarmSimulator {
  private agents: Map<string, AgentState> = new Map();
  private activityHistory: AgentActivity[] = [];
  private feedHistory: ActivityFeedItem[] = [];

  constructor() {
    this.initializeAgents();
  }

  /**
   * Initialize agent pool
   */
  private initializeAgents(): void {
    // Initialize 4 agent types with 2-3 instances each
    const agentConfigs = [
      { type: AgentType.SCOUT, count: 2 },
      { type: AgentType.CLERK, count: 2 },
      { type: AgentType.PROFILER, count: 3 },
      { type: AgentType.MATCHMAKER, count: 2 }
    ];

    let agentIndex = 0;
    agentConfigs.forEach(config => {
      for (let i = 0; i < config.count; i++) {
        const agentId = `${config.type}-${i + 1}`;
        this.agents.set(agentId, {
          id: agentId,
          type: config.type,
          status: AgentStatus.IDLE,
          completedTasks: 0,
          failedTasks: 0,
          successRate: 100,
          averageProcessingTimeMs: 0,
          lastUpdated: new Date()
        });
      }
    });
  }

  /**
   * Process incoming factory stream through agent swarm
   */
  processFactory(factory: SimulatedFactoryStream): AgentActivity[] {
    const activities: AgentActivity[] = [];

    // Scout agent: Intake and initial assessment
    const scoutActivity = this.createActivity(
      AgentType.SCOUT,
      ActivityType.FACTORY_INTAKE,
      factory
    );
    activities.push(scoutActivity);

    // Clerk agent: Data validation and standardization
    setTimeout(() => {
      const clerkActivity = this.createActivity(
        AgentType.CLERK,
        ActivityType.WASTE_PROFILING,
        factory
      );
      activities.push(clerkActivity);
    }, 500);

    // Profiler agent: Detailed waste analysis
    setTimeout(() => {
      const profilerActivity = this.createActivity(
        AgentType.PROFILER,
        ActivityType.EFFICIENCY_CHECK,
        factory
      );
      activities.push(profilerActivity);
    }, 1200);

    // Matchmaker agent: Compatibility scanning and match generation
    setTimeout(() => {
      const matchmakerActivity = this.createActivity(
        AgentType.MATCHMAKER,
        ActivityType.COMPATIBILITY_SCAN,
        factory
      );
      activities.push(matchmakerActivity);
    }, 2000);

    return activities;
  }

  /**
   * Create realistic agent activity
   */
  private createActivity(
    agentType: AgentType,
    activityType: ActivityType,
    factory: SimulatedFactoryStream
  ): AgentActivity {
    const agentId = `${agentType}-${Math.floor(Math.random() * 3) + 1}`;
    const agent = this.agents.get(agentId);

    const duration = this.getActivityDuration(activityType);
    const matchesGenerated = activityType === ActivityType.COMPATIBILITY_SCAN
      ? Math.floor(Math.random() * 8) + 1
      : undefined;

    const activity: AgentActivity = {
      id: `ACT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agentType,
      status: AgentStatus.PROCESSING,
      activityType,
      factoryId: factory.factoryId,
      factoryName: factory.factoryName,
      timestamp: new Date(),
      durationMs: duration,
      matchesGenerated,
      confidenceScore: matchesGenerated ? Math.floor(Math.random() * 40) + 60 : undefined,
      message: this.generateActivityMessage(agentType, activityType, factory),
      metadata: {
        wasteStreamCount: factory.wasteStreams.length,
        totalVolume: factory.wasteStreams.reduce((sum, w) => sum + w.volume, 0),
        contaminationLevels: factory.wasteStreams.map(w => w.contamination)
      }
    };

    // Record activity
    this.activityHistory.push(activity);

    // Update agent state
    if (agent) {
      agent.status = AgentStatus.PROCESSING;
      agent.currentActivity = activity;
      agent.completedTasks++;
      agent.lastUpdated = new Date();
      
      // Update success rate (simulate 95% success)
      if (Math.random() > 0.95) {
        agent.failedTasks++;
      }
      agent.successRate = (agent.completedTasks - agent.failedTasks) / agent.completedTasks * 100;
    }

    // Schedule completion
    setTimeout(() => {
      if (agent) {
        agent.status = AgentStatus.IDLE;
        agent.currentActivity = undefined;
      }
      activity.status = AgentStatus.COMPLETE;
    }, duration);

    return activity;
  }

  /**
   * Get activity duration based on type (ms)
   */
  private getActivityDuration(activityType: ActivityType): number {
    const durations: Record<ActivityType, [number, number]> = {
      [ActivityType.FACTORY_INTAKE]: [200, 800],
      [ActivityType.WASTE_PROFILING]: [300, 1200],
      [ActivityType.COMPATIBILITY_SCAN]: [500, 2500],
      [ActivityType.MATCH_GENERATION]: [400, 1500],
      [ActivityType.EFFICIENCY_CHECK]: [250, 1000],
      [ActivityType.ERROR_HANDLING]: [100, 500]
    };

    const [min, max] = durations[activityType];
    return Math.floor(Math.random() * (max - min) + min);
  }

  /**
   * Generate human-readable activity message
   */
  private generateActivityMessage(
    agentType: AgentType,
    activityType: ActivityType,
    factory: SimulatedFactoryStream
  ): string {
    const messages: Record<AgentType, Record<ActivityType, string>> = {
      [AgentType.SCOUT]: {
        [ActivityType.FACTORY_INTAKE]: `Intake: ${factory.factoryName} (${factory.industryType}) - ${factory.wasteStreams.length} waste streams`,
        [ActivityType.WASTE_PROFILING]: `Profiling ${factory.factoryName}`,
        [ActivityType.COMPATIBILITY_SCAN]: `Scanning ${factory.factoryName}`,
        [ActivityType.MATCH_GENERATION]: `Generating matches`,
        [ActivityType.EFFICIENCY_CHECK]: `Checking efficiency`,
        [ActivityType.ERROR_HANDLING]: `Handling error`
      },
      [AgentType.CLERK]: {
        [ActivityType.FACTORY_INTAKE]: `Validating intake for ${factory.factoryName}`,
        [ActivityType.WASTE_PROFILING]: `Standardizing waste data from ${factory.factoryName}`,
        [ActivityType.COMPATIBILITY_SCAN]: `Data validation`,
        [ActivityType.MATCH_GENERATION]: `Recording matches`,
        [ActivityType.EFFICIENCY_CHECK]: `Quality check`,
        [ActivityType.ERROR_HANDLING]: `Data correction`
      },
      [AgentType.PROFILER]: {
        [ActivityType.FACTORY_INTAKE]: `Initializing profile`,
        [ActivityType.WASTE_PROFILING]: `Analyzing waste streams: ${factory.wasteStreams.map(w => w.name).join(', ')}`,
        [ActivityType.COMPATIBILITY_SCAN]: `Profiling compatibility`,
        [ActivityType.MATCH_GENERATION]: `Enriching match data`,
        [ActivityType.EFFICIENCY_CHECK]: `Environmental impact analysis`,
        [ActivityType.ERROR_HANDLING]: `Profile correction`
      },
      [AgentType.MATCHMAKER]: {
        [ActivityType.FACTORY_INTAKE]: `Preparing match analysis`,
        [ActivityType.WASTE_PROFILING]: `Pre-matching assessment`,
        [ActivityType.COMPATIBILITY_SCAN]: `Scanning for symbiotic opportunities with ${factory.factoryName}`,
        [ActivityType.MATCH_GENERATION]: `Generating recommendations`,
        [ActivityType.EFFICIENCY_CHECK]: `Validating match quality`,
        [ActivityType.ERROR_HANDLING]: `Match conflict resolution`
      }
    };

    return messages[agentType][activityType] || 'Processing...';
  }

  /**
   * Get current swarm metrics
   */
  getSwarmMetrics(): SwarmMetrics {
    const agentArray = Array.from(this.agents.values());
    const activeAgents = agentArray.filter(a => a.status !== AgentStatus.IDLE).length;

    const agentStats = {
      [AgentType.SCOUT]: { count: 0, activeCount: 0, totalTasks: 0, successRate: 0 },
      [AgentType.CLERK]: { count: 0, activeCount: 0, totalTasks: 0, successRate: 0 },
      [AgentType.PROFILER]: { count: 0, activeCount: 0, totalTasks: 0, successRate: 0 },
      [AgentType.MATCHMAKER]: { count: 0, activeCount: 0, totalTasks: 0, successRate: 0 }
    };

    agentArray.forEach(agent => {
      const stats = agentStats[agent.type];
      stats.count++;
      if (agent.status !== AgentStatus.IDLE) stats.activeCount++;
      stats.totalTasks += agent.completedTasks;
      stats.successRate += agent.successRate;
    });

    Object.keys(agentStats).forEach(key => {
      const type = key as AgentType;
      if (agentStats[type].count > 0) {
        agentStats[type].successRate /= agentStats[type].count;
      }
    });

    const totalMatches = this.activityHistory
      .filter(a => a.activityType === ActivityType.COMPATIBILITY_SCAN)
      .reduce((sum, a) => sum + (a.matchesGenerated || 0), 0);

    const avgConfidence = this.activityHistory
      .filter(a => a.confidenceScore !== undefined)
      .reduce((sum, a) => sum + (a.confidenceScore || 0), 0) / 
      (this.activityHistory.filter(a => a.confidenceScore !== undefined).length || 1);

    const healthScore = Math.min(100, 
      (activeAgents / agentArray.length) * 50 +
      (avgConfidence > 0 ? avgConfidence : 50)
    );

    return {
      totalAgents: agentArray.length,
      activeAgents,
      idleAgents: agentArray.filter(a => a.status === AgentStatus.IDLE).length,
      agentStats,
      totalMatchesGenerated: totalMatches,
      averageConfidenceScore: avgConfidence,
      systemHealthScore: healthScore,
      lastActivity: this.activityHistory[this.activityHistory.length - 1]?.timestamp || new Date()
    };
  }

  /**
   * Get agent state by type
   */
  getAgentsByType(agentType: AgentType): AgentState[] {
    return Array.from(this.agents.values()).filter(a => a.type === agentType);
  }

  /**
   * Get all agents
   */
  getAllAgents(): AgentState[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get recent activities
   */
  getRecentActivities(count: number): AgentActivity[] {
    return this.activityHistory.slice(-count);
  }

  /**
   * Get activity feed
   */
  generateActivityFeed(count: number = 10): ActivityFeedItem[] {
    return this.activityHistory.slice(-count).map(activity => ({
      id: activity.id,
      timestamp: activity.timestamp,
      agent: activity.agentType,
      status: activity.status,
      title: this.getActivityTitle(activity.activityType),
      description: activity.message,
      factoryName: activity.factoryName,
      matchCount: activity.matchesGenerated,
      confidence: activity.confidenceScore,
      icon: this.getActivityIcon(activity.activityType)
    }));
  }

  /**
   * Get activity title from type
   */
  private getActivityTitle(type: ActivityType): string {
    const titles: Record<ActivityType, string> = {
      [ActivityType.FACTORY_INTAKE]: 'Factory Intake',
      [ActivityType.WASTE_PROFILING]: 'Waste Analysis',
      [ActivityType.COMPATIBILITY_SCAN]: 'Symbiotic Match',
      [ActivityType.MATCH_GENERATION]: 'Match Generated',
      [ActivityType.EFFICIENCY_CHECK]: 'Quality Check',
      [ActivityType.ERROR_HANDLING]: 'Error Handling'
    };
    return titles[type];
  }

  /**
   * Get activity icon
   */
  private getActivityIcon(type: ActivityType): string {
    const icons: Record<ActivityType, string> = {
      [ActivityType.FACTORY_INTAKE]: '📦',
      [ActivityType.WASTE_PROFILING]: '🔬',
      [ActivityType.COMPATIBILITY_SCAN]: '🔍',
      [ActivityType.MATCH_GENERATION]: '✨',
      [ActivityType.EFFICIENCY_CHECK]: '✅',
      [ActivityType.ERROR_HANDLING]: '⚠️'
    };
    return icons[type];
  }

  /**
   * Reset simulator
   */
  reset(): void {
    this.agents.clear();
    this.activityHistory = [];
    this.feedHistory = [];
    this.initializeAgents();
  }
}

/**
 * Global singleton instance
 */
let globalSimulator: AgentSwarmSimulator | null = null;

export function getAgentSwarmSimulator(): AgentSwarmSimulator {
  if (!globalSimulator) {
    globalSimulator = new AgentSwarmSimulator();
  }
  return globalSimulator;
}
