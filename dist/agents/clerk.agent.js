"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClerkAgent = void 0;
const spcb_annual_statement_1 = require("../templates/spcb-annual-statement");
class ClerkAgent {
    /**
     * Process a new factory registration.
     * This is the "Single Entry" point described in the milestone.
     */
    registerFactory(factoryInput) {
        console.log(`[Clerk Agent] 📝 New registration received for: "${factoryInput.name}"`);
        // Output 1: Generate SPCB Compliance Report
        const complianceReport = spcb_annual_statement_1.SPCBAnnualStatementTemplate.generateReport(factoryInput);
        console.log(`[Clerk Agent] 📝 SPCB Annual Statement generated (ready for download)`);
        // Output 2: Generate Event for The Scout
        const event = {
            type: 'FACTORY_REGISTERED',
            payload: factoryInput,
            timestamp: new Date()
        };
        console.log(`[Clerk Agent] 📝 Structured data forwarded to Scout agent via FACTORY_REGISTERED event`);
        return { complianceReport, event };
    }
}
exports.ClerkAgent = ClerkAgent;
