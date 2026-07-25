"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const clerk_agent_1 = require("./agents/clerk.agent");
const scout_agent_1 = require("./agents/scout.agent");
const profiler_agent_1 = require("./agents/profiler.agent");
const matchmaker_agent_1 = require("./agents/matchmaker.agent");
// Instantiate the autonomous agents
const clerk = new clerk_agent_1.ClerkAgent();
const scout = new scout_agent_1.ScoutAgent();
const profiler = new profiler_agent_1.ProfilerAgent();
const matchmaker = new matchmaker_agent_1.MatchmakerAgent();
// Dummy existing cluster
const existingCluster = [
    {
        id: 'f_1001',
        name: 'GreenPulp Paper Mill',
        industryType: 'Paper Manufacturing',
        locationCoordinates: { lat: 11.0168, lng: 76.9558 },
        productionCapacityDailyKg: 2000,
        rawMaterialsConsumed: ['wood pulp', 'recycled paper', 'cotton lint'],
        declaredWasteOutputs: []
    },
    {
        id: 'f_1002',
        name: 'PackRight Packaging',
        industryType: 'Cardboard Packaging Reuse',
        locationCoordinates: { lat: 11.0268, lng: 76.9658 },
        productionCapacityDailyKg: 500,
        rawMaterialsConsumed: ['cardboard'],
        declaredWasteOutputs: []
    }
];
matchmaker.seedCluster(existingCluster);
// 1. New factory submits their compliance form to The Clerk
const newFactoryInput = {
    id: 'f_2001',
    name: 'Lakshmi Textiles Pvt Ltd',
    industryType: 'Textile Manufacturing',
    locationCoordinates: { lat: 11.0188, lng: 76.9588 },
    productionCapacityDailyKg: 5000,
    rawMaterialsConsumed: ['cotton', 'polyester'],
    declaredWasteOutputs: []
};
console.log('--- STARTING AUTONOMOUS AGENT CHAIN ---');
// Chain Execution
const { complianceReport, event: clerkEvent } = clerk.registerFactory(newFactoryInput);
console.log('\n[Factory View] Compliance Report Downloaded:\n' + complianceReport);
// Clerk triggers Scout
const scoutResult = scout.ingest(clerkEvent);
if (scoutResult) {
    // Scout triggers Profiler
    const profilerResult = profiler.profile(scoutResult.event);
    if (profilerResult) {
        // Profiler triggers Matchmaker
        matchmaker.match(profilerResult.event);
    }
}
console.log('--- END OF DISCOVERY CHAIN ---');
