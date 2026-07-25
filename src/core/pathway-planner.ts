import { OpportunityRanking } from '../types/impact.types.js';
import { ManufacturingPathway, ProcessStep, Equipment } from '../types/pathway.types.js';
import { SymbioticMatch } from '../types/match.types.js';
import { ProductConcept } from '../types/product.types.js';

let pathCounter = 0;

function matchPathway(match: SymbioticMatch, ranking: OpportunityRanking): ManufacturingPathway {
  const volumeKg = match.estimatedVolumePerDay;
  const steps: ProcessStep[] = [
    { stepNumber: 1, title: 'Waste Collection', description: `Collect ${match.wasteType} from ${match.sourceFactoryName} (${match.distanceKm} km)`, durationMinutes: 60, temperatureCelsius: null, pressureBar: null },
    { stepNumber: 2, title: 'Quality Inspection', description: 'Incoming material QC — check contamination, moisture, particle size', durationMinutes: 30, temperatureCelsius: null, pressureBar: null },
    { stepNumber: 3, title: 'Pre-processing', description: 'Sort, clean, and prepare material for integration into production', durationMinutes: 45, temperatureCelsius: null, pressureBar: null },
    { stepNumber: 4, title: 'Production Integration', description: `Feed processed material into ${match.targetProcess}`, durationMinutes: 90, temperatureCelsius: null, pressureBar: null },
    { stepNumber: 5, title: 'Output QC', description: 'Final product quality verification — ensure specs match virgin-material output', durationMinutes: 20, temperatureCelsius: null, pressureBar: null },
  ];
  const equipment: Equipment[] = [
    { name: 'Collection vehicle', specification: `1-ton pickup, ${match.distanceKm < 5 ? 'short-haul' : 'medium-haul'}`, costInr: 800000, supplier: 'Local fleet' },
    { name: 'Weighbridge', specification: '5-ton platform scale', costInr: 120000, supplier: 'Essae Teraoka' },
    { name: 'Material hopper', specification: `${Math.ceil(volumeKg / 100)} m³ capacity`, costInr: 85000, supplier: 'Local fabricator' },
  ];
  return {
    id: `path_${++pathCounter}`,
    opportunityId: ranking.id,
    opportunityType: 'match',
    title: `${match.wasteType}: ${match.sourceFactoryName} → ${match.targetFactoryName}`,
    steps,
    equipment,
    facilitySqft: 200,
    powerKw: 5,
    waterLitersPerDay: 100,
    workers: 2,
    setupCapexInr: equipment.reduce((s, e) => s + e.costInr, 0),
    setupTimelineMonths: 2,
    regulatoryNotes: ['TNPCB consent for waste transport', 'GST registration for inter-factory material transfer'],
    scalingPathway: 'Start with daily pickup → add dedicated route once volume exceeds 500 kg/day',
    designedAt: new Date().toISOString(),
  };
}

function productPathway(product: ProductConcept, ranking: OpportunityRanking): ManufacturingPathway {
  const steps: ProcessStep[] = [
    { stepNumber: 1, title: 'Raw Waste Reception', description: `Receive ${product.sourceWasteStreams.map(s => s.wasteType).join(', ')}`, durationMinutes: 30, temperatureCelsius: null, pressureBar: null },
    { stepNumber: 2, title: 'Sorting & Cleaning', description: 'Remove contaminants, wash if needed, air-dry', durationMinutes: 60, temperatureCelsius: null, pressureBar: null },
    { stepNumber: 3, title: 'Size Reduction', description: 'Shred, grind, or pulverize inputs to target particle size', durationMinutes: 45, temperatureCelsius: null, pressureBar: null },
    { stepNumber: 4, title: 'Mixing & Blending', description: 'Combine prepared inputs in design ratio with binders/additives', durationMinutes: 30, temperatureCelsius: null, pressureBar: null },
    { stepNumber: 5, title: 'Manufacturing', description: product.manufacturingProcess, durationMinutes: 120, temperatureCelsius: 180, pressureBar: 8 },
    { stepNumber: 6, title: 'Quality Testing', description: 'Test mechanical properties, dimensional accuracy, surface finish', durationMinutes: 30, temperatureCelsius: null, pressureBar: null },
    { stepNumber: 7, title: 'Packaging & Storage', description: 'Pack finished product, label, move to dispatch area', durationMinutes: 20, temperatureCelsius: null, pressureBar: null },
  ];
  const equipment: Equipment[] = [
    { name: 'Shredder', specification: '500 kg/hr industrial shredder', costInr: 350000, supplier: 'Vecoplan India' },
    { name: 'Mixing unit', specification: 'Ribbon blender, 200L', costInr: 180000, supplier: 'Jaygo Inc' },
    { name: 'Hydraulic press', specification: '100-ton, heated platens', costInr: 450000, supplier: 'Hydraulic Press Mfg' },
    { name: 'Conveyor system', specification: '10m belt conveyor', costInr: 120000, supplier: 'Local fabricator' },
  ];
  return {
    id: `path_${++pathCounter}`,
    opportunityId: ranking.id,
    opportunityType: 'product',
    title: `${product.name} — ${product.processCategory} line`,
    steps,
    equipment,
    facilitySqft: 2000,
    powerKw: 50,
    waterLitersPerDay: 500,
    workers: 8,
    setupCapexInr: equipment.reduce((s, e) => s + e.costInr, 0),
    setupTimelineMonths: 6,
    regulatoryNotes: [
      'TNPCB consent to operate for new manufacturing',
      'Factory license from DIC',
      'BIS certification for finished product',
      'Fire safety NOC from Tamil Nadu Fire & Rescue',
    ],
    scalingPathway: `Pilot (${Math.round(product.sourceWasteStreams.reduce((s, w) => s + w.volumeRequired, 0) * 0.2)} kg/day) → Scale 1 (full input) → Scale 2 (add shift, 2× output)`,
    designedAt: new Date().toISOString(),
  };
}

export function designPathway(opportunity: OpportunityRanking): ManufacturingPathway {
  if (opportunity.type === 'match') {
    return matchPathway(opportunity.opportunity as SymbioticMatch, opportunity);
  }
  return productPathway(opportunity.opportunity as ProductConcept, opportunity);
}
