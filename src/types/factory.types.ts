export enum IndustryType {
  TEXTILE_MANUFACTURING = 'textile_manufacturing',
  FOOD_PROCESSING = 'food_processing',
  PLASTICS_MANUFACTURING = 'plastics_manufacturing',
  METAL_FABRICATION = 'metal_fabrication',
  PAPER_MANUFACTURING = 'paper_manufacturing',
  CHEMICAL_PROCESSING = 'chemical_processing',
  ELECTRONICS_MANUFACTURING = 'electronics_manufacturing',
  RUBBER_PROCESSING = 'rubber_processing',
  GLASS_MANUFACTURING = 'glass_manufacturing',
  CEMENT_MANUFACTURING = 'cement_manufacturing',
  LEATHER_PROCESSING = 'leather_processing',
  WOOD_PROCESSING = 'wood_processing',
  RECYCLING = 'recycling',
  PACKAGING = 'packaging',
  AUTOMOTIVE_PARTS = 'automotive_parts',
}

export enum MaterialCategory {
  ORGANIC = 'organic',
  METALLIC = 'metallic',
  POLYMERIC = 'polymeric',
  CHEMICAL = 'chemical',
  TEXTILE = 'textile',
  CELLULOSIC = 'cellulosic',
  CERAMIC = 'ceramic',
  COMPOSITE = 'composite',
}

export enum PhysicalForm {
  POWDER = 'powder',
  FIBER = 'fiber',
  LIQUID = 'liquid',
  SOLID = 'solid',
  PELLETS = 'pellets',
  FILM = 'film',
  SLUDGE = 'sludge',
  GAS = 'gas',
  GRANULES = 'granules',
  CHIPS = 'chips',
}

export enum ContaminationLevel {
  CLEAN = 'clean',
  MILD = 'mild',
  HIGH = 'high',
  HAZARDOUS = 'hazardous',
}

export interface Location {
  lat: number;
  lng: number;
  zone: string;
  districtId: string;
}

export interface ProductionInfo {
  capacityTonsPerDay: number;
  products: string[];
  rawMaterials: string[];
}

export interface Factory {
  id: string;
  name: string;
  location: Location;
  industry: IndustryType;
  subtype: string;
  production: ProductionInfo;
  employees: number;
  operatingHoursPerDay: number;
  registeredAt: string;
  lastUpdated: string;
  isActive: boolean;
}

export interface WasteStream {
  id: string;
  factoryId: string;
  wasteType: string;
  materialCategory: MaterialCategory;
  physicalForm: PhysicalForm;
  volumePerDay: number;
  unit: string;
  contamination: ContaminationLevel;
  reusePotential: number;
  seasonalVariation: SeasonalPattern;
  description: string;
}

export interface SeasonalPattern {
  peakMonths: number[];
  lowMonths: number[];
  variationPercent: number;
}

export interface ComplianceReport {
  id: string;
  factoryId: string;
  filingYear: string;
  generatedAt: string;
  status: 'draft' | 'generated' | 'submitted';
  pdfUrl: string | null;
}
