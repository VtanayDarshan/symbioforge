import { MaterialCategory } from '../types/factory.types.js';
import { IndustryType } from '../types/factory.types.js';

// TODO (Member 2): Implement compatibility matrix
// Maps waste material categories to industries that can accept them as inputs
// Reference: Kalundborg Symbiosis exchanges, NISP/SYNERGie case studies
// See data/compatibility-matrix.json

export interface CompatibilityEntry {
  wasteMaterial: MaterialCategory;
  acceptingIndustries: IndustryType[];
  compatibilityScore: number;
  processRequired: string;
}

export function checkCompatibility(
  wasteMaterial: MaterialCategory,
  targetIndustry: IndustryType
): { compatible: boolean; score: number; process: string } {
  // Placeholder — Member 2 implements from compatibility-matrix.json
  return { compatible: false, score: 0, process: '' };
}
