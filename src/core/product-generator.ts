import { WasteStream, MaterialCategory } from '../types/factory.types.js';
import { ProductConcept, WasteInput, ProcessCategory } from '../types/product.types.js';

interface ProductTemplate {
  name: string;
  description: string;
  inputCategories: MaterialCategory[];
  processCategory: ProcessCategory;
  manufacturingProcess: string;
  productionCostPerUnit: number;
  marketPricePerUnit: number;
  unit: string;
  targetMarket: string;
  competitiveAdvantage: string;
  environmentalBenefit: string;
  feasibilityBase: number;
}

const PRODUCT_TEMPLATES: ProductTemplate[] = [
  {
    name: 'EcoBoard Composite Panel',
    description: 'Compressed composite board from cellulosic and organic waste — used in interior wall panels and partitions',
    inputCategories: [MaterialCategory.CELLULOSIC, MaterialCategory.ORGANIC],
    processCategory: ProcessCategory.COMPRESSION_MOLDING,
    manufacturingProcess: 'Shred → mix with bio-binder → hot-press at 180°C → cool & trim',
    productionCostPerUnit: 280,
    marketPricePerUnit: 520,
    unit: 'sq.m',
    targetMarket: 'Construction & interior design',
    competitiveAdvantage: '40% lighter than plywood, termite-resistant, zero formaldehyde',
    environmentalBenefit: 'Diverts cellulose & organic waste from landfill, replaces virgin wood',
    feasibilityBase: 82,
  },
  {
    name: 'FiberFelt Insulation Roll',
    description: 'Thermal insulation from textile and polymeric fiber waste — R-value competitive with fiberglass',
    inputCategories: [MaterialCategory.TEXTILE, MaterialCategory.POLYMERIC],
    processCategory: ProcessCategory.BLENDING,
    manufacturingProcess: 'Open & blend fibers → needle-punch → heat-set → roll & pack',
    productionCostPerUnit: 150,
    marketPricePerUnit: 340,
    unit: 'sq.m',
    targetMarket: 'Building insulation, cold storage facilities',
    competitiveAdvantage: 'No itch factor, moisture-resistant, recyclable',
    environmentalBenefit: 'Upcycles textile waste, avoids energy-intensive fiberglass production',
    feasibilityBase: 78,
  },
  {
    name: 'GreenPellet Recycled Resin',
    description: 'Washed, shredded and re-pelletized PE/PP from plastic waste — injection-molding grade',
    inputCategories: [MaterialCategory.POLYMERIC],
    processCategory: ProcessCategory.PELLETIZING,
    manufacturingProcess: 'Sort → wash → shred → melt extrude → pelletize → QC',
    productionCostPerUnit: 45,
    marketPricePerUnit: 78,
    unit: 'kg',
    targetMarket: 'Plastics manufacturers, packaging industry',
    competitiveAdvantage: 'Consistent melt-flow index, 30% cheaper than virgin resin',
    environmentalBenefit: 'Prevents ocean/landfill pollution, saves petroleum extraction',
    feasibilityBase: 90,
  },
  {
    name: 'BioChar Fuel Briquette',
    description: 'High-calorific compressed fuel briquettes from organic and cellulosic waste',
    inputCategories: [MaterialCategory.ORGANIC, MaterialCategory.CELLULOSIC],
    processCategory: ProcessCategory.PYROLYSIS,
    manufacturingProcess: 'Dry to <10% moisture → carbonize at 400°C → crush → bind → compress',
    productionCostPerUnit: 8,
    marketPricePerUnit: 18,
    unit: 'kg',
    targetMarket: 'Industrial boilers, brick kilns, biomass power plants',
    competitiveAdvantage: 'Higher calorific value than raw biomass, low ash, smokeless',
    environmentalBenefit: 'Carbon-neutral fuel, replaces coal in industrial heating',
    feasibilityBase: 85,
  },
  {
    name: 'MetalBlend Alloy Ingot',
    description: 'Re-smelted alloy ingots from mixed metal scrap — foundry-grade',
    inputCategories: [MaterialCategory.METALLIC],
    processCategory: ProcessCategory.CASTING,
    manufacturingProcess: 'Sort by alloy type → clean → induction melt → degas → cast ingots',
    productionCostPerUnit: 120,
    marketPricePerUnit: 195,
    unit: 'kg',
    targetMarket: 'Foundries, auto component manufacturers',
    competitiveAdvantage: 'Certified composition, 25% below LME virgin price',
    environmentalBenefit: 'Saves 95% of energy vs mining & refining virgin ore',
    feasibilityBase: 88,
  },
  {
    name: 'CelluFill Paper Additive',
    description: 'Micronized cellulose filler powder from paper sludge and wood dust',
    inputCategories: [MaterialCategory.CELLULOSIC],
    processCategory: ProcessCategory.BLENDING,
    manufacturingProcess: 'Dry sludge → ball-mill to 50μm → classify → bag',
    productionCostPerUnit: 12,
    marketPricePerUnit: 28,
    unit: 'kg',
    targetMarket: 'Paper mills, paint industry, composite manufacturers',
    competitiveAdvantage: 'Uniform particle size, consistent whiteness index',
    environmentalBenefit: 'Converts paper mill waste into value-added industrial filler',
    feasibilityBase: 75,
  },
  {
    name: 'RubberMat Floor Tile',
    description: 'Interlocking rubber floor tiles from recycled rubber crumb',
    inputCategories: [MaterialCategory.POLYMERIC],
    processCategory: ProcessCategory.COMPRESSION_MOLDING,
    manufacturingProcess: 'Crumb rubber → mix with binder → compression mold at 160°C → cure',
    productionCostPerUnit: 200,
    marketPricePerUnit: 450,
    unit: 'sq.m',
    targetMarket: 'Gyms, playgrounds, factory floors',
    competitiveAdvantage: 'Shock-absorbing, anti-slip, weather-resistant',
    environmentalBenefit: 'Diverts rubber waste from incineration or landfill',
    feasibilityBase: 80,
  },
];

let productCounter = 0;

export function generateProductConcepts(
  allWasteStreams: WasteStream[],
  factoryLookup?: Map<string, string>
): ProductConcept[] {
  const products: ProductConcept[] = [];
  const streamsByCategory = new Map<MaterialCategory, WasteStream[]>();

  for (const ws of allWasteStreams) {
    const list = streamsByCategory.get(ws.materialCategory) ?? [];
    list.push(ws);
    streamsByCategory.set(ws.materialCategory, list);
  }

  for (const template of PRODUCT_TEMPLATES) {
    const matchingStreams: WasteStream[] = [];
    let hasAllCategories = true;

    for (const cat of template.inputCategories) {
      const candidates = streamsByCategory.get(cat) ?? [];
      if (candidates.length === 0) {
        hasAllCategories = false;
        break;
      }
      matchingStreams.push(candidates[0]);
      if (candidates.length > 1) matchingStreams.push(candidates[1]);
    }

    if (!hasAllCategories) continue;

    const uniqueStreams = matchingStreams.filter((ws, i, arr) =>
      arr.findIndex(w => w.id === ws.id) === i
    ).slice(0, 4);

    const sourceWasteStreams: WasteInput[] = uniqueStreams.map(ws => ({
      factoryId: ws.factoryId,
      factoryName: factoryLookup?.get(ws.factoryId) ?? ws.factoryId,
      wasteStreamId: ws.id,
      wasteType: ws.wasteType,
      volumeRequired: Math.round(ws.volumePerDay * 0.5),
      unit: ws.unit,
    }));

    const avgReusePotential = uniqueStreams.reduce((s, w) => s + w.reusePotential, 0) / uniqueStreams.length;
    const feasibilityScore = Math.round(template.feasibilityBase * 0.6 + avgReusePotential * 0.4);

    products.push({
      id: `prod_${++productCounter}`,
      name: template.name,
      description: template.description,
      sourceWasteStreams,
      manufacturingProcess: template.manufacturingProcess,
      processCategory: template.processCategory,
      feasibilityScore,
      productionCostPerUnit: template.productionCostPerUnit,
      marketPricePerUnit: template.marketPricePerUnit,
      unit: template.unit,
      targetMarket: template.targetMarket,
      competitiveAdvantage: template.competitiveAdvantage,
      environmentalBenefit: template.environmentalBenefit,
      generatedAt: new Date().toISOString(),
    });
  }

  return products.sort((a, b) => b.feasibilityScore - a.feasibilityScore);
}
