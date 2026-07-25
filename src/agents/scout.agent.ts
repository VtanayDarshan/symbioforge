import { FactoryProfile, SystemEvent } from '../types';

export class ScoutAgent {
  /**
   * Ingests data when a new factory is discovered or registered.
   * Processes the FACTORY_REGISTERED event from The Clerk.
   */
  public ingest(event: SystemEvent): { event: SystemEvent } | null {
    if (event.type !== 'FACTORY_REGISTERED') return null;

    const factory: FactoryProfile = event.payload;
    console.log(`[Scout Agent] 🔍 Ingesting new factory profile: "${factory.name}"`);
    console.log(`[Scout Agent] 🔍 Industry: ${factory.industryType}`);
    console.log(`[Scout Agent] 🔍 Location: Lat ${factory.locationCoordinates.lat}, Lng ${factory.locationCoordinates.lng}`);
    
    // Scout packages it and forwards to the Profiler
    const profilerEvent: SystemEvent = {
      type: 'FACTORY_PROFILED_PENDING',
      payload: factory,
      timestamp: new Date()
    };
    
    return { event: profilerEvent };
  }
}
