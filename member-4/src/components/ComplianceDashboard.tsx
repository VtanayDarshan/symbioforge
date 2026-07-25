/**
 * Compliance Dashboard Component (Widget 3)
 * Factory-facing compliance status dashboard with audit history, ESG metrics, and PDF export
 * Displays real-time compliance monitoring and status tracking
 */

import React, { useMemo } from 'react';
import { useCompliance } from '../hooks/useCompliance';
import { FactoryCompliance, ComplianceStatus, ComplianceDashboardProps } from '../types/phase-3';
import '../styles/compliance-dashboard.css';

export const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({
  autoStart = true,
  title = 'Compliance Dashboard',
  showMetrics = true,
  showControls = true,
  enablePDFExport = true,
  onFactorySelect,
  onStatusFilter
}) => {
  const {
    compliance,
    metrics,
    selectedFactory,
    filterStatus,
    sortBy,
    isLoading,
    startMonitoring,
    stopMonitoring,
    selectFactory,
    filterByStatus,
    setSortBy,
    resolveIssue,
    updateScore,
    exportDashboardPDF,
    exportFactoryReportPDF,
    getFilteredFactories,
    getDashboardSummary,
    getCriticalFactories
  } = useCompliance({ autoStart, refreshInterval: 1200 });

  const filteredFactories = useMemo(() => getFilteredFactories(), [getFilteredFactories]);
  const summary = useMemo(() => getDashboardSummary(), [getDashboardSummary]);
  const criticalFactories = useMemo(() => getCriticalFactories(), [getCriticalFactories]);

  const handleFilterChange = (status: ComplianceStatus | 'all') => {
    filterByStatus(status);
    onStatusFilter?.(status as any);
  };

  const getStatusColor = (status: ComplianceStatus): string => {
    switch (status) {
      case 'compliant':
        return '#10b981';
      case 'partially_compliant':
        return '#f59e0b';
      case 'non_compliant':
        return '#ef4444';
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return '#ef4444';
      case 'high':
        return '#f97316';
      case 'medium':
        return '#f59e0b';
      case 'low':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  const getStatusBadge = (status: ComplianceStatus): string => {
    switch (status) {
      case 'compliant':
        return '✓ Compliant';
      case 'partially_compliant':
        return '⚠ Partial';
      case 'non_compliant':
        return '✕ Non-Compliant';
    }
  };

  return (
    <div className="compliance-dashboard">
      <div className="dashboard-header">
        <h2>{title}</h2>
        <div className="header-controls">
          {showControls && (
            <>
              {enablePDFExport && (
                <button onClick={exportDashboardPDF} className="btn btn-sm btn-success">
                  📄 Export PDF
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {showMetrics && (
        <div className="metrics-section">
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Total Factories</div>
              <div className="metric-value">{summary.totalFactories}</div>
              <div className="metric-bar"></div>
            </div>
            <div className="metric-card status-compliant">
              <div className="metric-label">Compliant</div>
              <div className="metric-value">{summary.compliantCount}</div>
              <div className="metric-detail">{(summary.compliantCount / summary.totalFactories * 100).toFixed(0)}%</div>
            </div>
            <div className="metric-card status-partial">
              <div className="metric-label">Partially Compliant</div>
              <div className="metric-value">{summary.partialCount}</div>
              <div className="metric-detail">{(summary.partialCount / summary.totalFactories * 100).toFixed(0)}%</div>
            </div>
            <div className="metric-card status-non-compliant">
              <div className="metric-label">Non-Compliant</div>
              <div className="metric-value">{summary.nonCompliantCount}</div>
              <div className="metric-detail">{(summary.nonCompliantCount / summary.totalFactories * 100).toFixed(0)}%</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Open Issues</div>
              <div className="metric-value">{summary.totalOpenIssues}</div>
              <div className="metric-detail">{summary.criticalIssueCount} critical</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Avg Score</div>
              <div className="metric-value">{summary.averageScore.toFixed(0)}</div>
              <div className="metric-detail">/100</div>
            </div>
          </div>
        </div>
      )}

      {criticalFactories.length > 0 && (
        <div className="alert alert-danger">
          ⚠️ {criticalFactories.length} factorie{criticalFactories.length === 1 ? '' : 's'} with critical compliance issues
        </div>
      )}

      <div className="filters-section">
        <div className="filter-group">
          <label>Status Filter:</label>
          <div className="filter-buttons">
            {(['all', 'compliant', 'partially_compliant', 'non_compliant'] as const).map(status => (
              <button
                key={status}
                onClick={() => handleFilterChange(status)}
                className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
              >
                {status === 'all' ? 'All' : status === 'compliant' ? 'Compliant' : status === 'partially_compliant' ? 'Partial' : 'Non-Compliant'}
              </button>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <label>Sort By:</label>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="select-control">
            <option value="score">Score (High to Low)</option>
            <option value="issues">Issues (Most to Least)</option>
            <option value="name">Name (A to Z)</option>
          </select>
        </div>
      </div>

      <div className="factories-section">
        <h3>Factory Compliance Status ({filteredFactories.length})</h3>
        <div className="factories-grid">
          {filteredFactories.length > 0 ? (
            filteredFactories.map(factory => (
              <div
                key={factory.factoryId}
                className={`factory-card ${selectedFactory?.factoryId === factory.factoryId ? 'selected' : ''}`}
                onClick={() => {
                  selectFactory(factory);
                  onFactorySelect?.(factory);
                }}
              >
                <div className="card-header">
                  <div className="factory-name">{factory.factoryName}</div>
                  <div
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(factory.status), color: 'white' }}
                  >
                    {getStatusBadge(factory.status)}
                  </div>
                </div>

                <div className="card-body">
                  <div className="score-display">
                    <div className="score-value">{factory.overallScore.toFixed(0)}</div>
                    <div className="score-label">/100</div>
                  </div>

                  <div className="score-bar">
                    <div
                      className="score-fill"
                      style={{
                        width: `${factory.overallScore}%`,
                        backgroundColor: getStatusColor(factory.status)
                      }}
                    ></div>
                  </div>

                  <div className="card-stats">
                    <div className="stat">
                      <span className="stat-label">Issues:</span>
                      <span className="stat-value">{factory.openIssues.length}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Certs:</span>
                      <span className="stat-value">{factory.certifications.length}</span>
                    </div>
                    <div className="stat">
                      <span className="stat-label">Critical:</span>
                      <span className="stat-value" style={{ color: '#ef4444' }}>
                        {factory.violations.critical}
                      </span>
                    </div>
                  </div>

                  {enablePDFExport && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        exportFactoryReportPDF(factory.factoryId);
                      }}
                      className="btn btn-sm btn-secondary"
                      title="Download compliance report"
                    >
                      📄 Report
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No factories match your filters.</p>
            </div>
          )}
        </div>
      </div>

      {selectedFactory && (
        <div className="detail-panel">
          <div className="detail-header">
            <h3>{selectedFactory.factoryName} - Compliance Details</h3>
            <button onClick={() => selectFactory(null)} className="btn-close">✕</button>
          </div>

          <div className="detail-content">
            <div className="detail-section">
              <h4>Emissions & Sustainability</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <label>CO₂ Annual</label>
                  <div className="detail-value">{selectedFactory.emissions.co2Annual} tonnes</div>
                </div>
                <div className="detail-item">
                  <label>Water Usage</label>
                  <div className="detail-value">{(selectedFactory.emissions.waterUsage / 1000).toFixed(0)}K liters</div>
                </div>
                <div className="detail-item">
                  <label>Hazardous Waste</label>
                  <div className="detail-value">{selectedFactory.emissions.hazardousWaste} kg</div>
                </div>
                <div className="detail-item">
                  <label>Compliance %</label>
                  <div className="detail-value">{selectedFactory.emissions.complianceWithLimits.toFixed(0)}%</div>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h4>ESG Scores</h4>
              <div className="esg-display">
                {[
                  { label: 'Environmental', value: selectedFactory.esgScore.environmental },
                  { label: 'Social', value: selectedFactory.esgScore.social },
                  { label: 'Governance', value: selectedFactory.esgScore.governance }
                ].map(esg => (
                  <div key={esg.label} className="esg-item">
                    <label>{esg.label}</label>
                    <div className="esg-bar">
                      <div className="esg-fill" style={{ width: `${esg.value}%` }}></div>
                    </div>
                    <span className="esg-value">{esg.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="detail-section">
              <h4>Certifications ({selectedFactory.certifications.length})</h4>
              <div className="certifications">
                {selectedFactory.certifications.map(cert => (
                  <span key={cert} className="cert-badge">
                    {cert}
                  </span>
                ))}
              </div>
            </div>

            {selectedFactory.openIssues.length > 0 && (
              <div className="detail-section">
                <h4>Open Issues ({selectedFactory.openIssues.length})</h4>
                <div className="issues-list">
                  {selectedFactory.openIssues.map(issue => (
                    <div key={issue.id} className="issue-item" style={{ borderLeftColor: getSeverityColor(issue.severity) }}>
                      <div className="issue-header">
                        <div className="issue-title">{issue.description}</div>
                        <span className="issue-badge" style={{ backgroundColor: getSeverityColor(issue.severity) }}>
                          {issue.severity.toUpperCase()}
                        </span>
                      </div>
                      <div className="issue-details">
                        <span>Due: {issue.dueDate.toLocaleDateString()}</span>
                        <span>Status: {issue.status.toUpperCase()}</span>
                      </div>
                      <button
                        onClick={() => resolveIssue(selectedFactory.factoryId, issue.id)}
                        className="btn btn-sm btn-success"
                      >
                        Resolve
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="detail-section">
              <h4>Last Audit</h4>
              {selectedFactory.inspectionHistory[0] && (
                <div className="audit-info">
                  <p><strong>Date:</strong> {selectedFactory.inspectionHistory[0].date.toLocaleDateString()}</p>
                  <p><strong>Inspector:</strong> {selectedFactory.inspectionHistory[0].inspector}</p>
                  <p><strong>Result:</strong> <span className={`badge ${selectedFactory.inspectionHistory[0].passed ? 'badge-success' : 'badge-danger'}`}>
                    {selectedFactory.inspectionHistory[0].passed ? 'PASSED' : 'FAILED'}
                  </span></p>
                  <p><strong>Findings:</strong> {selectedFactory.inspectionHistory[0].findings}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
