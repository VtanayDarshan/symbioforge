/**
 * Compliance Simulator
 * Generates compliance status data for factories
 * Tracks regulatory compliance, emissions, certifications, and audit history
 */

import { ComplianceStatus, FactoryCompliance, ComplianceMetrics, ComplianceIssue } from '../types/compliance';

export class ComplianceSimulator {
  private factoryCompliance: Map<string, FactoryCompliance> = new Map();
  private metrics: ComplianceMetrics = {
    compliantFactories: 0,
    nonCompliantFactories: 0,
    partiallyCompliant: 0,
    openIssues: 0,
    averageComplianceScore: 0,
    certificationCoverage: 0,
    auditCoverage: 0
  };

  constructor() {
    this.initializeCompliance();
  }

  /**
   * Initialize compliance data for factories
   */
  private initializeCompliance(): void {
    // This would be populated from fixture factories
    // For now, creating structure for dynamic population
  }

  /**
   * Create compliance record for a factory
   */
  createFactoryCompliance(factoryId: string, factoryData: any): FactoryCompliance {
    const complianceRecord: FactoryCompliance = {
      factoryId,
      factoryName: factoryData.name,
      factoryType: factoryData.type,
      overallScore: 70 + Math.random() * 30,
      status: this.determineStatus(75 + Math.random() * 25),
      lastAudit: new Date(Date.now() - Math.floor(Math.random() * 7776000000)), // Within 3 months
      nextAuditDue: new Date(Date.now() + Math.floor(Math.random() * 2592000000)), // Within 30 days
      certifications: this.generateCertifications(),
      emissions: {
        co2Annual: Math.floor(Math.random() * 5000) + 500,
        waterUsage: Math.floor(Math.random() * 1000000) + 100000,
        waste: Math.floor(Math.random() * 500) + 50,
        hazardousWaste: Math.floor(Math.random() * 100) + 10,
        complianceWithLimits: 85 + Math.random() * 15
      },
      openIssues: this.generateOpenIssues(),
      violations: {
        critical: Math.floor(Math.random() * 3),
        major: Math.floor(Math.random() * 5),
        minor: Math.floor(Math.random() * 10)
      },
      inspectionHistory: this.generateInspectionHistory(),
      wasteSeparation: {
        recyclable: Math.floor(Math.random() * 100),
        hazardous: Math.floor(Math.random() * 50),
        organic: Math.floor(Math.random() * 100),
        incinerable: Math.floor(Math.random() * 80)
      },
      esgScore: {
        environmental: Math.floor(Math.random() * 100),
        social: Math.floor(Math.random() * 100),
        governance: Math.floor(Math.random() * 100)
      }
    };

    this.factoryCompliance.set(factoryId, complianceRecord);
    this.updateMetrics();
    return complianceRecord;
  }

  /**
   * Determine compliance status based on score
   */
  private determineStatus(score: number): ComplianceStatus {
    if (score >= 85) return 'compliant';
    if (score >= 70) return 'partially_compliant';
    return 'non_compliant';
  }

  /**
   * Generate certifications for factory
   */
  private generateCertifications(): string[] {
    const allCerts = [
      'ISO 9001',
      'ISO 14001',
      'ISO 45001',
      'ISO 50001',
      'EMAS',
      'B Corp',
      'Carbon Trust',
      'Science Based Targets',
      'UN Global Compact',
      'LEED',
      'TQM',
      'Six Sigma'
    ];

    const count = 2 + Math.floor(Math.random() * 6);
    const shuffled = [...allCerts].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Generate open compliance issues
   */
  private generateOpenIssues(): ComplianceIssue[] {
    const issues: ComplianceIssue[] = [];
    const issueCount = Math.floor(Math.random() * 4);

    const issueTypes = [
      { type: 'emissions_exceedance', severity: 'high', description: 'CO₂ emissions exceed quarterly target' },
      { type: 'waste_handling', severity: 'critical', description: 'Improper hazardous waste segregation' },
      { type: 'documentation', severity: 'low', description: 'Missing waste stream documentation' },
      { type: 'training', severity: 'medium', description: 'Staff safety certification overdue' },
      { type: 'equipment', severity: 'medium', description: 'Pollution control equipment maintenance' },
      { type: 'reporting', severity: 'low', description: 'Delayed quarterly compliance reporting' },
      { type: 'audit_finding', severity: 'high', description: 'Outstanding audit corrective action' },
      { type: 'water_discharge', severity: 'critical', description: 'Water quality parameter out of range' }
    ];

    for (let i = 0; i < issueCount; i++) {
      const issueTemplate = issueTypes[Math.floor(Math.random() * issueTypes.length)];
      issues.push({
        id: `issue-${Math.random().toString(36).substr(2, 9)}`,
        type: issueTemplate.type,
        severity: issueTemplate.severity as 'critical' | 'high' | 'medium' | 'low',
        description: issueTemplate.description,
        dateOpened: new Date(Date.now() - Math.floor(Math.random() * 2592000000)), // Within 30 days
        dueDate: new Date(Date.now() + Math.floor(Math.random() * 2592000000)), // 30 days to fix
        status: Math.random() > 0.4 ? 'open' : 'in_progress'
      });
    }

    return issues;
  }

  /**
   * Generate inspection history
   */
  private generateInspectionHistory(): any[] {
    const inspections = [];
    for (let i = 0; i < 3; i++) {
      inspections.push({
        date: new Date(Date.now() - i * 2592000000),
        type: ['routine', 'complaint', 'audit'][Math.floor(Math.random() * 3)],
        passed: Math.random() > 0.3,
        findings: Math.floor(Math.random() * 8),
        inspector: `Inspector ${Math.floor(Math.random() * 20) + 1}`
      });
    }
    return inspections;
  }

  /**
   * Get compliance record for a factory
   */
  getFactoryCompliance(factoryId: string): FactoryCompliance | null {
    return this.factoryCompliance.get(factoryId) || null;
  }

  /**
   * Get all compliance records
   */
  getAllCompliance(): FactoryCompliance[] {
    return Array.from(this.factoryCompliance.values());
  }

  /**
   * Update factory compliance issue status
   */
  resolveIssue(factoryId: string, issueId: string): void {
    const compliance = this.factoryCompliance.get(factoryId);
    if (compliance) {
      const issue = compliance.openIssues.find(i => i.id === issueId);
      if (issue) {
        issue.status = 'resolved';
        compliance.openIssues = compliance.openIssues.filter(i => i.id !== issueId);
        this.updateMetrics();
      }
    }
  }

  /**
   * Update compliance score (simulate audit or improvement)
   */
  updateComplianceScore(factoryId: string, scoreChange: number): void {
    const compliance = this.factoryCompliance.get(factoryId);
    if (compliance) {
      compliance.overallScore = Math.max(0, Math.min(100, compliance.overallScore + scoreChange));
      compliance.status = this.determineStatus(compliance.overallScore);
      this.updateMetrics();
    }
  }

  /**
   * Simulate compliance changes over time
   */
  simulateCompliance(): void {
    this.factoryCompliance.forEach((compliance) => {
      // Small fluctuations in score
      const change = (Math.random() - 0.5) * 3;
      this.updateComplianceScore(compliance.factoryId, change);

      // Random issue resolution
      if (compliance.openIssues.length > 0 && Math.random() > 0.9) {
        const issueIndex = Math.floor(Math.random() * compliance.openIssues.length);
        const issueId = compliance.openIssues[issueIndex].id;
        this.resolveIssue(compliance.factoryId, issueId);
      }

      // Emissions tracking
      compliance.emissions.co2Annual += (Math.random() - 0.5) * 100;
      compliance.emissions.waterUsage += (Math.random() - 0.5) * 5000;
    });

    this.updateMetrics();
  }

  /**
   * Get factories by compliance status
   */
  getFactoriesByStatus(status: ComplianceStatus): FactoryCompliance[] {
    return Array.from(this.factoryCompliance.values()).filter(
      c => c.status === status
    );
  }

  /**
   * Get factories with critical issues
   */
  getFactoriesWithCriticalIssues(): FactoryCompliance[] {
    return Array.from(this.factoryCompliance.values()).filter(
      c => c.openIssues.some(i => i.severity === 'critical')
    );
  }

  /**
   * Get metrics summary
   */
  getMetrics(): ComplianceMetrics {
    return { ...this.metrics };
  }

  /**
   * Update metrics calculations
   */
  private updateMetrics(): void {
    const all = Array.from(this.factoryCompliance.values());
    
    this.metrics.compliantFactories = all.filter(c => c.status === 'compliant').length;
    this.metrics.nonCompliantFactories = all.filter(c => c.status === 'non_compliant').length;
    this.metrics.partiallyCompliant = all.filter(c => c.status === 'partially_compliant').length;
    this.metrics.openIssues = all.reduce((sum, c) => sum + c.openIssues.length, 0);
    this.metrics.averageComplianceScore = all.reduce((sum, c) => sum + c.overallScore, 0) / (all.length || 1);
    this.metrics.certificationCoverage = (all.filter(c => c.certifications.length > 0).length / all.length) * 100 || 0;
    this.metrics.auditCoverage = (all.filter(c => c.inspectionHistory.length > 0).length / all.length) * 100 || 0;
  }

  /**
   * Get compliance dashboard data (for PDF export)
   */
  getDashboardData() {
    return {
      timestamp: new Date(),
      metrics: this.metrics,
      factories: Array.from(this.factoryCompliance.values()),
      criticalFactories: this.getFactoriesWithCriticalIssues(),
      nonCompliantFactories: this.getFactoriesByStatus('non_compliant'),
      summary: {
        totalFactories: this.factoryCompliance.size,
        complianceRate: (this.metrics.compliantFactories / this.factoryCompliance.size) * 100,
        criticalIssueCount: this.getFactoriesWithCriticalIssues().length,
        averageScore: this.metrics.averageComplianceScore
      }
    };
  }

  /**
   * Reset all compliance data
   */
  reset(): void {
    this.factoryCompliance.clear();
    this.metrics = {
      compliantFactories: 0,
      nonCompliantFactories: 0,
      partiallyCompliant: 0,
      openIssues: 0,
      averageComplianceScore: 0,
      certificationCoverage: 0,
      auditCoverage: 0
    };
  }
}
