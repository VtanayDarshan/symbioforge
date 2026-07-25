import { FactoryProfile, SystemEvent } from '../types';
import { SPCBAnnualStatementTemplate } from '../templates/spcb-annual-statement';

export class ClerkAgent {
  /**
   * Process a new factory registration.
   * This is the "Single Entry" point described in the milestone.
   */
  public registerFactory(factoryInput: FactoryProfile): { complianceReport: string, event: SystemEvent } {
    console.log(`[Clerk Agent] 📝 New registration received for: "${factoryInput.name}"`);
    
    // Output 1: Generate SPCB Compliance Report
    const complianceReport = SPCBAnnualStatementTemplate.generateReport(factoryInput);
    console.log(`[Clerk Agent] 📝 SPCB Annual Statement generated (ready for download)`);
    
    // Output 2: Generate Event for The Scout
    const event: SystemEvent = {
      type: 'FACTORY_REGISTERED',
      payload: factoryInput,
      timestamp: new Date()
    };
    console.log(`[Clerk Agent] 📝 Structured data forwarded to Scout agent via FACTORY_REGISTERED event`);
    
    return { complianceReport, event };
  }
}
