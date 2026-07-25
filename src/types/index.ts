export type MaterialCategory = 'organic' | 'metallic' | 'polymeric' | 'chemical' | 'textile' | 'cellulosic' | 'mineral';
export type PhysicalForm = 'powder' | 'fiber' | 'liquid' | 'solid_chunks' | 'pellets' | 'film' | 'loose';
export type ContaminationLevel = 'clean' | 'mildly_contaminated' | 'requires_treatment' | 'hazardous';

export interface WasteStream {
  id: string;
  name: string;
  category: MaterialCategory;
  physicalForm: PhysicalForm;
  estimatedDailyVolumeKg: number; // Normalized to kg for consistency
  contaminationLevel: ContaminationLevel;
  seasonalVariation: boolean;
  reusePotentialScore?: number; // 0-100, assigned by Profiler
}

export interface FactoryProfile {
  id: string;
  name: string;
  industryType: string;
  locationCoordinates: { lat: number; lng: number };
  productionCapacityDailyKg: number;
  rawMaterialsConsumed: string[];
  declaredWasteOutputs: WasteStream[];
  // The Profiler augments the profile with inferred streams
  inferredWasteOutputs?: WasteStream[];
}

export interface SymbioticMatch {
  id: string;
  sourceFactoryId: string;
  targetFactoryId: string;
  wasteStreamId: string;
  confidenceScore: number; // 0-100
  distanceKm: number;
  materialCompatibilityScore: number;
  volumeAlignmentScore: number;
  multiHopChain?: string[]; // IDs of matches if this is part of a chain
}

export interface SystemEvent {
  type: string;
  payload: any;
  timestamp: Date;
}
