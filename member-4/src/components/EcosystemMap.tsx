/**
 * Ecosystem Map Component (Widget 2)
 * Interactive node-edge graph visualization of factories and waste stream connections
 * Displays real-time factory network with waste flow visualization
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { useEcosystemMap } from '../hooks/useEcosystemMap';
import { FactoryNode, WasteConnection, EcosystemMapProps } from '../types/phase-3';
import '../styles/ecosystem-map.css';

export const EcosystemMap: React.FC<EcosystemMapProps> = ({
  autoStart = true,
  title = 'Ecosystem Map',
  showMetrics = true,
  showControls = true,
  onNodeSelect,
  onConnectionSelect
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    nodes,
    connections,
    metrics,
    selectedNode,
    selectedConnection,
    zoom,
    pan,
    isSimulating,
    startSimulation,
    stopSimulation,
    selectNode,
    selectConnection,
    zoomIn,
    zoomOut,
    setPan,
    getTopMatches,
    getSummary,
    reset
  } = useEcosystemMap({ autoStart, refreshInterval: 800 });

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    drawGrid(ctx, width, height);

    // Draw connections first (so they appear behind nodes)
    connections.forEach(connection => {
      drawConnection(ctx, connection, nodes, selectedConnection, zoom, pan);
    });

    // Draw nodes
    nodes.forEach(node => {
      drawNode(ctx, node, selectedNode, zoom, pan);
    });

    // Draw selection info
    if (selectedNode) {
      drawNodeInfo(ctx, selectedNode, width, height);
    }
    if (selectedConnection) {
      drawConnectionInfo(ctx, selectedConnection, width, height);
    }
  }, [nodes, connections, selectedNode, selectedConnection, zoom, pan]);

  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;

    const gridSize = 50;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  const drawConnection = (
    ctx: CanvasRenderingContext2D,
    connection: WasteConnection,
    nodes: FactoryNode[],
    selectedConnection: WasteConnection | null,
    zoom: number,
    pan: { x: number; y: number }
  ) => {
    const source = nodes.find(n => n.id === connection.sourceFactoryId);
    const target = nodes.find(n => n.id === connection.targetFactoryId);

    if (!source || !target) return;

    const x1 = source.location.x * zoom + pan.x;
    const y1 = source.location.y * zoom + pan.y;
    const x2 = target.location.x * zoom + pan.x;
    const y2 = target.location.y * zoom + pan.y;

    // Color based on status
    const isSelected = selectedConnection?.id === connection.id;
    let color = connection.status === 'active' ? '#10b981' : '#94a3b8';
    if (isSelected) color = '#f59e0b';

    ctx.strokeStyle = color;
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.globalAlpha = connection.status === 'active' ? 1 : 0.5;

    // Draw line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Draw arrowhead
    drawArrowhead(ctx, x1, y1, x2, y2, color);

    ctx.globalAlpha = 1;
  };

  const drawArrowhead = (
    ctx: CanvasRenderingContext2D,
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
    color: string
  ) => {
    const headlen = 12;
    const angle = Math.atan2(toY - fromY, toX - fromX);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
  };

  const drawNode = (
    ctx: CanvasRenderingContext2D,
    node: FactoryNode,
    selectedNode: FactoryNode | null,
    zoom: number,
    pan: { x: number; y: number }
  ) => {
    const x = node.location.x * zoom + pan.x;
    const y = node.location.y * zoom + pan.y;
    const isSelected = selectedNode?.id === node.id;
    const radius = isSelected ? 18 : 14;

    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.arc(x + 2, y + 2, radius, 0, Math.PI * 2);
    ctx.fill();

    // Determine node color based on health
    let color = '#6366f1';
    if (node.healthScore >= 80) color = '#10b981';
    else if (node.healthScore >= 60) color = '#f59e0b';
    else color = '#ef4444';

    // Draw node
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw border
    ctx.strokeStyle = isSelected ? '#fbbf24' : '#ffffff';
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.name.substring(0, 3), x, y);
  };

  const drawNodeInfo = (
    ctx: CanvasRenderingContext2D,
    node: FactoryNode,
    width: number,
    height: number
  ) => {
    const panelWidth = 250;
    const panelHeight = 180;
    const x = width - panelWidth - 10;
    const y = 10;

    // Draw panel
    ctx.fillStyle = 'rgba(30, 27, 75, 0.9)';
    ctx.fillRect(x, y, panelWidth, panelHeight);

    // Border
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, panelWidth, panelHeight);

    // Title
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('Selected Factory', x + 10, y + 20);

    // Info
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '11px Arial';
    let infoY = y + 40;
    const lineHeight = 15;

    const info = [
      `Name: ${node.name}`,
      `Type: ${node.type}`,
      `Health: ${node.healthScore.toFixed(0)}%`,
      `Waste: ${node.wasteVolume} kg`,
      `Connections: ${node.activeConnections}`,
      `Processing: ${node.processingRate.toFixed(0)}%`
    ];

    info.forEach(text => {
      ctx.fillText(text, x + 10, infoY);
      infoY += lineHeight;
    });
  };

  const drawConnectionInfo = (
    ctx: CanvasRenderingContext2D,
    connection: WasteConnection,
    width: number,
    height: number
  ) => {
    const panelWidth = 250;
    const panelHeight = 160;
    const x = width - panelWidth - 10;
    const y = 10;

    // Draw panel
    ctx.fillStyle = 'rgba(30, 27, 75, 0.9)';
    ctx.fillRect(x, y, panelWidth, panelHeight);

    // Border
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, panelWidth, panelHeight);

    // Title
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 12px Arial';
    ctx.fillText('Selected Connection', x + 10, y + 20);

    // Info
    ctx.fillStyle = '#e2e8f0';
    ctx.font = '11px Arial';
    let infoY = y + 40;
    const lineHeight = 15;

    const info = [
      `Waste: ${connection.wasteType}`,
      `Volume: ${connection.volumePerDay} kg/day`,
      `Confidence: ${connection.confidence.toFixed(0)}%`,
      `Status: ${connection.status.toUpperCase()}`,
      `Recovery: ${connection.recovery ? 'Yes' : 'No'}`,
      `Value: $${connection.recoveryValue}`
    ];

    info.forEach(text => {
      ctx.fillText(text, x + 10, infoY);
      infoY += lineHeight;
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / zoom;
    const clickY = (e.clientY - rect.top) / zoom;

    // Check node clicks
    for (const node of nodes) {
      const distance = Math.hypot(
        clickX - (node.location.x + pan.x / zoom),
        clickY - (node.location.y + pan.y / zoom)
      );
      if (distance < 20) {
        selectNode(node);
        onNodeSelect?.(node);
        return;
      }
    }

    selectNode(null);
    selectConnection(null);
  };

  const summary = getSummary();

  return (
    <div className="ecosystem-map">
      <div className="ecosystem-header">
        <h2>{title}</h2>
        <div className="ecosystem-controls">
          {showControls && (
            <>
              <button
                onClick={isSimulating ? stopSimulation : startSimulation}
                className={`btn btn-sm ${isSimulating ? 'btn-danger' : 'btn-primary'}`}
              >
                {isSimulating ? '⏸ Pause' : '▶ Start'}
              </button>
              <button onClick={zoomIn} className="btn btn-sm btn-secondary" title="Zoom In">
                🔍+
              </button>
              <button onClick={zoomOut} className="btn btn-sm btn-secondary" title="Zoom Out">
                🔍-
              </button>
              <button onClick={reset} className="btn btn-sm btn-secondary" title="Reset">
                ↻ Reset
              </button>
            </>
          )}
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        onClick={handleCanvasClick}
        className="ecosystem-canvas"
      />

      {showMetrics && (
        <div className="ecosystem-metrics">
          <div className="metrics-row">
            <div className="metric-item">
              <div className="metric-label">Total Factories</div>
              <div className="metric-value">{summary.totalFactories}</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Active Connections</div>
              <div className="metric-value">{summary.activeConnections}</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Total Waste</div>
              <div className="metric-value">{(summary.totalWasteCaptured / 1000).toFixed(0)}T</div>
            </div>
            <div className="metric-item">
              <div className="metric-label">Recovery Value</div>
              <div className="metric-value">${(summary.totalRecoveryValue / 1000).toFixed(0)}K</div>
            </div>
          </div>
        </div>
      )}

      {selectedNode && (
        <div className="ecosystem-sidebar">
          <div className="sidebar-header">
            <h3>{selectedNode.name}</h3>
            <button onClick={() => selectNode(null)} className="btn-close">✕</button>
          </div>
          <div className="sidebar-content">
            <div className="info-group">
              <label>Type</label>
              <p>{selectedNode.type}</p>
            </div>
            <div className="info-group">
              <label>Health Score</label>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${selectedNode.healthScore}%` }}></div>
              </div>
              <p>{selectedNode.healthScore.toFixed(0)}%</p>
            </div>
            <div className="info-group">
              <label>Waste Volume</label>
              <p>{selectedNode.wasteVolume} kg</p>
            </div>
            <div className="info-group">
              <label>Processing Rate</label>
              <p>{selectedNode.processingRate.toFixed(0)}%</p>
            </div>
            <div className="info-group">
              <label>Active Connections</label>
              <p>{selectedNode.activeConnections}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
