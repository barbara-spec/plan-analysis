import { useState } from 'react';
import ExtractionResultTable from './ExtractionResultTable';
import GroupingPanel from './GroupingPanel';
import { METRIC_LABELS } from '../../data/elementTypes';

const INDIGO = '#5151cd';
const INK    = '#111827';
const MUTED  = '#9ca3af';

const METRIC_MAP = Object.fromEntries(METRIC_LABELS.map(m => [m.id, m.label]));

// ─── Icons ────────────────────────────────────────────────────────────────────

function CursorIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor"
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

function CheckIcon({ size = 10 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="2 6 5 9 10 3"/>
    </svg>
  );
}

// ─── Method toggle (text ↔ vision) ───────────────────────────────────────────

function MethodToggle({ value, onChange }) {
  return (
    <div style={{ display: 'flex', background: '#f1f2f4', borderRadius: 6, padding: 2, gap: 1 }}>
      {[['text', 'Texte'], ['vision', 'Vision']].map(([key, label]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          style={{
            padding: '3px 9px', borderRadius: 4, fontSize: 10, fontWeight: 600,
            background: value === key ? 'white' : 'transparent',
            boxShadow: value === key ? '0 1px 3px rgba(0,0,0,.10)' : 'none',
            color: value === key ? INK : MUTED,
            border: 'none', cursor: 'pointer', transition: 'all .12s',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── Metric row ───────────────────────────────────────────────────────────────

function MetricRow({ elementId, metricId, label, isDone, isAwaiting, onActivate, onCancel }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0',
      borderBottom: '1px solid #f5f5f6',
      boxShadow: isAwaiting ? `inset 3px 0 0 ${INDIGO}` : 'none',
      paddingLeft: isAwaiting ? 8 : 0,
      background: isAwaiting ? 'rgba(81,81,205,0.03)' : 'transparent',
      transition: 'all .12s',
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
        background: isDone ? '#22c55e' : isAwaiting ? INDIGO : '#e5e7eb',
        transition: 'background .2s',
      }} />
      <span style={{ flex: 1, fontSize: 11.5, color: isDone ? '#374151' : isAwaiting ? INDIGO : '#6b7280', fontWeight: isAwaiting || isDone ? 500 : 400 }}>
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

// ─── Vision results review ────────────────────────────────────────────────────

function VisionReview({ elementLabel, items, isDone, onAccept, onDiscard, onRemoveItem, onAddItem }) {
  const [adding,   setAdding]   = useState(false);
  const [newLabel, setNewLabel] = useState('');

  const confirmAdd = () => {
    const l = newLabel.trim();
    if (!l) { setAdding(false); setNewLabel(''); return; }
    onAddItem?.({ id: `manual_${Date.now()}`, label: l });
    setNewLabel('');
    setAdding(false);
  };

  return (
    <div style={{ border: '1px solid #eef0f3', borderRadius: 8, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 10px',
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

      {/* Item list */}
      <div style={{ padding: '2px 10px', maxHeight: 180, overflowY: 'auto' }}>
        {items.map((item, i) => (
          <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid #f5f5f6' }}>
            <span style={{ width: 18, height: 18, borderRadius: 4, background: 'rgba(81,81,205,0.1)', color: INDIGO, fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
            <span style={{ flex: 1, fontSize: 11.5, color: '#374151' }}>{item.label}</span>
            {item.width && <span style={{ fontSize: 11, color: '#6b7280', fontFamily: 'ui-monospace,monospace' }}>{item.width}</span>}
            {!isDone && (
              <button
                onClick={() => onRemoveItem?.(item.id)}
                style={{ width: 16, height: 16, borderRadius: 3, border: '1px solid #e5e7eb', background: '#f9fafb', color: '#9ca3af', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, lineHeight: 1 }}
                title="Retirer"
              >×</button>
            )}
          </div>
        ))}

        {/* Add manually */}
        {!isDone && (
          <div style={{ padding: '6px 0', borderTop: items.length ? '1px solid #f5f5f6' : 'none', marginTop: 2 }}>
            {adding ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <input
                  autoFocus
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') confirmAdd(); if (e.key === 'Escape') { setAdding(false); setNewLabel(''); } }}
                  placeholder="Nom de l'élément…"
                  style={{ flex: 1, padding: '3px 7px', fontSize: 11, border: `1px solid ${INDIGO}`, borderRadius: 5, outline: 'none', color: INK }}
                />
                <button onClick={confirmAdd} style={{ width: 18, height: 18, borderRadius: 4, background: INDIGO, color: 'white', border: 'none', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</button>
                <button onClick={() => { setAdding(false); setNewLabel(''); }} style={{ width: 18, height: 18, borderRadius: 4, background: '#f1f2f4', color: '#636464', border: 'none', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
              </div>
            ) : (
              <button
                onClick={() => setAdding(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: MUTED, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <span style={{ width: 14, height: 14, borderRadius: 3, border: '1px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>+</span>
                Ajouter manuellement
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Element section ──────────────────────────────────────────────────────────

function ElementSection({ element, effectiveMethod, smartFilled, awaitingSmartSelect,
  onSmartSelect, onCancelSelect, onMethodChange,
  visionState, visionResultItems, onLaunchVision, onAcceptVision, onDiscardVision,
  onVisionRemoveItem, onVisionAddItem,
  activeElementType, onElementTypeSelect }) {
  const isActive = activeElementType === element.id;

  const activeMetrics  = Object.entries(element.metrics || {}).filter(([, v]) => v).map(([k]) => k);
  const customMetrics  = (element.customMetrics ?? []);
  const isText   = effectiveMethod === 'text';
  const isVision = effectiveMethod === 'vision';
  const visionRunning = visionState === 'running';
  const visionReview  = visionState === 'review';
  const visionDone    = visionState === 'done';

  const allTextMetricIds = [...activeMetrics, ...customMetrics.map(m => m.id)];
  const doneCount = isText
    ? allTextMetricIds.filter(m => smartFilled[`${element.id}.${m}`]).length
    : (visionDone ? 1 : 0);
  const totalCount = isText ? allTextMetricIds.length : 1;

  return (
    <div style={{
      paddingBottom: 18,
      borderBottom: '1px solid #f1f2f4',
      marginBottom: 16,
      borderLeft: isActive ? `2px solid ${INDIGO}` : '2px solid transparent',
      paddingLeft: isActive ? 8 : 0,
      transition: 'border-color 0.15s, padding-left 0.15s',
    }}>
      {/* Header — clickable to focus element type on plan */}
      <div
        onClick={() => onElementTypeSelect?.(element.id)}
        style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap',
          cursor: 'pointer',
          background: isActive ? 'rgba(81,81,205,0.04)' : 'transparent',
          borderRadius: 5,
          padding: '3px 6px 3px 4px',
          margin: '-3px -6px 6px -4px',
          transition: 'background 0.15s',
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: isActive ? INDIGO : INK, transition: 'color 0.15s' }}>{element.label}</span>
        {element.visionCapable && (
          <MethodToggle value={effectiveMethod} onChange={(m) => onMethodChange(element.id, m)} />
        )}
        {!element.visionCapable && (
          <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: 'rgba(81,81,205,0.08)', color: INDIGO, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Texte
          </span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 10, color: doneCount === totalCount && totalCount > 0 ? '#22c55e' : MUTED, fontWeight: 500 }}>
          {doneCount}/{totalCount}
        </span>
      </div>

      {/* Rules */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
        {(element.rules || []).filter(r => r.active).map(rule => (
          <span key={rule.id} style={{ fontSize: 10, color: '#6b7280', background: '#f4f5f7', border: '1px solid #eef0f3', borderRadius: 4, padding: '2px 6px', lineHeight: 1.4 }}>
            {rule.label}
          </span>
        ))}
      </div>

      {/* Text: preset metric rows */}
      {isText && activeMetrics.map(metricId => {
        const isAwaiting = awaitingSmartSelect?.type === 'metric' && awaitingSmartSelect?.elementId === element.id && awaitingSmartSelect?.metricId === metricId;
        return (
          <MetricRow
            key={metricId}
            elementId={element.id}
            metricId={metricId}
            label={METRIC_MAP[metricId] ?? metricId}
            isDone={!!smartFilled[`${element.id}.${metricId}`]}
            isAwaiting={isAwaiting}
            onActivate={() => onSmartSelect(element.id, metricId)}
            onCancel={onCancelSelect}
          />
        );
      })}
      {/* Text: custom metric rows */}
      {isText && customMetrics.map(cm => {
        const isAwaiting = awaitingSmartSelect?.type === 'metric' && awaitingSmartSelect?.elementId === element.id && awaitingSmartSelect?.metricId === cm.id;
        return (
          <MetricRow
            key={cm.id}
            elementId={element.id}
            metricId={cm.id}
            label={cm.label}
            isDone={!!smartFilled[`${element.id}.${cm.id}`]}
            isAwaiting={isAwaiting}
            onActivate={() => onSmartSelect(element.id, cm.id)}
            onCancel={onCancelSelect}
          />
        );
      })}

      {/* Vision: detect button or results */}
      {isVision && !visionRunning && !visionReview && !visionDone && (
        <button onClick={() => onLaunchVision(element.id)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          width: '100%', padding: '8px 12px',
          background: '#f9fafb', border: '1px dashed #d1d5db',
          borderRadius: 8, cursor: 'pointer', fontSize: 11.5, color: '#374151', fontWeight: 500,
        }}>
          <ScanIcon /> Détecter avec la vision
        </button>
      )}
      {isVision && visionRunning && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <div style={{ display: 'flex', gap: 3 }}>
            {[0, 1, 2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: INDIGO, animation: `dot-bounce 1.2s ease-in-out ${i * 0.18}s infinite` }} />)}
          </div>
          <span style={{ fontSize: 11, color: '#6b7280' }}>Analyse en cours…</span>
        </div>
      )}
      {isVision && (visionReview || visionDone) && visionResultItems && (
        <VisionReview
          elementLabel={element.label}
          items={visionResultItems}
          isDone={visionDone}
          onAccept={() => onAcceptVision(element.id)}
          onDiscard={() => onDiscardVision(element.id)}
          onRemoveItem={(itemId) => onVisionRemoveItem?.(element.id, itemId)}
          onAddItem={(item) => onVisionAddItem?.(element.id, item)}
        />
      )}
    </div>
  );
}

// ─── New group form ───────────────────────────────────────────────────────────

function NewGroupForm({ onConfirm, onCancel }) {
  const [label, setLabel]         = useState('');
  const [method, setMethod]       = useState('text');
  const [metrics, setMetrics]     = useState({});
  const [customMetrics, setCustomMetrics] = useState([]); // [{ id, label }]
  const [addingCustom, setAddingCustom]   = useState(false);
  const [customLabel, setCustomLabel]     = useState('');

  const toggleMetric = (id) => setMetrics(p => ({ ...p, [id]: !p[id] }));

  const confirmCustomMetric = () => {
    const l = customLabel.trim();
    if (l) setCustomMetrics(prev => [...prev, { id: `cm_${Date.now()}`, label: l }]);
    setCustomLabel('');
    setAddingCustom(false);
  };

  const anyMetric = Object.values(metrics).some(Boolean) || customMetrics.length > 0;
  const canConfirm = label.trim() && anyMetric;

  // Preset metrics (exclude count)
  const displayMetrics = METRIC_LABELS.filter(m => m.id !== 'count');

  return (
    <div style={{ border: '1px solid rgba(81,81,205,0.2)', borderRadius: 10, padding: 12, background: 'rgba(81,81,205,0.02)', marginTop: 4 }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Nouveau groupe</p>

      {/* Name */}
      <input
        autoFocus
        value={label}
        onChange={e => setLabel(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && canConfirm) onConfirm({ label: label.trim(), method, metrics, customMetrics }); if (e.key === 'Escape') onCancel(); }}
        placeholder="Nom du groupe…"
        style={{ width: '100%', padding: '6px 8px', fontSize: 11.5, border: `1px solid ${INDIGO}`, borderRadius: 6, outline: 'none', marginBottom: 10, boxSizing: 'border-box', color: INK }}
      />

      {/* Method */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 10, color: MUTED, fontWeight: 500, flexShrink: 0 }}>Méthode</span>
        <MethodToggle value={method} onChange={setMethod} />
      </div>

      {/* Metrics */}
      <p style={{ fontSize: 10, color: MUTED, fontWeight: 500, marginBottom: 6 }}>Métriques à extraire</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: method === 'text' ? 6 : 12 }}>
        {displayMetrics.map(m => {
          const active = !!metrics[m.id];
          return (
            <button key={m.id} onClick={() => toggleMetric(m.id)} style={{
              fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 5,
              background: active ? 'rgba(81,81,205,0.1)' : '#f4f5f7',
              color: active ? INDIGO : '#6b7280',
              border: `1px solid ${active ? 'rgba(81,81,205,0.25)' : '#eef0f3'}`,
              cursor: 'pointer',
            }}>
              {active ? '✓ ' : '+ '}{m.label}
            </button>
          );
        })}

        {/* Custom metrics — text method only */}
        {method === 'text' && customMetrics.map(cm => (
          <span
            key={cm.id}
            style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 5, color: INDIGO, background: 'rgba(81,81,205,0.1)', border: '1px solid rgba(81,81,205,0.25)' }}
          >
            ✓ {cm.label}
            <button
              onClick={() => setCustomMetrics(prev => prev.filter(m => m.id !== cm.id))}
              style={{ fontSize: 11, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1, padding: 0 }}
            >×</button>
          </span>
        ))}

        {/* Add custom metric */}
        {method === 'text' && (
          addingCustom ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <input
                autoFocus
                value={customLabel}
                onChange={e => setCustomLabel(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') confirmCustomMetric(); if (e.key === 'Escape') { setAddingCustom(false); setCustomLabel(''); } }}
                placeholder="Nom…"
                style={{ width: 80, padding: '2px 5px', fontSize: 10, border: `1px solid ${INDIGO}`, borderRadius: 4, outline: 'none', color: INK }}
              />
              <button onClick={confirmCustomMetric} style={{ fontSize: 10, color: 'white', background: INDIGO, border: 'none', borderRadius: 3, padding: '2px 5px', cursor: 'pointer' }}>✓</button>
              <button onClick={() => { setAddingCustom(false); setCustomLabel(''); }} style={{ fontSize: 11, color: MUTED, background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
            </span>
          ) : (
            <button
              onClick={() => setAddingCustom(true)}
              style={{ fontSize: 10, fontWeight: 500, padding: '3px 8px', borderRadius: 5, color: INDIGO, background: 'transparent', border: '1px dashed rgba(81,81,205,0.3)', cursor: 'pointer' }}
            >+ Custom</button>
          )
        )}
      </div>
      {method === 'text' && <div style={{ marginBottom: 6 }} />}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button
          onClick={() => canConfirm && onConfirm({ label: label.trim(), method, metrics, customMetrics })}
          disabled={!canConfirm}
          style={{ flex: 1, padding: '6px 0', borderRadius: 6, fontSize: 11, fontWeight: 600, background: canConfirm ? INDIGO : '#e5e7eb', color: canConfirm ? 'white' : MUTED, border: 'none', cursor: canConfirm ? 'pointer' : 'default' }}
        >Créer le groupe</button>
        <button onClick={onCancel} style={{ padding: '6px 10px', borderRadius: 6, fontSize: 11, background: '#f4f5f7', color: '#6b7280', border: 'none', cursor: 'pointer' }}>Annuler</button>
      </div>
    </div>
  );
}

// ─── Progress header ──────────────────────────────────────────────────────────

function ProgressHeader({ done, total }) {
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  return (
    <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid #f1f2f4', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: INK }}>Identifier les éléments</span>
        <span style={{ fontSize: 11, color: pct === 100 ? '#22c55e' : MUTED, fontWeight: 500 }}>{done}/{total}</span>
      </div>
      <div style={{ height: 3, background: '#f1f2f4', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 2, background: pct === 100 ? '#22c55e' : INDIGO, width: `${pct}%`, transition: 'width .3s ease' }} />
      </div>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export default function ExtractionPanel({
  elements, smartFilled, onSmartSelect, awaitingSmartSelect,
  visionStates, visionResults,
  onLaunchVision, onAcceptVision, onDiscardVision,
  onVisionRemoveItem, onVisionAddItem,
  methodOverrides, onMethodChange,
  extraRows, onAddElement, activeApt, onInstanceClick,
  extraGroups, onAddGroup,
  cellValues, onCellSelect,
  parentAssignments, onParentAssign,
  extractionDone,
  activeElementType, onElementTypeSelect,
}) {
  const [showGrouping, setShowGrouping] = useState(false);
  const [showNewGroupForm, setShowNewGroupForm] = useState(false);

  const inScopeElements = (elements ?? []).filter(e => e.inScope);

  const getEffectiveMethod = (el) => methodOverrides[el.id] ?? el.method ?? 'text';

  // When all done, show results table (or grouping panel)
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

    const fakeTaskStates = { ext_logements: 'done', ext_portes: 'done', ext_stationnement: 'done' };
    return (
      <ExtractionResultTable
        elements={elements}
        taskStates={fakeTaskStates}
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

  // Compute overall progress
  let totalSteps = 0, doneSteps = 0;
  inScopeElements.forEach(el => {
    const method = getEffectiveMethod(el);
    if (method === 'text') {
      const active = Object.entries(el.metrics || {}).filter(([, v]) => v);
      totalSteps += active.length;
      doneSteps  += active.filter(([k]) => smartFilled[`${el.id}.${k}`]).length;
    } else {
      totalSteps += 1;
      if (visionStates[`vision_${el.id}`] === 'done') doneSteps += 1;
    }
  });
  // Extra groups count towards progress too
  (extraGroups ?? []).forEach(g => {
    const method = methodOverrides[g.id] ?? g.method ?? 'text';
    const active = Object.entries(g.metrics || {}).filter(([, v]) => v);
    if (method === 'text') {
      totalSteps += active.length;
      doneSteps  += active.filter(([k]) => smartFilled[`${g.id}.${k}`]).length;
    } else {
      totalSteps += 1;
      if (visionStates[`vision_${g.id}`] === 'done') doneSteps += 1;
    }
  });

  const handleConfirmNewGroup = ({ label, method, metrics, customMetrics }) => {
    const id = `group_${Date.now()}`;
    onAddGroup(id, label, method, metrics, customMetrics ?? []);
    setShowNewGroupForm(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'white', borderLeft: '1px solid #f1f2f4' }}>
      <ProgressHeader done={doneSteps} total={totalSteps} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 8px' }}>
        {/* Built-in elements */}
        {inScopeElements.map(el => (
          <ElementSection
            key={el.id}
            element={el}
            effectiveMethod={getEffectiveMethod(el)}
            smartFilled={smartFilled}
            awaitingSmartSelect={awaitingSmartSelect}
            onSmartSelect={onSmartSelect}
            onCancelSelect={() => onSmartSelect(null, null)}
            onMethodChange={onMethodChange}
            visionState={visionStates[`vision_${el.id}`]}
            visionResultItems={visionResults[el.id]}
            onLaunchVision={onLaunchVision}
            onAcceptVision={onAcceptVision}
            onDiscardVision={onDiscardVision}
            onVisionRemoveItem={onVisionRemoveItem}
            onVisionAddItem={onVisionAddItem}
            activeElementType={activeElementType}
            onElementTypeSelect={onElementTypeSelect}
          />
        ))}

        {/* Extra groups */}
        {(extraGroups ?? []).map(g => (
          <ElementSection
            key={g.id}
            element={{ ...g, visionCapable: true, rules: [] }}
            effectiveMethod={methodOverrides[g.id] ?? g.method ?? 'text'}
            smartFilled={smartFilled}
            awaitingSmartSelect={awaitingSmartSelect}
            onSmartSelect={onSmartSelect}
            onCancelSelect={() => onSmartSelect(null, null)}
            onMethodChange={onMethodChange}
            visionState={visionStates[`vision_${g.id}`]}
            visionResultItems={visionResults[g.id]}
            onLaunchVision={onLaunchVision}
            onAcceptVision={onAcceptVision}
            onDiscardVision={onDiscardVision}
            onVisionRemoveItem={onVisionRemoveItem}
            onVisionAddItem={onVisionAddItem}
            activeElementType={activeElementType}
            onElementTypeSelect={onElementTypeSelect}
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
