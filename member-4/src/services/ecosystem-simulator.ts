/**
 * Ecosystem Simulator
 * Generates factory nodes and waste stream connections for the Ecosystem Map
 * Creates realistic relationships between factories based on material compatibility
 */

import { FactoryNode, WasteConnection, EcosystemMetrics } from '../types/ecosystem';
import { FixtureLoader } from '../../../src/utils/fixture-loader';

export class EcosystemSimulator {
  private factoryNodes: FactoryNode[] = [];
  private connections: WasteConnection[] = [];
  private metrics: EcosystemMetrics = {
    totalNodes: 0,
    activeConnections: 0,
    totalWasteCaptured: 0,
    connectionHealthScore: 0,
    averageConfidence: 0
  };

  private fixtureLoader: FixtureLoader;
  private activationTime: number = Date.now();

  constructor() {
    this.fixtureLoader = new FixtureLoader();
    this.initializeEcosystem();
  }

  /**
   * Initialize ecosystem with factory nodes from fixtures
   */
  private initializeEcosystem(): void {
    const factories = this.fixtureLoader.getAll('factories');
    
    this.factoryNodes = factories.map((factory: any, index: number) => ({
      id: factory.id,
      name: factory.name,
      type: factory.type,
      location: {
        x: 100 + (index % 5) * 200 + Math.random() * 50,
        y: 100 + Math.floor(index / 5) * 200 + Math.random() * 50
      },
      wasteVolume: factory.wasteVolume,
      contaminationLevel: factory.contaminationLevel,
      activeConnections: 0,
      healthScore: 75 + Math.random() * 25,
      lastActivity: Date.now(),
      processingRate: 85 + Math.random() * 15,
      matchCount: Math.floor(Math.random() * 8) + 1,
      recoveryValue: Math.floor(Math.random() * 500000) + 50000
    }));

    this.metrics.totalNodes = this.factoryNodes.length;
    this.generateConnections();
  }

  /**
   * Generate waste stream connections between compatible factories
   */
  private generateConnections(): void {
    this.connections = [];
    const compatibilityMatrix = this.fixtureLoader.getAll('compatibility');
    let totalCaptured = 0;

    // Create connections based on waste compatibility
    for (let i = 0; i < this.factoryNodes.length; i++) {
      const sourceFactory = this.factoryNodes[i];
      const possibleConnections = 1 + Math.floor(Math.random() * 3);

      for (let c = 0; c < possibleConnections; c++) {
        const targetIndex = (i + 1 + Math.floor(Math.random() * (this.factoryNodes.length - 1))) % this.factoryNodes.length;
        if (targetIndex !== i) {
          const targetFactory = this.factoryNodes[targetIndex];
          const wasteFlow = Math.floor(Math.random() * sourceFactory.wasteVolume * 0.8);
          
          const connection: WasteConnection = {
            id: `conn-${i}-${targetIndex}`,
            sourceFactoryId: sourceFactory.id,
            targetFactoryId: targetFactory.id,
            wasteType: sourceFactory.type,
            volumePerDay: wasteFlow,
            confidence: 60 + Math.random() * 40,
            status: Math.random() > 0.2 ? 'active' : 'pending',
            recovery: wasteFlow > 5000,
            recoveryValue: Math.floor(wasteFlow * (0.5 + Math.random() * 2)),
            lastUpdated: Date.now() - Math.floor(Math.random() * 3600000)
          };

          this.connections.push(connection);
          totalCaptured += wasteFlow;

          // Update node connection counts
          this.factoryNodes[i].activeConnections++;
          this.factoryNodes[targetIndex].activeConnections++;
        }
      }
    }

    this.metrics.activeConnections = this.connections.length;
    this.metrics.totalWasteCaptured = totalCaptured;
    this.updateConnectionHealth();
  }

  /**
   * Update connection health metrics
   */
  private updateConnectionHealth(): void {
    if (this.connections.length === 0) {
      this.metrics.connectionHealthScore = 0;
      this.metrics.averageConfidence = 0;
      return;
    }

    const activeCount = this.connections.filter(c => c.status === 'active').length;
    this.metrics.connectionHealthScore = (activeCount / this.connections.length) * 100;
    
    const avgConfidence = this.connections.reduce((sum, c) => sum + c.confidence, 0) / this.connections.length;
    this.metrics.averageConfidence = avgConfidence;
  }

  /**
   * Add a new factory to the ecosystem
   */
  addFactory(factory: any): FactoryNode {
    const newNode: FactoryNode = {
      id: factory.id,
      name: factory.name,
      type: factory.type,
      location: {
        x: 50 + Math.random() * 400,
        y: 50 + Math.random() * 400
      },
      wasteVolume: factory.wasteVolume,
      contaminationLevel: factory.contaminationLevel,
      activeConnections: 0,
      healthScore: 70 + Math.random() * 30,
      lastActivity: Date.now(),
      processingRate: 80 + Math.random() * 20,
      matchCount: 0,
      recoveryValue: 0
    };

    this.factoryNodes.push(newNode);
    this.metrics.totalNodes++;
    this.generateConnections();
    return newNode;
  }

  /**
   * Update connection status (activate/deactivate)
   */
  updateConnection(connectionId: string, newStatus: 'active' | 'pending' | 'inactive'): void {
    const connection = this.connections.find(c => c.id === connectionId);
    if (connection) {
      connection.status = newStatus;
      connection.lastUpdated = Date.now();
      this.updateConnectionHealth();
    }
  }

  /**
   * Get all factory nodes
   */
  getFactoryNodes(): FactoryNode[] {
    return this.factoryNodes;
  }

  /**
   * Get all waste connections
   */
  getConnections(): WasteConnection[] {
    return this.connections;
  }

  /**
   * Get connections for a specific factory
   */
  getFactoryConnections(factoryId: string): WasteConnection[] {
    return this.connections.filter(
      c => c.sourceFactoryId === factoryId || c.targetFactoryId === factoryId
    );
  }

  /**
   * Get ecosystem metrics
   */
  getMetrics(): EcosystemMetrics {
    return { ...this.metrics };
  }

  /**
   * Simulate ecosystem activity - update node states
   */
  simulateActivity(): void {
    // Update factory health scores
    this.factoryNodes.forEach(node => {
      const changeAmount = (Math.random() - 0.5) * 5;
      node.healthScore = Math.max(0, Math.min(100, node.healthScore + changeAmount));
      
      // Random connection updates
      if (Math.random() > 0.8) {
        node.lastActivity = Date.now();
      }

      // Update processing rate
      node.processingRate = Math.max(50, Math.min(100, node.processingRate + (Math.random() - 0.5) * 3));
    });

    // Update connections
    this.connections.forEach(conn => {
      if (Math.random() > 0.85) {
        conn.status = conn.status === 'active' ? 'pending' : 'active';
        conn.lastUpdated = Date.now();
      }

      // Slight confidence fluctuation
      conn.confidence = Math.max(30, Math.min(100, conn.confidence + (Math.random() - 0.5) * 2));
    });

    this.updateConnectionHealth();
  }

  /**
   * Get connection path between two factories (for visualization)
   */
  getConnectionPath(sourceId: string, targetId: string): WasteConnection | null {
    return this.connections.find(
      c => c.sourceFactoryId === sourceId && c.targetFactoryId === targetId
    ) || null;
  }

  /**
   * Get top matches by recovery value
   */
  getTopMatches(limit: number = 10): WasteConnection[] {
    return [...this.connections]
      .filter(c => c.status === 'active')
      .sort((a, b) => b.recoveryValue - a.recoveryValue)
      .slice(0, limit);
  }

  /**
   * Get ecosystem summary statistics
   */
  getSummary() {
    const activeConnections = this.connections.filter(c => c.status === 'active').length;
    const pendingConnections = this.connections.filter(c => c.status === 'pending').length;
    const totalRecoveryValue = this.connections.reduce((sum, c) => sum + c.recoveryValue, 0);
    const averageNodeHealth = this.factoryNodes.reduce((sum, n) => sum + n.healthScore, 0) / this.factoryNodes.length;

    return {
      totalFactories: this.factoryNodes.length,
      totalConnections: this.connections.length,
      activeConnections,
      pendingConnections,
      totalWasteCaptured: this.metrics.totalWasteCaptured,
      totalRecoveryValue,
      averageNodeHealth,
      connectionHealthScore: this.metrics.connectionHealthScore,
      systemUptime: Date.now() - this.activationTime
    };
  }

  /**
   * Reset ecosystem
   */
  reset(): void {
    this.factoryNodes = [];
    this.connections = [];
    this.activationTime = Date.now();
    this.initializeEcosystem();
  }
}
