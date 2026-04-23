import { useState } from 'react';
import { METRIC_LABELS } from '../../data/elementTypes';

const INDIGO = '#5151cd';
const GRAY   = '#636464';

function CheckIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2 7 5.5 10.5 12 4"/>
    </svg>
  );
}

const METHOD_BADGE = {
  text:   { label: 'Texte',  bg: 'rgba(81,81,205,0.08)', color: INDIGO },
  vision: { label: 'Vision', bg: 'rgba(15,116,17,0.08)', color: '#0f7411' },
};

function MethodToggle({ method, onChange }) {
  return (
    <div style={{ display: 'flex', background: '#f1f2f4', borderRadius: 5, padding: 2, gap: 1 }}>
      {[['text', 'Texte'], ['vision', 'Vision']].map(([key, label]) => (
        <button
          key={key}
          onClick={e => { e.stopPropagation(); onChange(key); }}
          style={{
            padding: '2px 7px', borderRadius: 3, fontSize: 9, fontWeight: 700,
            letterSpacing: '0.04em', textTransform: 'uppercase',
            background: method === key ? 'white' : 'transparent',
            boxShadow: method === key ? '0 1px 2px rgba(0,0,0,.08)' : 'none',
            color: method === key
              ? (key === 'vision' ? '#0f7411' : INDIGO)
              : '#9ca3af',
            border: 'none', cursor: 'pointer', transition: 'all .1s',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function ElementCard({ element, onToggleScope, onToggleRule, onToggleMetric, onToggleMethod, onAddCustomMetric, onRemoveCustomMetric }) {
  const { inScope, rules, metrics } = element;
  const activeRules = rules.filter(r => r.active);
  const methodBadge = METHOD_BADGE[element.method];
  const isTextMethod = element.method === 'text';
  const customMetrics = element.customMetrics ?? [];

  const [addingCustom, setAddingCustom] = useState(false);
  const [customLabel, setCustomLabel] = useState('');

  const confirmCustom = () => {
    const l = customLabel.trim();
    if (l) onAddCustomMetric?.(element.id, l);
    setCustomLabel('');
    setAddingCustom(false);
  };

  return (
    <div
      className="rounded-xl p-2.5 space-y-2"
      style={{ border: `1px solid ${inScope ? '#e8e8f0' : '#f1f2f4'}`, background: inScope ? 'white' : '#fafafa', opacity: inScope ? 1 : 0.6 }}
    >
      {/* Title row */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-sm font-semibold text-gray-900">{element.label}</span>
          {element.visionCapable && inScope ? (
            <MethodToggle method={element.method} onChange={onToggleMethod} />
          ) : methodBadge ? (
            <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: methodBadge.bg, color: methodBadge.color, textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0 }}>
              {methodBadge.label}
            </span>
          ) : null}
        </div>
        <button
          onClick={onToggleScope}
          style={{ color: inScope ? INDIGO : '#d1d5db', flexShrink: 0 }}
          className="transition-colors hover:opacity-80"
        >
          <CheckIcon size={15} />
        </button>
      </div>

      {/* Rules */}
      {inScope && activeRules.length > 0 && (
        <div className="space-y-1">
          {rules.map(rule => (
            <button
              key={rule.id}
              onClick={() => onToggleRule(element.id, rule.id)}
              className="flex items-start gap-1.5 w-full text-left group"
            >
              <span
                className="mt-0.5 flex-shrink-0 transition-colors"
                style={{ color: rule.active ? INDIGO : '#d1d5db' }}
              >
                <CheckIcon size={11} />
              </span>
              <span
                className="text-xs leading-snug transition-colors"
                style={{ color: rule.active ? INDIGO : GRAY }}
              >
                {rule.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Metrics */}
      {inScope && (
        <div className="flex flex-wrap gap-1.5">
          {/* Preset metrics (exclude count) */}
          {METRIC_LABELS.filter(m => m.id !== 'count').map(m => {
            const active = !!metrics[m.id];
            return (
              <button
                key={m.id}
                onClick={() => onToggleMetric(element.id, m.id)}
                className="text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors"
                style={{ color: active ? INDIGO : GRAY, background: active ? 'rgba(81,81,205,0.07)' : 'transparent' }}
              >
                {active ? '✓ ' : '+ '}{m.label}
              </button>
            );
          })}

          {/* Custom metrics — text method only */}
          {isTextMethod && customMetrics.map(cm => (
            <span
              key={cm.id}
              className="flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{ color: INDIGO, background: 'rgba(81,81,205,0.07)', border: '1px solid rgba(81,81,205,0.18)' }}
            >
              ✓ {cm.label}
              <button
                onClick={() => onRemoveCustomMetric?.(element.id, cm.id)}
                style={{ fontSize: 11, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, padding: 0 }}
              >×</button>
            </span>
          ))}

          {/* Add custom metric — text method only */}
          {isTextMethod && (
            addingCustom ? (
              <span className="flex items-center gap-1">
                <input
                  autoFocus
                  value={customLabel}
                  onChange={e => setCustomLabel(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') confirmCustom(); if (e.key === 'Escape') { setAddingCustom(false); setCustomLabel(''); } }}
                  placeholder="Nom…"
                  style={{ width: 90, padding: '1px 5px', fontSize: 10, border: `1px solid ${INDIGO}`, borderRadius: 4, outline: 'none', color: '#111827' }}
                />
                <button onClick={confirmCustom} style={{ fontSize: 10, color: 'white', background: INDIGO, border: 'none', borderRadius: 3, padding: '1px 5px', cursor: 'pointer' }}>✓</button>
                <button onClick={() => { setAddingCustom(false); setCustomLabel(''); }} style={{ fontSize: 11, color: GRAY, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
              </span>
            ) : (
              <button
                onClick={() => setAddingCustom(true)}
                className="text-[10px] font-medium px-1.5 py-0.5 rounded transition-colors"
                style={{ color: INDIGO, background: 'transparent', border: `1px dashed rgba(81,81,205,0.3)` }}
              >
                + Custom
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
