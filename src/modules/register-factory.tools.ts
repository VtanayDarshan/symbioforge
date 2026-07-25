import { ToolDecorator as Tool, Widget, Injectable, ExecutionContext, z } from '@nitrostack/core';
import { clerkAgent } from './bootstrap.js';

@Injectable()
export class RegisterFactoryTools {
  @Tool({
    name: 'register-factory',
    description: 'Register a new factory with its declared waste streams and generate its SPCB compliance report.',
    inputSchema: z.object({
      id: z.string().describe('Unique factory ID (e.g., fact_16)'),
      name: z.string().describe('Name of the factory'),
      industryType: z.string().describe('Type of industry (e.g., Textile Manufacturing)'),
      address: z.string().describe('Physical address'),
      lat: z.number().describe('Latitude coordinate'),
      lng: z.number().describe('Longitude coordinate'),
      productionCapacity: z.string().describe('Production capacity (e.g., 5 tons/day fabric)'),
      rawMaterials: z.array(z.string()).describe('List of raw materials consumed'),
      declaredWastes: z.array(z.string()).describe('List of declared waste streams')
    })
  })
  @Widget('compliance-dashboard')
  public async registerFactory(
    args: {
      id: string; name: string; industryType: string; address: string;
      lat: number; lng: number; productionCapacity: string;
      rawMaterials: string[]; declaredWastes: string[];
    },
    ctx: ExecutionContext
  ) {
    ctx.logger.info(`[SymbioForge] Registering factory: ${args.name}`);
    const { factory, reportPath } = await clerkAgent.registerFactory({
      id: args.id, name: args.name, industryType: args.industryType,
      location: { lat: args.lat, lng: args.lng, address: args.address },
      productionCapacity: args.productionCapacity,
      rawMaterials: args.rawMaterials, declaredWastes: args.declaredWastes,
      complianceStatus: 'filed'
    });
    return {
      success: true,
      message: `Factory "${factory.name}" registered successfully. SPCB compliance report generated at ${reportPath}.`,
      factory, complianceReportPath: reportPath, widgetUri: 'ui://compliance-dashboard'
    };
  }
}
