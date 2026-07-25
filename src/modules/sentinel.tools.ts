import { ToolDecorator as Tool, Widget, ExecutionContext, z } from '@nitrostack/core';
import { SwarmRegistry } from '../orchestrator/swarm-registry.js';
import { EventType } from '../types/events.types.js';

export class SentinelTools {
  @Tool({
    name: 'get_ecosystem_health',
    description: 'Get the current health status of the entire industrial ecosystem — circular score, factory count, active matches, CO2 savings, financial impact, and more.',
    inputSchema: z.object({}),
  })
  @Widget('carbon-dashboard')
  async getEcosystemHealth(_input: any, ctx: ExecutionContext) {
    return SwarmRegistry.stateManager.getClusterMetrics();
  }

  @Tool({
    name: 'get_activity_log',
    description: 'Get the real-time activity log of all 8 autonomous agents — what each agent is doing, when, and what events were triggered.',
    inputSchema: z.object({
      limit: z.number().optional().describe('Number of log entries to return (default: 50)'),
    }),
  })
  @Widget('agent-swarm-monitor')
  async getActivityLog(input: any, ctx: ExecutionContext) {
    const log = SwarmRegistry.eventBus.getActivityLog(input.limit ?? 50);
    return { activityLog: log, total: log.length };
  }

  @Tool({
    name: 'simulate_factory_shutdown',
    description: 'Simulate a factory shutdown to demonstrate the Sentinel agent\'s self-healing capability. The ecosystem will automatically find replacement connections.',
    inputSchema: z.object({
      factoryId: z.string().describe('Factory ID to simulate shutdown for'),
      reason: z.string().optional().describe('Reason for shutdown'),
    }),
  })
  @Widget('agent-swarm-monitor')
  async simulateFactoryShutdown(input: any, ctx: ExecutionContext) {
    ctx.logger.info('Simulating factory shutdown', { factoryId: input.factoryId });

    const factory = SwarmRegistry.stateManager.getFactory(input.factoryId);
    if (!factory) {
      return { error: `Factory ${input.factoryId} not found` };
    }

    SwarmRegistry.stateManager.updateFactory(input.factoryId, { isActive: false });

    await SwarmRegistry.eventBus.emit(EventType.FACTORY_SHUTDOWN, {
      factoryId: input.factoryId,
      reason: input.reason ?? 'Simulated shutdown for demo',
      durationDays: null,
    }, 'SentinelTools');

    return {
      message: `Factory "${factory.name}" shutdown simulated. Sentinel agent will detect broken chains and re-trigger Matchmaker for self-healing.`,
      factoryId: input.factoryId,
    };
  }
}
