import { Factory, WasteStream, MaterialCategory, ContaminationLevel } from '../types/factory.types.js';
import { SymbioticMatch, MatchScores, MatchStatus } from '../types/match.types.js';

export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const INDUSTRY_ACCEPTS: Record<string, MaterialCategory[]> = {
  textile_manufacturing: [MaterialCategory.TEXTILE, MaterialCategory.POLYMERIC, MaterialCategory.CELLULOSIC],
  food_processing: [MaterialCategory.ORGANIC, MaterialCategory.CELLULOSIC],
  paper_manufacturing: [MaterialCategory.CELLULOSIC, MaterialCategory.ORGANIC],
  metal_fabrication: [MaterialCategory.METALLIC],
  plastics_manufacturing: [MaterialCategory.POLYMERIC],
  chemical_processing: [MaterialCategory.CHEMICAL, MaterialCategory.POLYMERIC],
  recycling: [MaterialCategory.POLYMERIC, MaterialCategory.METALLIC, MaterialCategory.TEXTILE, MaterialCategory.CELLULOSIC, MaterialCategory.ORGANIC],
  packaging: [MaterialCategory.CELLULOSIC, MaterialCategory.POLYMERIC],
  wood_processing: [MaterialCategory.ORGANIC, MaterialCategory.CELLULOSIC],
  rubber_processing: [MaterialCategory.POLYMERIC],
};

const CONTAMINATION_TOLERANCE: Record<string, number> = {
  recycling: 3,
  chemical_processing: 2,
  metal_fabrication: 2,
  plastics_manufacturing: 1,
  paper_manufacturing: 1,
  textile_manufacturing: 1,
  food_processing: 0,
  packaging: 0,
  wood_processing: 1,
  rubber_processing: 1,
};

const CONTAMINATION_RANK: Record<string, number> = {
  clean: 0, mild: 1, high: 2, hazardous: 3,
};

function targetProcessFor(waste: WasteStream, targetIndustry: string): string {
  const map: Record<string, Record<string, string>> = {
    recycling: {
      [MaterialCategory.POLYMERIC]: 'Shredding & pelletizing for recycled resin',
      [MaterialCategory.METALLIC]: 'Smelting & re-casting',
      [MaterialCategory.TEXTILE]: 'Fiber shredding & re-spinning',
      [MaterialCategory.CELLULOSIC]: 'Pulping & paper recycling',
      [MaterialCategory.ORGANIC]: 'Composting or biogas generation',
    },
    paper_manufacturing: {
      [MaterialCategory.CELLULOSIC]: 'Pulping as secondary fiber input',
      [MaterialCategory.ORGANIC]: 'Filler or biomass fuel for boiler',
    },
    plastics_manufacturing: {
      [MaterialCategory.POLYMERIC]: 'Regrinding into production pellets',
    },
    textile_manufacturing: {
      [MaterialCategory.TEXTILE]: 'Blending into yarn production',
      [MaterialCategory.POLYMERIC]: 'Fiber extrusion feedstock',
      [MaterialCategory.CELLULOSIC]: 'Packaging material reuse',
    },
    metal_fabrication: {
      [MaterialCategory.METALLIC]: 'Melting & alloying into new stock',
    },
    packaging: {
      [MaterialCategory.CELLULOSIC]: 'Direct reuse as packaging material',
      [MaterialCategory.POLYMERIC]: 'Film extrusion for wrapping',
    },
  };
  return map[targetIndustry]?.[waste.materialCategory] ?? `Input to ${targetIndustry} production`;
}

let matchCounter = 0;

export function findMatches(
  factories: Factory[],
  wasteProfiles: Map<string, WasteStream[]>
): SymbioticMatch[] {
  const matches: SymbioticMatch[] = [];

  for (const source of factories) {
    const sourceWaste = wasteProfiles.get(source.id) ?? [];
    if (sourceWaste.length === 0) continue;

    for (const target of factories) {
      if (source.id === target.id) continue;

      const accepts = INDUSTRY_ACCEPTS[target.industry] ?? [];
      const tolerance = CONTAMINATION_TOLERANCE[target.industry] ?? 0;

      for (const waste of sourceWaste) {
        if (!accepts.includes(waste.materialCategory)) continue;

        const wasteContam = CONTAMINATION_RANK[waste.contamination] ?? 0;
        if (wasteContam > tolerance) continue;

        const distKm = calculateDistance(
          source.location.lat, source.location.lng,
          target.location.lat, target.location.lng
        );

        const materialCompatibility = waste.reusePotential;
        const proximityScore = Math.max(0, 100 - distKm * 5);
        const volumeAlignment = Math.min(100, (waste.volumePerDay / (target.production.capacityTonsPerDay * 50)) * 100);
        const seasonalSync = 85;
        const contaminationFeasibility = Math.max(0, 100 - wasteContam * 30);

        const compositeScore = Math.round(
          materialCompatibility * 0.40 +
          proximityScore * 0.25 +
          volumeAlignment * 0.20 +
          seasonalSync * 0.15
        );

        if (compositeScore < 55) continue;

        const scores: MatchScores = {
          materialCompatibility,
          proximityScore: Math.round(proximityScore),
          volumeAlignment: Math.round(volumeAlignment),
          seasonalSync,
          contaminationFeasibility: Math.round(contaminationFeasibility),
        };

        matches.push({
          id: `match_${++matchCounter}`,
          sourceFactoryId: source.id,
          sourceFactoryName: source.name,
          targetFactoryId: target.id,
          targetFactoryName: target.name,
          wasteStreamId: waste.id,
          wasteType: waste.wasteType,
          targetProcess: targetProcessFor(waste, target.industry),
          scores,
          compositeScore,
          estimatedVolumePerDay: waste.volumePerDay,
          unit: waste.unit,
          distanceKm: Math.round(distKm * 100) / 100,
          status: MatchStatus.DISCOVERED,
          discoveredAt: new Date().toISOString(),
        });
      }
    }
  }

  return matches.sort((a, b) => b.compositeScore - a.compositeScore);
}
