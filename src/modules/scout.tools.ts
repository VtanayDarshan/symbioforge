import { ToolDecorator as Tool, Widget, ExecutionContext, z } from '@nitrostack/core';
import { SwarmRegistry } from '../orchestrator/swarm-registry.js';

export class ScoutTools {
  @Tool({
    name: 'get_factories',
    description: 'List all factories registered in the SymbioForge ecosystem with their industry type and status.',
    inputSchema: z.object({
      activeOnly: z.boolean().optional().describe('If true, only return active factories'),
    }),
  })
  @Widget('ecosystem-map')
  async getFactories(input: any, ctx: ExecutionContext) {
    ctx.logger.info('Fetching factories');
    const factories = input.activeOnly
      ? SwarmRegistry.stateManager.getActiveFactories()
      : SwarmRegistry.stateManager.getAllFactories();
    return { factories, total: factories.length };
  }

  @Tool({
    name: 'get_factory_by_id',
    description: 'Get detailed information about a specific factory including its waste profile and active symbiotic connections.',
    inputSchema: z.object({
      factoryId: z.string().describe('Factory ID'),
    }),
  })
  @Widget('waste-profiles')
  async getFactoryById(input: any, ctx: ExecutionContext) {
    const factory = SwarmRegistry.stateManager.getFactory(input.factoryId);
    if (!factory) {
      return { error: `Factory ${input.factoryId} not found` };
    }
    const wasteProfile = SwarmRegistry.stateManager.getWasteProfile(input.factoryId);
    const matches = SwarmRegistry.stateManager.getAllMatches()
      .filter((m) => m.sourceFactoryId === input.factoryId || m.targetFactoryId === input.factoryId);
    return { factory, wasteProfile, activeMatches: matches };
  }

  @Tool({
    name: 'get_feed_status',
    description: 'Check the status of the simulated factory data feed — how many factories have been auto-discovered.',
    inputSchema: z.object({}),
  })
  async getFeedStatus(_input: any, ctx: ExecutionContext) {
    return SwarmRegistry.scout.getFeedStatus();
  }
}
