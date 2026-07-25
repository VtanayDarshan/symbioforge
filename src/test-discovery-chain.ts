import { FactoryProfile } from './types';
import { ClerkAgent } from './agents/clerk.agent';
import { ScoutAgent } from './agents/scout.agent';
import { ProfilerAgent } from './agents/profiler.agent';
import { MatchmakerAgent } from './agents/matchmaker.agent';

// Instantiate the autonomous agents
const clerk = new ClerkAgent();
const scout = new ScoutAgent();
const profiler = new ProfilerAgent();
const matchmaker = new MatchmakerAgent();

// Dummy existing cluster
const existingCluster: FactoryProfile[] = [
  {
    id: 'f_1001',
    name: 'GreenPulp Paper Mill',
    industryType: 'Paper Manufacturing',
    locationCoordinates: { lat: 11.0168, lng: 76.9558 },
    productionCapacityDailyKg: 2000,
    rawMaterialsConsumed: ['wood pulp', 'recycled paper', 'cotton lint'],
    declaredWasteOutputs: []
  },
  {
    id: 'f_1002',
    name: 'PackRight Packaging',
    industryType: 'Cardboard Packaging Reuse',
    locationCoordinates: { lat: 11.0268, lng: 76.9658 },
    productionCapacityDailyKg: 500,
    rawMaterialsConsumed: ['cardboard'],
    declaredWasteOutputs: []
  }
];

matchmaker.seedCluster(existingCluster);

// 1. New factory submits their compliance form to The Clerk
const newFactoryInput: FactoryProfile = {
  id: 'f_2001',
  name: 'Lakshmi Textiles Pvt Ltd',
  industryType: 'Textile Manufacturing',
  locationCoordinates: { lat: 11.0188, lng: 76.9588 },
  productionCapacityDailyKg: 5000,
  rawMaterialsConsumed: ['cotton', 'polyester'],
  declaredWasteOutputs: []
};

console.log('--- STARTING AUTONOMOUS AGENT CHAIN ---');

// Chain Execution
const { complianceReport, event: clerkEvent } = clerk.registerFactory(newFactoryInput);
console.log('\n[Factory View] Compliance Report Downloaded:\n' + complianceReport);

// Clerk triggers Scout
const scoutResult = scout.ingest(clerkEvent);
if (scoutResult) {
  // Scout triggers Profiler
  const profilerResult = profiler.profile(scoutResult.event);
  
  if (profilerResult) {
    // Profiler triggers Matchmaker
    matchmaker.match(profilerResult.event);
  }
}

console.log('--- END OF DISCOVERY CHAIN ---');
