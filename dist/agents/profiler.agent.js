"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfilerAgent = void 0;
const waste_classifier_1 = require("../core/waste-classifier");
class ProfilerAgent {
    /**
     * Processes the FACTORY_PROFILED_PENDING event.
     * Classifies and explicitly defines all generated waste streams.
     */
    profile(event) {
        if (event.type !== 'FACTORY_PROFILED_PENDING')
            return null;
        const factory = event.payload;
        console.log(`[Profiler Agent] 📋 Activated for: "${factory.name}"`);
        // Core logic execution
        const inferredStreams = waste_classifier_1.WasteClassifier.inferWasteStreams(factory);
        factory.inferredWasteOutputs = inferredStreams;
        console.log(`[Profiler Agent] 📋 Classified ${inferredStreams.length} inferred waste streams:`);
        inferredStreams.forEach(stream => {
            console.log(`           → ${stream.name} (${stream.category}/${stream.physicalForm}, ${stream.estimatedDailyVolumeKg}kg/day, ${stream.contaminationLevel}, reuse: ${stream.reusePotentialScore}%)`);
        });
        const matchmakerEvent = {
            type: 'FACTORY_READY_FOR_MATCHING',
            payload: factory,
            timestamp: new Date()
        };
        return { event: matchmakerEvent };
    }
}
exports.ProfilerAgent = ProfilerAgent;
