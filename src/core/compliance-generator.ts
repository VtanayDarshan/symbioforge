import { Factory } from './types.js';

export class ComplianceGenerator {
  public generateSbcbReport(factory: Factory): string {
    const date = new Date().toISOString().split('T')[0];
    const wastesList = (factory.wasteStreams ?? []).map(w => {
      return `  - ${w.name}: ${w.volume} kg/day (${w.category}, ${w.physicalForm}, contamination: ${w.contamination})`;
    }).join('\n');

    return `======================================================================
FORM V: ANNUAL ENVIRONMENTAL STATEMENT
(See Rule 14 of the Environment (Protection) Rules, 1986)
State Pollution Control Board (SPCB / TNPCB)
Filing Year: 2026 | Submission Date: ${date}
======================================================================

PART A: FACTORY PROFILE
----------------------------------------------------------------------
1. Name of the Owner/Occupier : Director, ${factory.name}
2. Industry Category          : Red / Large
3. Industry Type              : ${factory.industryType}
4. Production Capacity        : ${factory.productionCapacity}
5. Factory Address            : ${factory.location.address}
6. Coordinates                : Lat ${factory.location.lat}, Lng ${factory.location.lng}

PART B: WATER & RAW MATERIAL CONSUMPTION
----------------------------------------------------------------------
1. Water Consumption (m3/day):
   - Process                  : 15.0 m3/day
   - Cooling/Boiler           : 5.0 m3/day
   - Domestic                 : 2.5 m3/day
2. Raw Materials Consumed:
${factory.rawMaterials.map(m => `   - ${m}`).join('\n')}

PART C: POLLUTION DISCHARGED TO ENVIRONMENT
----------------------------------------------------------------------
1. Wastewater Discharged      : 12.5 m3/day (treated to SPCB standards)
2. Air Emissions (Stack)      : PM10, PM2.5, SO2, NOx within permissible limits

PART D: HAZARDOUS & SOLID WASTES GENERATED
----------------------------------------------------------------------
Declared Waste Streams and Daily Volumes:
${wastesList || '   - No waste streams declared yet.'}

PART E: DISPOSAL & REUSE PRACTICE
----------------------------------------------------------------------
1. Solid Waste Disposal       : Disposed through authorized recyclers / landfill.
2. Circular Economy Status    : Integrated with SymbioForge Swarm.
   - CO2 Avoided              : ${factory.co2Avoided} tons/year
   - Financial Savings        : INR ${factory.savingsEarned.toLocaleString()}/year

======================================================================
DECLARATION:
I hereby declare that the information given above is correct and complete
to the best of my knowledge.

Authorized Signatory: ___________________________
Director, ${factory.name}
======================================================================`;
  }
}
