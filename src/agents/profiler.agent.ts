import { FactoryProfile, SystemEvent } from '../types';
import { WasteClassifier } from '../core/waste-classifier';

export class ProfilerAgent {
  /**
   * Processes the FACTORY_PROFILED_PENDING event.
   * Classifies and explicitly defines all generated waste streams.
   */
  public profile(event: SystemEvent): { event: SystemEvent } | null {
    if (event.type !== 'FACTORY_PROFILED_PENDING') return null;

    const factory: FactoryProfile = event.payload;
    console.log(`[Profiler Agent] 📋 Activated for: "${factory.name}"`);
    
    // Core logic execution
    const inferredStreams = WasteClassifier.inferWasteStreams(factory);
    factory.inferredWasteOutputs = inferredStreams;
    
    console.log(`[Profiler Agent] 📋 Classified ${inferredStreams.length} inferred waste streams:`);
    inferredStreams.forEach(stream => {
      console.log(`           → ${stream.name} (${stream.category}/${stream.physicalForm}, ${stream.estimatedDailyVolumeKg}kg/day, ${stream.contaminationLevel}, reuse: ${stream.reusePotentialScore}%)`);
    });

    const matchmakerEvent: SystemEvent = {
      type: 'FACTORY_READY_FOR_MATCHING',
      payload: factory,
      timestamp: new Date()
    };
    
    return { event: matchmakerEvent };
  }
}
