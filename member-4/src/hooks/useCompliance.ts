/**
 * useCompliance Hook
 * React hook for Widget 3: Compliance Dashboard state management
 * Manages factory compliance, issues, metrics, and PDF export
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { ComplianceSimulator } from '../services/compliance-simulator';
import { FactoryCompliance, ComplianceStatus, ComplianceMetrics, ComplianceDashboardState } from '../types/phase-3';
import { PDFExportService } from '../services/pdf-export';
import { FixtureLoader } from '../../../src/utils/fixture-loader';

interface UseComplianceOptions {
  autoStart?: boolean;
  refreshInterval?: number;
}

export const useCompliance = (options: UseComplianceOptions = {}) => {
  const {
    autoStart = true,
    refreshInterval = 1500
  } = options;

  const simulatorRef = useRef<ComplianceSimulator>(new ComplianceSimulator());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fixtureLoaderRef = useRef<FixtureLoader>(new FixtureLoader());

  const [state, setState] = useState<ComplianceDashboardState>({
    compliance: new Map(),
    metrics: {
      compliantFactories: 0,
      nonCompliantFactories: 0,
      partiallyCompliant: 0,
      openIssues: 0,
      averageComplianceScore: 0,
      certificationCoverage: 0,
      auditCoverage: 0
    },
    selectedFactory: null,
    filterStatus: 'all',
    sortBy: 'score',
    isLoading: false
  });

  // Initialize compliance data on mount
  useEffect(() => {
    setState(prev => ({ ...prev, isLoading: true }));

    const factories = fixtureLoaderRef.current.getAll('factories');
    factories.forEach((factory: any) => {
      const compliance = simulatorRef.current.createFactoryCompliance(factory.id, factory);
      setState(prev => {
        const newMap = new Map(prev.compliance);
        newMap.set(factory.id, compliance);
        return {
          ...prev,
          compliance: newMap
        };
      });
    });

    setState(prev => ({
      ...prev,
      metrics: simulatorRef.current.getMetrics(),
      isLoading: false
    }));

    if (autoStart) {
      startMonitoring();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Monitoring loop
  const startMonitoring = useCallback(() => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      simulatorRef.current.simulateCompliance();
      setState(prev => ({
        ...prev,
        metrics: simulatorRef.current.getMetrics(),
        compliance: new Map(
          Array.from(simulatorRef.current.getAllCompliance()).map(c => [c.factoryId, c])
        )
      }));
    }, refreshInterval);
  }, [refreshInterval]);

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const selectFactory = useCallback((factory: FactoryCompliance | null) => {
    setState(prev => ({ ...prev, selectedFactory: factory }));
  }, []);

  const filterByStatus = useCallback((status: ComplianceStatus | 'all') => {
    setState(prev => ({ ...prev, filterStatus: status }));
  }, []);

  const setSortBy = useCallback((sortBy: 'score' | 'issues' | 'name') => {
    setState(prev => ({ ...prev, sortBy }));
  }, []);

  const getFilteredFactories = useCallback((): FactoryCompliance[] => {
    let factories = Array.from(state.compliance.values());

    if (state.filterStatus !== 'all') {
      factories = factories.filter(f => f.status === state.filterStatus);
    }

    switch (state.sortBy) {
      case 'score':
        factories.sort((a, b) => b.overallScore - a.overallScore);
        break;
      case 'issues':
        factories.sort((a, b) => b.openIssues.length - a.openIssues.length);
        break;
      case 'name':
        factories.sort((a, b) => a.factoryName.localeCompare(b.factoryName));
        break;
    }

    return factories;
  }, [state.compliance, state.filterStatus, state.sortBy]);

  const resolveIssue = useCallback((factoryId: string, issueId: string) => {
    simulatorRef.current.resolveIssue(factoryId, issueId);
    setState(prev => ({
      ...prev,
      metrics: simulatorRef.current.getMetrics(),
      compliance: new Map(
        Array.from(simulatorRef.current.getAllCompliance()).map(c => [c.factoryId, c])
      )
    }));
  }, []);

  const updateScore = useCallback((factoryId: string, scoreChange: number) => {
    simulatorRef.current.updateComplianceScore(factoryId, scoreChange);
    setState(prev => ({
      ...prev,
      metrics: simulatorRef.current.getMetrics(),
      compliance: new Map(
        Array.from(simulatorRef.current.getAllCompliance()).map(c => [c.factoryId, c])
      )
    }));
  }, []);

  const exportDashboardPDF = useCallback(() => {
    const compliance = Array.from(state.compliance.values());
    PDFExportService.generateCompliancePDF(
      compliance,
      state.metrics,
      `compliance-dashboard-${new Date().toISOString().split('T')[0]}.pdf`
    );
  }, [state.compliance, state.metrics]);

  const exportFactoryReportPDF = useCallback((factoryId: string) => {
    const compliance = state.compliance.get(factoryId);
    if (compliance) {
      PDFExportService.generateFactoryReportPDF(
        compliance,
        `${compliance.factoryName.replace(/\s+/g, '-').toLowerCase()}-compliance.pdf`
      );
    }
  }, [state.compliance]);

  const getCriticalFactories = useCallback((): FactoryCompliance[] => {
    return simulatorRef.current.getFactoriesWithCriticalIssues();
  }, []);

  const getNonCompliantFactories = useCallback((): FactoryCompliance[] => {
    return simulatorRef.current.getFactoriesByStatus('non_compliant');
  }, []);

  const getFactoryCompliance = useCallback((factoryId: string): FactoryCompliance | null => {
    return state.compliance.get(factoryId) || null;
  }, [state.compliance]);

  const getDashboardSummary = useCallback(() => {
    const all = Array.from(state.compliance.values());
    return {
      totalFactories: all.length,
      compliantCount: all.filter(f => f.status === 'compliant').length,
      partialCount: all.filter(f => f.status === 'partially_compliant').length,
      nonCompliantCount: all.filter(f => f.status === 'non_compliant').length,
      totalOpenIssues: all.reduce((sum, f) => sum + f.openIssues.length, 0),
      criticalIssueCount: all.reduce(
        (sum, f) => sum + f.openIssues.filter(i => i.severity === 'critical').length,
        0
      ),
      averageScore: all.reduce((sum, f) => sum + f.overallScore, 0) / all.length,
      complianceRate: (all.filter(f => f.status === 'compliant').length / all.length) * 100
    };
  }, [state.compliance]);

  const reset = useCallback(() => {
    simulatorRef.current.reset();
    setState(prev => ({
      ...prev,
      compliance: new Map(),
      metrics: simulatorRef.current.getMetrics(),
      selectedFactory: null
    }));
  }, []);

  return {
    // State
    compliance: state.compliance,
    metrics: state.metrics,
    selectedFactory: state.selectedFactory,
    filterStatus: state.filterStatus,
    sortBy: state.sortBy,
    isLoading: state.isLoading,

    // Controls
    startMonitoring,
    stopMonitoring,
    selectFactory,
    filterByStatus,
    setSortBy,
    resolveIssue,
    updateScore,
    reset,

    // Export
    exportDashboardPDF,
    exportFactoryReportPDF,

    // Queries
    getFilteredFactories,
    getCriticalFactories,
    getNonCompliantFactories,
    getFactoryCompliance,
    getDashboardSummary,

    // Direct access
    simulator: simulatorRef.current
  };
};
