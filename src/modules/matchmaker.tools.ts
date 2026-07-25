import { ToolDecorator as Tool, Widget, ExecutionContext, z } from '@nitrostack/core';
import { SwarmRegistry } from '../orchestrator/swarm-registry.js';

export class MatchmakerTools {
  @Tool({
    name: 'get_symbiosis_graph',
    description: 'Get the living symbiosis graph — all discovered waste-to-resource connections between factories in the cluster, ranked by composite score.',
    inputSchema: z.object({
      minScore: z.number().optional().describe('Minimum composite score filter (0-100)'),
    }),
  })
  @Widget('ecosystem-map')
  async getSymbiosisGraph(input: any, ctx: ExecutionContext) {
    let matches = SwarmRegistry.stateManager.getAllMatches();
    if (input.minScore) {
      matches = matches.filter((m) => m.compositeScore >= input.minScore);
    }
    matches.sort((a, b) => b.compositeScore - a.compositeScore);
    return { matches, total: matches.length };
  }

  @Tool({
    name: 'get_match_details',
    description: 'Get detailed information about a specific symbiotic match including scoring breakdown and factory details.',
    inputSchema: z.object({
      matchId: z.string().describe('Match ID'),
    }),
  })
  @Widget('pathway-viewer')
  async getMatchDetails(input: any, ctx: ExecutionContext) {
    const match = SwarmRegistry.stateManager.getMatch(input.matchId);
    if (!match) {
      return { error: `Match ${input.matchId} not found` };
    }
    const sourceFactory = SwarmRegistry.stateManager.getFactory(match.sourceFactoryId);
    const targetFactory = SwarmRegistry.stateManager.getFactory(match.targetFactoryId);
    return { match, sourceFactory, targetFactory };
  }
}
