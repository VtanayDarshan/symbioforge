'use client';

import { useWidgetSDK, useTheme } from '@nitrostack/widgets';

export const dynamic = 'force-dynamic';

interface WasteStream {
  id: string;
  name: string;
  category: string;
  physicalForm: string;
  volume: number;
  contamination: string;
  reusePotential: number;
}

interface WasteProfileData {
  factoryId: string;
  factoryName: string;
  wasteStreams: WasteStream[];
}

const CATEGORY_ICONS: Record<string, string> = {
  organic: '🌿', metallic: '⚙️', polymeric: '🧪', chemical: '⚗️',
  textile: '🧵', cellulosic: '📄', ceramic: '🏺', composite: '🔗',
};

const CONTAM_COLORS: Record<string, string> = {
  clean: '#10b981', mild: '#f59e0b', high: '#f97316', hazardous: '#ef4444',
};

function ReuseBar({ value }: { value: number }) {
  const color = value > 75 ? '#10b981' : value > 50 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--border)' }}>
        <div style={{ width: `${value}%`, height: '100%', borderRadius: 3, background: color, transition: 'width 0.5s ease' }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color, minWidth: 32 }}>{value}%</span>
    </div>
  );
}

export default function WasteProfiles() {
  const theme = useTheme();
  const { isReady, getToolOutput } = useWidgetSDK();
  const data = getToolOutput<WasteProfileData>();

  const isDark = theme === 'dark';
  const vars = {
    '--card-bg': isDark ? '#1e293b' : '#f8fafc',
    '--text-primary': isDark ? '#e2e8f0' : '#1e293b',
    '--text-secondary': isDark ? '#94a3b8' : '#64748b',
    '--border': isDark ? '#334155' : '#e2e8f0',
    '--bg': isDark ? '#0f172a' : '#ffffff',
  } as React.CSSProperties;

  if (!isReady || !data) {
    return <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>Loading Waste Profiles...</div>;
  }

  const streams = data.wasteStreams ?? [];

  return (
    <div style={{ ...vars, padding: 20, fontFamily: 'system-ui, sans-serif', color: 'var(--text-primary)', background: 'var(--bg)', minHeight: '100%' }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700 }}>📋 Waste Profile</h2>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
        {data.factoryName ?? 'Factory'} — {streams.length} classified waste stream{streams.length !== 1 ? 's' : ''}
      </p>

      {streams.length === 0 ? (
        <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-secondary)' }}>No waste streams classified yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {streams.map((ws) => (
            <div key={ws.id} style={{ background: 'var(--card-bg)', borderRadius: 10, padding: 14, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 20 }}>{CATEGORY_ICONS[ws.category] ?? '♻️'}</span>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{ws.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{ws.category} · {ws.physicalForm}</div>
                  </div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
                  background: (CONTAM_COLORS[ws.contamination] ?? '#666') + '22',
                  color: CONTAM_COLORS[ws.contamination] ?? '#666',
                }}>{ws.contamination}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                <span>Volume: <strong style={{ color: 'var(--text-primary)' }}>{ws.volume} kg/day</strong></span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 }}>Reuse Potential</div>
              <ReuseBar value={ws.reusePotential} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
