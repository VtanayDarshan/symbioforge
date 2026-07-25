import { Factory, WasteStream, IndustryType, MaterialCategory, PhysicalForm, ContaminationLevel } from '../types/factory.types.js';

interface WasteTemplate {
  wasteType: string;
  materialCategory: MaterialCategory;
  physicalForm: PhysicalForm;
  contamination: ContaminationLevel;
  reusePotential: number;
  volumeFraction: number;
  unit: string;
  description: string;
}

const INDUSTRY_WASTE_MAP: Record<string, WasteTemplate[]> = {
  [IndustryType.TEXTILE_MANUFACTURING]: [
    { wasteType: 'Cotton lint waste', materialCategory: MaterialCategory.TEXTILE, physicalForm: PhysicalForm.FIBER, contamination: ContaminationLevel.CLEAN, reusePotential: 88, volumeFraction: 0.013, unit: 'kg', description: 'Loose cotton fiber from spinning and weaving' },
    { wasteType: 'Polyester fiber scraps', materialCategory: MaterialCategory.POLYMERIC, physicalForm: PhysicalForm.FIBER, contamination: ContaminationLevel.CLEAN, reusePotential: 82, volumeFraction: 0.008, unit: 'kg', description: 'Cut polyester fiber waste from blending' },
    { wasteType: 'Dye effluent', materialCategory: MaterialCategory.CHEMICAL, physicalForm: PhysicalForm.LIQUID, contamination: ContaminationLevel.HIGH, reusePotential: 35, volumeFraction: 0.04, unit: 'L', description: 'Chemical-laden wastewater from dyeing process' },
    { wasteType: 'Cardboard packaging waste', materialCategory: MaterialCategory.CELLULOSIC, physicalForm: PhysicalForm.SOLID, contamination: ContaminationLevel.CLEAN, reusePotential: 95, volumeFraction: 0.004, unit: 'kg', description: 'Used cardboard from raw material packaging' },
  ],
  [IndustryType.FOOD_PROCESSING]: [
    { wasteType: 'Rice husk', materialCategory: MaterialCategory.ORGANIC, physicalForm: PhysicalForm.GRANULES, contamination: ContaminationLevel.CLEAN, reusePotential: 90, volumeFraction: 0.20, unit: 'kg', description: 'Outer covering of rice grain — high silica content' },
    { wasteType: 'Rice bran', materialCategory: MaterialCategory.ORGANIC, physicalForm: PhysicalForm.POWDER, contamination: ContaminationLevel.CLEAN, reusePotential: 85, volumeFraction: 0.08, unit: 'kg', description: 'Nutritious outer layer removed during polishing' },
    { wasteType: 'Broken rice', materialCategory: MaterialCategory.ORGANIC, physicalForm: PhysicalForm.GRANULES, contamination: ContaminationLevel.CLEAN, reusePotential: 75, volumeFraction: 0.05, unit: 'kg', description: 'Broken grains from milling process' },
    { wasteType: 'Organic process water', materialCategory: MaterialCategory.CHEMICAL, physicalForm: PhysicalForm.LIQUID, contamination: ContaminationLevel.MILD, reusePotential: 40, volumeFraction: 0.03, unit: 'L', description: 'Starch-laden wash water from grain processing' },
  ],
  [IndustryType.PAPER_MANUFACTURING]: [
    { wasteType: 'Paper sludge', materialCategory: MaterialCategory.CELLULOSIC, physicalForm: PhysicalForm.SLUDGE, contamination: ContaminationLevel.MILD, reusePotential: 60, volumeFraction: 0.06, unit: 'kg', description: 'Residual cellulose fiber from pulping' },
    { wasteType: 'Reject fiber', materialCategory: MaterialCategory.CELLULOSIC, physicalForm: PhysicalForm.FIBER, contamination: ContaminationLevel.CLEAN, reusePotential: 70, volumeFraction: 0.03, unit: 'kg', description: 'Short or contaminated fibers screened out during processing' },
    { wasteType: 'Ink sludge', materialCategory: MaterialCategory.CHEMICAL, physicalForm: PhysicalForm.SLUDGE, contamination: ContaminationLevel.HIGH, reusePotential: 25, volumeFraction: 0.01, unit: 'kg', description: 'Waste from de-inking recycled paper' },
    { wasteType: 'Cardboard trim waste', materialCategory: MaterialCategory.CELLULOSIC, physicalForm: PhysicalForm.SOLID, contamination: ContaminationLevel.CLEAN, reusePotential: 92, volumeFraction: 0.04, unit: 'kg', description: 'Edge trimmings from cardboard cutting' },
  ],
  [IndustryType.METAL_FABRICATION]: [
    { wasteType: 'Aluminum shavings', materialCategory: MaterialCategory.METALLIC, physicalForm: PhysicalForm.CHIPS, contamination: ContaminationLevel.MILD, reusePotential: 92, volumeFraction: 0.08, unit: 'kg', description: 'Metal chips from CNC machining and cutting' },
    { wasteType: 'Steel scrap offcuts', materialCategory: MaterialCategory.METALLIC, physicalForm: PhysicalForm.SOLID, contamination: ContaminationLevel.CLEAN, reusePotential: 95, volumeFraction: 0.10, unit: 'kg', description: 'Sheet metal offcuts from fabrication' },
    { wasteType: 'Used cutting oil', materialCategory: MaterialCategory.CHEMICAL, physicalForm: PhysicalForm.LIQUID, contamination: ContaminationLevel.HIGH, reusePotential: 45, volumeFraction: 0.005, unit: 'L', description: 'Spent metalworking fluid from machining' },
    { wasteType: 'Welding slag', materialCategory: MaterialCategory.CERAMIC, physicalForm: PhysicalForm.SOLID, contamination: ContaminationLevel.MILD, reusePotential: 30, volumeFraction: 0.02, unit: 'kg', description: 'Vitreous byproduct from welding processes' },
  ],
  [IndustryType.PLASTICS_MANUFACTURING]: [
    { wasteType: 'PE film scraps', materialCategory: MaterialCategory.POLYMERIC, physicalForm: PhysicalForm.FILM, contamination: ContaminationLevel.CLEAN, reusePotential: 90, volumeFraction: 0.06, unit: 'kg', description: 'Polyethylene film trimmings from molding' },
    { wasteType: 'PP runner waste', materialCategory: MaterialCategory.POLYMERIC, physicalForm: PhysicalForm.SOLID, contamination: ContaminationLevel.CLEAN, reusePotential: 88, volumeFraction: 0.05, unit: 'kg', description: 'Polypropylene runner and sprue waste from injection molding' },
    { wasteType: 'Mixed plastic dust', materialCategory: MaterialCategory.POLYMERIC, physicalForm: PhysicalForm.POWDER, contamination: ContaminationLevel.MILD, reusePotential: 50, volumeFraction: 0.01, unit: 'kg', description: 'Fine plastic dust from grinding and trimming' },
    { wasteType: 'Defective molded parts', materialCategory: MaterialCategory.POLYMERIC, physicalForm: PhysicalForm.SOLID, contamination: ContaminationLevel.CLEAN, reusePotential: 85, volumeFraction: 0.03, unit: 'kg', description: 'Rejected parts that can be reground and reprocessed' },
  ],
  [IndustryType.CHEMICAL_PROCESSING]: [
    { wasteType: 'Spent solvents', materialCategory: MaterialCategory.CHEMICAL, physicalForm: PhysicalForm.LIQUID, contamination: ContaminationLevel.HAZARDOUS, reusePotential: 40, volumeFraction: 0.03, unit: 'L', description: 'Used organic solvents from manufacturing' },
    { wasteType: 'Chemical sludge', materialCategory: MaterialCategory.CHEMICAL, physicalForm: PhysicalForm.SLUDGE, contamination: ContaminationLevel.HAZARDOUS, reusePotential: 20, volumeFraction: 0.02, unit: 'kg', description: 'Residual sludge from chemical reactions' },
    { wasteType: 'Empty chemical drums', materialCategory: MaterialCategory.METALLIC, physicalForm: PhysicalForm.SOLID, contamination: ContaminationLevel.MILD, reusePotential: 80, volumeFraction: 0.01, unit: 'kg', description: 'Steel and HDPE drums from raw material delivery' },
    { wasteType: 'Off-spec product', materialCategory: MaterialCategory.CHEMICAL, physicalForm: PhysicalForm.LIQUID, contamination: ContaminationLevel.MILD, reusePotential: 65, volumeFraction: 0.015, unit: 'L', description: 'Products not meeting specifications that can be reprocessed' },
  ],
  [IndustryType.RECYCLING]: [
    { wasteType: 'Non-recyclable residue', materialCategory: MaterialCategory.COMPOSITE, physicalForm: PhysicalForm.SOLID, contamination: ContaminationLevel.HIGH, reusePotential: 15, volumeFraction: 0.15, unit: 'kg', description: 'Mixed material residue that cannot be further separated' },
    { wasteType: 'Wash water effluent', materialCategory: MaterialCategory.CHEMICAL, physicalForm: PhysicalForm.LIQUID, contamination: ContaminationLevel.MILD, reusePotential: 30, volumeFraction: 0.05, unit: 'L', description: 'Water used to wash incoming recyclable materials' },
  ],
  [IndustryType.PACKAGING]: [
    { wasteType: 'Cardboard trim waste', materialCategory: MaterialCategory.CELLULOSIC, physicalForm: PhysicalForm.SOLID, contamination: ContaminationLevel.CLEAN, reusePotential: 93, volumeFraction: 0.08, unit: 'kg', description: 'Edge trimmings from box cutting' },
    { wasteType: 'Ink and adhesive waste', materialCategory: MaterialCategory.CHEMICAL, physicalForm: PhysicalForm.LIQUID, contamination: ContaminationLevel.MILD, reusePotential: 30, volumeFraction: 0.005, unit: 'L', description: 'Leftover printing inks and adhesives' },
    { wasteType: 'Paper dust', materialCategory: MaterialCategory.CELLULOSIC, physicalForm: PhysicalForm.POWDER, contamination: ContaminationLevel.CLEAN, reusePotential: 70, volumeFraction: 0.02, unit: 'kg', description: 'Fine cellulose particles from cutting and folding' },
  ],
  [IndustryType.WOOD_PROCESSING]: [
    { wasteType: 'Sawdust', materialCategory: MaterialCategory.ORGANIC, physicalForm: PhysicalForm.POWDER, contamination: ContaminationLevel.CLEAN, reusePotential: 85, volumeFraction: 0.12, unit: 'kg', description: 'Fine wood particles from sawing and planing' },
    { wasteType: 'Wood shavings', materialCategory: MaterialCategory.ORGANIC, physicalForm: PhysicalForm.FIBER, contamination: ContaminationLevel.CLEAN, reusePotential: 80, volumeFraction: 0.08, unit: 'kg', description: 'Curled wood strips from planing operations' },
    { wasteType: 'Bark waste', materialCategory: MaterialCategory.ORGANIC, physicalForm: PhysicalForm.SOLID, contamination: ContaminationLevel.CLEAN, reusePotential: 70, volumeFraction: 0.05, unit: 'kg', description: 'Outer bark stripped from timber logs' },
    { wasteType: 'Adhesive and varnish waste', materialCategory: MaterialCategory.CHEMICAL, physicalForm: PhysicalForm.LIQUID, contamination: ContaminationLevel.MILD, reusePotential: 25, volumeFraction: 0.008, unit: 'L', description: 'Spent adhesives and varnish from finishing' },
  ],
  [IndustryType.RUBBER_PROCESSING]: [
    { wasteType: 'Rubber trim scrap', materialCategory: MaterialCategory.POLYMERIC, physicalForm: PhysicalForm.SOLID, contamination: ContaminationLevel.CLEAN, reusePotential: 80, volumeFraction: 0.07, unit: 'kg', description: 'Flash and trim waste from rubber molding' },
    { wasteType: 'Rubber dust', materialCategory: MaterialCategory.POLYMERIC, physicalForm: PhysicalForm.POWDER, contamination: ContaminationLevel.MILD, reusePotential: 60, volumeFraction: 0.02, unit: 'kg', description: 'Fine rubber particles from buffing and grinding' },
    { wasteType: 'Defective rubber parts', materialCategory: MaterialCategory.POLYMERIC, physicalForm: PhysicalForm.SOLID, contamination: ContaminationLevel.CLEAN, reusePotential: 75, volumeFraction: 0.03, unit: 'kg', description: 'Rejected parts that can be reground' },
  ],
};

let wasteIdCounter = 0;

export function classifyWasteStreams(factory: Factory): WasteStream[] {
  const templates = INDUSTRY_WASTE_MAP[factory.industry] ?? [];
  const capacityKgPerDay = factory.production.capacityTonsPerDay * 1000;

  return templates.map((template) => {
    const volumePerDay = Math.round(capacityKgPerDay * template.volumeFraction);
    return {
      id: `ws_${factory.id}_${++wasteIdCounter}`,
      factoryId: factory.id,
      wasteType: template.wasteType,
      materialCategory: template.materialCategory,
      physicalForm: template.physicalForm,
      volumePerDay,
      unit: template.unit,
      contamination: template.contamination,
      reusePotential: template.reusePotential,
      seasonalVariation: {
        peakMonths: [10, 11, 12, 1, 2],
        lowMonths: [5, 6, 7],
        variationPercent: 15,
      },
      description: template.description,
    };
  });
}
