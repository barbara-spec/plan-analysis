import { useState, useRef, useEffect } from 'react';
import { RESULT_COLS, EXTRACTION_RESULTS, ELEMENT_TASK_MAP } from '../../data/extractionResults';

const INDIGO = '#5151cd';
const ROW_BORDER = '1px solid #f5f5f6';

function parseNum(str) {
  if (str == null) return NaN;
  return parseFloat(str);
}

function checkFilter(filter, rawValue) {
  if (!filter) return null;
  const num = parseNum(rawValue);
  if (isNaN(num)) return null;
  if (filter.op === '>'  && num <= filter.value) return 'fail';
  if (filter.op === '<'  && num >= filter.value) return 'fail';
  if (filter.op === '≥'  && num <  filter.value) return 'fail';
  if (filter.op === '≤'  && num >  filter.value) return 'fail';
  return 'pass';
}

const CUSTOM_MOCKS = ['124 cm', '97 cm', '110 cm', '116 cm', '102 cm', '108 cm', '119 cm'];
function customMockValue(rowIdx) { return CUSTOM_MOCKS[rowIdx % CUSTOM_MOCKS.length]; }

function FilterIcon({ active }) {
  return (
    <svg width="10" height="10" viewBox="0 0 12 12" fill="none"
      stroke={active ? INDIGO : '#b0b2b8'} strokeWidth="1.4"
      strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 2.5h10M3 6h6M5 9.5h2"/>
    </svg>
  );
}

function SmartSelectIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 14 14" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5.5" cy="5.5" r="4"/>
      <path d="M9 9l3.5 3.5"/>
      <path d="M5.5 3.5v4M3.5 5.5h4" strokeWidth="1.4"/>
    </svg>
  );
}

function FilterPopover({ filter, onApply, onClear, onClose }) {
  const [op, setOp]       = useState(filter?.op ?? '>');
  const [value, setValue] = useState(filter?.value != null ? String(filter.value) : '');
  const ref = useRef();

  useEffect(() => {
    function onDown(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [onClose]);

  const parsedVal = parseFloat(value);
  const canApply  = !isNaN(parsedVal);

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 100,
      background: 'white', border: '1px solid #eef0f3', borderRadius: 10,
      padding: '10px 10px 8px', minWidth: 164,
      boxShadow: '0 8px 24px rgba(0,0,0,.10), 0 1px 4px rgba(0,0,0,.06)',
    }}>
      <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 7, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Seuil</div>
      <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
        {['>', '<', '≥', '≤'].map(o => (
          <button key={o} onClick={() => setOp(o)} style={{
            flex: 1, padding: '4px 0', borderRadius: 5, fontSize: 12, fontWeight: 700,
            background: op === o ? INDIGO : '#f4f5f7',
            color: op === o ? 'white' : '#636464',
            border: op === o ? 'none' : '1px solid #eef0f3',
            cursor: 'pointer',
            transition: 'all .12s',
          }}>{o}</button>
        ))}
      </div>
      <input
        type="number"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Valeur…"
        style={{
          width: '100%', padding: '5px 8px', fontSize: 11,
          border: '1px solid #e5e7eb', borderRadius: 6, outline: 'none',
          marginBottom: 8, boxSizing: 'border-box', color: '#111827',
        }}
      />
      <div style={{ display: 'flex', gap: 5 }}>
        <button
          onClick={() => { if (canApply) { onApply({ op, value: parsedVal }); onClose(); } }}
          disabled={!canApply}
          style={{
            flex: 1, padding: '5px 0', borderRadius: 6, fontSize: 11, fontWeight: 600,
            background: canApply ? INDIGO : '#e5e7eb',
            color: canApply ? 'white' : '#9ca3af',
            border: 'none', cursor: canApply ? 'pointer' : 'default',
          }}
        >Appliquer</button>
        {filter && (
          <button onClick={() => { onClear(); onClose(); }} style={{
            padding: '5px 10px', borderRadius: 6, fontSize: 11,
            background: '#f4f5f7', color: '#636464', border: 'none', cursor: 'pointer',
          }}>Effacer</button>
        )}
      </div>
    </div>
  );
}

function ActionButton({ children, onClick, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center gap-1 transition-all hover:opacity-90"
      style={{
        background: 'rgba(81,81,205,0.07)',
        color: INDIGO,
        border: '1px solid rgba(81,81,205,0.18)',
        borderRadius: 5,
        padding: '2px 7px',
        fontSize: 10,
        fontWeight: 500,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </button>
  );
}

function ParentCellContent({ cellKey, cellValues, onCellSelect, elementId, instId, isAwaiting }) {
  const filled = cellValues?.[cellKey] ?? null;
  if (isAwaiting) {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 10, color: INDIGO, fontStyle: 'italic' }}>Cliquez plan</span>
        <button onClick={e => { e.stopPropagation(); onCellSelect?.(null, null, null); }}
          style={{ fontSize: 10, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
      </span>
    );
  }
  if (filled) {
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 11.5, color: '#374151', fontFamily: 'ui-monospace,monospace' }}>{filled}</span>
        <button onClick={e => { e.stopPropagation(); onCellSelect?.(elementId, instId, '__parent__'); }}
          style={{ fontSize: 10, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}>↺</button>
      </span>
    );
  }
  return (
    <button
      onClick={e => { e.stopPropagation(); onCellSelect?.(elementId, instId, '__parent__'); }}
      style={{
        display: 'flex', alignItems: 'center', gap: 3,
        fontSize: 10, color: INDIGO, fontWeight: 500,
        background: 'rgba(81,81,205,0.07)', border: '1px solid rgba(81,81,205,0.18)',
        borderRadius: 5, padding: '2px 6px', cursor: 'pointer',
      }}
    >
      <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1.5 1.5l3 7.5 1.5-3 3-1.5L1.5 1.5z"/></svg>
      Sélect.
    </button>
  );
}

function SectionTable({ elementId, instances, activeMetrics, smartFilled, onSmartSelect, extraRows, onAddElement, activeApt, onInstanceClick, cellValues, onCellSelect, awaitingSmartSelect, parentCol, childLabels }) {
  const [filters,    setFilters]    = useState({});
  const [openFilter, setOpenFilter] = useState(null);
  const [extraCols, setExtraCols]   = useState([]);
  const [isAdding,  setIsAdding]    = useState(false);
  const [newLabel,  setNewLabel]    = useState('');
  const newLabelRef = useRef();
  const activeRowRef = useRef(null);

  // Scroll active row into view when activeApt changes
  useEffect(() => {
    if (activeRowRef.current) {
      activeRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeApt]);

  useEffect(() => {
    if (isAdding) newLabelRef.current?.focus();
  }, [isAdding]);

  const confirmAdd = () => {
    const label = newLabel.trim();
    if (!label) { setIsAdding(false); return; }
    setExtraCols(prev => [...prev, { id: `custom_${elementId}_${Date.now()}`, label }]);
    setNewLabel('');
    setIsAdding(false);
  };

  const allInstances = [...instances, ...(extraRows ?? [])];

  // Only show a column if the user asked for it (inScope) or any instance has data for it
  const visibleCols = [...RESULT_COLS, ...extraCols].filter(col => {
    if (col.id.startsWith('custom_')) return true;
    const hasData = allInstances.some(inst => inst[col.id] != null);
    return !!activeMetrics?.[col.id] || hasData;
  });

  // Column needs smart-select when: in scope but no data extracted yet and not smart-filled
  const needsSmartSelect = (col) => {
    if (col.id.startsWith('custom_')) return false;
    const hasData = allInstances.some(inst => inst[col.id] != null);
    const filled  = !!smartFilled?.[`${elementId}.${col.id}`];
    return !!activeMetrics?.[col.id] && !hasData && !filled;
  };

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="border-collapse" style={{ fontSize: 11, width: '100%' }}>
          <thead>
            <tr>
              <th className="text-left pb-2 pr-4 whitespace-nowrap"
                style={{ color: '#9ca3af', fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', minWidth: 90, borderBottom: '1px solid #eef0f3' }}>
                Label
              </th>
              {visibleCols.map(col => (
                <th key={col.id} className="text-left pb-2 pr-4 whitespace-nowrap"
                  style={{ color: '#9ca3af', fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', minWidth: 96, borderBottom: '1px solid #eef0f3', position: 'relative' }}>
                  <span className="flex items-center gap-1.5">
                    {col.label}
                    {needsSmartSelect(col) ? (
                      <ActionButton onClick={() => onSmartSelect?.(elementId, col.id)}>
                        <SmartSelectIcon /> Smart select
                      </ActionButton>
                    ) : (
                      <button
                        onClick={() => setOpenFilter(prev => prev === col.id ? null : col.id)}
                        className="flex items-center transition-opacity hover:opacity-70"
                        style={{ marginTop: 1 }}
                      >
                        <FilterIcon active={!!filters[col.id]} />
                      </button>
                    )}
                  </span>
                  {openFilter === col.id && (
                    <FilterPopover
                      filter={filters[col.id]}
                      onApply={f  => setFilters(prev => ({ ...prev, [col.id]: f }))}
                      onClear={()  => setFilters(prev => { const n = { ...prev }; delete n[col.id]; return n; })}
                      onClose={() => setOpenFilter(null)}
                    />
                  )}
                </th>
              ))}
              {/* Parent column header */}
              {parentCol && (
                <th className="text-left pb-2 pr-4 whitespace-nowrap"
                  style={{ borderBottom: '1px solid #eef0f3', minWidth: 96 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke={INDIGO} strokeWidth="1.5" strokeLinecap="round">
                      <circle cx="6" cy="2.5" r="1.5"/><circle cx="6" cy="9.5" r="1.5"/>
                      <path d="M6 4v2.5M4 7l2 2.5 2-2.5" strokeWidth="1.3"/>
                    </svg>
                    <span style={{ fontSize: 10, fontWeight: 600, color: INDIGO, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {parentCol.label}
                    </span>
                  </span>
                </th>
              )}
              <th className="pb-2 pl-1 whitespace-nowrap" style={{ borderBottom: '1px solid #eef0f3', position: 'relative' }}>
                {isAdding ? (
                  <span className="flex items-center gap-1">
                    <input
                      ref={newLabelRef}
                      value={newLabel}
                      onChange={e => setNewLabel(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') confirmAdd(); if (e.key === 'Escape') { setIsAdding(false); setNewLabel(''); } }}
                      placeholder="Nom…"
                      style={{ width: 100, padding: '2px 6px', fontSize: 10, border: `1px solid ${INDIGO}`, borderRadius: 4, outline: 'none' }}
                    />
                    <button onClick={confirmAdd} style={{ width: 18, height: 18, borderRadius: 4, background: INDIGO, color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>✓</button>
                    <button onClick={() => { setIsAdding(false); setNewLabel(''); }} style={{ width: 18, height: 18, borderRadius: 4, background: '#f1f2f4', color: '#636464', border: 'none', cursor: 'pointer', fontSize: 13, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                  </span>
                ) : (
                  <button
                    onClick={() => setIsAdding(true)}
                    title="Add column"
                    className="flex items-center justify-center transition-opacity hover:opacity-70"
                    style={{ width: 20, height: 20, borderRadius: 5, border: '1px dashed #d1d5db', color: '#c4c6cc', fontSize: 14, cursor: 'pointer', background: 'transparent' }}
                  >+</button>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {allInstances.map((inst, rowIdx) => {
              const isActiveRow = inst.planRef && inst.planRef === activeApt;
              return (
                <tr key={inst.id}
                  ref={isActiveRow ? activeRowRef : null}
                  onClick={() => onInstanceClick?.(inst.id)}
                  className={inst.planRef ? 'hover:bg-gray-50/70' : ''}
                  style={{ cursor: inst.planRef ? 'pointer' : 'default', background: isActiveRow ? 'rgba(81,81,205,0.06)' : undefined, transition: 'background .1s' }}
                >
                  <td className="pr-4 whitespace-nowrap"
                    style={{
                      paddingTop: 7, paddingBottom: 7, borderBottom: ROW_BORDER,
                      color: isActiveRow ? INDIGO : '#1f2937',
                      fontWeight: isActiveRow ? 600 : 400,
                      fontSize: 11.5,
                      boxShadow: isActiveRow ? `inset 3px 0 0 ${INDIGO}` : 'none',
                      paddingLeft: isActiveRow ? 6 : 0,
                    }}>
                    {inst.label}
                  </td>
                  {visibleCols.map(col => {
                    const isExtra = col.id.startsWith('custom_');
                    const cellKey = `${elementId}.${inst.id}.${col.id}`;
                    const rawVal  = isExtra
                      ? (cellValues?.[cellKey] ?? null)
                      : (inst[col.id] ?? '—');
                    const failing = checkFilter(filters[col.id], rawVal) === 'fail';
                    const isAwaitingCell = awaitingSmartSelect?.type === 'cell' && awaitingSmartSelect?.elementId === elementId && awaitingSmartSelect?.instanceId === inst.id && awaitingSmartSelect?.colId === col.id;

                    if (isExtra && rawVal == null) {
                      // Empty custom cell — show fill affordance
                      return (
                        <td key={col.id} className="pr-4 whitespace-nowrap"
                          style={{ paddingTop: 7, paddingBottom: 7, borderBottom: ROW_BORDER }}>
                          {isAwaitingCell ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              <span style={{ fontSize: 10, color: INDIGO, fontStyle: 'italic' }}>Cliquez plan</span>
                              <button onClick={e => { e.stopPropagation(); onCellSelect?.(null, null, null); }} style={{ fontSize: 10, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                            </span>
                          ) : (
                            <button
                              onClick={e => { e.stopPropagation(); onCellSelect?.(elementId, inst.id, col.id); }}
                              style={{
                                display: 'flex', alignItems: 'center', gap: 3,
                                fontSize: 10, color: INDIGO, fontWeight: 500,
                                background: 'rgba(81,81,205,0.07)',
                                border: '1px solid rgba(81,81,205,0.18)',
                                borderRadius: 5, padding: '2px 6px', cursor: 'pointer',
                              }}
                            >
                              <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M1.5 1.5l3 7.5 1.5-3 3-1.5L1.5 1.5z"/></svg>
                              Sélect.
                            </button>
                          )}
                        </td>
                      );
                    }

                    return (
                      <td key={col.id} className="pr-4 whitespace-nowrap"
                        style={{
                          paddingTop: 7, paddingBottom: 7, borderBottom: ROW_BORDER, fontSize: 11.5,
                          background: failing ? 'rgba(239,68,68,0.05)' : 'transparent',
                          color: failing ? '#dc2626' : '#374151',
                          fontWeight: failing ? 600 : 400,
                          fontFamily: 'ui-monospace, monospace',
                        }}>
                        {rawVal}
                      </td>
                    );
                  })}
                  {/* Parent column cell */}
                  {parentCol && (
                    <td className="pr-4 whitespace-nowrap" style={{ paddingTop: 7, paddingBottom: 7, borderBottom: ROW_BORDER }}>
                      <ParentCellContent
                        cellKey={`${elementId}.${inst.id}.__parent__`}
                        cellValues={cellValues}
                        onCellSelect={onCellSelect}
                        elementId={elementId}
                        instId={inst.id}
                        isAwaiting={awaitingSmartSelect?.type === 'cell' && awaitingSmartSelect?.elementId === elementId && awaitingSmartSelect?.instanceId === inst.id && awaitingSmartSelect?.colId === '__parent__'}
                      />
                    </td>
                  )}
                  <td style={{ borderBottom: ROW_BORDER }} />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        onClick={() => onAddElement?.(elementId)}
        className="flex items-center gap-1.5 mt-2.5 transition-opacity hover:opacity-70"
        style={{ fontSize: 11, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
      >
        <span style={{ width: 16, height: 16, borderRadius: 4, border: '1px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>+</span>
        Add element
      </button>
    </div>
  );
}

function AddGroupButton({ onAddGroup }) {
  const [isAdding, setIsAdding] = useState(false);
  const [label, setLabel]       = useState('');
  const inputRef = useRef();

  useEffect(() => { if (isAdding) inputRef.current?.focus(); }, [isAdding]);

  const confirm = () => {
    const trimmed = label.trim();
    if (!trimmed) { setIsAdding(false); return; }
    const id = `group_${Date.now()}`;
    onAddGroup?.(id, trimmed, 'text', {});
    setLabel('');
    setIsAdding(false);
  };

  if (isAdding) {
    return (
      <div className="flex items-center gap-1.5 pt-1">
        <span style={{ width: 16, height: 16, borderRadius: 4, border: `1px dashed ${INDIGO}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0, color: INDIGO }}>+</span>
        <input
          ref={inputRef}
          value={label}
          onChange={e => setLabel(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') confirm(); if (e.key === 'Escape') { setIsAdding(false); setLabel(''); } }}
          placeholder="Nom du groupe…"
          style={{ width: 130, padding: '2px 6px', fontSize: 11, border: `1px solid ${INDIGO}`, borderRadius: 4, outline: 'none' }}
        />
        <button onClick={confirm} style={{ width: 18, height: 18, borderRadius: 4, background: INDIGO, color: 'white', border: 'none', cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✓</button>
        <button onClick={() => { setIsAdding(false); setLabel(''); }} style={{ width: 18, height: 18, borderRadius: 4, background: '#f1f2f4', color: '#636464', border: 'none', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsAdding(true)}
      className="flex items-center gap-1.5 pt-1 transition-opacity hover:opacity-70"
      style={{ fontSize: 11, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
    >
      <span style={{ width: 16, height: 16, borderRadius: 4, border: '1px dashed #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>+</span>
      Add element group
    </button>
  );
}

export default function ExtractionResultTable({
  elements, taskStates, smartFilled, onSmartSelect,
  extraRows, onAddElement, activeApt, onInstanceClick,
  extraGroups, onAddGroup,
  cellValues, onCellSelect, awaitingSmartSelect,
  parentAssignments,
  onShowGrouping,
}) {
  const sections = Object.entries(ELEMENT_TASK_MAP)
    .filter(([elId, taskId]) => taskStates[taskId] === 'done')
    .map(([elId, taskId]) => {
      const element   = elements.find(e => e.id === elId);
      const instances = EXTRACTION_RESULTS[elId] ?? [];
      return { elId, taskId, element, instances };
    })
    .filter(s => s.element?.inScope);

  if (sections.length === 0) return null;

  const totalExtracted = sections.reduce((s, sec) => s + sec.instances.length, 0);

  // All known element types (built-in + extra groups) for label lookup
  const allElementDefs = [...(elements ?? []), ...(extraGroups ?? [])];

  // Helper: given an elementId, return parent label if assigned
  const getParentCol = (elId) => {
    const parentId = parentAssignments?.[elId];
    if (!parentId) return null;
    const parentEl = allElementDefs.find(e => e.id === parentId);
    return parentEl ? { id: '__parent__', label: parentEl.label } : null;
  };

  // Helper: given an elementId, return labels of its direct children
  const getChildLabels = (elId) => {
    if (!parentAssignments) return [];
    return Object.entries(parentAssignments)
      .filter(([, pId]) => pId === elId)
      .map(([cId]) => allElementDefs.find(e => e.id === cId)?.label)
      .filter(Boolean);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white" style={{ borderLeft: '1px solid #f1f2f4' }}>
      {/* Header */}
      <div className="px-4 pt-3.5 pb-3 flex-shrink-0 flex items-center justify-between" style={{ borderBottom: '1px solid #f1f2f4' }}>
        <span className="text-sm font-semibold text-gray-900">Éléments extraits</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold" style={{ background: '#f1f2f4', color: '#636464' }}>{totalExtracted}</span>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pb-5 space-y-6 pt-4">
        {sections.map(({ elId, element, instances }) => {
          const parentCol  = getParentCol(elId);
          const childLabels = getChildLabels(elId);
          return (
          <div key={elId}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-gray-700">{element.label}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold" style={{ background: '#f4f5f7', color: '#6b7280' }}>
                {(instances.length + (extraRows?.[elId]?.length ?? 0))}
              </span>
              {childLabels.length > 0 && (
                <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 5px', borderRadius: 3, background: 'rgba(81,81,205,0.07)', color: INDIGO, letterSpacing: '0.04em' }}>
                  ↓ {childLabels.join(', ')}
                </span>
              )}
              {parentCol && (
                <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 5px', borderRadius: 3, background: 'rgba(81,81,205,0.07)', color: INDIGO, letterSpacing: '0.04em' }}>
                  ↑ {parentCol.label}
                </span>
              )}
            </div>
            <SectionTable
              elementId={elId}
              instances={instances}
              activeMetrics={element.metrics}
              smartFilled={smartFilled}
              onSmartSelect={onSmartSelect}
              extraRows={extraRows?.[elId]}
              onAddElement={onAddElement}
              activeApt={activeApt}
              onInstanceClick={onInstanceClick}
              cellValues={cellValues}
              onCellSelect={onCellSelect}
              awaitingSmartSelect={awaitingSmartSelect}
              parentCol={parentCol}
              childLabels={childLabels}
            />
          </div>
          );
        })}

        {(extraGroups ?? []).map(group => {
          const parentCol  = getParentCol(group.id);
          const childLabels = getChildLabels(group.id);
          return (
          <div key={group.id}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold text-gray-700">{group.label}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold" style={{ background: '#f4f5f7', color: '#6b7280' }}>
                {(extraRows?.[group.id] ?? []).length}
              </span>
              {childLabels.length > 0 && (
                <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 5px', borderRadius: 3, background: 'rgba(81,81,205,0.07)', color: INDIGO, letterSpacing: '0.04em' }}>
                  ↓ {childLabels.join(', ')}
                </span>
              )}
              {parentCol && (
                <span style={{ fontSize: 9, fontWeight: 600, padding: '1px 5px', borderRadius: 3, background: 'rgba(81,81,205,0.07)', color: INDIGO, letterSpacing: '0.04em' }}>
                  ↑ {parentCol.label}
                </span>
              )}
            </div>
            <SectionTable
              elementId={group.id}
              instances={[]}
              activeMetrics={group.metrics ?? {}}
              smartFilled={smartFilled}
              onSmartSelect={onSmartSelect}
              extraRows={extraRows?.[group.id]}
              onAddElement={onAddElement}
              activeApt={activeApt}
              onInstanceClick={onInstanceClick}
              cellValues={cellValues}
              onCellSelect={onCellSelect}
              awaitingSmartSelect={awaitingSmartSelect}
              parentCol={parentCol}
              childLabels={childLabels}
            />
          </div>
          );
        })}

        <div style={{ borderTop: '1px solid #f1f2f4', paddingTop: 14, marginTop: 2 }}>
          <AddGroupButton onAddGroup={onAddGroup} />
        </div>
      </div>

      {/* Footer: grouping CTA */}
      {onShowGrouping && (
        <div style={{ padding: '10px 16px', borderTop: '1px solid #f1f2f4', flexShrink: 0 }}>
          <button
            onClick={onShowGrouping}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              width: '100%', padding: '8px 0',
              background: 'white', color: '#374151',
              border: '1px solid #e5e7eb', borderRadius: 8,
              fontSize: 11.5, fontWeight: 500, cursor: 'pointer',
              transition: 'all .12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#5151cd'; e.currentTarget.style.color = '#5151cd'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.color = '#374151'; }}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <circle cx="7" cy="3" r="1.5"/><circle cx="3" cy="10" r="1.5"/><circle cx="11" cy="10" r="1.5"/>
              <path d="M7 4.5v2.5M7 7l-3 2M7 7l3 2"/>
            </svg>
            Définir la hiérarchie
          </button>
        </div>
      )}
    </div>
  );
}
