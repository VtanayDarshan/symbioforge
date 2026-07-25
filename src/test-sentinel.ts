import { EventBus } from './orchestrator/event-bus.js';
import { StateManager } from './orchestrator/state-manager.js';
import { SentinelAgent } from './agents/sentinel.agent.js';
import { ClerkAgent } from './agents/clerk.agent.js';
import { Factory } from './core/types.js';

const stateManager = StateManager.getInstance();
const eventBus = EventBus.getInstance();
const sentinel = new SentinelAgent();
const clerk = new ClerkAgent();

// Mock an old factory to trigger compliance warning
const oldFactory: Factory = {
  id: 'fact_old_1',
  name: 'Old Reliable Steel',
  industryType: 'Metallurgy',
  location: { lat: 10, lng: 10, address: '' },
  productionCapacity: '500',
  rawMaterials: [],
  declaredWastes: ['Metal Slag'],
  wasteStreams: [
    {
      id: 'ws_slag',
      factoryId: 'fact_old_1',
      factoryName: 'Old Reliable Steel',
      name: 'Metal Slag',
      category: 'metallic',
      physicalForm: 'solid',
      volume: 100,
      contamination: 'clean',
      seasonalVariation: 'none',
      reusePotential: 80
    }
  ],
  complianceStatus: 'filed',
  savingsEarned: 0,
  co2Avoided: 0,
  lastFiledDate: new Date(Date.now() - 350 * 24 * 60 * 60 * 1000).toISOString() // 350 days ago
};

stateManager.addFactory(oldFactory);

console.log('--- Testing Compliance Check ---');
sentinel.checkComplianceDeadlines();

setTimeout(() => {
  console.log('\n--- Testing Volume Anomaly ---');
  // Trigger a 30% volume spike (expected is 100, sending 135)
  eventBus.publish({
    type: 'VOLUME_UPDATE',
    payload: { factoryId: 'fact_old_1', currentVolume: 135 }
  });
  
  setTimeout(() => {
    console.log('\n--- Logs ---');
    console.log(stateManager.getState().activityLogs.map(l => `[${l.agent}] ${l.message}`));
  }, 1000);
}, 1000);
