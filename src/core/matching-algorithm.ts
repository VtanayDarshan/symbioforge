import { FactoryProfile, WasteStream, SymbioticMatch } from '../types';
import { CompatibilityMatrix } from './compatibility-matrix';

export class MatchingAlgorithm {
  /**
   * Calculates the geographic distance between two sets of coordinates using the Haversine formula.
   */
  public static calculateDistance(
    coord1: { lat: number; lng: number },
    coord2: { lat: number; lng: number }
  ): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(coord2.lat - coord1.lat);
    const dLon = this.deg2rad(coord2.lng - coord1.lng); 
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(coord1.lat)) * Math.cos(this.deg2rad(coord2.lat)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    return R * c; 
  }

  private static deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  /**
   * Evaluates all possible matches between a source factory's waste streams and a target factory.
   */
  public static findMatches(source: FactoryProfile, target: FactoryProfile): SymbioticMatch[] {
    const matches: SymbioticMatch[] = [];
    const allWaste = [...(source.declaredWasteOutputs || []), ...(source.inferredWasteOutputs || [])];

    for (const waste of allWaste) {
      const materialScore = CompatibilityMatrix.evaluate(waste.category, waste.name, target.industryType);
      
      if (materialScore > 0) {
        const distance = this.calculateDistance(source.locationCoordinates, target.locationCoordinates);
        
        // Simple distance penalty: -1 score for every km over 10km
        const distancePenalty = distance > 10 ? Math.min(20, distance - 10) : 0;
        
        // Volume alignment (simplified: assuming target can take whatever is produced if it's the right industry)
        const volumeScore = 90;

        const finalScore = Math.round((materialScore * 0.6) + (volumeScore * 0.3) - distancePenalty);

        if (finalScore >= 50) { // Minimum threshold to be considered a match
          matches.push({
            id: `match_${Date.now()}_${Math.floor(Math.random()*1000)}`,
            sourceFactoryId: source.id,
            targetFactoryId: target.id,
            wasteStreamId: waste.id,
            confidenceScore: finalScore,
            distanceKm: Number(distance.toFixed(2)),
            materialCompatibilityScore: materialScore,
            volumeAlignmentScore: volumeScore
          });
        }
      }
    }
    return matches;
  }
}
