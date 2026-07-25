import { ResourceDecorator as Resource, Widget, ExecutionContext } from '@nitrostack/core';
import { SwarmRegistry } from '../orchestrator/swarm-registry.js';

export class ClusterResources {
  @Resource({
    uri: 'symbioforge://cluster/state',
    name: 'Cluster State',
    description: 'Complete state of the SymbioForge industrial ecosystem — all factories, waste profiles, symbiotic matches, product concepts, rankings, pathways, and metrics.',
    mimeType: 'application/json',
  })
  async getClusterState(uri: string, ctx: ExecutionContext) {
    ctx.logger.info('Fetching full cluster state');
    const state = SwarmRegistry.stateManager.getFullState();
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(state, null, 2),
      }],
    };
  }

  @Resource({
    uri: 'symbioforge://cluster/metrics',
    name: 'Cluster Metrics',
    description: 'Key metrics for the industrial cluster — circular economy score, CO2 saved, landfill diverted, financial impact.',
    mimeType: 'application/json',
  })
  @Widget('carbon-dashboard')
  async getClusterMetrics(uri: string, ctx: ExecutionContext) {
    const metrics = SwarmRegistry.stateManager.getClusterMetrics();
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(metrics, null, 2),
      }],
    };
  }

  @Resource({
    uri: 'symbioforge://cluster/activity',
    name: 'Agent Activity Log',
    description: 'Real-time activity log of all 8 autonomous agents — shows the swarm thinking and acting.',
    mimeType: 'application/json',
  })
  @Widget('agent-swarm-monitor')
  async getActivityLog(uri: string, ctx: ExecutionContext) {
    const log = SwarmRegistry.eventBus.getActivityLog(100);
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify({ activityLog: log, total: log.length }, null, 2),
      }],
    };
  }
}
