import { ToolDecorator as Tool, Widget, ExecutionContext, z } from '@nitrostack/core';
import { SwarmRegistry } from '../orchestrator/swarm-registry.js';

export class ProfilerTools {
  @Tool({
    name: 'get_waste_streams',
    description: 'Get classified waste streams for a specific factory, including material category, volume, contamination level, and reuse potential.',
    inputSchema: z.object({
      factoryId: z.string().describe('Factory ID to get waste profile for'),
    }),
  })
  @Widget('waste-profiles')
  async getWasteStreams(input: any, ctx: ExecutionContext) {
    const factory = SwarmRegistry.stateManager.getFactory(input.factoryId);
    const wasteStreams = SwarmRegistry.stateManager.getWasteProfile(input.factoryId);
    return {
      factoryId: input.factoryId,
      factoryName: factory?.name ?? 'Unknown',
      wasteStreams,
      totalStreams: wasteStreams.length,
    };
  }

  @Tool({
    name: 'get_all_waste_streams',
    description: 'Get all classified waste streams across the entire industrial cluster.',
    inputSchema: z.object({}),
  })
  @Widget('waste-profiles')
  async getAllWasteStreams(_input: any, ctx: ExecutionContext) {
    const wasteStreams = SwarmRegistry.stateManager.getAllWasteStreams();
    return { wasteStreams, total: wasteStreams.length };
  }
}
