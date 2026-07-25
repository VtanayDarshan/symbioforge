import { ToolDecorator as Tool, Widget, ExecutionContext, z } from '@nitrostack/core';
import { SwarmRegistry } from '../orchestrator/swarm-registry.js';

export class SwarmTools {
  @Tool({
    name: 'start_swarm',
    description: 'Start the autonomous agent swarm. Activates the Scout feed monitor and Sentinel ecosystem checks on continuous loops. The 8 agents will begin processing autonomously.',
    inputSchema: z.object({
      scoutIntervalMs: z.number().optional().describe('Scout feed check interval in ms (default: 30000)'),
      sentinelIntervalMs: z.number().optional().describe('Sentinel health check interval in ms (default: 60000)'),
    }),
  })
  @Widget('agent-swarm-monitor')
  async startSwarm(input: any, ctx: ExecutionContext) {
    if (input.scoutIntervalMs || input.sentinelIntervalMs) {
      SwarmRegistry.scheduler.updateConfig({
        scoutIntervalMs: input.scoutIntervalMs,
        sentinelIntervalMs: input.sentinelIntervalMs,
      });
    }
    SwarmRegistry.scheduler.start();
    return {
      status: 'running',
      message: 'Autonomous agent swarm started. Scout monitoring feed. Sentinel monitoring ecosystem.',
      config: SwarmRegistry.scheduler.getConfig(),
    };
  }

  @Tool({
    name: 'stop_swarm',
    description: 'Stop the autonomous agent swarm. Pauses all scheduled agent activities.',
    inputSchema: z.object({}),
  })
  async stopSwarm(_input: any, ctx: ExecutionContext) {
    SwarmRegistry.scheduler.stop();
    return { status: 'stopped', message: 'Agent swarm stopped.' };
  }

  @Tool({
    name: 'get_swarm_status',
    description: 'Get the current status of all 8 autonomous agents, the scheduler, and cluster-wide metrics. The complete picture of the SymbioForge ecosystem.',
    inputSchema: z.object({}),
  })
  @Widget('agent-swarm-monitor')
  async getSwarmStatus(_input: any, ctx: ExecutionContext) {
    return {
      swarmRunning: SwarmRegistry.scheduler.isRunning(),
      agentStatuses: SwarmRegistry.agentChain.getAgentStatuses(),
      clusterMetrics: SwarmRegistry.stateManager.getClusterMetrics(),
      schedulerConfig: SwarmRegistry.scheduler.getConfig(),
      recentActivity: SwarmRegistry.eventBus.getActivityLog(10),
    };
  }
}
