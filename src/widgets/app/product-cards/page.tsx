'use client';

import { useWidgetSDK, useTheme } from '@nitrostack/widgets';

export const dynamic = 'force-dynamic';

interface WasteInput {
  wasteStreamId: string;
  wasteStreamName: string;
  factoryId: string;
  factoryName: string;
  proportion: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  wasteStreamsUsed: WasteInput[];
  manufacturingProcess: string;
  feasibilityScore: number;
  productionCostPerUnit: number;
  marketPricePerUnit: number;
  targetMarket: string;
  co2SavedTonsPerYear: number;
  revenuePotentialInrPerYear: number;
  status: string;
}

interface ProductData {
  products: Product[];
}

function FeasibilityGauge({ score }: { score: number }) {
  const color = score > 75 ? '#10b981' : score > 50 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 60, height: 6, borderRadius: 3, background: 'var(--border)' }}>
        <div style={{ width: `${score}%`, height: '100%', borderRadius: 3, background: color }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 700, color }}>{score}%</span>
    </div>
  );
}

export default function ProductCards() {
  const theme = useTheme();
  const { isReady, getToolOutput } = useWidgetSDK();
  const data = getToolOutput<ProductData>();

  const isDark = theme === 'dark';
  const vars = {
    '--card-bg': isDark ? '#1e293b' : '#f8fafc',
    '--text-primary': isDark ? '#e2e8f0' : '#1e293b',
    '--text-secondary': isDark ? '#94a3b8' : '#64748b',
    '--border': isDark ? '#334155' : '#e2e8f0',
    '--bg': isDark ? '#0f172a' : '#ffffff',
  } as React.CSSProperties;

  if (!isReady || !data) {
    return <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>Loading Product Concepts...</div>;
  }

  const products = data.products ?? [];

  return (
    <div style={{ ...vars, padding: 20, fontFamily: 'system-ui, sans-serif', color: 'var(--text-primary)', background: 'var(--bg)', minHeight: '100%' }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700 }}>💡 Product Concepts</h2>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--text-secondary)' }}>
        {products.length} AI-invented product{products.length !== 1 ? 's' : ''} from waste stream combinations
      </p>

      {products.length === 0 ? (
        <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-secondary)' }}>No product concepts generated yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {products.map((p) => {
            const margin = p.marketPricePerUnit - p.productionCostPerUnit;
            const marginPct = Math.round((margin / p.marketPricePerUnit) * 100);
            return (
              <div key={p.id} style={{ background: 'var(--card-bg)', borderRadius: 12, padding: 16, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{p.description}</div>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 10,
                    background: p.status === 'Blueprint Ready' ? '#10b98122' : p.status === 'Active' ? '#3b82f622' : '#64748b22',
                    color: p.status === 'Blueprint Ready' ? '#10b981' : p.status === 'Active' ? '#3b82f6' : '#64748b',
                  }}>{p.status}</span>
                </div>

                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>Waste Inputs:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                  {p.wasteStreamsUsed.map((w, i) => (
                    <span key={i} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: isDark ? '#334155' : '#e2e8f0' }}>
                      {w.wasteStreamName} ({w.factoryName})
                    </span>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Cost</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>₹{p.productionCostPerUnit}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Price</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#10b981' }}>₹{p.marketPricePerUnit}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Margin</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#f59e0b' }}>{marginPct}%</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Feasibility</div>
                    <FeasibilityGauge score={p.feasibilityScore} />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>CO₂ saved</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#10b981' }}>{p.co2SavedTonsPerYear} t/yr</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Revenue</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#f59e0b' }}>₹{(p.revenuePotentialInrPerYear / 100000).toFixed(1)}L/yr</div>
                  </div>
                </div>

                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 8 }}>
                  🎯 {p.targetMarket} &nbsp;|&nbsp; ⚙️ {p.manufacturingProcess}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
