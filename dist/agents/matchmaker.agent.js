"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchmakerAgent = void 0;
const matching_algorithm_1 = require("../core/matching-algorithm");
class MatchmakerAgent {
    constructor() {
        this.activeCluster = [];
        this.activeMatches = [];
    }
    /**
     * Used to seed the cluster with existing factories (e.g., from mock data).
     */
    seedCluster(factories) {
        this.activeCluster = factories;
    }
    /**
     * Process a factory that has been completely profiled and is ready for matching.
     */
    match(event) {
        if (event.type !== 'FACTORY_READY_FOR_MATCHING')
            return null;
        const newFactory = event.payload;
        console.log(`[Matchmaker Agent] 🤝 Scanning cluster (${this.activeCluster.length} existing factories) for symbioses with "${newFactory.name}"...`);
        // Add to cluster state
        const existingIndex = this.activeCluster.findIndex(f => f.id === newFactory.id);
        if (existingIndex >= 0) {
            this.activeCluster[existingIndex] = newFactory; // Update
        }
        else {
            this.activeCluster.push(newFactory); // New addition
        }
        const newMatches = [];
        // Scan new factory's waste against all other factories
        for (const targetFactory of this.activeCluster) {
            if (targetFactory.id === newFactory.id)
                continue;
            // 1. Can someone else use the new factory's waste?
            const outgoingMatches = matching_algorithm_1.MatchingAlgorithm.findMatches(newFactory, targetFactory);
            newMatches.push(...outgoingMatches);
            // 2. Can the new factory use someone else's waste?
            const incomingMatches = matching_algorithm_1.MatchingAlgorithm.findMatches(targetFactory, newFactory);
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
        const auditorEvent = {
            type: 'MATCHES_DISCOVERED',
            payload: newMatches,
            timestamp: new Date()
        };
        const inventorEvent = {
            type: 'WASTE_PORTFOLIO_CHANGED',
            payload: { cluster: this.activeCluster },
            timestamp: new Date()
        };
        return { events: [auditorEvent, inventorEvent] };
    }
}
exports.MatchmakerAgent = MatchmakerAgent;
