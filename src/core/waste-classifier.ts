import { FactoryProfile, WasteStream } from '../types';

export class WasteClassifier {
  /**
   * Infers waste streams based on industry type and capacity if they are missing or incomplete.
   */
  public static inferWasteStreams(factory: FactoryProfile): WasteStream[] {
    const inferred: WasteStream[] = [];
    const idPrefix = `inf_${Date.now()}_`;
    
    // Simple rule engine based on industry type
    if (factory.industryType.toLowerCase().includes('textile')) {
      inferred.push({
        id: `${idPrefix}cotton_lint`,
        name: 'Cotton Lint',
        category: 'textile',
        physicalForm: 'fiber',
        estimatedDailyVolumeKg: factory.productionCapacityDailyKg * 0.15, // 15% waste
        contaminationLevel: 'clean',
        seasonalVariation: false,
        reusePotentialScore: 88
      });
      inferred.push({
        id: `${idPrefix}polyester_scrap`,
        name: 'Polyester Scraps',
        category: 'polymeric',
        physicalForm: 'fiber',
        estimatedDailyVolumeKg: factory.productionCapacityDailyKg * 0.08,
        contaminationLevel: 'clean',
        seasonalVariation: false,
        reusePotentialScore: 82
      });
      inferred.push({
        id: `${idPrefix}dye_effluent`,
        name: 'Dye Effluent Sludge',
        category: 'chemical',
        physicalForm: 'liquid',
        estimatedDailyVolumeKg: factory.productionCapacityDailyKg * 0.5,
        contaminationLevel: 'requires_treatment',
        seasonalVariation: true,
        reusePotentialScore: 35
      });
    }

    if (factory.industryType.toLowerCase().includes('food')) {
      if (factory.rawMaterialsConsumed.some(r => r.toLowerCase().includes('paddy') || r.toLowerCase().includes('rice'))) {
        inferred.push({
          id: `${idPrefix}rice_husk`,
          name: 'Rice Husk',
          category: 'organic',
          physicalForm: 'loose',
          estimatedDailyVolumeKg: factory.productionCapacityDailyKg * 0.20, // 20% of paddy is husk
          contaminationLevel: 'clean',
          seasonalVariation: true,
          reusePotentialScore: 92
        });
      }
    }
    
    // Universal packaging waste based on capacity
    inferred.push({
      id: `${idPrefix}cardboard`,
      name: 'Cardboard Packaging',
      category: 'cellulosic',
      physicalForm: 'solid_chunks',
      estimatedDailyVolumeKg: factory.productionCapacityDailyKg * 0.02,
      contaminationLevel: 'clean',
      seasonalVariation: false,
      reusePotentialScore: 95
    });

    return inferred;
  }
}
