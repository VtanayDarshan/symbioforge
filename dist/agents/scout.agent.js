"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoutAgent = void 0;
class ScoutAgent {
    /**
     * Ingests data when a new factory is discovered or registered.
     * Processes the FACTORY_REGISTERED event from The Clerk.
     */
    ingest(event) {
        if (event.type !== 'FACTORY_REGISTERED')
            return null;
        const factory = event.payload;
        console.log(`[Scout Agent] 🔍 Ingesting new factory profile: "${factory.name}"`);
        console.log(`[Scout Agent] 🔍 Industry: ${factory.industryType}`);
        console.log(`[Scout Agent] 🔍 Location: Lat ${factory.locationCoordinates.lat}, Lng ${factory.locationCoordinates.lng}`);
        // Scout packages it and forwards to the Profiler
        const profilerEvent = {
            type: 'FACTORY_PROFILED_PENDING',
            payload: factory,
            timestamp: new Date()
        };
        return { event: profilerEvent };
    }
}
exports.ScoutAgent = ScoutAgent;
