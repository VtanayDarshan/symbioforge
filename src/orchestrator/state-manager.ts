import { Factory, WasteStream } from '../types/factory.types.js';
import { SymbioticMatch } from '../types/match.types.js';
import { ProductConcept } from '../types/product.types.js';
import { OpportunityRanking, ClusterMetrics } from '../types/impact.types.js';
import { ManufacturingPathway } from '../types/pathway.types.js';
import { EventBus } from './event-bus.js';
import { EventType } from '../types/events.types.js';

export class StateManager {
  private factories: Map<string, Factory> = new Map();
  private wasteProfiles: Map<string, WasteStream[]> = new Map();
  private matches: Map<string, SymbioticMatch> = new Map();
  private products: Map<string, ProductConcept> = new Map();
  private rankings: OpportunityRanking[] = [];
  private pathways: Map<string, ManufacturingPathway> = new Map();
  private previousCircularScore = 0;

  constructor(private eventBus: EventBus) {}

  // --- Factories ---

  addFactory(factory: Factory): void {
    this.factories.set(factory.id, factory);
    this.emitEcosystemUpdate();
  }

  updateFactory(factoryId: string, changes: Partial<Factory>): void {
    const factory = this.factories.get(factoryId);
    if (factory) {
      Object.assign(factory, changes, { lastUpdated: new Date().toISOString() });
      this.factories.set(factoryId, factory);
      this.emitEcosystemUpdate();
    }
  }

  removeFactory(factoryId: string): void {
    this.factories.delete(factoryId);
    this.wasteProfiles.delete(factoryId);

    for (const [id, match] of this.matches) {
      if (match.sourceFactoryId === factoryId || match.targetFactoryId === factoryId) {
        this.matches.delete(id);
      }
    }
    this.emitEcosystemUpdate();
  }

  getFactory(factoryId: string): Factory | undefined {
    return this.factories.get(factoryId);
  }

  getAllFactories(): Factory[] {
    return Array.from(this.factories.values());
  }

  getActiveFactories(): Factory[] {
    return this.getAllFactories().filter((f) => f.isActive);
  }

  // --- Waste Profiles ---

  setWasteProfile(factoryId: string, wasteStreams: WasteStream[]): void {
    this.wasteProfiles.set(factoryId, wasteStreams);
    this.emitEcosystemUpdate();
  }

  getWasteProfile(factoryId: string): WasteStream[] {
    return this.wasteProfiles.get(factoryId) ?? [];
  }

  getAllWasteStreams(): WasteStream[] {
    const all: WasteStream[] = [];
    for (const streams of this.wasteProfiles.values()) {
      all.push(...streams);
    }
    return all;
  }

  // --- Matches ---

  addMatches(newMatches: SymbioticMatch[]): void {
    for (const match of newMatches) {
      this.matches.set(match.id, match);
    }
    this.emitEcosystemUpdate();
  }

  getMatch(matchId: string): SymbioticMatch | undefined {
    return this.matches.get(matchId);
  }

  getAllMatches(): SymbioticMatch[] {
    return Array.from(this.matches.values());
  }

  removeMatchesForFactory(factoryId: string): SymbioticMatch[] {
    const broken: SymbioticMatch[] = [];
    for (const [id, match] of this.matches) {
      if (match.sourceFactoryId === factoryId || match.targetFactoryId === factoryId) {
        broken.push(match);
        this.matches.delete(id);
      }
    }
    return broken;
  }

  // --- Products ---

  addProducts(newProducts: ProductConcept[]): void {
    for (const product of newProducts) {
      this.products.set(product.id, product);
    }
    this.emitEcosystemUpdate();
  }

  getProduct(productId: string): ProductConcept | undefined {
    return this.products.get(productId);
  }

  getAllProducts(): ProductConcept[] {
    return Array.from(this.products.values());
  }

  // --- Rankings ---

  setRankings(newRankings: OpportunityRanking[]): void {
    this.rankings = newRankings;
  }

  getRankings(limit?: number): OpportunityRanking[] {
    const sorted = [...this.rankings].sort((a, b) => b.compositeScore - a.compositeScore);
    return limit ? sorted.slice(0, limit) : sorted;
  }

  // --- Pathways ---

  addPathway(pathway: ManufacturingPathway): void {
    this.pathways.set(pathway.id, pathway);
    this.emitEcosystemUpdate();
  }

  getPathway(pathwayId: string): ManufacturingPathway | undefined {
    return this.pathways.get(pathwayId);
  }

  getAllPathways(): ManufacturingPathway[] {
    return Array.from(this.pathways.values());
  }

  // --- Cluster Metrics ---

  getClusterMetrics(): ClusterMetrics {
    const allMatches = this.getAllMatches();
    const allProducts = this.getAllProducts();
    const totalWasteStreams = this.getAllWasteStreams().length;
    const activeFactories = this.getActiveFactories();

    let totalCO2 = 0;
    let totalLandfill = 0;
    let totalWater = 0;
    let totalFinancial = 0;

    for (const ranking of this.rankings) {
      totalCO2 += ranking.impactMetrics.co2SavedTonsPerYear;
      totalLandfill += ranking.impactMetrics.landfillDivertedTonsPerYear;
      totalWater += ranking.impactMetrics.waterSavedLitersPerYear;
      totalFinancial +=
        ranking.financialImpact.disposalCostSavingsPerYear +
        ranking.financialImpact.rawMaterialSavingsPerYear +
        ranking.financialImpact.newRevenuePotentialPerYear;
    }

    const circularScore = this.calculateCircularScore();

    return {
      totalFactories: this.factories.size,
      activeFactories: activeFactories.length,
      totalWasteStreams,
      activeMatches: allMatches.length,
      productConcepts: allProducts.length,
      circularScore,
      totalCO2SavedTonsPerYear: Math.round(totalCO2 * 100) / 100,
      totalLandfillDivertedTonsPerYear: Math.round(totalLandfill * 100) / 100,
      totalWaterSavedLitersPerYear: Math.round(totalWater),
      totalFinancialValuePerYear: Math.round(totalFinancial),
      lastUpdated: new Date().toISOString(),
    };
  }

  private calculateCircularScore(): number {
    const totalStreams = this.getAllWasteStreams().length;
    if (totalStreams === 0) return 0;

    const matchedStreamIds = new Set<string>();
    for (const match of this.matches.values()) {
      matchedStreamIds.add(match.wasteStreamId);
    }
    for (const product of this.products.values()) {
      for (const input of product.sourceWasteStreams) {
        matchedStreamIds.add(input.wasteStreamId);
      }
    }

    return Math.round((matchedStreamIds.size / totalStreams) * 100);
  }

  private emitEcosystemUpdate(): void {
    const metrics = this.getClusterMetrics();
    if (metrics.circularScore !== this.previousCircularScore || metrics.activeMatches > 0) {
      this.previousCircularScore = metrics.circularScore;
      this.eventBus.emit(EventType.ECOSYSTEM_UPDATED, { metrics }, 'StateManager').catch(() => {});
    }
  }

  // --- Full State ---

  getFullState() {
    return {
      factories: this.getAllFactories(),
      wasteProfiles: Object.fromEntries(this.wasteProfiles),
      matches: this.getAllMatches(),
      products: this.getAllProducts(),
      rankings: this.getRankings(),
      pathways: this.getAllPathways(),
      metrics: this.getClusterMetrics(),
    };
  }
}
