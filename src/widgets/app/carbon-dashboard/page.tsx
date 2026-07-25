'use client';

import { useWidgetSDK, useTheme } from '@nitrostack/widgets';

export const dynamic = 'force-dynamic';

interface CarbonData {
  success: boolean;
  circularScore: number;
  totalCo2Avoided: number;
  totalLandfillDiverted: number;
  totalWaterSaved: number;
  totalFinancialValue: number;
  factoriesCount: number;
  matchesCount: number;
  productsCount: number;
  blueprintsCount: number;
}

function MetricCard({ label, value, unit, color, icon }: { label: string; value: string; unit: string; color: string; icon: string }) {
  return (
    <div style={{ background: 'var(--card-bg)', borderRadius: 12, padding: 20, border: `1px solid ${color}33`, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 20 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{unit}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{label}</div>
    </div>
  );
}

function CircularGauge({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score > 60 ? '#10b981' : score > 30 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--border)" strokeWidth="10" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
        <text x="70" y="65" textAnchor="middle" fill={color} fontSize="28" fontWeight="700">{score}</text>
        <text x="70" y="85" textAnchor="middle" fill="var(--text-secondary)" fontSize="11">/ 100</text>
      </svg>
      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>Circular Economy Score</div>
    </div>
  );
}

export default function CarbonDashboard() {
  const theme = useTheme();
  const { isReady, getToolOutput } = useWidgetSDK();
  const data = getToolOutput<CarbonData>();

  const isDark = theme === 'dark';
  const vars = {
    '--card-bg': isDark ? '#1e293b' : '#f8fafc',
    '--text-primary': isDark ? '#e2e8f0' : '#1e293b',
    '--text-secondary': isDark ? '#94a3b8' : '#64748b',
    '--border': isDark ? '#334155' : '#e2e8f0',
    '--bg': isDark ? '#0f172a' : '#ffffff',
  } as React.CSSProperties;

  if (!isReady || !data) {
    return <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>Loading Carbon Dashboard...</div>;
  }

  const formatNum = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

  return (
    <div style={{ ...vars, padding: 20, fontFamily: 'system-ui, sans-serif', color: 'var(--text-primary)', background: 'var(--bg)', minHeight: '100%' }}>
      <h2 style={{ margin: '0 0 6px', fontSize: 20, fontWeight: 700 }}>🌍 Carbon & ESG Dashboard</h2>
      <p style={{ margin: '0 0 20px', fontSize: 13, color: 'var(--text-secondary)' }}>Cluster-wide environmental and financial impact metrics</p>

      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 24 }}>
        <CircularGauge score={data.circularScore ?? 0} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 20 }}>
        <MetricCard label="CO₂ Avoided" value={(data.totalCo2Avoided ?? 0).toFixed(1)} unit="tons/year" color="#10b981" icon="🌿" />
        <MetricCard label="Landfill Diverted" value={(data.totalLandfillDiverted ?? 0).toFixed(1)} unit="tons/year" color="#06b6d4" icon="🏭" />
        <MetricCard label="Water Saved" value={formatNum(data.totalWaterSaved ?? 0)} unit="liters/year" color="#3b82f6" icon="💧" />
        <MetricCard label="Financial Value" value={formatNum(data.totalFinancialValue ?? 0)} unit="INR/year" color="#f59e0b" icon="💰" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 }}>
        <div style={{ background: 'var(--card-bg)', borderRadius: 8, padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#8b5cf6' }}>{data.factoriesCount ?? 0}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Factories</div>
        </div>
        <div style={{ background: 'var(--card-bg)', borderRadius: 8, padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#ec4899' }}>{data.matchesCount ?? 0}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Symbioses</div>
        </div>
        <div style={{ background: 'var(--card-bg)', borderRadius: 8, padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#f59e0b' }}>{data.productsCount ?? 0}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Products</div>
        </div>
        <div style={{ background: 'var(--card-bg)', borderRadius: 8, padding: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#6366f1' }}>{data.blueprintsCount ?? 0}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Blueprints</div>
        </div>
      </div>
    </div>
  );
}
