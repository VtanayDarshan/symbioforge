/**
 * Widget 1: Agent Swarm Monitor
 * Real-time visualization of agent activities and system metrics
 * 
 * Features:
 * - Live agent status tracking
 * - Activity feed with real-time updates
 * - System health metrics
 * - Interactive controls for simulation
 */

import React, { useEffect, useState } from 'react';
import { useAgentSwarm } from '../hooks/useAgentSwarm';
import { AgentType, AgentStatus, ActivityFeedItem, SwarmMetrics } from '../types/agent-swarm';
import '../styles/agent-swarm-monitor.css';

interface AgentSwarmMonitorProps {
  autoStart?: boolean;
  title?: string;
  showMetrics?: boolean;
  showActivityFeed?: boolean;
  showAgentPool?: boolean;
}

/**
 * Agent Swarm Monitor Widget
 */
export const AgentSwarmMonitor: React.FC<AgentSwarmMonitorProps> = ({
  autoStart = true,
  title = 'Agent Swarm Monitor',
  showMetrics = true,
  showActivityFeed = true,
  showAgentPool = true
}) => {
  const {
    metrics,
    agents,
    activityFeed,
    isRunning,
    factoryStreamActive,
    start,
    stop,
    reset,
    startFactoryStream,
    stopFactoryStream
  } = useAgentSwarm({ autoStart, refreshInterval: 500 });

  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  return (
    <div className="agent-swarm-monitor">
      {/* Header */}
      <div className="monitor-header">
        <h1>{title}</h1>
        <div className="header-controls">
          <button
            className={`btn ${isRunning ? 'btn-running' : 'btn-stopped'}`}
            onClick={isRunning ? stop : start}
          >
            {isRunning ? '⏸ Pause Monitoring' : '▶ Start Monitoring'}
          </button>
          <button
            className={`btn ${factoryStreamActive ? 'btn-active' : 'btn-inactive'}`}
            onClick={factoryStreamActive ? stopFactoryStream : startFactoryStream}
          >
            {factoryStreamActive ? '⏹ Stop Factory Stream' : '▶ Start Factory Stream'}
          </button>
          <button className="btn btn-reset" onClick={reset}>
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="monitor-grid">
        {/* Left Panel: Metrics & Agent Pool */}
        <div className="monitor-left">
          {showMetrics && metrics && (
            <MetricsPanel metrics={metrics} />
          )}

          {showAgentPool && (
            <AgentPoolPanel
              agents={agents}
              selectedAgent={selectedAgent}
              onSelectAgent={setSelectedAgent}
            />
          )}
        </div>

        {/* Right Panel: Activity Feed */}
        <div className="monitor-right">
          {showActivityFeed && (
            <ActivityFeedPanel feed={activityFeed} />
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="monitor-footer">
        <div className="status-indicator">
          <span className={`status-dot ${isRunning ? 'active' : 'inactive'}`}></span>
          <span className="status-text">
            {isRunning ? 'Monitoring Active' : 'Monitoring Paused'}
          </span>
        </div>
        <div className="stream-indicator">
          <span className={`stream-dot ${factoryStreamActive ? 'active' : 'inactive'}`}></span>
          <span className="stream-text">
            {factoryStreamActive ? 'Factory Stream Running' : 'Factory Stream Stopped'}
          </span>
        </div>
      </div>
    </div>
  );
};

/**
 * Metrics Panel Component
 */
const MetricsPanel: React.FC<{ metrics: SwarmMetrics }> = ({ metrics }) => {
  const agentStats = metrics.agentStats;

  return (
    <div className="metrics-panel">
      <h2>System Metrics</h2>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <MetricCard
          label="Total Agents"
          value={metrics.totalAgents}
          subValue={`${metrics.activeAgents} active`}
          color="blue"
        />
        <MetricCard
          label="System Health"
          value={`${Math.round(metrics.systemHealthScore)}%`}
          subValue="Overall health score"
          color={metrics.systemHealthScore > 70 ? 'green' : 'yellow'}
        />
        <MetricCard
          label="Total Matches"
          value={metrics.totalMatchesGenerated}
          subValue="Generated today"
          color="purple"
        />
        <MetricCard
          label="Avg Confidence"
          value={`${Math.round(metrics.averageConfidenceScore)}%`}
          subValue="Match quality"
          color={metrics.averageConfidenceScore > 70 ? 'green' : 'orange'}
        />
      </div>

      {/* Agent Breakdown */}
      <div className="agent-breakdown">
        <h3>Agent Distribution</h3>
        {Object.entries(agentStats).map(([type, stats]) => (
          <div key={type} className="agent-stat">
            <div className="agent-stat-header">
              <span className="agent-type">{type}</span>
              <span className="agent-count">{stats.count} agents</span>
            </div>
            <div className="agent-stat-details">
              <span className="detail">Active: {stats.activeCount}</span>
              <span className="detail">Tasks: {stats.totalTasks}</span>
              <span className="detail">Success: {Math.round(stats.successRate)}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${stats.successRate}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Metric Card Component
 */
interface MetricCardProps {
  label: string;
  value: string | number;
  subValue: string;
  color: 'blue' | 'green' | 'yellow' | 'orange' | 'purple' | 'red';
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, subValue, color }) => (
  <div className={`metric-card metric-${color}`}>
    <div className="metric-label">{label}</div>
    <div className="metric-value">{value}</div>
    <div className="metric-sub">{subValue}</div>
  </div>
);

/**
 * Agent Pool Panel
 */
interface AgentPoolPanelProps {
  agents: any[];
  selectedAgent: string | null;
  onSelectAgent: (agentId: string | null) => void;
}

const AgentPoolPanel: React.FC<AgentPoolPanelProps> = ({
  agents,
  selectedAgent,
  onSelectAgent
}) => {
  // Group agents by type
  const agentsByType = agents.reduce((acc, agent) => {
    if (!acc[agent.type]) acc[agent.type] = [];
    acc[agent.type].push(agent);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="agent-pool-panel">
      <h2>Agent Pool</h2>
      {Object.entries(agentsByType).map(([type, typeAgents]) => (
        <div key={type} className="agent-group">
          <h4 className="agent-group-title">{type}</h4>
          <div className="agents-list">
            {typeAgents.map(agent => (
              <div
                key={agent.id}
                className={`agent-item ${agent.status} ${selectedAgent === agent.id ? 'selected' : ''}`}
                onClick={() => onSelectAgent(selectedAgent === agent.id ? null : agent.id)}
              >
                <div className="agent-item-header">
                  <span className="agent-id">{agent.id}</span>
                  <span className={`agent-status-badge ${agent.status}`}>
                    {getStatusBadge(agent.status)}
                  </span>
                </div>
                <div className="agent-item-details">
                  <span className="detail">Tasks: {agent.completedTasks}</span>
                  <span className="detail">Success: {Math.round(agent.successRate)}%</span>
                </div>
                {agent.currentActivity && (
                  <div className="agent-current-activity">
                    {agent.currentActivity.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/**
 * Activity Feed Panel
 */
interface ActivityFeedPanelProps {
  feed: ActivityFeedItem[];
}

const ActivityFeedPanel: React.FC<ActivityFeedPanelProps> = ({ feed }) => {
  return (
    <div className="activity-feed-panel">
      <h2>Activity Feed</h2>
      <div className="activity-list">
        {feed.length === 0 ? (
          <div className="empty-feed">
            <p>No activities yet. Start the factory stream to begin.</p>
          </div>
        ) : (
          feed.map(item => (
            <ActivityFeedItem key={item.id} item={item} />
          ))
        )}
      </div>
    </div>
  );
};

/**
 * Individual Activity Feed Item
 */
const ActivityFeedItem: React.FC<{ item: ActivityFeedItem }> = ({ item }) => {
  const timeAgo = getTimeAgo(item.timestamp);

  return (
    <div className={`activity-item activity-${item.status}`}>
      <div className="activity-icon">{item.icon || '⚡'}</div>
      <div className="activity-content">
        <div className="activity-header">
          <span className="activity-title">{item.title}</span>
          <span className="activity-agent">{item.agent}</span>
        </div>
        <div className="activity-description">{item.description}</div>
        {item.matchCount !== undefined && (
          <div className="activity-details">
            <span className="detail-badge">🔗 {item.matchCount} matches</span>
            {item.confidence && (
              <span className={`confidence-badge confidence-${Math.round(item.confidence / 25)}`}>
                {Math.round(item.confidence)}% confidence
              </span>
            )}
          </div>
        )}
        <div className="activity-time">{timeAgo}</div>
      </div>
    </div>
  );
};

/**
 * Helper: Get status badge text
 */
function getStatusBadge(status: AgentStatus): string {
  const badges: Record<AgentStatus, string> = {
    [AgentStatus.IDLE]: '💤 Idle',
    [AgentStatus.PROCESSING]: '⚙️ Processing',
    [AgentStatus.ANALYZING]: '🔬 Analyzing',
    [AgentStatus.MATCHING]: '🔍 Matching',
    [AgentStatus.ERROR]: '❌ Error',
    [AgentStatus.COMPLETE]: '✅ Complete'
  };
  return badges[status] || 'Unknown';
}

/**
 * Helper: Format time ago
 */
function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 5) return 'Just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export default AgentSwarmMonitor;
