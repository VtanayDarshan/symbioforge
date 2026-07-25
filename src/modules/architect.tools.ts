import { ToolDecorator as Tool, Widget, ExecutionContext, z } from '@nitrostack/core';
import { SwarmRegistry } from '../orchestrator/swarm-registry.js';

export class ArchitectTools {
  @Tool({
    name: 'get_blueprints',
    description: 'Get all manufacturing pathway blueprints designed by the Architect agent — complete step-by-step implementation plans for symbiotic matches and novel products.',
    inputSchema: z.object({}),
  })
  @Widget('pathway-viewer')
  async getBlueprints(_input: any, ctx: ExecutionContext) {
    const pathways = SwarmRegistry.stateManager.getAllPathways();
    return { pathways, total: pathways.length };
  }

  @Tool({
    name: 'get_blueprint_details',
    description: 'Get detailed manufacturing blueprint for a specific opportunity — step-by-step process, equipment specs, costs, timeline, and regulatory notes.',
    inputSchema: z.object({
      pathwayId: z.string().describe('Manufacturing pathway ID'),
    }),
  })
  @Widget('pathway-viewer')
  async getBlueprintDetails(input: any, ctx: ExecutionContext) {
    const pathway = SwarmRegistry.stateManager.getPathway(input.pathwayId);
    if (!pathway) {
      return { error: `Pathway ${input.pathwayId} not found` };
    }
    return { pathway };
  }
}
