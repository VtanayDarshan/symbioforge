/**
 * useEcosystemMap Hook
 * React hook for Widget 2: Ecosystem Map state management
 * Manages factory nodes, waste connections, metrics, and interactions
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { EcosystemSimulator } from '../services/ecosystem-simulator';
import { FactoryNode, WasteConnection, EcosystemMetrics, EcosystemMapState } from '../types/phase-3';
import { FixtureLoader } from '../../../src/utils/fixture-loader';

interface UseEcosystemMapOptions {
  autoStart?: boolean;
  refreshInterval?: number;
}

export const useEcosystemMap = (options: UseEcosystemMapOptions = {}) => {
  const {
    autoStart = true,
    refreshInterval = 1000
  } = options;

  const simulatorRef = useRef<EcosystemSimulator>(new EcosystemSimulator());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const fixtureLoaderRef = useRef<FixtureLoader>(new FixtureLoader());

  const [state, setState] = useState<EcosystemMapState>({
    nodes: [],
    connections: [],
    metrics: {
      totalNodes: 0,
      activeConnections: 0,
      totalWasteCaptured: 0,
      connectionHealthScore: 0,
      averageConfidence: 0
    },
    selectedNode: null,
    selectedConnection: null,
    zoom: 1,
    pan: { x: 0, y: 0 },
    isSimulating: autoStart
  });

  // Initialize ecosystem on mount
  useEffect(() => {
    const factories = fixtureLoaderRef.current.getAll('factories');
    factories.forEach((factory: any) => {
      simulatorRef.current.addFactory(factory);
    });

    setState(prev => ({
      ...prev,
      nodes: simulatorRef.current.getFactoryNodes(),
      connections: simulatorRef.current.getConnections(),
      metrics: simulatorRef.current.getMetrics()
    }));

    if (autoStart) {
      startSimulation();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Simulation loop
  const startSimulation = useCallback(() => {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      simulatorRef.current.simulateActivity();
      setState(prev => ({
        ...prev,
        nodes: simulatorRef.current.getFactoryNodes(),
        connections: simulatorRef.current.getConnections(),
        metrics: simulatorRef.current.getMetrics(),
        isSimulating: true
      }));
    }, refreshInterval);
  }, [refreshInterval]);

  const stopSimulation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setState(prev => ({ ...prev, isSimulating: false }));
  }, []);

  const selectNode = useCallback((node: FactoryNode | null) => {
    setState(prev => ({
      ...prev,
      selectedNode: node,
      selectedConnection: null
    }));
  }, []);

  const selectConnection = useCallback((connection: WasteConnection | null) => {
    setState(prev => ({
      ...prev,
      selectedConnection: connection,
      selectedNode: null
    }));
  }, []);

  const activateConnection = useCallback((connectionId: string) => {
    simulatorRef.current.updateConnection(connectionId, 'active');
    setState(prev => ({
      ...prev,
      connections: simulatorRef.current.getConnections(),
      metrics: simulatorRef.current.getMetrics()
    }));
  }, []);

  const deactivateConnection = useCallback((connectionId: string) => {
    simulatorRef.current.updateConnection(connectionId, 'inactive');
    setState(prev => ({
      ...prev,
      connections: simulatorRef.current.getConnections(),
      metrics: simulatorRef.current.getMetrics()
    }));
  }, []);

  const zoomIn = useCallback(() => {
    setState(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom + 0.2, 3)
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setState(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom - 0.2, 0.5)
    }));
  }, []);

  const setPan = useCallback((x: number, y: number) => {
    setState(prev => ({
      ...prev,
      pan: { x, y }
    }));
  }, []);

  const getNodeConnections = useCallback((nodeId: string): WasteConnection[] => {
    return simulatorRef.current.getFactoryConnections(nodeId);
  }, []);

  const getTopMatches = useCallback((limit: number = 10): WasteConnection[] => {
    return simulatorRef.current.getTopMatches(limit);
  }, []);

  const getSummary = useCallback(() => {
    return simulatorRef.current.getSummary();
  }, []);

  const reset = useCallback(() => {
    simulatorRef.current.reset();
    setState(prev => ({
      ...prev,
      nodes: simulatorRef.current.getFactoryNodes(),
      connections: simulatorRef.current.getConnections(),
      metrics: simulatorRef.current.getMetrics(),
      selectedNode: null,
      selectedConnection: null
    }));
  }, []);

  return {
    // State
    nodes: state.nodes,
    connections: state.connections,
    metrics: state.metrics,
    selectedNode: state.selectedNode,
    selectedConnection: state.selectedConnection,
    zoom: state.zoom,
    pan: state.pan,
    isSimulating: state.isSimulating,

    // Controls
    startSimulation,
    stopSimulation,
    selectNode,
    selectConnection,
    activateConnection,
    deactivateConnection,
    zoomIn,
    zoomOut,
    setPan,
    reset,

    // Queries
    getNodeConnections,
    getTopMatches,
    getSummary,

    // Direct access
    simulator: simulatorRef.current
  };
};
