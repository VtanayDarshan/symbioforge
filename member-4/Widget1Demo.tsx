/**
 * Widget 1 Demo - Agent Swarm Monitor
 * Quick start example for using the Agent Swarm Monitor component
 */

import React from 'react';
import { AgentSwarmMonitor } from './src/components/AgentSwarmMonitor';
import './src/styles/agent-swarm-monitor.css';

/**
 * Demo Application
 * Shows Widget 1 in action with real-time agent monitoring
 */
export function Widget1Demo() {
  return (
    <AgentSwarmMonitor
      autoStart={true}
      title="Agent Swarm Monitor - Live Demo"
      showMetrics={true}
      showActivityFeed={true}
      showAgentPool={true}
    />
  );
}

export default Widget1Demo;
