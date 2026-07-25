import { FactoryProfile, SymbioticMatch, SystemEvent } from '../types';
import { MatchingAlgorithm } from '../core/matching-algorithm';

export class MatchmakerAgent {
  private activeCluster: FactoryProfile[] = [];
  private activeMatches: SymbioticMatch[] = [];

  /**
   * Used to seed the cluster with existing factories (e.g., from mock data).
   */
  public seedCluster(factories: FactoryProfile[]) {
    this.activeCluster = factories;
  }

  /**
   * Process a factory that has been completely profiled and is ready for matching.
   */
  public match(event: SystemEvent): { events: SystemEvent[] } | null {
    if (event.type !== 'FACTORY_READY_FOR_MATCHING') return null;

    const newFactory: FactoryProfile = event.payload;
    console.log(`[Matchmaker Agent] 🤝 Scanning cluster (${this.activeCluster.length} existing factories) for symbioses with "${newFactory.name}"...`);
    
    // Add to cluster state
    const existingIndex = this.activeCluster.findIndex(f => f.id === newFactory.id);
    if (existingIndex >= 0) {
      this.activeCluster[existingIndex] = newFactory; // Update
    } else {
      this.activeCluster.push(newFactory); // New addition
    }

    const newMatches: SymbioticMatch[] = [];

    // Scan new factory's waste against all other factories
    for (const targetFactory of this.activeCluster) {
      if (targetFactory.id === newFactory.id) continue;
      
      // 1. Can someone else use the new factory's waste?
      const outgoingMatches = MatchingAlgorithm.findMatches(newFactory, targetFactory);
      newMatches.push(...outgoingMatches);

      // 2. Can the new factory use someone else's waste?
      const incomingMatches = MatchingAlgorithm.findMatches(targetFactory, newFactory);
      newMatches.push(...incomingMatches);
    }

    this.activeMatches.push(...newMatches);
    
    console.log(`[Matchmaker Agent] 🤝 Found ${newMatches.length} new matches.`);
    newMatches.forEach(m => {
      const source = this.activeCluster.find(f => f.id === m.sourceFactoryId)?.name;
      const target = this.activeCluster.find(f => f.id === m.targetFactoryId)?.name;
      console.log(`           → ${source} waste goes to ${target} (Score: ${m.confidenceScore}%, Dist: ${m.distanceKm}km)`);
    });

    // We can also trigger the Inventor here as requested in the architecture
    const auditorEvent: SystemEvent = {
      type: 'MATCHES_DISCOVERED',
      payload: newMatches,
      timestamp: new Date()
    };
    
    const inventorEvent: SystemEvent = {
      type: 'WASTE_PORTFOLIO_CHANGED',
      payload: { cluster: this.activeCluster },
      timestamp: new Date()
    };
    
    return { events: [auditorEvent, inventorEvent] };
  }
}
