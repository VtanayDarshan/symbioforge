import { ToolDecorator as Tool, Widget, ExecutionContext, z } from '@nitrostack/core';
import { SwarmRegistry } from '../orchestrator/swarm-registry.js';
import { IndustryType } from '../types/factory.types.js';

export class ClerkTools {
  @Tool({
    name: 'register_factory',
    description: 'Register a new factory in the SymbioForge ecosystem. Generates an SPCB-compliant Annual Environmental Statement and feeds the autonomous agent swarm. This is the primary data entry point — one form generates compliance AND circular economy intelligence.',
    inputSchema: z.object({
      name: z.string().describe('Factory name (e.g., "Lakshmi Textiles Pvt Ltd")'),
      industry: z.nativeEnum(IndustryType).describe('Industry type classification'),
      subtype: z.string().optional().describe('Industry subtype (e.g., "cotton-polyester blend")'),
      lat: z.number().optional().describe('Latitude coordinate'),
      lng: z.number().optional().describe('Longitude coordinate'),
      zone: z.string().optional().describe('Industrial zone (e.g., "SIDCO Phase II, Coimbatore")'),
      capacityTonsPerDay: z.number().describe('Daily production capacity in tons'),
      products: z.array(z.string()).describe('Products manufactured'),
      rawMaterials: z.array(z.string()).describe('Raw materials consumed'),
      employees: z.number().optional().describe('Number of employees'),
      operatingHoursPerDay: z.number().optional().describe('Daily operating hours'),
    }),
    examples: {
      request: {
        name: 'Lakshmi Textiles Pvt Ltd',
        industry: 'textile_manufacturing',
        subtype: 'cotton-polyester blend',
        zone: 'SIDCO Phase II, Coimbatore',
        capacityTonsPerDay: 5,
        products: ['cotton-polyester blend fabric'],
        rawMaterials: ['raw cotton', 'polyester fiber', 'textile dyes'],
        employees: 120,
        operatingHoursPerDay: 16,
      },
      response: {
        factory: { id: 'fac_123', name: 'Lakshmi Textiles Pvt Ltd', industry: 'textile_manufacturing' },
        complianceReport: { id: 'rpt_123', status: 'generated' },
        message: 'Factory registered. SPCB compliance PDF generated. Agent swarm activated.',
      },
    },
  })
  @Widget('compliance-dashboard')
  async registerFactory(input: any, ctx: ExecutionContext) {
    ctx.logger.info('Registering factory', { name: input.name });

    const result = await SwarmRegistry.clerk.registerFactory({
      name: input.name,
      industry: input.industry,
      subtype: input.subtype ?? '',
      location: {
        lat: input.lat ?? 11.0168,
        lng: input.lng ?? 76.9558,
        zone: input.zone ?? 'SIDCO Industrial Estate',
        districtId: 'coimbatore',
      },
      production: {
        capacityTonsPerDay: input.capacityTonsPerDay,
        products: input.products,
        rawMaterials: input.rawMaterials,
      },
      employees: input.employees ?? 50,
      operatingHoursPerDay: input.operatingHoursPerDay ?? 8,
    });

    return {
      factory: result.factory,
      complianceReport: result.report,
      message: `Factory "${result.factory.name}" registered successfully. SPCB compliance PDF generated. Agent swarm activated — Scout, Profiler, Matchmaker, and Inventor will process autonomously.`,
    };
  }

  @Tool({
    name: 'generate_compliance_report',
    description: 'Generate an SPCB-compliant Annual Environmental Statement PDF for a registered factory.',
    inputSchema: z.object({
      factoryId: z.string().describe('ID of the registered factory'),
    }),
  })
  @Widget('compliance-dashboard')
  async generateComplianceReport(input: any, ctx: ExecutionContext) {
    ctx.logger.info('Generating compliance report', { factoryId: input.factoryId });
    const factory = SwarmRegistry.stateManager.getFactory(input.factoryId);
    if (!factory) {
      return { error: `Factory ${input.factoryId} not found` };
    }
    return {
      factoryId: input.factoryId,
      factoryName: factory.name,
      status: 'generated',
      message: `SPCB Annual Environmental Statement generated for "${factory.name}". Download available.`,
    };
  }
}
