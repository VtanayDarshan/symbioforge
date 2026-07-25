import { EventBus, SwarmEvent } from './event-bus.js';
import { StateManager } from './state-manager.js';

export class AgentChain {
  private static instance: AgentChain;
  private eventBus: EventBus;
  private stateManager: StateManager;
  private isRunning = false;

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.stateManager = StateManager.getInstance();
    this.setupListeners();
  }

  public static getInstance(): AgentChain {
    if (!AgentChain.instance) {
      AgentChain.instance = new AgentChain();
    }
    return AgentChain.instance;
  }

  private setupListeners() {
    // Clerk -> Scout
    this.eventBus.subscribe('FACTORY_REGISTERED', (event) => {
      if (!this.stateManager.getState().swarmActive) return;
      this.triggerScout(event);
    });

    this.eventBus.subscribe('FACTORY_UPDATED', (event) => {
      if (!this.stateManager.getState().swarmActive) return;
      this.triggerScout(event);
    });

    // Scout -> Profiler
    this.eventBus.subscribe('FACTORY_PROFILED', (event) => {
      if (!this.stateManager.getState().swarmActive) return;
      this.triggerProfiler(event);
    });

    // Profiler -> Matchmaker & Inventor
    this.eventBus.subscribe('MATCHES_DISCOVERED', (event) => {
      if (!this.stateManager.getState().swarmActive) return;
      this.triggerMatchmakerAndInventor(event);
    });

    // Matchmaker & Inventor -> Auditor
    this.eventBus.subscribe('PRODUCTS_INVENTED', (event) => {
      if (!this.stateManager.getState().swarmActive) return;
      this.triggerAuditor();
    });

    // Auditor -> Architect
    this.eventBus.subscribe('IMPACT_AUDITED', (event) => {
      if (!this.stateManager.getState().swarmActive) return;
      this.triggerArchitect(event);
    });

    // Architect -> Sentinel
    this.eventBus.subscribe('PATHWAYS_DESIGNED', (event) => {
      if (!this.stateManager.getState().swarmActive) return;
      this.triggerSentinel();
    });
  }

  private async triggerScout(event: SwarmEvent) {
    if (event.type !== 'FACTORY_REGISTERED' && event.type !== 'FACTORY_UPDATED') return;
    const { factoryId } = event.payload;
    const factory = this.stateManager.getFactory(factoryId);
    if (!factory) return;

    this.stateManager.addLog('Scout', `Ingesting factory profile: "${factory.name}"`, 'info');

    // Simulate Scout processing delay
    setTimeout(() => {
      this.eventBus.publish({
        type: 'FACTORY_PROFILED',
        payload: { factoryId }
      });
    }, 1000);
  }

  private async triggerProfiler(event: SwarmEvent) {
    if (event.type !== 'FACTORY_PROFILED') return;
    const { factoryId } = event.payload;
    const factory = this.stateManager.getFactory(factoryId);
    if (!factory) return;

    this.stateManager.addLog('Profiler', `Classifying waste streams for "${factory.name}"`, 'info');

    // Simulate Profiler processing delay
    setTimeout(() => {
      // Profiler logic will run here via the Profiler agent
      // For now, we publish the next event to keep the chain moving
      this.eventBus.publish({
        type: 'MATCHES_DISCOVERED',
        payload: { matchIds: [] }
      });
    }, 1500);
  }

  private async triggerMatchmakerAndInventor(event: SwarmEvent) {
    this.stateManager.addLog('Matchmaker', 'Scanning cluster for new symbiotic matches...', 'info');
    this.stateManager.addLog('Inventor', 'Analyzing waste portfolio to generate novel product concepts...', 'info');

    // Simulate parallel processing
    setTimeout(() => {
      this.eventBus.publish({
        type: 'PRODUCTS_INVENTED',
        payload: { productIds: [] }
      });
    }, 2000);
  }

  private async triggerAuditor() {
    this.stateManager.addLog('Auditor', 'Quantifying environmental and financial impact of discoveries...', 'info');

    setTimeout(() => {
      this.eventBus.publish({
        type: 'IMPACT_AUDITED',
        payload: { opportunityIds: [] }
      });
    }, 1500);
  }

  private async triggerArchitect(event: SwarmEvent) {
    this.stateManager.addLog('Architect', 'Designing complete manufacturing pathways and blueprints...', 'info');

    setTimeout(() => {
      this.eventBus.publish({
        type: 'PATHWAYS_DESIGNED',
        payload: { blueprintIds: [] }
      });
    }, 2000);
  }

  private async triggerSentinel() {
    this.stateManager.addLog('Sentinel', 'Ecosystem stable. Monitoring for changes and compliance deadlines.', 'success');
    this.eventBus.publish({
      type: 'ECOSYSTEM_STABLE',
      payload: { timestamp: new Date().toISOString() }
    });
  }
}
