/**
 * PDF Export Utility
 * Generates compliance dashboard PDF reports
 * Creates professional, downloadable compliance documents
 */

import { FactoryCompliance, ComplianceMetrics } from '../types/compliance';

export class PDFExportService {
  /**
   * Generate compliance dashboard PDF
   */
  static generateCompliancePDF(
    factoryCompliance: FactoryCompliance[],
    metrics: ComplianceMetrics,
    filename: string = 'compliance-dashboard.pdf'
  ): void {
    const htmlContent = this.generateHTMLContent(factoryCompliance, metrics);
    this.downloadPDF(htmlContent, filename);
  }

  /**
   * Generate factory compliance report PDF
   */
  static generateFactoryReportPDF(
    compliance: FactoryCompliance,
    filename?: string
  ): void {
    const htmlContent = this.generateFactoryHTML(compliance);
    this.downloadPDF(htmlContent, filename || `${compliance.factoryId}-compliance.pdf`);
  }

  /**
   * Generate HTML content for compliance dashboard
   */
  private static generateHTMLContent(
    factoryCompliance: FactoryCompliance[],
    metrics: ComplianceMetrics
  ): string {
    const timestamp = new Date().toLocaleString();
    const complianceRate = (metrics.compliantFactories / (factoryCompliance.length || 1)) * 100;

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Compliance Dashboard Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; background: #f5f5f5; }
          .page { page-break-after: always; background: white; padding: 40px; margin: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          header { border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
          h1 { color: #1e1b4b; font-size: 28px; margin-bottom: 10px; }
          .timestamp { color: #666; font-size: 12px; }
          .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
          .metric-card { background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; }
          .metric-value { font-size: 24px; font-weight: bold; color: #6366f1; margin-bottom: 5px; }
          .metric-label { font-size: 12px; color: #666; text-transform: uppercase; }
          .status-compliant { color: #10b981; }
          .status-partial { color: #f59e0b; }
          .status-non-compliant { color: #ef4444; }
          section { margin-bottom: 30px; }
          h2 { color: #1e1b4b; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background: #f3f4f6; color: #1e1b4b; padding: 12px; text-align: left; font-weight: 600; font-size: 12px; border-bottom: 2px solid #e5e7eb; }
          td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
          tr:hover { background: #f9fafb; }
          .issue-critical { color: #ef4444; font-weight: 600; }
          .issue-high { color: #f97316; }
          .issue-medium { color: #f59e0b; }
          .issue-low { color: #3b82f6; }
          .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
          .badge-green { background: #d1fae5; color: #065f46; }
          .badge-yellow { background: #fef3c7; color: #92400e; }
          .badge-red { background: #fee2e2; color: #991b1b; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #999; }
          .graph-bar { display: inline-block; height: 20px; border-radius: 3px; margin-right: 5px; }
          .bar-compliant { background: #10b981; }
          .bar-partial { background: #f59e0b; }
          .bar-non-compliant { background: #ef4444; }
          page-break { page-break-after: always; }
        </style>
      </head>
      <body>
        <div class="page">
          <header>
            <h1>🌍 SymBioForge Compliance Dashboard</h1>
            <p class="timestamp">Generated: ${timestamp}</p>
          </header>

          <section class="metrics">
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-value status-compliant">${metrics.compliantFactories}</div>
                <div class="metric-label">Compliant Factories</div>
              </div>
              <div class="metric-card">
                <div class="metric-value status-partial">${metrics.partiallyCompliant}</div>
                <div class="metric-label">Partially Compliant</div>
              </div>
              <div class="metric-card">
                <div class="metric-value status-non-compliant">${metrics.nonCompliantFactories}</div>
                <div class="metric-label">Non-Compliant</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${metrics.openIssues}</div>
                <div class="metric-label">Open Issues</div>
              </div>
            </div>
          </section>

          <section>
            <h2>Compliance Overview</h2>
            <table>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Status</th>
              </tr>
              <tr>
                <td>Compliance Rate</td>
                <td><strong>${complianceRate.toFixed(1)}%</strong></td>
                <td><span class="badge ${complianceRate >= 80 ? 'badge-green' : complianceRate >= 60 ? 'badge-yellow' : 'badge-red'}">${complianceRate >= 80 ? 'Excellent' : complianceRate >= 60 ? 'Good' : 'Poor'}</span></td>
              </tr>
              <tr>
                <td>Average Compliance Score</td>
                <td><strong>${metrics.averageComplianceScore.toFixed(1)}/100</strong></td>
                <td><span class="badge badge-green">Tracked</span></td>
              </tr>
              <tr>
                <td>Certification Coverage</td>
                <td><strong>${metrics.certificationCoverage.toFixed(1)}%</strong></td>
                <td><span class="badge badge-green">Active</span></td>
              </tr>
              <tr>
                <td>Audit Coverage</td>
                <td><strong>${metrics.auditCoverage.toFixed(1)}%</strong></td>
                <td><span class="badge badge-green">Current</span></td>
              </tr>
            </table>
          </section>

          <section>
            <h2>Factory Compliance Status</h2>
            <table>
              <tr>
                <th>Factory Name</th>
                <th>Type</th>
                <th>Score</th>
                <th>Status</th>
                <th>Issues</th>
                <th>Audit Date</th>
              </tr>
              ${factoryCompliance.map(f => `
                <tr>
                  <td>${f.factoryName}</td>
                  <td>${f.factoryType}</td>
                  <td><strong>${f.overallScore.toFixed(1)}</strong></td>
                  <td><span class="badge ${
                    f.status === 'compliant' ? 'badge-green' :
                    f.status === 'partially_compliant' ? 'badge-yellow' :
                    'badge-red'
                  }">${f.status.replace('_', ' ').toUpperCase()}</span></td>
                  <td>${f.openIssues.length}</td>
                  <td>${f.lastAudit.toLocaleDateString()}</td>
                </tr>
              `).join('')}
            </table>
          </section>

          <section>
            <h2>Critical Issues Summary</h2>
            ${factoryCompliance.filter(f => f.openIssues.length > 0).length > 0 ? `
              <table>
                <tr>
                  <th>Factory</th>
                  <th>Issue</th>
                  <th>Severity</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
                ${factoryCompliance
                  .flatMap(f => f.openIssues.map(issue => ({ factory: f.factoryName, issue })))
                  .slice(0, 20)
                  .map(({ factory, issue }) => `
                    <tr>
                      <td>${factory}</td>
                      <td>${issue.description}</td>
                      <td><span class="issue-${issue.severity}">${issue.severity.toUpperCase()}</span></td>
                      <td>${issue.dueDate.toLocaleDateString()}</td>
                      <td><span class="badge badge-yellow">${issue.status.toUpperCase()}</span></td>
                    </tr>
                  `).join('')}
              </table>
            ` : '<p style="color: #666;">No critical issues reported.</p>'}
          </section>

          <div class="footer">
            <p>This report was automatically generated by the SymBioForge Compliance Dashboard.</p>
            <p>For questions or concerns, please contact your compliance administrator.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate HTML for individual factory compliance report
   */
  private static generateFactoryHTML(compliance: FactoryCompliance): string {
    const timestamp = new Date().toLocaleString();

    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Factory Compliance Report</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; background: #f5f5f5; }
          .page { background: white; padding: 40px; margin: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          header { border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }
          h1 { color: #1e1b4b; font-size: 28px; margin-bottom: 10px; }
          .timestamp { color: #666; font-size: 12px; }
          .score-display { font-size: 48px; font-weight: bold; color: #6366f1; margin: 20px 0; }
          .score-label { color: #666; font-size: 14px; }
          .metrics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
          .metric-card { background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; }
          .metric-value { font-size: 20px; font-weight: bold; color: #6366f1; margin-bottom: 5px; }
          .metric-label { font-size: 12px; color: #666; text-transform: uppercase; }
          section { margin-bottom: 30px; }
          h2 { color: #1e1b4b; font-size: 18px; margin-bottom: 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background: #f3f4f6; color: #1e1b4b; padding: 12px; text-align: left; font-weight: 600; font-size: 12px; border-bottom: 2px solid #e5e7eb; }
          td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 12px; }
          .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 600; }
          .badge-green { background: #d1fae5; color: #065f46; }
          .badge-yellow { background: #fef3c7; color: #92400e; }
          .badge-red { background: #fee2e2; color: #991b1b; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #999; }
          .chart-bar { display: flex; align-items: center; margin: 10px 0; }
          .bar-label { width: 150px; font-size: 12px; }
          .bar-visual { flex: 1; height: 24px; background: #e5e7eb; border-radius: 4px; margin: 0 10px; position: relative; }
          .bar-fill { height: 100%; border-radius: 4px; background: #6366f1; }
          .bar-value { font-size: 12px; font-weight: 600; }
        </style>
      </head>
      <body>
        <div class="page">
          <header>
            <h1>${compliance.factoryName}</h1>
            <p>${compliance.factoryType} Facility</p>
            <p class="timestamp">Generated: ${timestamp}</p>
          </header>

          <div class="score-display">
            ${compliance.overallScore.toFixed(1)}<span style="font-size: 24px; color: #999;">/100</span>
          </div>
          <p class="score-label">Overall Compliance Score - ${compliance.status.replace('_', ' ').toUpperCase()}</p>

          <section class="metrics">
            <div class="metrics-grid">
              <div class="metric-card">
                <div class="metric-value">${compliance.emissions.co2Annual}</div>
                <div class="metric-label">Annual CO₂ (tonnes)</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${(compliance.emissions.waterUsage / 1000).toFixed(0)}</div>
                <div class="metric-label">Water Usage (1000 L)</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${compliance.violations.critical}</div>
                <div class="metric-label">Critical Violations</div>
              </div>
              <div class="metric-card">
                <div class="metric-value">${compliance.certifications.length}</div>
                <div class="metric-label">Active Certifications</div>
              </div>
            </div>
          </section>

          <section>
            <h2>Certifications</h2>
            <p>${compliance.certifications.join(', ') || 'No certifications'}</p>
          </section>

          <section>
            <h2>ESG Scores</h2>
            <div class="chart-bar">
              <div class="bar-label">Environmental</div>
              <div class="bar-visual">
                <div class="bar-fill" style="width: ${compliance.esgScore.environmental}%"></div>
              </div>
              <div class="bar-value">${compliance.esgScore.environmental}</div>
            </div>
            <div class="chart-bar">
              <div class="bar-label">Social</div>
              <div class="bar-visual">
                <div class="bar-fill" style="width: ${compliance.esgScore.social}%"></div>
              </div>
              <div class="bar-value">${compliance.esgScore.social}</div>
            </div>
            <div class="chart-bar">
              <div class="bar-label">Governance</div>
              <div class="bar-visual">
                <div class="bar-fill" style="width: ${compliance.esgScore.governance}%"></div>
              </div>
              <div class="bar-value">${compliance.esgScore.governance}</div>
            </div>
          </section>

          <section>
            <h2>Open Issues</h2>
            ${compliance.openIssues.length > 0 ? `
              <table>
                <tr>
                  <th>Issue</th>
                  <th>Severity</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
                ${compliance.openIssues.map(issue => `
                  <tr>
                    <td>${issue.description}</td>
                    <td><span class="badge badge-${issue.severity === 'critical' ? 'red' : issue.severity === 'high' ? 'yellow' : 'green'}">${issue.severity.toUpperCase()}</span></td>
                    <td>${issue.dueDate.toLocaleDateString()}</td>
                    <td><span class="badge badge-yellow">${issue.status.toUpperCase()}</span></td>
                  </tr>
                `).join('')}
              </table>
            ` : '<p style="color: #666;">No open issues reported.</p>'}
          </section>

          <section>
            <h2>Last Audit</h2>
            <table>
              <tr>
                <th>Date</th>
                <th>Inspector</th>
                <th>Result</th>
                <th>Findings</th>
              </tr>
              ${compliance.inspectionHistory.slice(0, 1).map(inspection => `
                <tr>
                  <td>${new Date(inspection.date).toLocaleDateString()}</td>
                  <td>${inspection.inspector}</td>
                  <td><span class="badge ${inspection.passed ? 'badge-green' : 'badge-red'}">${inspection.passed ? 'PASSED' : 'FAILED'}</span></td>
                  <td>${inspection.findings}</td>
                </tr>
              `).join('')}
            </table>
          </section>

          <div class="footer">
            <p>This report was automatically generated by the SymBioForge Compliance Dashboard.</p>
            <p>For questions, contact your compliance administrator.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Trigger PDF download
   */
  private static downloadPDF(htmlContent: string, filename: string): void {
    // Create blob from HTML
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    // Create link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
