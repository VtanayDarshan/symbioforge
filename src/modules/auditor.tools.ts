import { ToolDecorator as Tool, Widget, ExecutionContext, z } from '@nitrostack/core';
import { SwarmRegistry } from '../orchestrator/swarm-registry.js';

export class AuditorTools {
  @Tool({
    name: 'get_ranked_opportunities',
    description: 'Get all opportunities (symbiotic matches + product concepts) ranked by composite impact score combining environmental benefit, financial upside, and implementation feasibility.',
    inputSchema: z.object({
      limit: z.number().optional().describe('Max number of opportunities to return (default: all)'),
    }),
  })
  @Widget('opportunity-feed')
  async getRankedOpportunities(input: any, ctx: ExecutionContext) {
    const rankings = SwarmRegistry.stateManager.getRankings(input.limit);
    return { rankings, total: rankings.length };
  }

  @Tool({
    name: 'get_opportunity_details',
    description: 'Get detailed impact analysis for a specific opportunity including environmental metrics, financial projections, and implementation timeline.',
    inputSchema: z.object({
      opportunityId: z.string().describe('Opportunity ranking ID'),
    }),
  })
  @Widget('opportunity-feed')
  async getOpportunityDetails(input: any, ctx: ExecutionContext) {
    const rankings = SwarmRegistry.stateManager.getRankings();
    const ranking = rankings.find((r) => r.id === input.opportunityId);
    if (!ranking) {
      return { error: `Opportunity ${input.opportunityId} not found` };
    }
    return { ranking };
  }
}
