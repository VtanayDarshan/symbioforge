export interface WasteInput {
  factoryId: string;
  factoryName: string;
  wasteStreamId: string;
  wasteType: string;
  volumeRequired: number;
  unit: string;
}

export interface ProductConcept {
  id: string;
  name: string;
  description: string;
  sourceWasteStreams: WasteInput[];
  manufacturingProcess: string;
  processCategory: ProcessCategory;
  feasibilityScore: number;
  productionCostPerUnit: number;
  marketPricePerUnit: number;
  unit: string;
  targetMarket: string;
  competitiveAdvantage: string;
  environmentalBenefit: string;
  generatedAt: string;
}

export enum ProcessCategory {
  COMPRESSION_MOLDING = 'compression_molding',
  EXTRUSION = 'extrusion',
  SINTERING = 'sintering',
  CHEMICAL_PROCESSING = 'chemical_processing',
  BLENDING = 'blending',
  WEAVING = 'weaving',
  PELLETIZING = 'pelletizing',
  PYROLYSIS = 'pyrolysis',
  COMPOSTING = 'composting',
  CASTING = 'casting',
}
