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
import { Factory } from '../types/factory.types.js';
import { classifyWasteStreams } from '../core/waste-classifier.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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

    this.seedInitialFactories();

    this.initialized = true;
    this.eventBus.addActivityLog('System', '⚡', 'SymbioForge swarm initialized — 8 agents ready');
  }

  private seedInitialFactories(): void {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = dirname(__filename);
      const dataPath = join(__dirname, '..', 'data', 'factories-initial.json');
      const raw = readFileSync(dataPath, 'utf-8');
      const factories: Factory[] = JSON.parse(raw);

      for (const factory of factories) {
        this.stateManager.addFactory(factory);
        const wasteStreams = classifyWasteStreams(factory);
        this.stateManager.setWasteProfile(factory.id, wasteStreams);
      }

      this.eventBus.addActivityLog('System', '🏭',
        `Seeded ${factories.length} SIDCO Coimbatore factories with waste profiles`
      );
    } catch {
      this.eventBus.addActivityLog('System', '⚠️', 'Could not load seed factories — starting empty');
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}

export const SwarmRegistry = new SwarmRegistryClass();
