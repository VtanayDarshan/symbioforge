import { readFileSync } from 'fs';
import { join } from 'path';
import { Factory, SymbioticMatch, ProductConcept, Blueprint, ActivityLog, ClusterState } from '../core/types.js';
import { ImpactCalculator } from '../core/impact-calculator.js';

export class StateManager {
  private static instance: StateManager;
  private state: ClusterState;
  private impactCalculator: ImpactCalculator;

  private constructor() {
    this.impactCalculator = new ImpactCalculator();
    this.state = {
      factories: [],
      matches: [],
      products: [],
      blueprints: [],
      activityLogs: [],
      swarmActive: true,
      circularScore: 0,
      totalCo2Avoided: 0,
      totalLandfillDiverted: 0,
      totalWaterSaved: 0,
      totalFinancialValue: 0
    };
    this.loadInitialState();
  }

  public static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  private loadInitialState() {
    try {
      const initialPath = join(process.cwd(), 'src/data/factories-initial.json');
      const factories: Factory[] = JSON.parse(readFileSync(initialPath, 'utf-8'));
      this.state.factories = factories;
      this.addLog('System', 'Initial cluster state loaded with 15 factories.', 'info');
    } catch (e) {
      this.addLog('System', 'Failed to load initial factories.', 'error');
    }
  }

  public getState(): ClusterState {
    return this.state;
  }

  public setSwarmActive(active: boolean) {
    this.state.swarmActive = active;
    this.addLog('System', `Swarm status changed to: ${active ? 'ACTIVE' : 'INACTIVE'}`, 'info');
  }

  public getFactories(): Factory[] {
    return this.state.factories;
  }

  public getFactory(id: string): Factory | undefined {
    return this.state.factories.find(f => f.id === id);
  }

  public addFactory(factory: Factory) {
    const exists = this.state.factories.find(f => f.id === factory.id);
    if (exists) {
      Object.assign(exists, factory);
    } else {
      this.state.factories.push(factory);
    }
    this.recalculateMetrics();
  }

  public updateFactoryWastes(factoryId: string, wasteStreams: any[]) {
    const factory = this.getFactory(factoryId);
    if (factory) {
      factory.wasteStreams = wasteStreams;
      this.recalculateMetrics();
    }
  }

  public getMatches(): SymbioticMatch[] {
    return this.state.matches;
  }

  public setMatches(matches: SymbioticMatch[]) {
    this.state.matches = matches;
    this.recalculateMetrics();
  }

  public getProducts(): ProductConcept[] {
    return this.state.products;
  }

  public setProducts(products: ProductConcept[]) {
    this.state.products = products;
    this.recalculateMetrics();
  }

  public getBlueprints(): Blueprint[] {
    return this.state.blueprints;
  }

  public addBlueprint(blueprint: Blueprint) {
    const idx = this.state.blueprints.findIndex(b => b.id === blueprint.id);
    if (idx >= 0) {
      this.state.blueprints[idx] = blueprint;
    } else {
      this.state.blueprints.push(blueprint);
    }
  }

  public addLog(
    agent: ActivityLog['agent'],
    message: string,
    type: ActivityLog['type'] = 'info'
  ) {
    const log: ActivityLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toLocaleTimeString(),
      agent,
      message,
      type
    };
    this.state.activityLogs.unshift(log);
    // Keep last 100 logs
    if (this.state.activityLogs.length > 100) {
      this.state.activityLogs.pop();
    }
  }

  public recalculateMetrics() {
    const metrics = this.impactCalculator.calculateClusterMetrics(
      this.state.factories,
      this.state.matches,
      this.state.products
    );
    Object.assign(this.state, metrics);

    // Update individual factory savings and CO2 avoided based on active matches/products
    for (const f of this.state.factories) {
      let factorySavings = 0;
      let factoryCo2 = 0;

      // Matches where this factory is source or target
      const factoryMatches = this.state.matches.filter(
        m => (m.sourceFactoryId === f.id || m.targetFactoryId === f.id) && (m.status === 'Active' || m.status === 'Blueprint Ready')
      );
      for (const m of factoryMatches) {
        factorySavings += m.savingsInrPerYear / 2; // Split savings between source and target
        factoryCo2 += m.co2SavedTonsPerYear / 2;
      }

      // Products where this factory is a supplier
      const factoryProducts = this.state.products.filter(
        p => (p.status === 'Active' || p.status === 'Blueprint Ready') && p.wasteStreamsUsed.some(w => w.factoryId === f.id)
      );
      for (const p of factoryProducts) {
        factorySavings += p.revenuePotentialInrPerYear / p.wasteStreamsUsed.length;
        factoryCo2 += p.co2SavedTonsPerYear / p.wasteStreamsUsed.length;
      }

      f.savingsEarned = Math.round(factorySavings);
      f.co2Avoided = parseFloat(factoryCo2.toFixed(2));
    }
  }

  public resetState() {
    this.state.matches = [];
    this.state.products = [];
    this.state.blueprints = [];
    this.state.activityLogs = [];
    this.loadInitialState();
    this.recalculateMetrics();
  }
}
