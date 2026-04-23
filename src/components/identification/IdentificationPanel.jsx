import { useState, useRef, useEffect } from 'react';
import ExtractionResultTable from '../extraction/ExtractionResultTable';
import GroupingPanel from '../extraction/GroupingPanel';
import { METRIC_LABELS } from '../../data/elementTypes';

const INDIGO = '#5151cd';
const INK    = '#111827';
const MUTED  = '#9ca3af';
const GRAY   = '#636464';

const METRIC_MAP = Object.fromEntries(METRIC_LABELS.map(m => [m.id, m.label]));

// ── Icons ──────────────────────────────────────────────────────────────────────

function CheckIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="2 7 5.5 10.5 12 4"/>
    </svg>
  );
}

function CursorIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 2l4 10 2-4 4-2L2 2z"/>
    </svg>
  );
}

function ScanIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor"
      strokeWidth="1.5" strokeLinecap="round">
      <rect x="2" y="2" width="4" height="4" rx="0.5"/>
      <rect x="8" y="2" width="4" height="4" rx="0.5"/>
      <rect x="2" y="8" width="4" height="4" rx="0.5"/>
      <path d="M8 10h4M10 8v4" strokeWidth="1.8"/>
    </svg>
  );
}

// ── Method toggle ──────────────────────────────────────────────────────────────

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
            color: method === key ? (key === 'vision' ? '#0f7411' : INDIGO) : '#9ca3af',
            border: 'none', cursor: 'pointer', transition: 'all .1s',
          }}
        >{label}</button>
      ))}
    </div>
  );
}

// ── MetricChip with filter popover ─────────────────────────────────────────────

function MetricChip({ metricId, label, active, filter, onToggle, onSetFilter }) {
  const [open, setOpen] = useState(false);
  const [op,   setOp]   = useState(filter?.op    ?? '>');
  const [val,  setVal]  = useState(filter?.value != null ? String(filter.value) : '');
  const popRef = useRef(null);

  useEffect(() => { setOp(filter?.op ?? '>'); setVal(filter?.value != null ? String(filter.value) : ''); }, [filter]);

  useEffect(() => {
    if (!open) return;
    const fn = e => { if (popRef.current && !popRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [open]);

  const apply = () => { const v = parseFloat(val); if (!isNaN(v)) onSetFilter?.(metricId, { op, value: v }); setOpen(false); };
  const clear = () => { onSetFilter?.(metricId, null); setVal(''); setOpen(false); };
  const hasFilter = filter != null;

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}>
      <button
        onClick={onToggle}
        style={{
          fontSize: 10, fontWeight: 500, lineHeight: 1, paddingTop: 3, paddingBottom: 3,
          paddingLeft: 6, paddingRight: hasFilter && active ? 4 : 6,
          color: active ? INDIGO : GRAY,
          background: active ? 'rgba(81,81,205,0.07)' : 'transparent',
          border: 'none', cursor: 'pointer',
          borderRadius: hasFilter && active ? '4px 0 0 4px' : 4,
        }}
      >{active ? '✓ ' : '+ '}{label}</button>

      {active && (
        <button
          onClick={e => { e.stopPropagation(); setOpen(o => !o); }}
          style={{
            display: 'flex', alignItems: 'center', fontSize: 9, fontWeight: 700, lineHeight: 1,
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

      {open && (
        <div ref={popRef} style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200,
          background: 'white', border: '1px solid #eef0f3', borderRadius: 10,
          padding: '10px 10px 8px', minWidth: 158,
          boxShadow: '0 8px 24px rgba(0,0,0,.10), 0 1px 4px rgba(0,0,0,.06)',
        }}>
          <div style={{ fontSize: 10, color: MUTED, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 7 }}>
            Filtre — {label}
          </div>
          <div style={{ display: 'flex', gap: 3, marginBottom: 7 }}>
            {['>', '<', '≥', '≤'].map(o => (
              <button key={o} onClick={() => setOp(o)} style={{
                flex: 1, padding: '4px 0', borderRadius: 4, fontSize: 12, fontWeight: 700,
                background: op === o ? INDIGO : '#f4f5f7',
                color:      op === o ? 'white' : GRAY,
                border:     op === o ? 'none'  : '1px solid #eef0f3',
                cursor: 'pointer',
              }}>{o}</button>
            ))}
          </div>
          <input
            autoFocus type="number" value={val}
            onChange={e => setVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') apply(); if (e.key === 'Escape') setOpen(false); }}
            placeholder="Valeur…"
            style={{ width: '100%', padding: '5px 8px', fontSize: 11, border: '1px solid #e5e7eb', borderRadius: 6, outline: 'none', marginBottom: 7, boxSizing: 'border-box', color: INK }}
          />
          <div style={{ display: 'flex', gap: 5 }}>
            <button onClick={apply} disabled={isNaN(parseFloat(val))} style={{
              flex: 1, padding: '5px 0', borderRadius: 6, fontSize: 10, fontWeight: 600,
              background: !isNaN(parseFloat(val)) ? INDIGO : '#e5e7eb',
              color:      !isNaN(parseFloat(val)) ? 'white' : MUTED,
              border: 'none', cursor: !isNaN(parseFloat(val)) ? 'pointer' : 'default',
            }}>Appliquer</button>
            {hasFilter && (
              <button onClick={clear} style={{ padding: '5px 9px', borderRadius: 6, fontSize: 10, background: '#f4f5f7', color: GRAY, border: 'none', cursor: 'pointer' }}>Effacer</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── MetricRow (text extraction) ────────────────────────────────────────────────

function MetricRow({ elementId, metricId, label, isDone, isAwaiting, onActivate, onCancel }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0',
      borderBottom: '1px solid #f5f5f6',
      paddingLeft: isAwaiting ? 8 : 0,
      background: isAwaiting ? 'rgba(81,81,205,0.03)' : 'transparent',
      boxShadow: isAwaiting ? `inset 3px 0 0 ${INDIGO}` : 'none',
      transition: 'all .12s',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: isDone ? '#22c55e' : isAwaiting ? INDIGO : '#e5e7eb' }} />
      <span style={{ flex: 1, fontSize: 11, color: isDone ? '#374151' : isAwaiting ? INDIGO : '#6b7280', fontWeight: isAwaiting || isDone ? 500 : 400 }}>
        {label}
      </span>
      {isDone ? (
        <button onClick={onActivate} style={{ fontSize: 10, color: MUTED, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }} title="Re-identifier">↺</button>
      ) : isAwaiting ? (
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontSize: 10, color: INDIGO, fontStyle: 'italic' }}>Cliquez sur le plan</span>
          <button onClick={onCancel} style={{ fontSize: 10, color: MUTED, background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
        </span>
      ) : (
        <button onClick={onActivate} style={{
          display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: INDIGO, fontWeight: 500,
          background: 'rgba(81,81,205,0.07)', border: '1px solid rgba(81,81,205,0.18)',
          borderRadius: 5, padding: '2px 7px', cursor: 'pointer', whiteSpace: 'nowrap',
        }}>
          <CursorIcon /> Sélectionner
        </button>
      )}
    </div>
  );
}

// ── VisionReview ───────────────────────────────────────────────────────────────

function VisionReview({ elementLabel, items, isDone, onAccept, onDiscard, onRemoveItem, onAddItem, onItemHover }) {
  const [adding,   setAdding]   = useState(false);
  const [newLabel, setNewLabel] = useState('');

  const confirmAdd = () => {
    const l = newLabel.trim();
    if (!l) { setAdding(false); setNewLabel(''); return; }
    onAddItem?.({ id: `manual_${Date.now()}`, label: l });
    setNewLabel(''); setAdding(false);
  };

  return (
    <div style={{ border: '1px solid #eef0f3', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px',
        background: isDone ? 'rgba(34,197,94,0.06)' : 'rgba(81,81,205,0.05)',
        borderBottom: '1px solid #eef0f3',
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, color: isDone ? '#15803d' : INDIGO }}>
          {isDone && <CheckIcon size={11} />}
          {items.length} {elementLabel.toLowerCase()} détectés
        </span>
        {!isDone ? (
          <div style={{ display: 'flex', gap: 5 }}>
            <button onClick={onAccept} style={{ fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: INDIGO, color: 'white', border: 'none', cursor: 'pointer' }}>Accepter</button>
            <button onClick={onDiscard} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 5, background: 'transparent', color: '#6b7280', border: '1px solid #e5e7eb', cursor: 'pointer' }}>Ignorer</button>
          </div>
        ) : (
          <button onClick={onDiscard} style={{ fontSize: 10, color: MUTED, background: 'none', border: 'none', cursor: 'pointer' }}>Relancer</button>
        )}
      </div>
      <div style={{ padding: '2px 10px', maxHeight: 160, overflowY: 'auto' }}>
        {items.map((item, i) => (
          <div
            key={item.id}
            onMouseEnter={() => onItemHover?.(item.id)}
            onMouseLeave={() => onItemHover?.(null)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid #f5f5f6', cursor: item.planRef ? 'crosshair' : 'default' }}
          >
            <span style={{ width: 17, height: 17, borderRadius: 4, background: 'rgba(81,81,205,0.1)', color: INDIGO, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
            <span style={{ flex: 1, fontSize: 11, color: '#374151' }}>{item.label}</span>
            {item.width && <span style={{ fontSize: 11, color: '#6b7280', fontFamily: 'ui-monospace,monospace' }}>{item.width}</span>}
            {!isDone && (
              <button onClick={() => onRemoveItem?.(item.id)} style={{ width: 16, height: 16, borderRadius: 3, border: '1px solid #e5e7eb', background: '#f9fafb', color: '#9ca3af', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
            )}
          </div>
        ))}
        {!isDone && (
          <div style={{ padding: '5px 0', borderTop: items.length ? '1px solid #f5f5f6' : 'none', marginTop: 2 }}>
            {adding ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <input autoFocus value={newLabel} onChange={e => setNewLabel(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') confirmAdd(); if (e.key === 'Escape') { setAdding(false); setNewLabel(''); } }}
                  placeholder="Nom de l'élément…"
                  style={{ flex: 1, padding: '3px 7px', fontSize: 11, border: `1px solid ${INDIGO}`, borderRadius: 5, outline: 'none', color: INK }}
                />
                <button onClick={confirmAdd} style={{ width: 18, height: 18, borderRadius: 4, background: INDIGO, color: 'white', border: 'none', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</button>
                <button onClick={() => { setAdding(false); setNewLabel(''); }} style={{ width: 18, height: 18, borderRadius: 4, background: '#f1f2f4', color: GRAY, border: 'none', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
              </div>
            ) : (
              <button onClick={() => setAdding(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: MUTED, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <span style={{ width: 14, height: 14, borderRadius: 3, border: '1px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>+</span>
                Ajouter manuellement
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── New group form ─────────────────────────────────────────────────────────────

function NewGroupForm({ onConfirm, onCancel }) {
  const [label,        setLabel]        = useState('');
  const [method,       setMethod]       = useState('text');
  const [metrics,      setMetrics]      = useState({});
  const [customMetrics, setCustomMetrics] = useState([]);
  const [addingCustom, setAddingCustom] = useState(false);
  const [customLabel,  setCustomLabel]  = useState('');

  const toggleMetric = id => setMetrics(p => ({ ...p, [id]: !p[id] }));
  const confirmCustom = () => {
    const l = customLabel.trim();
    if (l) setCustomMetrics(prev => [...prev, { id: `cm_${Date.now()}`, label: l }]);
    setCustomLabel(''); setAddingCustom(false);
  };

  const anyMetric = Object.values(metrics).some(Boolean) || customMetrics.length > 0;
  const canConfirm = label.trim() && anyMetric;
  const displayMetrics = METRIC_LABELS.filter(m => m.id !== 'count');

  return (
    <div style={{ border: '1px solid rgba(81,81,205,0.2)', borderRadius: 10, padding: 12, background: 'rgba(81,81,205,0.02)', marginTop: 4 }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Nouveau groupe</p>
      <input
        autoFocus value={label} onChange={e => setLabel(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && canConfirm) onConfirm({ label: label.trim(), method, metrics, customMetrics }); if (e.key === 'Escape') onCancel(); }}
        placeholder="Nom du groupe…"
        style={{ width: '100%', padding: '6px 8px', fontSize: 11.5, border: `1px solid ${INDIGO}`, borderRadius: 6, outline: 'none', marginBottom: 10, boxSizing: 'border-box', color: INK }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 10, color: MUTED, fontWeight: 500 }}>Méthode</span>
        <MethodToggle method={method} onChange={setMethod} />
      </div>
      <p style={{ fontSize: 10, color: MUTED, fontWeight: 500, marginBottom: 6 }}>Métriques à extraire</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
        {displayMetrics.map(m => {
          const active = !!metrics[m.id];
          return (
            <button key={m.id} onClick={() => toggleMetric(m.id)} style={{
              fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 5,
              background: active ? 'rgba(81,81,205,0.1)' : '#f4f5f7',
              color: active ? INDIGO : '#6b7280',
              border: `1px solid ${active ? 'rgba(81,81,205,0.25)' : '#eef0f3'}`,
              cursor: 'pointer',
            }}>{active ? '✓ ' : '+ '}{m.label}</button>
          );
        })}
        {method === 'text' && customMetrics.map(cm => (
          <span key={cm.id} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 5, color: INDIGO, background: 'rgba(81,81,205,0.1)', border: '1px solid rgba(81,81,205,0.25)' }}>
            ✓ {cm.label}
            <button onClick={() => setCustomMetrics(p => p.filter(m => m.id !== cm.id))} style={{ fontSize: 11, color: MUTED, background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, padding: 0 }}>×</button>
          </span>
        ))}
        {method === 'text' && (addingCustom ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <input autoFocus value={customLabel} onChange={e => setCustomLabel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') confirmCustom(); if (e.key === 'Escape') { setAddingCustom(false); setCustomLabel(''); } }}
              placeholder="Nom…"
              style={{ width: 80, padding: '2px 5px', fontSize: 10, border: `1px solid ${INDIGO}`, borderRadius: 4, outline: 'none', color: INK }}
            />
            <button onClick={confirmCustom} style={{ fontSize: 10, color: 'white', background: INDIGO, border: 'none', borderRadius: 3, padding: '2px 5px', cursor: 'pointer' }}>✓</button>
            <button onClick={() => { setAddingCustom(false); setCustomLabel(''); }} style={{ fontSize: 11, color: MUTED, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
          </span>
        ) : (
          <button onClick={() => setAddingCustom(true)} style={{ fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 5, color: INDIGO, background: 'transparent', border: '1px dashed rgba(81,81,205,0.3)', cursor: 'pointer' }}>+ Custom</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button onClick={() => canConfirm && onConfirm({ label: label.trim(), method, metrics, customMetrics })} disabled={!canConfirm}
          style={{ flex: 1, padding: '6px 0', borderRadius: 6, fontSize: 11, fontWeight: 600, background: canConfirm ? INDIGO : '#e5e7eb', color: canConfirm ? 'white' : MUTED, border: 'none', cursor: canConfirm ? 'pointer' : 'default' }}>
          Créer le groupe
        </button>
        <button onClick={onCancel} style={{ padding: '6px 10px', borderRadius: 6, fontSize: 11, background: '#f4f5f7', color: '#6b7280', border: 'none', cursor: 'pointer' }}>Annuler</button>
      </div>
    </div>
  );
}

// ── Unified element card ───────────────────────────────────────────────────────

function UnifiedElementCard({
  element,
  onToggleScope, onToggleRule, onToggleMetric, onToggleMethod,
  onAddCustomMetric, onRemoveCustomMetric, onSetMetricFilter,
  smartFilled, awaitingSmartSelect, onSmartSelect,
  visionState, visionResultItems,
  onLaunchVision, onAcceptVision, onDiscardVision, onVisionRemoveItem, onVisionAddItem,
  activeElementType, onElementTypeSelect, onVisionItemHover,
}) {
  const { inScope, rules = [], metrics = {}, customMetrics = [] } = element;
  const metricFilters = element.metricFilters ?? {};
  const method  = element.method ?? 'text';
  const isText   = method === 'text';
  const isVision = method === 'vision';
  const isActive = activeElementType === element.id;

  const activePresetMetrics = METRIC_LABELS.filter(m => m.id !== 'count' && !!metrics[m.id]);
  const allTextMetricIds = isText
    ? [...activePresetMetrics.map(m => m.id), ...customMetrics.map(m => m.id)]
    : [];

  const visionRunning = visionState === 'running';
  const visionReview  = visionState === 'review';
  const visionDone    = visionState === 'done';

  const doneCount = isText
    ? allTextMetricIds.filter(m => smartFilled[`${element.id}.${m}`]).length
    : (visionDone ? 1 : 0);
  const totalCount = inScope ? (isText ? allTextMetricIds.length : 1) : 0;

  const [addingCustom, setAddingCustom] = useState(false);
  const [customLabel,  setCustomLabel]  = useState('');
  const confirmCustom = () => {
    const l = customLabel.trim();
    if (l) onAddCustomMetric?.(element.id, l);
    setCustomLabel(''); setAddingCustom(false);
  };

  const showExtractionSection = inScope && (allTextMetricIds.length > 0 || isVision);

  return (
    <div style={{
      border: `1px solid ${inScope ? (isActive ? 'rgba(81,81,205,0.3)' : '#e8e8f0') : '#f1f2f4'}`,
      borderRadius: 10,
      background: inScope ? 'white' : '#fafafa',
      opacity: inScope ? 1 : 0.6,
      marginBottom: 6,
      overflow: 'hidden',
      transition: 'border-color .15s',
    }}>
      {/* ── Config section ── */}
      <div style={{ padding: '10px 12px' }}>

        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: inScope ? 8 : 0 }}>
          <span
            onClick={() => inScope && onElementTypeSelect?.(element.id)}
            style={{ flex: 1, fontSize: 12.5, fontWeight: 600, color: isActive ? INDIGO : INK, cursor: inScope ? 'pointer' : 'default', transition: 'color .15s' }}
          >
            {element.label}
          </span>
          {element.visionCapable && inScope ? (
            <MethodToggle method={method} onChange={m => onToggleMethod(element.id, m)} />
          ) : inScope ? (
            <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: 'rgba(81,81,205,0.08)', color: INDIGO, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Texte
            </span>
          ) : null}
          {inScope && totalCount > 0 && (
            <span style={{ fontSize: 10, color: doneCount === totalCount ? '#22c55e' : MUTED, fontWeight: 500, flexShrink: 0 }}>
              {doneCount}/{totalCount}
            </span>
          )}
          <button
            onClick={onToggleScope}
            style={{ color: inScope ? INDIGO : '#d1d5db', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', flexShrink: 0, transition: 'color .12s' }}
          >
            <CheckIcon size={15} />
          </button>
        </div>

        {/* Rules */}
        {inScope && rules.filter(r => r.active).length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            {rules.map(rule => (
              <button
                key={rule.id}
                onClick={() => onToggleRule(element.id, rule.id)}
                style={{
                  fontSize: 10, textAlign: 'left', lineHeight: 1.4, padding: '2px 6px', borderRadius: 4, cursor: 'pointer',
                  color: rule.active ? INDIGO : '#9ca3af',
                  background: rule.active ? 'rgba(81,81,205,0.06)' : 'transparent',
                  border: `1px solid ${rule.active ? 'rgba(81,81,205,0.2)' : '#e5e7eb'}`,
                  transition: 'all .12s',
                }}
              >
                {rule.active ? '✓ ' : '○ '}{rule.label}
              </button>
            ))}
          </div>
        )}

        {/* Metric chips */}
        {inScope && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, rowGap: 5 }}>
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

            {/* Custom metric chips */}
            {isText && customMetrics.map(cm => (
              <span key={cm.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 500, padding: '1px 6px', borderRadius: 4, color: INDIGO, background: 'rgba(81,81,205,0.07)', border: '1px solid rgba(81,81,205,0.18)' }}>
                ✓ {cm.label}
                <button onClick={() => onRemoveCustomMetric?.(element.id, cm.id)} style={{ fontSize: 11, color: MUTED, background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, padding: 0 }}>×</button>
              </span>
            ))}

            {/* Add custom metric */}
            {isText && (addingCustom ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <input autoFocus value={customLabel} onChange={e => setCustomLabel(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') confirmCustom(); if (e.key === 'Escape') { setAddingCustom(false); setCustomLabel(''); } }}
                  placeholder="Nom…"
                  style={{ width: 90, padding: '1px 5px', fontSize: 10, border: `1px solid ${INDIGO}`, borderRadius: 4, outline: 'none', color: INK }}
                />
                <button onClick={confirmCustom} style={{ fontSize: 10, color: 'white', background: INDIGO, border: 'none', borderRadius: 3, padding: '1px 5px', cursor: 'pointer' }}>✓</button>
                <button onClick={() => { setAddingCustom(false); setCustomLabel(''); }} style={{ fontSize: 11, color: GRAY, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
              </span>
            ) : (
              <button onClick={() => setAddingCustom(true)} style={{ fontSize: 10, fontWeight: 500, padding: '1px 6px', borderRadius: 4, color: INDIGO, background: 'transparent', border: '1px dashed rgba(81,81,205,0.3)', cursor: 'pointer' }}>
                + Custom
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Extraction section ── */}
      {showExtractionSection && (
        <div style={{ borderTop: '1px solid #f0f1f3', background: '#fcfcfd', padding: '8px 12px 10px' }}>

          {/* Text: per-metric selection rows */}
          {isText && allTextMetricIds.length > 0 && allTextMetricIds.map(metricId => {
            const label = METRIC_MAP[metricId] ?? customMetrics.find(m => m.id === metricId)?.label ?? metricId;
            const isAwaiting = awaitingSmartSelect?.type === 'metric'
              && awaitingSmartSelect?.elementId === element.id
              && awaitingSmartSelect?.metricId === metricId;
            return (
              <MetricRow
                key={metricId}
                elementId={element.id}
                metricId={metricId}
                label={label}
                isDone={!!smartFilled[`${element.id}.${metricId}`]}
                isAwaiting={isAwaiting}
                onActivate={() => onSmartSelect(element.id, metricId)}
                onCancel={() => onSmartSelect(null, null)}
              />
            );
          })}

          {/* Vision: idle → detect button */}
          {isVision && !visionRunning && !visionReview && !visionDone && (
            <button onClick={() => onLaunchVision(element.id)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              width: '100%', padding: '7px 10px',
              background: 'white', border: '1px dashed #d1d5db',
              borderRadius: 7, cursor: 'pointer', fontSize: 11, color: '#374151', fontWeight: 500,
            }}>
              <ScanIcon /> Détecter avec la vision
            </button>
          )}

          {/* Vision: running */}
          {isVision && visionRunning && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: 'white', border: '1px solid #e5e7eb', borderRadius: 7 }}>
              <div style={{ display: 'flex', gap: 3 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: INDIGO, animation: `dot-bounce 1.2s ease-in-out ${i * 0.18}s infinite` }} />
                ))}
              </div>
              <span style={{ fontSize: 11, color: '#6b7280' }}>Analyse en cours…</span>
            </div>
          )}

          {/* Vision: review or done */}
          {isVision && (visionReview || visionDone) && visionResultItems && (
            <VisionReview
              elementLabel={element.label}
              items={visionResultItems}
              isDone={visionDone}
              onAccept={() => onAcceptVision(element.id)}
              onDiscard={() => onDiscardVision(element.id)}
              onRemoveItem={itemId => onVisionRemoveItem?.(element.id, itemId)}
              onAddItem={item => onVisionAddItem?.(element.id, item)}
              onItemHover={onVisionItemHover}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── Main panel ─────────────────────────────────────────────────────────────────

export default function IdentificationPanel({
  elements,
  onToggleScope, onToggleRule, onToggleMetric, onToggleMethod,
  onAddCustomMetric, onRemoveCustomMetric, onSetMetricFilter,
  smartFilled, awaitingSmartSelect, onSmartSelect,
  visionStates, visionResults,
  onLaunchVision, onAcceptVision, onDiscardVision, onVisionRemoveItem, onVisionAddItem,
  extraGroups, onAddGroup,
  cellValues, onCellSelect, parentAssignments, onParentAssign,
  extraRows, onAddElement, activeApt, onInstanceClick,
  extractionDone,
  activeElementType, onElementTypeSelect, onVisionItemHover,
}) {
  const [showGrouping,     setShowGrouping]     = useState(false);
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);

  const inScopeElements = (elements ?? []).filter(e => e.inScope);

  // ── When extraction is complete, hand off to result table ──────────────────
  if (extractionDone) {
    if (showGrouping) {
      return (
        <GroupingPanel
          elements={[...inScopeElements, ...(extraGroups ?? [])]}
          extraGroups={extraGroups ?? []}
          parentAssignments={parentAssignments}
          onParentAssign={onParentAssign}
          onBack={() => setShowGrouping(false)}
        />
      );
    }
    return (
      <ExtractionResultTable
        elements={elements}
        taskStates={{ ext_logements: 'done', ext_portes: 'done', ext_stationnement: 'done' }}
        smartFilled={smartFilled}
        onSmartSelect={onSmartSelect}
        extraRows={extraRows}
        onAddElement={onAddElement}
        activeApt={activeApt}
        onInstanceClick={onInstanceClick}
        extraGroups={extraGroups}
        onAddGroup={onAddGroup}
        cellValues={cellValues}
        onCellSelect={onCellSelect}
        parentAssignments={parentAssignments}
        onShowGrouping={() => setShowGrouping(true)}
      />
    );
  }

  // ── Header progress ────────────────────────────────────────────────────────
  let totalSteps = 0, doneSteps = 0;
  const allElements = [...inScopeElements, ...(extraGroups ?? [])];
  allElements.forEach(el => {
    const m = el.method ?? 'text';
    if (m === 'text') {
      const active = Object.entries(el.metrics || {}).filter(([, v]) => v);
      totalSteps += active.length + (el.customMetrics ?? []).length;
      doneSteps  += active.filter(([k]) => smartFilled[`${el.id}.${k}`]).length
        + (el.customMetrics ?? []).filter(cm => smartFilled[`${el.id}.${cm.id}`]).length;
    } else {
      totalSteps += 1;
      if (visionStates[`vision_${el.id}`] === 'done') doneSteps += 1;
    }
  });
  const pct = totalSteps === 0 ? 0 : Math.round((doneSteps / totalSteps) * 100);
  const hasStarted = doneSteps > 0;

  const handleConfirmNewGroup = ({ label, method, metrics, customMetrics }) => {
    onAddGroup(`group_${Date.now()}`, label, method, metrics, customMetrics ?? []);
    setShowNewGroupForm(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', borderLeft: '1px solid #f1f2f4' }}>

      {/* Header */}
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #f1f2f4', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: hasStarted ? 8 : 2 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: INK }}>Éléments à identifier</span>
          <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: '#f1f2f4', color: '#636464', fontWeight: 600 }}>
            {inScopeElements.length} types · {totalSteps} métriques
          </span>
        </div>
        {hasStarted ? (
          <div style={{ height: 3, background: '#f1f2f4', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 2, background: pct === 100 ? '#22c55e' : INDIGO, width: `${pct}%`, transition: 'width .3s ease' }} />
          </div>
        ) : (
          <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.5, marginTop: 4 }}>
            Configurez les métriques et lancez l'identification.
          </p>
        )}
      </div>

      {/* Scrollable card list */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px 12px' }}>

        {/* Default elements */}
        {(elements ?? []).map(el => (
          <UnifiedElementCard
            key={el.id}
            element={el}
            onToggleScope={() => onToggleScope(el.id)}
            onToggleRule={onToggleRule}
            onToggleMetric={onToggleMetric}
            onToggleMethod={onToggleMethod}
            onAddCustomMetric={onAddCustomMetric}
            onRemoveCustomMetric={onRemoveCustomMetric}
            onSetMetricFilter={onSetMetricFilter}
            smartFilled={smartFilled}
            awaitingSmartSelect={awaitingSmartSelect}
            onSmartSelect={onSmartSelect}
            visionState={visionStates[`vision_${el.id}`]}
            visionResultItems={visionResults[el.id]}
            onLaunchVision={onLaunchVision}
            onAcceptVision={onAcceptVision}
            onDiscardVision={onDiscardVision}
            onVisionRemoveItem={onVisionRemoveItem}
            onVisionAddItem={onVisionAddItem}
            activeElementType={activeElementType}
            onElementTypeSelect={onElementTypeSelect}
            onVisionItemHover={onVisionItemHover}
          />
        ))}

        {/* Extra groups */}
        {(extraGroups ?? []).map(g => (
          <UnifiedElementCard
            key={g.id}
            element={{ ...g, visionCapable: true, rules: [], inScope: true }}
            onToggleScope={() => {}}
            onToggleRule={onToggleRule}
            onToggleMetric={onToggleMetric}
            onToggleMethod={onToggleMethod}
            onAddCustomMetric={onAddCustomMetric}
            onRemoveCustomMetric={onRemoveCustomMetric}
            onSetMetricFilter={onSetMetricFilter}
            smartFilled={smartFilled}
            awaitingSmartSelect={awaitingSmartSelect}
            onSmartSelect={onSmartSelect}
            visionState={visionStates[`vision_${g.id}`]}
            visionResultItems={visionResults[g.id]}
            onLaunchVision={onLaunchVision}
            onAcceptVision={onAcceptVision}
            onDiscardVision={onDiscardVision}
            onVisionRemoveItem={onVisionRemoveItem}
            onVisionAddItem={onVisionAddItem}
            activeElementType={activeElementType}
            onElementTypeSelect={onElementTypeSelect}
            onVisionItemHover={onVisionItemHover}
          />
        ))}

        {/* Add group */}
        {showNewGroupForm ? (
          <NewGroupForm
            onConfirm={handleConfirmNewGroup}
            onCancel={() => setShowNewGroupForm(false)}
          />
        ) : (
          <button
            onClick={() => setShowNewGroupForm(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              width: '100%', padding: '7px 0',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 11, color: MUTED,
            }}
          >
            <span style={{ width: 16, height: 16, borderRadius: 4, border: '1px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>+</span>
            Ajouter un groupe d'éléments
          </button>
        )}
      </div>
    </div>
  );
}
