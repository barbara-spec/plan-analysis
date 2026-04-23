import { useState, useRef, useEffect } from 'react';
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

// ─── Metric chip with inline filter popover ───────────────────────────────────

function MetricChip({ metricId, label, active, filter, onToggle, onSetFilter }) {
  const [open, setOpen]   = useState(false);
  const [op,  setOp]      = useState(filter?.op  ?? '>');
  const [val, setVal]     = useState(filter?.value != null ? String(filter.value) : '');
  const popRef = useRef(null);

  // Keep local state in sync when filter prop changes externally
  useEffect(() => {
    setOp(filter?.op ?? '>');
    setVal(filter?.value != null ? String(filter.value) : '');
  }, [filter]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const fn = e => { if (popRef.current && !popRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [open]);

  const apply = () => {
    const v = parseFloat(val);
    if (!isNaN(v)) onSetFilter?.(metricId, { op, value: v });
    setOpen(false);
  };

  const clear = () => {
    onSetFilter?.(metricId, null);
    setVal('');
    setOpen(false);
  };

  const hasFilter = filter != null;

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}>
      {/* Toggle button */}
      <button
        onClick={onToggle}
        className="text-[10px] font-medium py-0.5 transition-colors"
        style={{
          paddingLeft: 6, paddingRight: hasFilter && active ? 4 : 6,
          color: active ? INDIGO : GRAY,
          background: active ? 'rgba(81,81,205,0.07)' : 'transparent',
          borderRadius: hasFilter && active ? '4px 0 0 4px' : 4,
        }}
      >
        {active ? '✓ ' : '+ '}{label}
      </button>

      {/* Filter pill — only when active */}
      {active && (
        <button
          onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
          title={hasFilter ? 'Modifier le filtre' : 'Ajouter un filtre'}
          style={{
            display: 'flex', alignItems: 'center',
            fontSize: 9, fontWeight: 700, lineHeight: 1,
            padding: '3px 5px',
            color:      hasFilter ? 'white' : 'rgba(81,81,205,0.5)',
            background: hasFilter ? INDIGO  : 'rgba(81,81,205,0.07)',
            border: 'none', cursor: 'pointer',
            borderLeft: '1px solid rgba(81,81,205,0.15)',
            borderRadius: '0 4px 4px 0',
            transition: 'all .12s',
          }}
        >
          {hasFilter ? `${filter.op}${filter.value}` : (
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M1 2h8M2.5 5h5M4 8h2"/>
            </svg>
          )}
        </button>
      )}

      {/* Filter popover */}
      {open && (
        <div ref={popRef} style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200,
          background: 'white', border: '1px solid #eef0f3', borderRadius: 10,
          padding: '10px 10px 8px', minWidth: 158,
          boxShadow: '0 8px 24px rgba(0,0,0,.10), 0 1px 4px rgba(0,0,0,.06)',
        }}>
          <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 7 }}>
            Filtre — {label}
          </div>
          {/* Operator */}
          <div style={{ display: 'flex', gap: 3, marginBottom: 7 }}>
            {['>', '<', '≥', '≤'].map(o => (
              <button key={o} onClick={() => setOp(o)} style={{
                flex: 1, padding: '4px 0', borderRadius: 4, fontSize: 12, fontWeight: 700,
                background: op === o ? INDIGO : '#f4f5f7',
                color:      op === o ? 'white' : '#636464',
                border:     op === o ? 'none'  : '1px solid #eef0f3',
                cursor: 'pointer', transition: 'all .1s',
              }}>{o}</button>
            ))}
          </div>
          {/* Value */}
          <input
            autoFocus
            type="number"
            value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') apply(); if (e.key === 'Escape') setOpen(false); }}
            placeholder="Valeur…"
            style={{
              width: '100%', padding: '5px 8px', fontSize: 11,
              border: '1px solid #e5e7eb', borderRadius: 6, outline: 'none',
              marginBottom: 7, boxSizing: 'border-box', color: '#111827',
            }}
          />
          {/* Actions */}
          <div style={{ display: 'flex', gap: 5 }}>
            <button
              onClick={apply}
              disabled={isNaN(parseFloat(val))}
              style={{
                flex: 1, padding: '5px 0', borderRadius: 6, fontSize: 10, fontWeight: 600,
                background: !isNaN(parseFloat(val)) ? INDIGO : '#e5e7eb',
                color:      !isNaN(parseFloat(val)) ? 'white' : '#9ca3af',
                border: 'none', cursor: !isNaN(parseFloat(val)) ? 'pointer' : 'default',
              }}
            >Appliquer</button>
            {hasFilter && (
              <button onClick={clear} style={{
                padding: '5px 9px', borderRadius: 6, fontSize: 10,
                background: '#f4f5f7', color: '#636464', border: 'none', cursor: 'pointer',
              }}>Effacer</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Element card ─────────────────────────────────────────────────────────────

export default function ElementCard({ element, onToggleScope, onToggleRule, onToggleMetric, onToggleMethod, onAddCustomMetric, onRemoveCustomMetric, onSetMetricFilter }) {
  const { inScope, rules, metrics } = element;
  const metricFilters = element.metricFilters ?? {};
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
          {METRIC_LABELS.filter(m => m.id !== 'count').map(m => (
            <MetricChip
              key={m.id}
              metricId={m.id}
              label={m.label}
              active={!!metrics[m.id]}
              filter={metricFilters[m.id] ?? null}
              onToggle={() => onToggleMetric(element.id, m.id)}
              onSetFilter={(mId, f) => onSetMetricFilter?.(element.id, mId, f)}
            />
          ))}

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
