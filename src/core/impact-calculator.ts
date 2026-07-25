import { SymbioticMatch } from '../types/match.types.js';
import { ProductConcept } from '../types/product.types.js';
import { ImpactMetrics, FinancialImpact, OpportunityRanking } from '../types/impact.types.js';

const DISPOSAL_COST_PER_TON_INR = 2500;
const CO2_PER_TON_LANDFILL = 1.2;
const WATER_PER_TON_VIRGIN = 15000;
const ENERGY_PER_TON_VIRGIN_KWH = 800;

export function calculateMatchImpact(match: SymbioticMatch): { impact: ImpactMetrics; financial: FinancialImpact } {
  const volumeTonsPerYear = (match.estimatedVolumePerDay * 300) / 1000;

  const co2SavedTonsPerYear = Math.round(volumeTonsPerYear * CO2_PER_TON_LANDFILL * 100) / 100;
  const landfillDivertedTonsPerYear = Math.round(volumeTonsPerYear * 100) / 100;
  const waterSavedLitersPerYear = Math.round(volumeTonsPerYear * WATER_PER_TON_VIRGIN);
  const energySavedKwhPerYear = Math.round(volumeTonsPerYear * ENERGY_PER_TON_VIRGIN_KWH);

  const disposalCostSavingsPerYear = Math.round(volumeTonsPerYear * DISPOSAL_COST_PER_TON_INR);
  const rawMaterialSavingsPerYear = Math.round(volumeTonsPerYear * 8000 * (match.compositeScore / 100));
  const newRevenuePotentialPerYear = 0;
  const totalSavings = disposalCostSavingsPerYear + rawMaterialSavingsPerYear;
  const setupCost = 150000;
  const estimatedROI = Math.round((totalSavings / setupCost) * 100);
  const paybackMonths = totalSavings > 0 ? Math.round((setupCost / totalSavings) * 12) : 999;

  return {
    impact: { co2SavedTonsPerYear, landfillDivertedTonsPerYear, waterSavedLitersPerYear, energySavedKwhPerYear },
    financial: { disposalCostSavingsPerYear, rawMaterialSavingsPerYear, newRevenuePotentialPerYear, estimatedROI, paybackMonths },
  };
}

export function calculateProductImpact(product: ProductConcept): { impact: ImpactMetrics; financial: FinancialImpact } {
  const totalInputPerDay = product.sourceWasteStreams.reduce((s, w) => s + w.volumeRequired, 0);
  const volumeTonsPerYear = (totalInputPerDay * 300) / 1000;

  const co2SavedTonsPerYear = Math.round(volumeTonsPerYear * CO2_PER_TON_LANDFILL * 1.5 * 100) / 100;
  const landfillDivertedTonsPerYear = Math.round(volumeTonsPerYear * 100) / 100;
  const waterSavedLitersPerYear = Math.round(volumeTonsPerYear * WATER_PER_TON_VIRGIN * 0.8);
  const energySavedKwhPerYear = Math.round(volumeTonsPerYear * ENERGY_PER_TON_VIRGIN_KWH * 0.6);

  const disposalCostSavingsPerYear = Math.round(volumeTonsPerYear * DISPOSAL_COST_PER_TON_INR);
  const margin = product.marketPricePerUnit - product.productionCostPerUnit;
  const unitsPerYear = Math.round((totalInputPerDay * 300) / 10);
  const newRevenuePotentialPerYear = Math.round(margin * unitsPerYear);
  const rawMaterialSavingsPerYear = 0;
  const setupCost = 500000;
  const totalBenefit = disposalCostSavingsPerYear + newRevenuePotentialPerYear;
  const estimatedROI = Math.round((totalBenefit / setupCost) * 100);
  const paybackMonths = totalBenefit > 0 ? Math.round((setupCost / totalBenefit) * 12) : 999;

  return {
    impact: { co2SavedTonsPerYear, landfillDivertedTonsPerYear, waterSavedLitersPerYear, energySavedKwhPerYear },
    financial: { disposalCostSavingsPerYear, rawMaterialSavingsPerYear, newRevenuePotentialPerYear, estimatedROI, paybackMonths },
  };
}

let rankCounter = 0;

export function rankOpportunities(
  matches: SymbioticMatch[],
  products: ProductConcept[]
): OpportunityRanking[] {
  const rankings: OpportunityRanking[] = [];

  for (const match of matches) {
    const { impact, financial } = calculateMatchImpact(match);
    const envScore = Math.min(100, impact.co2SavedTonsPerYear * 10 + impact.landfillDivertedTonsPerYear * 5);
    const finScore = Math.min(100, financial.estimatedROI);
    const feasScore = match.compositeScore;
    const compositeScore = Math.round(envScore * 0.40 + finScore * 0.35 + feasScore * 0.25);

    rankings.push({
      id: `rank_${++rankCounter}`,
      type: 'match',
      opportunityId: match.id,
      opportunity: match,
      impactMetrics: impact,
      financialImpact: financial,
      compositeScore,
      rank: 0,
      evaluatedAt: new Date().toISOString(),
    });
  }

  for (const product of products) {
    const { impact, financial } = calculateProductImpact(product);
    const envScore = Math.min(100, impact.co2SavedTonsPerYear * 10 + impact.landfillDivertedTonsPerYear * 5);
    const finScore = Math.min(100, financial.estimatedROI);
    const feasScore = product.feasibilityScore;
    const compositeScore = Math.round(envScore * 0.40 + finScore * 0.35 + feasScore * 0.25);

    rankings.push({
      id: `rank_${++rankCounter}`,
      type: 'product',
      opportunityId: product.id,
      opportunity: product,
      impactMetrics: impact,
      financialImpact: financial,
      compositeScore,
      rank: 0,
      evaluatedAt: new Date().toISOString(),
    });
  }

  rankings.sort((a, b) => b.compositeScore - a.compositeScore);
  rankings.forEach((r, i) => r.rank = i + 1);
  return rankings;
}
