import { readFileSync } from 'fs';
import { join } from 'path';
import { WasteStream } from './types.js';

export class WasteClassifier {
  private materialsDb: Record<string, any>;

  constructor() {
    try {
      const dbPath = join(process.cwd(), 'src/data/materials-db.json');
      this.materialsDb = JSON.parse(readFileSync(dbPath, 'utf-8'));
    } catch (e) {
      this.materialsDb = {};
    }
  }

  public classifyWaste(factoryId: string, factoryName: string, wasteName: string): WasteStream {
    const matched = this.materialsDb[wasteName];
    if (matched) {
      return {
        id: `${factoryId}_${wasteName.toLowerCase().replace(/\s+/g, '_')}`,
        factoryId,
        factoryName,
        name: wasteName,
        category: matched.category,
        physicalForm: matched.physicalForm,
        volume: matched.volumeEstimate,
        contamination: matched.contamination,
        seasonalVariation: matched.seasonalVariation,
        reusePotential: matched.reusePotential
      };
    }

    // Fallback inference
    return {
      id: `${factoryId}_${wasteName.toLowerCase().replace(/\s+/g, '_')}`,
      factoryId,
      factoryName,
      name: wasteName,
      category: 'organic',
      physicalForm: 'solid',
      volume: 50,
      contamination: 'mild',
      seasonalVariation: 'none',
      reusePotential: 50
    };
  }
}
