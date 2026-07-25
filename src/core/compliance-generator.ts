import { Factory } from './types.js';
import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';

export class ComplianceGenerator {
  public async generateSbcbReport(factory: Factory): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const reportsDir = path.join(process.cwd(), '.reports');
        if (!fs.existsSync(reportsDir)) {
          fs.mkdirSync(reportsDir, { recursive: true });
        }

        const dateStr = new Date().toISOString().split('T')[0];
        const fileName = `SPCB_FORM_V_${factory.id}_${dateStr}.pdf`;
        const filePath = path.join(reportsDir, fileName);

        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // Header
        doc.fontSize(16).font('Helvetica-Bold')
           .text('STATE POLLUTION CONTROL BOARD (SPCB / TNPCB)', { align: 'center' })
           .moveDown(0.5);
           
        doc.fontSize(14).font('Helvetica-Bold')
           .text('FORM V: ANNUAL ENVIRONMENTAL STATEMENT', { align: 'center' })
           .moveDown(0.5);
           
        doc.fontSize(10).font('Helvetica')
           .text('(See Rule 14 of the Environment (Protection) Rules, 1986)', { align: 'center' })
           .moveDown(1.5);
           
        doc.text(`Filing Year: ${new Date().getFullYear()} | Submission Date: ${dateStr}`, { align: 'right' })
           .moveDown(1);

        // PART A
        doc.fontSize(12).font('Helvetica-Bold').text('PART A: FACTORY PROFILE').moveDown(0.5);
        doc.fontSize(10).font('Helvetica')
           .text(`1. Name of the Owner/Occupier : Director, ${factory.name}`)
           .text(`2. Industry Category          : Red / Large`)
           .text(`3. Industry Type              : ${factory.industryType}`)
           .text(`4. Production Capacity        : ${factory.productionCapacity}`)
           .text(`5. Factory Address            : ${factory.location.address}`)
           .text(`6. Coordinates                : Lat ${factory.location.lat}, Lng ${factory.location.lng}`)
           .moveDown(1);

        // PART B
        doc.fontSize(12).font('Helvetica-Bold').text('PART B: WATER & RAW MATERIAL CONSUMPTION').moveDown(0.5);
        doc.fontSize(10).font('Helvetica')
           .text(`1. Water Consumption (m3/day):`)
           .text(`   - Process                  : 15.0 m3/day`)
           .text(`   - Cooling/Boiler           : 5.0 m3/day`)
           .text(`   - Domestic                 : 2.5 m3/day`)
           .text(`2. Raw Materials Consumed:`);
           
        factory.rawMaterials.forEach(m => doc.text(`   - ${m}`));
        doc.moveDown(1);

        // PART C
        doc.fontSize(12).font('Helvetica-Bold').text('PART C: POLLUTION DISCHARGED TO ENVIRONMENT').moveDown(0.5);
        doc.fontSize(10).font('Helvetica')
           .text(`1. Wastewater Discharged      : 12.5 m3/day (treated to SPCB standards)`)
           .text(`2. Air Emissions (Stack)      : PM10, PM2.5, SO2, NOx within permissible limits`)
           .moveDown(1);

        // PART D
        doc.fontSize(12).font('Helvetica-Bold').text('PART D: HAZARDOUS & SOLID WASTES GENERATED').moveDown(0.5);
        doc.fontSize(10).font('Helvetica').text('Declared Waste Streams and Daily Volumes:');
        
        if (factory.wasteStreams && factory.wasteStreams.length > 0) {
          factory.wasteStreams.forEach(w => {
            doc.text(`   - ${w.name}: ${w.volume} kg/day (${w.category}, ${w.physicalForm}, contamination: ${w.contamination})`);
          });
        } else {
          doc.text('   - No waste streams declared yet.');
        }
        doc.moveDown(1);

        // PART E
        doc.fontSize(12).font('Helvetica-Bold').text('PART E: DISPOSAL & REUSE PRACTICE').moveDown(0.5);
        doc.fontSize(10).font('Helvetica')
           .text(`1. Solid Waste Disposal       : Disposed through authorized recyclers / landfill.`)
           .text(`2. Circular Economy Status    : Integrated with SymbioForge Swarm.`)
           .text(`   - CO2 Avoided              : ${factory.co2Avoided} tons/year`)
           .text(`   - Financial Savings        : INR ${factory.savingsEarned.toLocaleString()}/year`)
           .moveDown(1.5);

        // Declaration
        doc.fontSize(12).font('Helvetica-Bold').text('DECLARATION:').moveDown(0.5);
        doc.fontSize(10).font('Helvetica-Oblique')
           .text('I hereby declare that the information given above is correct and complete to the best of my knowledge.')
           .moveDown(2);
           
        doc.font('Helvetica')
           .text('___________________________', { align: 'right' })
           .text(`Director, ${factory.name}`, { align: 'right' });

        doc.end();

        writeStream.on('finish', () => resolve(filePath));
        writeStream.on('error', reject);
      } catch (err) {
        reject(err);
      }
    });
  }
}
