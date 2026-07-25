import { FactoryProfile, WasteStream } from '../types/index.js';

export class SPCBAnnualStatementTemplate {
  /**
   * Generates a mock SPCB Annual Environmental Statement based on factory data.
   * In a real implementation, this would use a PDF generation library like pdfmake or puppeteer.
   */
  public static generateReport(factory: FactoryProfile): string {
    const date = new Date().toLocaleDateString('en-IN');

    let wasteList = factory.declaredWasteOutputs.map((w: WasteStream) =>
      `  - [${w.category}] ${w.name}: ${w.estimatedDailyVolumeKg} kg/day (${w.physicalForm})`
    ).join('\n');

    if (!wasteList) {
      wasteList = '  - No waste streams declared.';
    }

    return `
======================================================
     STATE POLLUTION CONTROL BOARD (SPCB / TNPCB)
           ANNUAL ENVIRONMENTAL STATEMENT
======================================================
Date of Filing: ${date}

1. General Information
-----------------------
Name of the Industry: ${factory.name}
Industry Category:    ${factory.industryType}
Location:             Lat: ${factory.locationCoordinates.lat}, Lng: ${factory.locationCoordinates.lng}

2. Production Capacity
-----------------------
Total Output:         ${factory.productionCapacityDailyKg} kg/day
Raw Materials:        ${factory.rawMaterialsConsumed.join(', ')}

3. Solid and Hazardous Waste Generation
----------------------------------------
Declared Waste Streams:
${wasteList}

4. Declaration
---------------
I hereby declare that the above information is true to the best of my knowledge.
This report is generated autonomously via SymbioForge Platform.

======================================================
    [End of Report - PDF version available to download]
======================================================
`;
  }
}
