import { ToolDecorator as Tool, Widget, Injectable, ExecutionContext, z } from '@nitrostack/core';
import { stateManager, clerkAgent, _sentinel } from './bootstrap.js';

@Injectable()
export class ComplianceTools {
  @Tool({
    name: 'get-compliance-report',
    description: 'Retrieve the SPCB Annual Environmental Statement report for a specific factory.',
    inputSchema: z.object({
      factoryId: z.string().describe('The ID of the factory')
    })
  })
  @Widget('compliance-dashboard')
  public async getComplianceReport(args: { factoryId: string }, ctx: ExecutionContext) {
    ctx.logger.info(`[SymbioForge] Retrieving compliance report for: ${args.factoryId}`);
    const report = await clerkAgent.generateComplianceReport(args.factoryId);
    const factory = stateManager.getFactory(args.factoryId);
    if (!report || !factory) {
      return { success: false, message: `Factory with ID "${args.factoryId}" not found.` };
    }
    return { success: true, factory, complianceReport: report, widgetUri: 'ui://compliance-dashboard' };
  }

  @Tool({
    name: 'trigger-compliance-check',
    description: 'Forces Sentinel to run its periodic compliance deadline check.',
    inputSchema: z.object({})
  })
  public async triggerComplianceCheck(args: {}, ctx: ExecutionContext) {
    ctx.logger.info(`[SymbioForge] Running periodic compliance check...`);
    _sentinel.checkComplianceDeadlines();
    return { success: true, message: 'Compliance check initiated across cluster.' };
  }
}
