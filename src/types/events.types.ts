import { Factory, WasteStream, ComplianceReport } from './factory.types.js';
import { SymbioticMatch } from './match.types.js';
import { ProductConcept } from './product.types.js';
import { OpportunityRanking, ClusterMetrics } from './impact.types.js';
import { ManufacturingPathway } from './pathway.types.js';

export enum EventType {
  FACTORY_REGISTERED = 'FACTORY_REGISTERED',
  FACTORY_UPDATED = 'FACTORY_UPDATED',
  FACTORY_SHUTDOWN = 'FACTORY_SHUTDOWN',
  COMPLIANCE_GENERATED = 'COMPLIANCE_GENERATED',
  FACTORY_DATA_INGESTED = 'FACTORY_DATA_INGESTED',
  WASTE_PROFILED = 'WASTE_PROFILED',
  MATCHES_FOUND = 'MATCHES_FOUND',
  PRODUCTS_GENERATED = 'PRODUCTS_GENERATED',
  IMPACT_CALCULATED = 'IMPACT_CALCULATED',
  PATHWAY_DESIGNED = 'PATHWAY_DESIGNED',
  ECOSYSTEM_UPDATED = 'ECOSYSTEM_UPDATED',
  CHAIN_BROKEN = 'CHAIN_BROKEN',
  COMPLIANCE_DUE = 'COMPLIANCE_DUE',
  SENTINEL_ALERT = 'SENTINEL_ALERT',
}

export interface EventPayloadMap {
  [EventType.FACTORY_REGISTERED]: { factory: Factory };
  [EventType.FACTORY_UPDATED]: { factoryId: string; changes: Partial<Factory> };
  [EventType.FACTORY_SHUTDOWN]: { factoryId: string; reason: string; durationDays: number | null };
  [EventType.COMPLIANCE_GENERATED]: { report: ComplianceReport };
  [EventType.FACTORY_DATA_INGESTED]: { factory: Factory };
  [EventType.WASTE_PROFILED]: { factoryId: string; wasteStreams: WasteStream[] };
  [EventType.MATCHES_FOUND]: { matches: SymbioticMatch[] };
  [EventType.PRODUCTS_GENERATED]: { products: ProductConcept[] };
  [EventType.IMPACT_CALCULATED]: { rankings: OpportunityRanking[] };
  [EventType.PATHWAY_DESIGNED]: { pathway: ManufacturingPathway };
  [EventType.ECOSYSTEM_UPDATED]: { metrics: ClusterMetrics };
  [EventType.CHAIN_BROKEN]: { brokenMatchIds: string[]; affectedFactoryIds: string[] };
  [EventType.COMPLIANCE_DUE]: { factoryId: string; factoryName: string; dueDate: string };
  [EventType.SENTINEL_ALERT]: { alertType: string; message: string; severity: 'info' | 'warning' | 'critical' };
}

export interface SwarmEvent<T extends EventType = EventType> {
  id: string;
  type: T;
  payload: EventPayloadMap[T];
  timestamp: string;
  sourceAgent: string;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  agentName: string;
  emoji: string;
  message: string;
  eventType: EventType | null;
}
