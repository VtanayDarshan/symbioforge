# Widget 1 Integration Guide

## Quick Setup

### 1. Copy Widget 1 Files
```bash
# All files are in member-4/src/
# Copy to your main project:
src/
  ├── components/
  │   └── AgentSwarmMonitor.tsx
  ├── hooks/
  │   └── useAgentSwarm.ts
  ├── services/
  │   ├── agent-swarm-simulator.ts
  │   └── factory-stream-simulator.ts
  ├── types/
  │   └── agent-swarm.ts
  └── styles/
      └── agent-swarm-monitor.css
```

### 2. Install Dependencies (if needed)
```bash
npm install react react-dom typescript
# No additional UI libraries required!
```

### 3. Import Widget
```typescript
import { AgentSwarmMonitor } from './components/AgentSwarmMonitor';
import './styles/agent-swarm-monitor.css';
```

### 4. Use in Your App
```typescript
function App() {
  return (
    <AgentSwarmMonitor
      autoStart={true}
      title="SymBioForge Agent Monitor"
      showMetrics={true}
      showActivityFeed={true}
      showAgentPool={true}
    />
  );
}

export default App;
```

---

## Integration Patterns

### Pattern 1: Standalone Dashboard
```typescript
export function Dashboard() {
  return (
    <div className="dashboard">
      <AgentSwarmMonitor autoStart={true} />
    </div>
  );
}
```

### Pattern 2: With Other Widgets
```typescript
export function MainApp() {
  return (
    <div className="app-layout">
      <header>SymBioForge Control Center</header>
      <div className="widgets-grid">
        <AgentSwarmMonitor autoStart={true} />
        {/* Widget 2, 3, 4, etc. will go here */}
      </div>
    </div>
  );
}
```

### Pattern 3: Custom Hook Usage
```typescript
function CustomMonitor() {
  const {
    metrics,
    agents,
    activityFeed,
    isRunning,
    factoryStreamActive,
    start,
    startFactoryStream
  } = useAgentSwarm({ autoStart: false });

  return (
    <div>
      <button onClick={start}>Start Monitoring</button>
      <button onClick={startFactoryStream}>Start Stream</button>
      {metrics && (
        <div>Health: {metrics.systemHealthScore}%</div>
      )}
      <ul>
        {activityFeed.map(item => (
          <li key={item.id}>{item.title}: {item.description}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Pattern 4: Server Integration (Future)
```typescript
// When MCP Server is ready:
function MonitorWithLiveData() {
  const {
    metrics,
    agents,
    processFactory
  } = useAgentSwarm({ autoStart: true });

  useEffect(() => {
    // Connect to MCP Server
    const stream = connectToMCPServer('/api/agents');
    stream.on('factory', (factory) => {
      processFactory(factory); // Real data!
    });
  }, [processFactory]);

  return <AgentSwarmMonitor />;
}
```

---

## Component Props

```typescript
interface AgentSwarmMonitorProps {
  autoStart?: boolean;           // Auto-start monitoring (default: true)
  title?: string;                // Header title (default: "Agent Swarm Monitor")
  showMetrics?: boolean;         // Show metrics panel (default: true)
  showActivityFeed?: boolean;    // Show activity feed (default: true)
  showAgentPool?: boolean;       // Show agent pool (default: true)
}
```

---

## Hook API

```typescript
const {
  // State
  metrics: SwarmMetrics | null;                    // System metrics
  agents: AgentState[];                            // All agents
  recentActivities: AgentActivity[];               // Last 20 activities
  activityFeed: ActivityFeedItem[];                // Last 10 feed items
  isRunning: boolean;                              // Monitoring active?
  factoryStreamActive: boolean;                    // Stream running?

  // Controls
  start: () => void;                               // Start monitoring
  stop: () => void;                                // Stop monitoring
  reset: () => void;                               // Reset everything
  startFactoryStream: () => void;                  // Start incoming stream
  stopFactoryStream: () => void;                   // Stop stream
  processFactory: (factory) => void;               // Process single factory

  // Simulators (for advanced use)
  simulators: {
    swarm: AgentSwarmSimulator;
    factory: FactoryStreamSimulator;
  }
} = useAgentSwarm(options);
```

---

## Options

```typescript
interface UseAgentSwarmOptions {
  autoStart?: boolean;              // Auto-start on mount (default: false)
  refreshInterval?: number;         // Metrics update ms (default: 1000)
  factoryStreamInterval?: number;   // Factory generation ms (default: 3000)
}
```

**Example:**
```typescript
const hook = useAgentSwarm({
  autoStart: true,
  refreshInterval: 500,      // Update faster
  factoryStreamInterval: 2000 // Factories every 2 seconds
});
```

---

## Data Types

### SwarmMetrics
```typescript
interface SwarmMetrics {
  totalAgents: number;                    // Total agents (9)
  activeAgents: number;                   // Currently processing
  idleAgents: number;                     // Waiting
  agentStats: {
    [AgentType]: {
      count: number;                      // Agents of this type
      activeCount: number;
      totalTasks: number;
      successRate: number;                // 0-100%
    }
  };
  totalMatchesGenerated: number;
  averageConfidenceScore: number;         // 0-100%
  systemHealthScore: number;              // 0-100%
  lastActivity: Date;
}
```

### AgentState
```typescript
interface AgentState {
  id: string;                             // e.g., "scout-1"
  type: AgentType;                        // scout|clerk|profiler|matchmaker
  status: AgentStatus;                    // idle|processing|analyzing|matching|error|complete
  currentActivity?: AgentActivity;
  completedTasks: number;
  failedTasks: number;
  successRate: number;                    // 0-100%
  averageProcessingTimeMs: number;
  lastUpdated: Date;
}
```

### ActivityFeedItem
```typescript
interface ActivityFeedItem {
  id: string;
  timestamp: Date;
  agent: AgentType;                       // scout|clerk|profiler|matchmaker
  status: AgentStatus;
  title: string;                          // e.g., "Factory Intake"
  description: string;
  factoryName?: string;
  matchCount?: number;                    // If matches were generated
  confidence?: number;                    // 0-100%
  icon?: string;                          // Emoji
}
```

---

## Styling & Customization

### Using Design Tokens
```css
:root {
  --color-primary: #6366f1;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-danger: #ef4444;
  --color-info: #3b82f6;
  /* ... see agent-swarm-monitor.css for all tokens */
}
```

### Overriding Styles
```css
/* Your custom styles */
.agent-swarm-monitor {
  --color-primary: #yourcolor;
}

.metric-card {
  padding: 2rem; /* Custom spacing */
}
```

---

## Performance Tips

### 1. Control Refresh Rate
```typescript
// For dashboards - every 500ms
const hook = useAgentSwarm({ refreshInterval: 500 });

// For embedded - every 2 seconds
const hook = useAgentSwarm({ refreshInterval: 2000 });
```

### 2. Lazy Load Component
```typescript
const AgentSwarmMonitor = lazy(() =>
  import('./components/AgentSwarmMonitor')
);

<Suspense fallback={<div>Loading...</div>}>
  <AgentSwarmMonitor />
</Suspense>
```

### 3. Memoize Component
```typescript
const MemoizedMonitor = React.memo(AgentSwarmMonitor);

// Only re-render if props change
<MemoizedMonitor autoStart={true} />
```

---

## Common Use Cases

### Use Case 1: Demo Mode
```typescript
<AgentSwarmMonitor
  autoStart={true}
  title="Live Demo - SymBioForge"
/>
// Automatically starts with simulated data
```

### Use Case 2: Control Panel
```typescript
function ControlPanel() {
  const [isActive, setIsActive] = useState(false);

  return (
    <div>
      <button onClick={() => setIsActive(!isActive)}>
        Toggle Monitor
      </button>
      {isActive && <AgentSwarmMonitor autoStart={true} />}
    </div>
  );
}
```

### Use Case 3: Embedded in Dashboard
```typescript
function FactoryDashboard() {
  return (
    <div className="dashboard-grid">
      <div className="col-8">
        <AgentSwarmMonitor autoStart={true} />
      </div>
      <div className="col-4">
        {/* Other widgets/stats */}
      </div>
    </div>
  );
}
```

### Use Case 4: Real-time Integration
```typescript
// When MCP Server is connected:
function LiveMonitor() {
  const { processFactory } = useAgentSwarm({ autoStart: true });
  const mcpClient = useMCP();

  useEffect(() => {
    mcpClient.subscribe('factory:new', processFactory);
  }, [processFactory, mcpClient]);

  return <AgentSwarmMonitor />;
}
```

---

## Troubleshooting

### Issue: Widget not showing activities
**Solution:**
```typescript
// Make sure to start both monitoring AND stream
const { start, startFactoryStream } = useAgentSwarm();

useEffect(() => {
  start();
  startFactoryStream();
}, []);
```

### Issue: Metrics showing zero
**Solution:**
```typescript
// Wait 1-2 seconds for data to accumulate
// Check browser console for errors
console.log('Metrics:', metrics);
console.log('Stream active:', factoryStreamActive);
```

### Issue: Performance degradation
**Solution:**
```typescript
// Reduce refresh rate
const hook = useAgentSwarm({ refreshInterval: 2000 });

// Don't display all panels if not needed
<AgentSwarmMonitor showActivityFeed={false} />
```

### Issue: Component unmounting causes errors
**Solution:**
Already handled! The hook cleans up intervals on unmount.

---

## Next Steps

1. **Copy files** to your project
2. **Import component** in your app
3. **Test** with `autoStart={true}`
4. **Customize** styling as needed
5. **Connect** real data when MCP Server ready

---

## Resources

- [Widget 1 Completion Summary](./PHASE-2-COMPLETION.md)
- [Type Definitions](./src/types/agent-swarm.ts)
- [Component Code](./src/components/AgentSwarmMonitor.tsx)
- [Services Documentation](./src/services/)

---

**Ready to integrate Widget 1? 🚀**
