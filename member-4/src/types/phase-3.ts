/**
 * Phase 3 Type Definitions
 * Type definitions for Ecosystem Map (Widget 2) and Compliance Dashboard (Widget 3)
 */

// ==================== ECOSYSTEM MAP TYPES ====================

export interface FactoryNode {
  id: string;
  name: string;
  type: string;
  location: {
    x: number;
    y: number;
  };
  wasteVolume: number;
  contaminationLevel: string;
  activeConnections: number;
  healthScore: number;
  lastActivity: number;
  processingRate: number;
  matchCount: number;
  recoveryValue: number;
}

export interface WasteConnection {
  id: string;
  sourceFactoryId: string;
  targetFactoryId: string;
  wasteType: string;
  volumePerDay: number;
  confidence: number;
  status: 'active' | 'pending' | 'inactive';
  recovery: boolean;
  recoveryValue: number;
  lastUpdated: number;
}

export interface EcosystemMetrics {
  totalNodes: number;
  activeConnections: number;
  totalWasteCaptured: number;
  connectionHealthScore: number;
  averageConfidence: number;
}

export interface EcosystemMapState {
  nodes: FactoryNode[];
  connections: WasteConnection[];
  metrics: EcosystemMetrics;
  selectedNode: FactoryNode | null;
  selectedConnection: WasteConnection | null;
  zoom: number;
  pan: { x: number; y: number };
  isSimulating: boolean;
}

// ==================== COMPLIANCE DASHBOARD TYPES ====================

export type ComplianceStatus = 'compliant' | 'partially_compliant' | 'non_compliant';

export interface ComplianceIssue {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  dateOpened: Date;
  dueDate: Date;
  status: 'open' | 'in_progress' | 'resolved';
}

export interface FactoryCompliance {
  factoryId: string;
  factoryName: string;
  factoryType: string;
  overallScore: number;
  status: ComplianceStatus;
  lastAudit: Date;
  nextAuditDue: Date;
  certifications: string[];
  emissions: {
    co2Annual: number;
    waterUsage: number;
    waste: number;
    hazardousWaste: number;
    complianceWithLimits: number;
  };
  openIssues: ComplianceIssue[];
  violations: {
    critical: number;
    major: number;
    minor: number;
  };
  inspectionHistory: Array<{
    date: Date;
    type: string;
    passed: boolean;
    findings: number;
    inspector: string;
  }>;
  wasteSeparation: {
    recyclable: number;
    hazardous: number;
    organic: number;
    incinerable: number;
  };
  esgScore: {
    environmental: number;
    social: number;
    governance: number;
  };
}

export interface ComplianceMetrics {
  compliantFactories: number;
  nonCompliantFactories: number;
  partiallyCompliant: number;
  openIssues: number;
  averageComplianceScore: number;
  certificationCoverage: number;
  auditCoverage: number;
}

export interface ComplianceDashboardState {
  compliance: Map<string, FactoryCompliance>;
  metrics: ComplianceMetrics;
  selectedFactory: FactoryCompliance | null;
  filterStatus: ComplianceStatus | 'all';
  sortBy: 'score' | 'issues' | 'name';
  isLoading: boolean;
}

// ==================== WIDGET 2 PROPS ====================

export interface EcosystemMapProps {
  autoStart?: boolean;
  title?: string;
  showMetrics?: boolean;
  showControls?: boolean;
  onNodeSelect?: (node: FactoryNode) => void;
  onConnectionSelect?: (connection: WasteConnection) => void;
}

// ==================== WIDGET 3 PROPS ====================

export interface ComplianceDashboardProps {
  autoStart?: boolean;
  title?: string;
  showMetrics?: boolean;
  showControls?: boolean;
  enablePDFExport?: boolean;
  onFactorySelect?: (factory: FactoryCompliance) => void;
  onStatusFilter?: (status: ComplianceStatus) => void;
}

// ==================== ACTIVITY TYPES ====================

export interface EcosystemActivity {
  id: string;
  type: 'connection_activated' | 'connection_deactivated' | 'factory_added' | 'waste_captured' | 'recovery_initiated' | 'health_improved';
  timestamp: number;
  factoryId?: string;
  connectionId?: string;
  data: Record<string, any>;
}

export interface ComplianceActivity {
  id: string;
  type: 'issue_opened' | 'issue_resolved' | 'audit_completed' | 'score_updated' | 'certification_added' | 'violation_found';
  timestamp: number;
  factoryId: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  data: Record<string, any>;
}
