import { EventBus } from './event-bus.js';
import { EventType, SwarmEvent } from '../types/events.types.js';
import { IAgent } from '../types/agent.types.js';

interface AgentBinding {
  agent: IAgent;
  triggerEvents: EventType[];
}

export class AgentChain {
  private bindings: AgentBinding[] = [];
  private agentMap: Map<string, IAgent> = new Map();

  constructor(private eventBus: EventBus) {}

  registerAgent(agent: IAgent, triggerEvents: EventType[]): void {
    this.bindings.push({ agent, triggerEvents });
    this.agentMap.set(agent.name, agent);

    for (const eventType of triggerEvents) {
      this.eventBus.on(eventType, async (event: SwarmEvent) => {
        await this.executeAgent(agent, event);
      });
    }
  }

  private async executeAgent(agent: IAgent, event: SwarmEvent): Promise<void> {
    const startTime = Date.now();
    try {
      this.eventBus.addActivityLog(
        agent.name,
        agent.emoji,
        `Processing ${event.type}...`
      );

      const result = await agent.process(event);

      this.eventBus.addActivityLog(
        agent.name,
        agent.emoji,
        `Completed in ${Date.now() - startTime}ms`,
        event.type
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.eventBus.addActivityLog(
        agent.name,
        agent.emoji,
        `Error: ${message}`
      );
      console.error(`[AgentChain] ${agent.name} failed on ${event.type}:`, error);
    }
  }

  setupDefaultChain(agents: {
    clerk: IAgent;
    scout: IAgent;
    profiler: IAgent;
    matchmaker: IAgent;
    inventor: IAgent;
    auditor: IAgent;
    architect: IAgent;
    sentinel: IAgent;
  }): void {
    // Clerk triggers → Scout ingests
    this.registerAgent(agents.scout, [
      EventType.FACTORY_REGISTERED,
    ]);

    // Scout ingested → Profiler classifies
    this.registerAgent(agents.profiler, [
      EventType.FACTORY_DATA_INGESTED,
    ]);

    // Profiler done → Matchmaker + Inventor run in parallel
    this.registerAgent(agents.matchmaker, [
      EventType.WASTE_PROFILED,
      EventType.CHAIN_BROKEN,
    ]);

    this.registerAgent(agents.inventor, [
      EventType.WASTE_PROFILED,
    ]);

    // Matchmaker/Inventor done → Auditor evaluates
    this.registerAgent(agents.auditor, [
      EventType.MATCHES_FOUND,
      EventType.PRODUCTS_GENERATED,
    ]);

    // Auditor done → Architect designs
    this.registerAgent(agents.architect, [
      EventType.IMPACT_CALCULATED,
    ]);

    // Architect done → Sentinel monitors
    this.registerAgent(agents.sentinel, [
      EventType.PATHWAY_DESIGNED,
      EventType.FACTORY_SHUTDOWN,
      EventType.ECOSYSTEM_UPDATED,
    ]);

    // Clerk handles compliance reminders from Sentinel
    this.registerAgent(agents.clerk, [
      EventType.COMPLIANCE_DUE,
    ]);

    this.agentMap.set(agents.clerk.name, agents.clerk);
  }

  getAgent(name: string): IAgent | undefined {
    return this.agentMap.get(name);
  }

  getAllAgents(): IAgent[] {
    return Array.from(this.agentMap.values());
  }

  getAgentStatuses(): Record<string, { status: string; lastResult: unknown }> {
    const statuses: Record<string, { status: string; lastResult: unknown }> = {};
    for (const [name, agent] of this.agentMap) {
      statuses[name] = {
        status: agent.getStatus(),
        lastResult: agent.getLastResult(),
      };
    }
    return statuses;
  }
}
