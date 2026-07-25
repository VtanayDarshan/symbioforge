import { EventBus } from './event-bus.js';
import { StateManager } from './state-manager.js';
import { AgentChain } from './agent-chain.js';
import { Scheduler } from './scheduler.js';
import { ClerkAgent } from '../agents/clerk.agent.js';
import { ScoutAgent } from '../agents/scout.agent.js';
import { ProfilerAgent } from '../agents/profiler.agent.js';
import { MatchmakerAgent } from '../agents/matchmaker.agent.js';
import { InventorAgent } from '../agents/inventor.agent.js';
import { AuditorAgent } from '../agents/auditor.agent.js';
import { ArchitectAgent } from '../agents/architect.agent.js';
import { SentinelAgent } from '../agents/sentinel.agent.js';

class SwarmRegistryClass {
  private initialized = false;

  eventBus!: EventBus;
  stateManager!: StateManager;
  agentChain!: AgentChain;
  scheduler!: Scheduler;

  clerk!: ClerkAgent;
  scout!: ScoutAgent;
  profiler!: ProfilerAgent;
  matchmaker!: MatchmakerAgent;
  inventor!: InventorAgent;
  auditor!: AuditorAgent;
  architect!: ArchitectAgent;
  sentinel!: SentinelAgent;

  initialize(): void {
    if (this.initialized) return;

    this.eventBus = new EventBus();
    this.stateManager = new StateManager(this.eventBus);
    this.agentChain = new AgentChain(this.eventBus);
    this.scheduler = new Scheduler(this.eventBus, this.stateManager);

    this.clerk = new ClerkAgent(this.eventBus, this.stateManager);
    this.scout = new ScoutAgent(this.eventBus, this.stateManager);
    this.profiler = new ProfilerAgent(this.eventBus, this.stateManager);
    this.matchmaker = new MatchmakerAgent(this.eventBus, this.stateManager);
    this.inventor = new InventorAgent(this.eventBus, this.stateManager);
    this.auditor = new AuditorAgent(this.eventBus, this.stateManager);
    this.architect = new ArchitectAgent(this.eventBus, this.stateManager);
    this.sentinel = new SentinelAgent(this.eventBus, this.stateManager);

    this.agentChain.setupDefaultChain({
      clerk: this.clerk,
      scout: this.scout,
      profiler: this.profiler,
      matchmaker: this.matchmaker,
      inventor: this.inventor,
      auditor: this.auditor,
      architect: this.architect,
      sentinel: this.sentinel,
    });

    this.scheduler.setScoutCallback(async () => {
      const factory = await this.scout.checkFeed();
      if (factory) {
        await this.clerk.registerFactory(factory);
      }
    });

    this.scheduler.setSentinelCallback(async () => {
      await this.sentinel.runHealthCheck();
    });

    this.initialized = true;
    this.eventBus.addActivityLog('System', '⚡', 'SymbioForge swarm initialized — 8 agents ready');
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const SwarmRegistry = new SwarmRegistryClass();
