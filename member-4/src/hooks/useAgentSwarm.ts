/**
 * useAgentSwarm Hook
 * React hook for managing agent swarm state and real-time monitoring
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { AgentSwarmSimulator, getAgentSwarmSimulator } from '../services/agent-swarm-simulator';
import { FactoryStreamSimulator } from '../services/factory-stream-simulator';
import {
  AgentState,
  SwarmMetrics,
  AgentActivity,
  ActivityFeedItem,
  SimulatedFactoryStream
} from '../types/agent-swarm';

interface UseAgentSwarmOptions {
  autoStart?: boolean;
  refreshInterval?: number;
  factoryStreamInterval?: number;
}

export function useAgentSwarm(options: UseAgentSwarmOptions = {}) {
  const {
    autoStart = false,
    refreshInterval = 1000, // Update metrics every second
    factoryStreamInterval = 3000 // New factory every 3 seconds
  } = options;

  const [metrics, setMetrics] = useState<SwarmMetrics | null>(null);
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [recentActivities, setRecentActivities] = useState<AgentActivity[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityFeedItem[]>([]);
  const [isRunning, setIsRunning] = useState(autoStart);
  const [factoryStreamActive, setFactoryStreamActive] = useState(false);

  const swarmSimulatorRef = useRef<AgentSwarmSimulator | null>(null);
  const factorySimulatorRef = useRef<FactoryStreamSimulator | null>(null);
  const metricsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const factoryStreamRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Initialize simulators
   */
  useEffect(() => {
    if (!swarmSimulatorRef.current) {
      swarmSimulatorRef.current = getAgentSwarmSimulator();
    }
    if (!factorySimulatorRef.current) {
      factorySimulatorRef.current = new FactoryStreamSimulator();
    }
  }, []);

  /**
   * Update metrics and state
   */
  const updateMetrics = useCallback(() => {
    if (!swarmSimulatorRef.current) return;

    const newMetrics = swarmSimulatorRef.current.getSwarmMetrics();
    setMetrics(newMetrics);
    setAgents(swarmSimulatorRef.current.getAllAgents());
    setRecentActivities(swarmSimulatorRef.current.getRecentActivities(20));
    setActivityFeed(swarmSimulatorRef.current.generateActivityFeed(10));
  }, []);

  /**
   * Handle incoming factory
   */
  const handleFactory = useCallback((factory: SimulatedFactoryStream) => {
    if (!swarmSimulatorRef.current) return;

    // Process factory through swarm
    swarmSimulatorRef.current.processFactory(factory);

    // Update UI
    updateMetrics();
  }, [updateMetrics]);

  /**
   * Start monitoring
   */
  const start = useCallback(() => {
    setIsRunning(true);

    // Setup metrics update interval
    if (metricsIntervalRef.current) clearInterval(metricsIntervalRef.current);
    metricsIntervalRef.current = setInterval(updateMetrics, refreshInterval);

    updateMetrics(); // Initial update
  }, [updateMetrics, refreshInterval]);

  /**
   * Stop monitoring
   */
  const stop = useCallback(() => {
    setIsRunning(false);
    if (metricsIntervalRef.current) {
      clearInterval(metricsIntervalRef.current);
      metricsIntervalRef.current = null;
    }
  }, []);

  /**
   * Start factory stream
   */
  const startFactoryStream = useCallback(() => {
    if (!factorySimulatorRef.current) return;

    setFactoryStreamActive(true);
    if (factoryStreamRef.current) clearInterval(factoryStreamRef.current);

    factoryStreamRef.current = factorySimulatorRef.current.startContinuousStream(
      factoryStreamInterval,
      handleFactory
    );
  }, [factoryStreamInterval, handleFactory]);

  /**
   * Stop factory stream
   */
  const stopFactoryStream = useCallback(() => {
    setFactoryStreamActive(false);
    if (factoryStreamRef.current) {
      clearInterval(factoryStreamRef.current);
      factoryStreamRef.current = null;
    }
  }, []);

  /**
   * Process single factory
   */
  const processFactory = useCallback((factory: SimulatedFactoryStream) => {
    handleFactory(factory);
  }, [handleFactory]);

  /**
   * Reset simulator
   */
  const reset = useCallback(() => {
    if (swarmSimulatorRef.current) {
      swarmSimulatorRef.current.reset();
    }
    if (factorySimulatorRef.current) {
      factorySimulatorRef.current.reset();
    }
    stopFactoryStream();
    stop();
    setMetrics(null);
    setAgents([]);
    setRecentActivities([]);
    setActivityFeed([]);
  }, [stop, stopFactoryStream]);

  /**
   * Setup/cleanup effect
   */
  useEffect(() => {
    if (autoStart && !isRunning) {
      start();
    }

    return () => {
      if (metricsIntervalRef.current) clearInterval(metricsIntervalRef.current);
      if (factoryStreamRef.current) clearInterval(factoryStreamRef.current);
    };
  }, [autoStart, isRunning, start]);

  return {
    // State
    metrics,
    agents,
    recentActivities,
    activityFeed,
    isRunning,
    factoryStreamActive,

    // Controls
    start,
    stop,
    reset,
    startFactoryStream,
    stopFactoryStream,
    processFactory,

    // Data generators
    simulators: {
      swarm: swarmSimulatorRef.current,
      factory: factorySimulatorRef.current
    }
  };
}
