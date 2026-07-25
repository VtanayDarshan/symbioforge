import { MatchingAlgorithm } from './core/matching-algorithm.js';
import { SymbioticMatch } from './core/types.js';

const matchingAlg = new MatchingAlgorithm();

// Define Match 1: Factory A -> Factory B
const match1: SymbioticMatch = {
  id: 'match1',
  sourceFactoryId: 'fact_A',
  sourceFactoryName: 'Factory A',
  targetFactoryId: 'fact_B',
  targetFactoryName: 'Factory B',
  wasteStreamId: 'ws_1',
  wasteStreamName: 'Waste 1',
  compatibilityScore: 80,
  distanceKm: 5,
  volumeTonsPerYear: 100,
  co2SavedTonsPerYear: 50,
  savingsInrPerYear: 10000,
  status: 'New'
};

// Define Match 2: Factory B -> Factory C
const match2: SymbioticMatch = {
  id: 'match2',
  sourceFactoryId: 'fact_B',
  sourceFactoryName: 'Factory B',
  targetFactoryId: 'fact_C',
  targetFactoryName: 'Factory C',
  wasteStreamId: 'ws_2',
  wasteStreamName: 'Waste 2',
  compatibilityScore: 90,
  distanceKm: 10,
  volumeTonsPerYear: 50,
  co2SavedTonsPerYear: 25,
  savingsInrPerYear: 5000,
  status: 'New'
};

// Define Match 3: Factory X -> Factory Y (disconnected)
const match3: SymbioticMatch = {
  id: 'match3',
  sourceFactoryId: 'fact_X',
  sourceFactoryName: 'Factory X',
  targetFactoryId: 'fact_Y',
  targetFactoryName: 'Factory Y',
  wasteStreamId: 'ws_3',
  wasteStreamName: 'Waste 3',
  compatibilityScore: 70,
  distanceKm: 2,
  volumeTonsPerYear: 200,
  co2SavedTonsPerYear: 100,
  savingsInrPerYear: 20000,
  status: 'New'
};

const matches = [match1, match2, match3];
const chains = matchingAlg.findMultiHopChains(matches);

console.log(`Discovered ${chains.length} multi-hop chains.`);
chains.forEach(c => {
  const hop1 = c.hops[0];
  const hop2 = c.hops[1];
  console.log(`  Chain: ${hop1.sourceFactoryName} -> ${hop1.targetFactoryName} -> ${hop2.targetFactoryName}`);
  console.log(`  Score: ${c.overallCompatibilityScore}, CO2 Saved: ${c.totalCo2Saved}`);
});
