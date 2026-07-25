'use client';

import { useWidgetSDK, useTheme } from '@nitrostack/widgets';

export const dynamic = 'force-dynamic';

interface Equipment {
  name: string;
  spec: string;
  costInr: number;
}

interface Blueprint {
  id: string;
  opportunityId: string;
  opportunityType: 'match' | 'product';
  title: string;
  steps: string[];
  equipment: Equipment[];
  facilityRequirements: { spaceSqFt: number; powerKw: number; waterLpd: number; ventilation: string };
  capexInr: number;
  paybackMonths: number;
  timelineWeeks: number;
  regulatoryNotes: string[];
}

interface PathwayData {
  blueprints: Blueprint[];
}

function StepTimeline({ steps }: { steps: string[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', gap: 10, minHeight: 36 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20 }}>
            <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#6366f1', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</div>
            {i < steps.length - 1 && <div style={{ width: 2, flex: 1, background: '#6366f133' }} />}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-primary)', paddingBottom: 8, lineHeight: 1.4 }}>{step}</div>
        </div>
      ))}
    </div>
  );
}

export default function PathwayViewer() {
  const theme = useTheme();
  const { isReady, getToolOutput } = useWidgetSDK();
  const data = getToolOutput<PathwayData>();

  const isDark = theme === 'dark';
  const vars = {
    '--card-bg': isDark ? '#1e293b' : '#f8fafc',
    '--text-primary': isDark ? '#e2e8f0' : '#1e293b',
    '--text-secondary': isDark ? '#94a3b8' : '#64748b',
    '--border': isDark ? '#334155' : '#e2e8f0',
    '--bg': isDark ? '#0f172a' : '#ffffff',
  } as React.CSSProperties;

  if (!isReady || !data) {
    return <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>Loading Pathways...</div>;
  }

  const blueprints = data.blueprints ?? [];

  return (
    <div style={{ ...vars, padding: 20, fontFamily: 'system-ui, sans-serif', color: 'var(--text-primary)', background: 'var(--bg)', minHeight: '100%' }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700 }}>🏗️ Manufacturing Pathways</h2>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
        {blueprints.length} blueprint{blueprints.length !== 1 ? 's' : ''} with step-by-step implementation plans
      </p>

      {blueprints.length === 0 ? (
        <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-secondary)' }}>No blueprints generated yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {blueprints.map((bp) => (
            <div key={bp.id} style={{ background: 'var(--card-bg)', borderRadius: 12, padding: 16, border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ fontWeight: 700, fontSize: 14, flex: 1 }}>{bp.title}</div>
                <span style={{
                  fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 10, flexShrink: 0,
                  background: bp.opportunityType === 'product' ? '#f59e0b22' : '#6366f122',
                  color: bp.opportunityType === 'product' ? '#f59e0b' : '#6366f1',
                }}>{bp.opportunityType === 'product' ? 'Product Line' : 'Symbiotic Match'}</span>
              </div>

              <StepTimeline steps={bp.steps} />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 8, margin: '12px 0', padding: 10, background: isDark ? '#0f172a' : '#f1f5f9', borderRadius: 8 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>CAPEX</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b' }}>₹{(bp.capexInr / 1000).toFixed(0)}K</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Payback</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>{bp.paybackMonths} mo</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Timeline</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#6366f1' }}>{bp.timelineWeeks} wk</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-secondary)' }}>Space</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{bp.facilityRequirements.spaceSqFt} sqft</div>
                </div>
              </div>

              {bp.equipment.length > 0 && (
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Equipment</div>
                  {bp.equipment.map((eq, i) => (
                    <div key={i} style={{ fontSize: 12, display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                      <span>{eq.name} <span style={{ color: 'var(--text-secondary)' }}>({eq.spec})</span></span>
                      <span style={{ fontWeight: 600 }}>₹{(eq.costInr / 1000).toFixed(0)}K</span>
                    </div>
                  ))}
                </div>
              )}

              {bp.regulatoryNotes.length > 0 && (
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', paddingTop: 8, marginTop: 4 }}>
                  ⚖️ {bp.regulatoryNotes.join(' | ')}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
