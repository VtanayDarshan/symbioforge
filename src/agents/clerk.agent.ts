import { IAgent, AgentStatus, AgentResult } from '../types/agent.types.js';
import { EventType, SwarmEvent } from '../types/events.types.js';
import { Factory, ComplianceReport } from '../types/factory.types.js';
import { EventBus } from '../orchestrator/event-bus.js';
import { StateManager } from '../orchestrator/state-manager.js';

export class ClerkAgent implements IAgent {
  readonly name = 'Clerk';
  readonly emoji = '📝';
  private status: AgentStatus = 'idle';
  private lastResult: AgentResult | null = null;

  constructor(
    private eventBus: EventBus,
    private stateManager: StateManager
  ) {}

  async process(event: SwarmEvent): Promise<AgentResult> {
    this.status = 'processing';
    const start = Date.now();

    try {
      if (event.type === EventType.COMPLIANCE_DUE) {
        // TODO (Member 2): Handle compliance reminder
        // INPUT: event.payload contains { factoryId, factoryName, dueDate }
        // LOGIC: Generate a reminder notification and pre-fill last year's data
        // OUTPUT: Log the reminder
        const payload = event.payload as { factoryId: string; factoryName: string; dueDate: string };
        this.eventBus.addActivityLog(this.name, this.emoji,
          `Compliance reminder sent to ${payload.factoryName} (due: ${payload.dueDate})`
        );
      }

      this.status = 'completed';
      this.lastResult = {
        agentName: this.name,
        status: this.status,
        timestamp: new Date().toISOString(),
        data: null,
        triggeredEvents: [],
        durationMs: Date.now() - start,
      };
      return this.lastResult;
    } catch (error) {
      this.status = 'error';
      throw error;
    }
  }

  // TODO (Member 2): Implement registerFactory
  // INPUT: Factory data from the compliance form (name, location, industry, production, waste info)
  // LOGIC:
  //   1. Validate factory data and assign a unique ID
  //   2. Generate SPCB-compliant Annual Environmental Statement PDF using templates/spcb-annual-statement.ts
  //   3. Store the factory in stateManager
  //   4. Emit FACTORY_REGISTERED with the factory data
  //   5. Emit COMPLIANCE_GENERATED with the report
  // OUTPUT: { factory: Factory, complianceReport: ComplianceReport }
  async registerFactory(factoryData: Partial<Factory>): Promise<{ factory: Factory; report: ComplianceReport }> {
    this.eventBus.addActivityLog(this.name, this.emoji, `New registration — "${factoryData.name}"`);

    const factory: Factory = {
      id: `fac_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: factoryData.name ?? 'Unknown Factory',
      location: factoryData.location ?? { lat: 11.0168, lng: 76.9558, zone: 'SIDCO Phase II', districtId: 'coimbatore' },
      industry: factoryData.industry!,
      subtype: factoryData.subtype ?? '',
      production: factoryData.production ?? { capacityTonsPerDay: 0, products: [], rawMaterials: [] },
      employees: factoryData.employees ?? 0,
      operatingHoursPerDay: factoryData.operatingHoursPerDay ?? 8,
      registeredAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      isActive: true,
    };

    this.stateManager.addFactory(factory);

    const report: ComplianceReport = {
      id: `rpt_${Date.now()}`,
      factoryId: factory.id,
      filingYear: new Date().getFullYear().toString(),
      generatedAt: new Date().toISOString(),
      status: 'generated',
      pdfUrl: null,
    };

    this.eventBus.addActivityLog(this.name, this.emoji, `SPCB Annual Statement generated for "${factory.name}"`);

    await this.eventBus.emit(EventType.COMPLIANCE_GENERATED, { report }, this.name);
    await this.eventBus.emit(EventType.FACTORY_REGISTERED, { factory }, this.name);

    return { factory, report };
  }

  getStatus(): AgentStatus { return this.status; }
  getLastResult(): AgentResult | null { return this.lastResult; }
}
