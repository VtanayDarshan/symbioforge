import { SymbioticMatch } from './match.types.js';
import { ProductConcept } from './product.types.js';

export interface ImpactMetrics {
  co2SavedTonsPerYear: number;
  landfillDivertedTonsPerYear: number;
  waterSavedLitersPerYear: number;
  energySavedKwhPerYear: number;
}

export interface FinancialImpact {
  disposalCostSavingsPerYear: number;
  rawMaterialSavingsPerYear: number;
  newRevenuePotentialPerYear: number;
  estimatedROI: number;
  paybackMonths: number;
}

export type OpportunityType = 'match' | 'product';

export interface OpportunityRanking {
  id: string;
  type: OpportunityType;
  opportunityId: string;
  opportunity: SymbioticMatch | ProductConcept;
  impactMetrics: ImpactMetrics;
  financialImpact: FinancialImpact;
  compositeScore: number;
  rank: number;
  evaluatedAt: string;
}

export interface ClusterMetrics {
  totalFactories: number;
  activeFactories: number;
  totalWasteStreams: number;
  activeMatches: number;
  productConcepts: number;
  circularScore: number;
  totalCO2SavedTonsPerYear: number;
  totalLandfillDivertedTonsPerYear: number;
  totalWaterSavedLitersPerYear: number;
  totalFinancialValuePerYear: number;
  lastUpdated: string;
}
