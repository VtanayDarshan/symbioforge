import { ToolDecorator as Tool, Widget, ExecutionContext, z } from '@nitrostack/core';
import { SwarmRegistry } from '../orchestrator/swarm-registry.js';

export class InventorTools {
  @Tool({
    name: 'get_product_concepts',
    description: 'Get all AI-generated novel product concepts created from combinations of available waste streams in the cluster.',
    inputSchema: z.object({
      minFeasibility: z.number().optional().describe('Minimum feasibility score filter (0-100)'),
    }),
  })
  @Widget('product-cards')
  async getProductConcepts(input: any, ctx: ExecutionContext) {
    let products = SwarmRegistry.stateManager.getAllProducts();
    if (input.minFeasibility) {
      products = products.filter((p) => p.feasibilityScore >= input.minFeasibility);
    }
    products.sort((a, b) => b.feasibilityScore - a.feasibilityScore);
    return { products, total: products.length };
  }

  @Tool({
    name: 'get_product_details',
    description: 'Get detailed information about a specific AI-generated product concept including source waste streams, manufacturing process, and market analysis.',
    inputSchema: z.object({
      productId: z.string().describe('Product concept ID'),
    }),
  })
  @Widget('product-cards')
  async getProductDetails(input: any, ctx: ExecutionContext) {
    const product = SwarmRegistry.stateManager.getProduct(input.productId);
    if (!product) {
      return { error: `Product ${input.productId} not found` };
    }
    return { product };
  }
}
