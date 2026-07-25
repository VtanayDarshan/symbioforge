import { WasteStream } from './factory.types.js';

export enum MatchStatus {
  DISCOVERED = 'discovered',
  EVALUATED = 'evaluated',
  BLUEPRINT_READY = 'blueprint_ready',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface MatchScores {
  materialCompatibility: number;
  proximityScore: number;
  volumeAlignment: number;
  seasonalSync: number;
  contaminationFeasibility: number;
}

export interface SymbioticMatch {
  id: string;
  sourceFactoryId: string;
  sourceFactoryName: string;
  targetFactoryId: string;
  targetFactoryName: string;
  wasteStreamId: string;
  wasteType: string;
  targetProcess: string;
  scores: MatchScores;
  compositeScore: number;
  estimatedVolumePerDay: number;
  unit: string;
  distanceKm: number;
  status: MatchStatus;
  discoveredAt: string;
}

export interface MatchChain {
  id: string;
  hops: SymbioticMatch[];
  totalScore: number;
  factoryIds: string[];
  description: string;
}
