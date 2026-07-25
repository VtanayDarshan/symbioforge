import { Factory, WasteStream } from '../types/factory.types.js';

// TODO (Member 2): Implement full SPCB Annual Environmental Statement template
// This template generates a formatted compliance report matching TNPCB requirements
// For the hackathon, generate a structured JSON that could be rendered as PDF

export interface SPCBStatementData {
  factoryName: string;
  factoryAddress: string;
  industryCategory: string;
  filingYear: string;
  productionDetails: {
    products: string[];
    rawMaterials: string[];
    capacityTonsPerDay: number;
  };
  wasteStreams: {
    type: string;
    category: string;
    quantity: string;
    disposal: string;
  }[];
  complianceStatus: string;
  generatedAt: string;
}

export function generateSPCBStatement(
  factory: Factory,
  wasteStreams: WasteStream[]
): SPCBStatementData {
  return {
    factoryName: factory.name,
    factoryAddress: `${factory.location.zone}, District: ${factory.location.districtId}`,
    industryCategory: factory.industry,
    filingYear: new Date().getFullYear().toString(),
    productionDetails: {
      products: factory.production.products,
      rawMaterials: factory.production.rawMaterials,
      capacityTonsPerDay: factory.production.capacityTonsPerDay,
    },
    wasteStreams: wasteStreams.map((ws) => ({
      type: ws.wasteType,
      category: ws.materialCategory,
      quantity: `${ws.volumePerDay} ${ws.unit}/day`,
      disposal: ws.contamination === 'hazardous' ? 'TSDF' : 'Recycling/Reuse',
    })),
    complianceStatus: 'Generated — pending factory submission to TNPCB',
    generatedAt: new Date().toISOString(),
  };
}
