import ElementCard from './ElementCard';

const INDIGO = '#5151cd';
const INK    = '#111827';
const MUTED  = '#9ca3af';

const METHOD_BADGE = {
  text:   { label: 'Texte',   bg: 'rgba(81,81,205,0.08)',  color: INDIGO },
  vision: { label: 'Vision',  bg: 'rgba(15,116,17,0.08)', color: '#0f7411' },
};

function ArrowRightIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7h8M8 4l3 3-3 3"/>
    </svg>
  );
}

export default function ElementScopePanel({ elements, onToggleScope, onToggleRule, onToggleMetric, onToggleMethod, onAddCustomMetric, onRemoveCustomMetric, onExtract }) {
  const inScopeElements = elements.filter(e => e.inScope);
  const totalMetrics = inScopeElements.reduce((sum, el) =>
    sum + Object.values(el.metrics).filter(Boolean).length, 0
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', borderLeft: '1px solid #f1f2f4' }}>

      {/* Header */}
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #f1f2f4', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: INK }}>Éléments à identifier</span>
          <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: '#f1f2f4', color: '#636464', fontWeight: 600 }}>
            {inScopeElements.length} types · {totalMetrics} métriques
          </span>
        </div>
        <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.5, marginTop: 4 }}>
          Déduits des règles en revue. Ajustez les métriques puis lancez l'identification.
        </p>
      </div>

      {/* Method legend */}
      <div style={{ display: 'flex', gap: 12, padding: '8px 16px', borderBottom: '1px solid #f9f9fa', flexShrink: 0 }}>
        {Object.entries(METHOD_BADGE).map(([key, m]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: m.bg, color: m.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {m.label}
            </span>
            <span style={{ fontSize: 10, color: MUTED }}>
              {key === 'text' ? 'Sélection sur plan' : 'Détection auto'}
            </span>
          </div>
        ))}
      </div>

      {/* Element cards */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {elements.map(el => (
            <ElementCard
              key={el.id}
              element={el}
              onToggleScope={() => onToggleScope(el.id)}
              onToggleRule={(elId, ruleId) => onToggleRule(elId, ruleId)}
              onToggleMetric={(elId, metricId) => onToggleMetric(elId, metricId)}
              onToggleMethod={(method) => onToggleMethod(el.id, method)}
              onAddCustomMetric={onAddCustomMetric}
              onRemoveCustomMetric={onRemoveCustomMetric}
            />
          ))}
        </div>
      </div>

      {/* Footer CTA */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f2f4', flexShrink: 0 }}>
        <button
          onClick={onExtract}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            width: '100%', padding: '9px 0',
            background: INK, color: 'white',
            border: 'none', borderRadius: 8,
            fontSize: 12, fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity .12s',
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          Identifier les éléments <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
}
