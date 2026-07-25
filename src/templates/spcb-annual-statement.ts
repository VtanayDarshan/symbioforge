import fs from 'fs';
import path from 'path';
import PDFDocument from 'pdfkit';
import { FactoryProfile, WasteStream } from '../types/index.js';

export class SPCBAnnualStatementTemplate {
  /**
   * Generates a real SPCB Annual Environmental Statement PDF based on factory data.
   * Returns the file path to the generated PDF.
   */
  public static async generateReport(factory: FactoryProfile): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        
        // Ensure .reports directory exists
        const reportsDir = path.join(process.cwd(), '.reports');
        if (!fs.existsSync(reportsDir)) {
          fs.mkdirSync(reportsDir, { recursive: true });
        }
        
        const fileName = `SPCB_FORM_V_${factory.id}_${new Date().getFullYear()}.pdf`;
        const filePath = path.join(reportsDir, fileName);
        
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);
        
        // Header
        doc
          .fontSize(16)
          .font('Helvetica-Bold')
          .text('STATE POLLUTION CONTROL BOARD (TNPCB)', { align: 'center' })
          .moveDown(0.5);
          
        doc
          .fontSize(14)
          .text('FORM V - ANNUAL ENVIRONMENTAL STATEMENT', { align: 'center' })
          .moveDown(1.5);
          
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`Date of Filing: ${new Date().toLocaleDateString('en-IN')}`, { align: 'right' })
          .moveDown(1);
          
        // 1. General Information
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('1. General Information')
          .moveDown(0.5);
          
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`Name of the Industry: ${factory.name}`)
          .text(`Industry Category: ${factory.industryType}`)
          .text(`Location: Lat: ${factory.locationCoordinates.lat}, Lng: ${factory.locationCoordinates.lng}`)
          .moveDown(1);
          
        // 2. Production Capacity
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('2. Production Capacity')
          .moveDown(0.5);
          
        doc
          .fontSize(10)
          .font('Helvetica')
          .text(`Total Output: ${factory.productionCapacityDailyKg} kg/day`)
          .text(`Raw Materials: ${factory.rawMaterialsConsumed.join(', ')}`)
          .moveDown(1);
          
        // 3. Solid and Hazardous Waste Generation
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('3. Solid and Hazardous Waste Generation')
          .moveDown(0.5);
          
        doc.fontSize(10).font('Helvetica');
        
        if (factory.declaredWasteOutputs && factory.declaredWasteOutputs.length > 0) {
          factory.declaredWasteOutputs.forEach((w: WasteStream) => {
            doc.text(`• [${w.category}] ${w.name}: ${w.estimatedDailyVolumeKg} kg/day (${w.physicalForm})`);
          });
        } else {
          doc.text('• No waste streams declared.');
        }
        doc.moveDown(1.5);
        
        // 4. Declaration
        doc
          .fontSize(12)
          .font('Helvetica-Bold')
          .text('4. Declaration')
          .moveDown(0.5);
          
        doc
          .fontSize(10)
          .font('Helvetica-Oblique')
          .text('I hereby declare that the above information is true to the best of my knowledge.')
          .text('This report was generated autonomously via the SymbioForge Platform.')
          .moveDown(2);
          
        doc
          .font('Helvetica')
          .text('_____________________________', { align: 'right' })
          .text('Authorized Signatory           ', { align: 'right' });
          
        doc.end();
        
        writeStream.on('finish', () => {
          resolve(filePath);
        });
        
        writeStream.on('error', (err) => {
          reject(err);
        });
        
      } catch (error) {
        reject(error);
      }
    });
  }
}
