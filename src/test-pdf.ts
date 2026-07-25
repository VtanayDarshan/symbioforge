import { ClerkAgent } from './agents/clerk.agent.js';
import { Factory } from './core/types.js';
import fs from 'fs';
import path from 'path';

async function runTest() {
  const clerk = new ClerkAgent();
  
  const testFactory: Omit<Factory, 'savingsEarned' | 'co2Avoided'> = {
    id: 'fact_999_test',
    name: 'Test PDF Factory',
    industryType: 'Chemical',
    location: { lat: 12.123, lng: 77.123, address: 'Test Address' },
    productionCapacity: '1000 tons/day',
    rawMaterials: ['Chemical A', 'Chemical B'],
    wasteStreams: [
      {
        id: 'ws_test_1',
        factoryId: 'fact_999_test',
        factoryName: 'Test PDF Factory',
        name: 'Acidic Sludge',
        category: 'chemical',
        physicalForm: 'liquid',
        volume: 50,
        contamination: 'high',
        seasonalVariation: 'none',
        reusePotential: 20
      }
    ],
    declaredWastes: ['Acidic Sludge'],
    complianceStatus: 'filed'
  };

  console.log('Testing PDF generation...');
  const { factory, reportPath } = await clerk.registerFactory(testFactory);
  
  console.log(`Generated PDF Path: ${reportPath}`);
  if (fs.existsSync(reportPath)) {
    console.log('SUCCESS: PDF file exists on disk!');
  } else {
    console.error('ERROR: PDF file was not created on disk.');
  }
}

runTest().catch(console.error);
