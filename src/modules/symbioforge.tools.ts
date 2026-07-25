import { ToolDecorator as Tool, ResourceDecorator as Resource, Widget, Injectable, ExecutionContext, z } from '@nitrostack/core';
import { StateManager } from '../orchestrator/state-manager.js';
import { ClerkAgent } from '../agents/clerk.agent.js';
import { ProfilerAgent } from '../agents/profiler.agent.js';
import { MatchmakerAgent } from '../agents/matchmaker.agent.js';
import { InventorAgent } from '../agents/inventor.agent.js';
import { AuditorAgent } from '../agents/auditor.agent.js';
import { ArchitectAgent } from '../agents/architect.agent.js';
import { SentinelAgent } from '../agents/sentinel.agent.js';
import { AgentChain } from '../orchestrator/agent-chain.js';
import { Scheduler } from '../orchestrator/scheduler.js';
import { EventBus } from '../orchestrator/event-bus.js';

// ── Bootstrap: instantiate all 8 agents + orchestrators so event listeners register ──
const stateManager = StateManager.getInstance();
const clerkAgent = new ClerkAgent();
// Instantiate remaining agents — their constructors call setupListeners() to subscribe
new ProfilerAgent();
new MatchmakerAgent();
new InventorAgent();
new AuditorAgent();
new ArchitectAgent();
new SentinelAgent();
// AgentChain provides the cross-agent logging narrative layer
AgentChain.getInstance();
const scheduler = Scheduler.getInstance();
const eventBus = EventBus.getInstance();

// Start scheduler by default
scheduler.start();

@Injectable()
export class SymbioForgeTools {

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
      id: string;
      name: string;
      industryType: string;
      address: string;
      lat: number;
      lng: number;
      productionCapacity: string;
      rawMaterials: string[];
      declaredWastes: string[];
    },
    ctx: ExecutionContext
  ) {
    ctx.logger.info(`[SymbioForge] Registering factory: ${args.name}`);
    
    const { factory, reportPath } = await clerkAgent.registerFactory({
      id: args.id,
      name: args.name,
      industryType: args.industryType,
      location: {
        lat: args.lat,
        lng: args.lng,
        address: args.address
      },
      productionCapacity: args.productionCapacity,
      rawMaterials: args.rawMaterials,
      declaredWastes: args.declaredWastes,
      complianceStatus: 'filed'
    });

    return {
      success: true,
      message: `Factory "${factory.name}" registered successfully. SPCB compliance report generated at ${reportPath}.`,
      factory,
      complianceReportPath: reportPath,
      widgetUri: 'ui://compliance-dashboard'
    };
  }

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
    return {
      success: true,
      factory,
      complianceReport: report,
      widgetUri: 'ui://compliance-dashboard'
    };
  }

  @Tool({
    name: 'get-cluster-state',
    description: 'Retrieve the live state of the industrial cluster, including factories, matches, products, and activity logs.',
    inputSchema: z.object({})
  })
  @Widget('agent-swarm-monitor')
  public async getClusterState(args: any, ctx: ExecutionContext) {
    ctx.logger.info('[SymbioForge] Retrieving live cluster state');
    const state = stateManager.getState();
    return {
      success: true,
      circularScore: state.circularScore,
      totalCo2Avoided: state.totalCo2Avoided,
      totalLandfillDiverted: state.totalLandfillDiverted,
      totalWaterSaved: state.totalWaterSaved,
      totalFinancialValue: state.totalFinancialValue,
      factoriesCount: state.factories.length,
      matchesCount: state.matches.length,
      productsCount: state.products.length,
      blueprintsCount: state.blueprints.length,
      logsCount: state.activityLogs.length,
      activityLogs: state.activityLogs,
      widgetUri: 'ui://agent-swarm-monitor'
    };
  }

  @Tool({
    name: 'control-swarm',
    description: 'Start, stop, or reset the autonomous agent swarm and scheduler.',
    inputSchema: z.object({
      action: z.enum(['start', 'stop', 'reset']).describe('The action to perform')
    })
  })
  @Widget('agent-swarm-monitor')
  public async controlSwarm(args: { action: 'start' | 'stop' | 'reset' }, ctx: ExecutionContext) {
    ctx.logger.info(`[SymbioForge] Swarm control action: ${args.action}`);
    if (args.action === 'start') {
      stateManager.setSwarmActive(true);
      scheduler.start();
      return { success: true, message: 'Swarm and scheduler started.', widgetUri: 'ui://agent-swarm-monitor' };
    } else if (args.action === 'stop') {
      stateManager.setSwarmActive(false);
      scheduler.stop();
      return { success: true, message: 'Swarm and scheduler stopped.', widgetUri: 'ui://agent-swarm-monitor' };
    } else {
      stateManager.resetState();
      scheduler.reset();
      return { success: true, message: 'Swarm and cluster state reset to initial values.', widgetUri: 'ui://agent-swarm-monitor' };
    }
  }

  @Tool({
    name: 'trigger-disruption',
    description: 'Simulate a factory shutdown or volume change to test the Sentinel self-healing capabilities.',
    inputSchema: z.object({
      factoryId: z.string().describe('The ID of the factory to halt'),
      volume: z.number().optional().describe('New waste volume (if simulating volume spike/drop instead of halt)')
    })
  })
  @Widget('agent-swarm-monitor')
  public async triggerDisruption(args: { factoryId: string, volume?: number }, ctx: ExecutionContext) {
    ctx.logger.info(`[SymbioForge] Triggering disruption for: ${args.factoryId}`);
    const factory = stateManager.getFactory(args.factoryId);
    if (!factory) {
      return { success: false, message: `Factory with ID "${args.factoryId}" not found.` };
    }

    if (args.volume !== undefined) {
      stateManager.addLog('System', `MANUAL ALERT: Volume update injected for ${factory.name} (${args.volume} kg)`, 'info');
      eventBus.publish({
        type: 'VOLUME_UPDATE',
        payload: { factoryId: args.factoryId, currentVolume: args.volume }
      });
      return {
        success: true,
        message: `Volume update (${args.volume} kg) sent to Sentinel.`,
        widgetUri: 'ui://agent-swarm-monitor'
      };
    }

    stateManager.addLog('Sentinel', `MANUAL ALERT: Factory "${factory.name}" reported temporary production halt!`, 'warning');
    
    // Break matches involving this factory
    const matches = stateManager.getMatches();
    const affectedMatches = matches.filter(m => m.sourceFactoryId === args.factoryId || m.targetFactoryId === args.factoryId);
    
    if (affectedMatches.length > 0) {
      stateManager.addLog('Sentinel', `Impact: ${affectedMatches.length} symbiotic chains affected. Re-triggering Matchmaker...`, 'warning');
      
      factory.complianceStatus = 'pending';
      stateManager.recalculateMetrics();

      eventBus.publish({
        type: 'SENTINEL_TRIGGERED',
        payload: { reason: `manual_halt_${args.factoryId}` }
      });

      return {
        success: true,
        message: `Disruption triggered. Sentinel is self-healing ${affectedMatches.length} affected chains.`,
        widgetUri: 'ui://agent-swarm-monitor'
      };
    }

    return {
      success: true,
      message: `Disruption triggered for "${factory.name}", but no active symbiotic chains were affected.`,
      widgetUri: 'ui://agent-swarm-monitor'
    };
  }

  @Tool({
    name: 'trigger-compliance-check',
    description: 'Forces Sentinel to run its periodic compliance deadline check.',
    inputSchema: z.object({})
  })
  public async triggerComplianceCheck(args: {}, ctx: ExecutionContext) {
    ctx.logger.info(`[SymbioForge] Running periodic compliance check...`);
    // Publish COMPLIANCE_DUE scan event — the already-running SentinelAgent handles it
    // We call checkComplianceDeadlines via a lightweight in-process sentinel instance
    const { SentinelAgent } = await import('../agents/sentinel.agent.js');
    const sentinel = new SentinelAgent();
    sentinel.checkComplianceDeadlines();
    return { success: true, message: 'Compliance deadline check initiated across cluster.', widgetUri: 'ui://agent-swarm-monitor' };
  }

  @Tool({
    name: 'get-ecosystem-map',
    description: 'Retrieve nodes and edges representing factories and symbiotic waste flows for the ecosystem map.',
    inputSchema: z.object({})
  })
  @Widget('ecosystem-map')
  public async getEcosystemMap(args: any, ctx: ExecutionContext) {
    ctx.logger.info('[SymbioForge] Retrieving ecosystem map data');
    const state = stateManager.getState();
    
    const nodes = state.factories.map(f => ({
      id: f.id,
      name: f.name,
      industryType: f.industryType,
      lat: f.location.lat,
      lng: f.location.lng,
      co2Avoided: f.co2Avoided,
      savingsEarned: f.savingsEarned,
      complianceStatus: f.complianceStatus
    }));

    const edges = state.matches.map(m => ({
      id: m.id,
      source: m.sourceFactoryId,
      target: m.targetFactoryId,
      wasteStreamName: m.wasteStreamName,
      compatibilityScore: m.compatibilityScore,
      volumeTonsPerYear: m.volumeTonsPerYear,
      co2SavedTonsPerYear: m.co2SavedTonsPerYear,
      status: m.status
    }));

    return {
      success: true,
      circularScore: state.circularScore,
      nodes,
      edges,
      widgetUri: 'ui://ecosystem-map'
    };
  }

  @Tool({
    name: 'get-opportunity-feed',
    description: 'Retrieve a ranked feed of symbiotic matches and product concepts.',
    inputSchema: z.object({})
  })
  @Widget('opportunity-feed')
  public async getOpportunityFeed(args: any, ctx: ExecutionContext) {
    ctx.logger.info('[SymbioForge] Retrieving opportunity feed');
    const state = stateManager.getState();

    const matches = state.matches.map(m => ({
      id: m.id,
      type: 'match' as const,
      title: `${m.wasteStreamName} Symbiosis`,
      source: m.sourceFactoryName,
      target: m.targetFactoryName,
      score: m.compatibilityScore,
      co2Saved: m.co2SavedTonsPerYear,
      savings: m.savingsInrPerYear,
      status: m.status
    }));

    const products = state.products.map(p => ({
      id: p.id,
      type: 'product' as const,
      title: p.name,
      description: p.description,
      score: p.feasibilityScore,
      co2Saved: p.co2SavedTonsPerYear,
      savings: p.revenuePotentialInrPerYear,
      status: p.status
    }));

    const feed = [...matches, ...products].sort((a, b) => b.score - a.score);

    return {
      success: true,
      feed,
      widgetUri: 'ui://opportunity-feed'
    };
  }

  @Tool({
    name: 'get-product-concepts',
    description: 'Retrieve AI-invented product concepts generated from waste streams.',
    inputSchema: z.object({})
  })
  @Widget('product-cards')
  public async getProductConcepts(args: any, ctx: ExecutionContext) {
    ctx.logger.info('[SymbioForge] Retrieving product concepts');
    const state = stateManager.getState();
    return {
      success: true,
      products: state.products,
      widgetUri: 'ui://product-cards'
    };
  }

  @Tool({
    name: 'get-waste-profiles',
    description: 'Retrieve factories and their detailed classified waste streams.',
    inputSchema: z.object({})
  })
  @Widget('waste-profiles')
  public async getWasteProfiles(args: any, ctx: ExecutionContext) {
    ctx.logger.info('[SymbioForge] Retrieving waste profiles');
    const state = stateManager.getState();
    return {
      success: true,
      factories: state.factories,
      widgetUri: 'ui://waste-profiles'
    };
  }

  @Tool({
    name: 'get-pathway',
    description: 'Retrieve the step-by-step manufacturing pathway/blueprint for a specific opportunity.',
    inputSchema: z.object({
      opportunityId: z.string().describe('The ID of the symbiotic match or product concept')
    })
  })
  @Widget('pathway-viewer')
  public async getPathway(args: { opportunityId: string }, ctx: ExecutionContext) {
    ctx.logger.info(`[SymbioForge] Retrieving pathway for opportunity: ${args.opportunityId}`);
    const state = stateManager.getState();
    const blueprint = state.blueprints.find(b => b.opportunityId === args.opportunityId);
    
    if (!blueprint) {
      return {
        success: false,
        message: `No blueprint found for opportunity ID "${args.opportunityId}".`
      };
    }

    return {
      success: true,
      blueprint,
      widgetUri: 'ui://pathway-viewer'
    };
  }

  @Tool({
    name: 'get-carbon-metrics',
    description: 'Retrieve cluster-wide environmental and financial impact metrics.',
    inputSchema: z.object({})
  })
  @Widget('carbon-dashboard')
  public async getCarbonMetrics(args: any, ctx: ExecutionContext) {
    ctx.logger.info('[SymbioForge] Retrieving carbon and impact metrics');
    const state = stateManager.getState();
    return {
      success: true,
      circularScore: state.circularScore,
      totalCo2Avoided: state.totalCo2Avoided,
      totalLandfillDiverted: state.totalLandfillDiverted,
      totalWaterSaved: state.totalWaterSaved,
      totalFinancialValue: state.totalFinancialValue,
      widgetUri: 'ui://carbon-dashboard'
    };
  }

  @Resource({
    uri: 'symbioforge://cluster-state',
    name: 'Live SymbioForge Cluster State',
    description: 'Exposes the complete live state of the industrial cluster, including factories, matches, products, and activity logs.',
    mimeType: 'application/json'
  })
  public async getClusterStateResource(uri: string, ctx: ExecutionContext) {
    ctx.logger.info('[SymbioForge] Exposing cluster state resource');
    return {
      contents: [{
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(stateManager.getState(), null, 2)
      }]
    };
  }
}
