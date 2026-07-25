/**
 * Factory Stream Simulator
 * Simulates incoming factory data for realistic agent activity demonstration
 */

import { SimulatedFactoryStream } from '../types/agent-swarm';

// Extended factory database for stream generation
const FACTORY_POOL = [
  {
    id: 'FAC_NEW_001',
    name: 'TextilePro Manufacturing',
    industry: 'textile',
    wastes: [
      { name: 'cotton lint waste', category: 'textile', volumeRange: [500, 5000] },
      { name: 'dyeing effluent sludge', category: 'chemical', volumeRange: [200, 1500] }
    ]
  },
  {
    id: 'FAC_NEW_002',
    name: 'MetalCast Industries',
    industry: 'metal fabrication',
    wastes: [
      { name: 'metal shavings and chips', category: 'metallic', volumeRange: [1000, 10000] },
      { name: 'spent casting sand', category: 'mineral', volumeRange: [500, 5000] }
    ]
  },
  {
    id: 'FAC_NEW_003',
    name: 'PlastiForm Polymers',
    industry: 'plastics manufacturing',
    wastes: [
      { name: 'polyethylene scraps', category: 'polymeric', volumeRange: [1000, 7000] },
      { name: 'injection molding flash', category: 'polymeric', volumeRange: [200, 2500] }
    ]
  },
  {
    id: 'FAC_NEW_004',
    name: 'ChemBlend Solutions',
    industry: 'chemical processing',
    wastes: [
      { name: 'process wash water', category: 'chemical', volumeRange: [5000, 20000] },
      { name: 'spent catalyst pellets', category: 'chemical', volumeRange: [100, 1000] }
    ]
  },
  {
    id: 'FAC_NEW_005',
    name: 'EcoPaper Mills',
    industry: 'paper production',
    wastes: [
      { name: 'pulp mill effluent solids', category: 'organic', volumeRange: [2000, 10000] },
      { name: 'bleach box sludge', category: 'chemical', volumeRange: [500, 3000] }
    ]
  },
  {
    id: 'FAC_NEW_006',
    name: 'FiberTech Composites',
    industry: 'composite manufacturing',
    wastes: [
      { name: 'fiberglass trim waste', category: 'polymeric', volumeRange: [500, 3000] },
      { name: 'epoxy resin spills', category: 'polymeric', volumeRange: [100, 500] }
    ]
  },
  {
    id: 'FAC_NEW_007',
    name: 'BioOrgan Fertilizers',
    industry: 'organic fertilizer',
    wastes: [
      { name: 'excess compost material', category: 'organic', volumeRange: [1000, 5000] },
      { name: 'sieving dust', category: 'organic', volumeRange: [300, 1500] }
    ]
  },
  {
    id: 'FAC_NEW_008',
    name: 'GlassForm Industries',
    industry: 'glass manufacturing',
    wastes: [
      { name: 'glass cullet (broken glass)', category: 'mineral', volumeRange: [1000, 4000] },
      { name: 'furnace silica dust', category: 'mineral', volumeRange: [300, 1500] }
    ]
  }
];

const CONTAMINATION_LEVELS = ['clean', 'mildly_contaminated', 'requires_treatment'];

/**
 * Factory Stream Simulator
 * Generates realistic factory intake data at intervals
 */
export class FactoryStreamSimulator {
  private factoryIndex = 0;
  private activityLog: SimulatedFactoryStream[] = [];

  /**
   * Generate next factory stream
   */
  generateNextFactory(): SimulatedFactoryStream {
    const factory = FACTORY_POOL[this.factoryIndex % FACTORY_POOL.length];
    this.factoryIndex++;

    const wasteStreams = factory.wastes.map((waste, idx) => {
      const [minVolume, maxVolume] = waste.volumeRange;
      const volume = Math.floor(Math.random() * (maxVolume - minVolume) + minVolume);
      const contamination = CONTAMINATION_LEVELS[
        Math.floor(Math.random() * CONTAMINATION_LEVELS.length)
      ];

      return {
        id: `WASTE_${factory.id}_${idx}`,
        name: waste.name,
        category: waste.category,
        volume,
        contamination
      };
    });

    const stream: SimulatedFactoryStream = {
      id: `STREAM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      factoryId: factory.id,
      factoryName: factory.name,
      industryType: factory.industry,
      timestamp: new Date(),
      wasteStreams,
      processingStatus: 'pending'
    };

    this.activityLog.push(stream);
    return stream;
  }

  /**
   * Generate multiple factories with random intervals
   */
  generateBatchWithDelays(count: number): Promise<SimulatedFactoryStream[]> {
    return new Promise((resolve) => {
      const batch: SimulatedFactoryStream[] = [];
      let processed = 0;

      const generateWithDelay = () => {
        if (processed >= count) {
          resolve(batch);
          return;
        }

        const factory = this.generateNextFactory();
        batch.push(factory);
        processed++;

        // Random delay between 500ms - 3000ms
        const delay = Math.random() * 2500 + 500;
        setTimeout(generateWithDelay, delay);
      };

      generateWithDelay();
    });
  }

  /**
   * Generate stream of factories at regular interval
   */
  startContinuousStream(
    intervalMs: number,
    onFactory: (factory: SimulatedFactoryStream) => void
  ): NodeJS.Timeout {
    return setInterval(() => {
      const factory = this.generateNextFactory();
      onFactory(factory);
    }, intervalMs);
  }

  /**
   * Get activity log
   */
  getActivityLog(): SimulatedFactoryStream[] {
    return this.activityLog;
  }

  /**
   * Get recent factories (last N entries)
   */
  getRecentFactories(count: number): SimulatedFactoryStream[] {
    return this.activityLog.slice(-count);
  }

  /**
   * Get statistics
   */
  getStatistics() {
    const totalVolume = this.activityLog.reduce((sum, s) => {
      return sum + s.wasteStreams.reduce((wsum, w) => wsum + w.volume, 0);
    }, 0);

    const industryCount: Record<string, number> = {};
    this.activityLog.forEach(s => {
      industryCount[s.industryType] = (industryCount[s.industryType] || 0) + 1;
    });

    return {
      totalFactoriesProcessed: this.activityLog.length,
      totalWasteVolume: totalVolume,
      industriesRepresented: Object.keys(industryCount).length,
      industryBreakdown: industryCount,
      averageWasteStreamsPerFactory: 
        this.activityLog.reduce((sum, s) => sum + s.wasteStreams.length, 0) / 
        (this.activityLog.length || 1)
    };
  }

  /**
   * Reset simulator
   */
  reset(): void {
    this.factoryIndex = 0;
    this.activityLog = [];
  }
}

/**
 * Simulate factory stream intake with realistic delays
 * Usage: Can be used in development/demo modes
 */
export async function simulateFactoryIntake(
  count: number,
  onFactory?: (factory: SimulatedFactoryStream) => void
): Promise<SimulatedFactoryStream[]> {
  const simulator = new FactoryStreamSimulator();
  const factories = await simulator.generateBatchWithDelays(count);
  
  if (onFactory) {
    factories.forEach(onFactory);
  }

  return factories;
}
