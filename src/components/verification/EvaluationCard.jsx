import { trackMeta } from '../../data/evaluations';

const STATUS = {
  pass:        { label: 'Conforme',     bg: '#f0fdf4', text: '#15803d', dot: '#22c55e', border: '#bbf7d0' },
  fail:        { label: 'Non conforme', bg: '#fff1f2', text: '#be123c', dot: '#f43f5e', border: '#fecdd3' },
  review:      { label: 'À vérifier',   bg: '#fffbeb', text: '#92400e', dot: '#f59e0b', border: '#fde68a' },
  disregarded: { label: 'Ignoré',       bg: '#f4f5f7', text: '#9ca3af', dot: '#d1d5db', border: '#e5e7eb' },
};

export default function EvaluationCard({ evaluation, isActive, onActivate, onElementClick, isDisregarded, onDisregard, onReactivate, aptHighlight }) {
  const { ruleCode, ruleName, track, status, observation, nonCompliantElements } = evaluation;
  const tm = trackMeta(track);
  const st = STATUS[isDisregarded ? 'disregarded' : status] ?? STATUS.review;

  return (
    <div
      className="w-full text-left rounded-xl transition-all duration-150"
      style={{
        border: isActive && !isDisregarded
          ? '1.5px solid #5151cd'
          : aptHighlight && !isDisregarded
            ? '1.5px solid #f87171'
            : '1px solid #eef0f3',
        background: isDisregarded ? '#fafafa'
          : isActive ? '#fafaff'
          : aptHighlight ? '#fff8f8'
          : 'white',
        padding: '12px 14px',
        boxShadow: isActive && !isDisregarded
          ? '0 0 0 3px rgba(81,81,205,.1), 0 1px 4px rgba(0,0,0,.06)'
          : aptHighlight && !isDisregarded
            ? '0 0 0 3px rgba(248,113,113,.12), 0 1px 4px rgba(0,0,0,.06)'
            : '0 1px 3px rgba(0,0,0,.05)',
        opacity: isDisregarded ? 0.6 : 1,
        transition: 'all .2s',
      }}
    >
      {/* Header row */}
      <button onClick={onActivate} className="w-full text-left" style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span
              className="text-[9px] font-bold tracking-widest px-1.5 py-0.5 rounded flex-shrink-0"
              style={{ background: tm.color, color: tm.text, letterSpacing: '0.08em' }}
            >
              {track}
            </span>
            <span className="text-[10px] text-gray-400 font-mono flex-shrink-0">{ruleCode}</span>
            <span className="text-xs font-semibold leading-tight" style={{ color: isDisregarded ? '#9ca3af' : '#1f2937', textDecoration: isDisregarded ? 'line-through' : 'none' }}>{ruleName}</span>
          </div>
          <span
            className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1.5"
            style={{ background: st.bg, color: st.text, border: `1px solid ${st.border}` }}
          >
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: st.dot }} />
            {st.label}
          </span>
        </div>

        {/* Observation */}
        {!isDisregarded && <p className="text-xs text-gray-500 leading-relaxed mb-2.5 text-left">{observation}</p>}
      </button>

      {/* Non-compliant elements */}
      {!isDisregarded && nonCompliantElements.length > 0 && (
        <div className="flex flex-col gap-1 mb-2.5">
          {nonCompliantElements.map(el => (
            <button
              key={el.id}
              onClick={e => { e.stopPropagation(); onElementClick?.(el.id); }}
              className="text-left w-full transition-colors hover:brightness-95"
              style={{
                borderLeft: '2px solid #f87171',
                background: '#fffafa',
                color: '#991b1b',
                fontSize: 11,
                padding: '5px 10px',
                borderRadius: '0 6px 6px 0',
                lineHeight: 1.4,
              }}
            >
              {el.detail}
            </button>
          ))}
        </div>
      )}

      {/* Disregard / reactivate action */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: isDisregarded ? 0 : 2 }}>
        {isDisregarded ? (
          <button
            onClick={e => { e.stopPropagation(); onReactivate?.(); }}
            style={{ fontSize: 10, color: '#6b7280', background: 'none', border: '1px solid #e5e7eb', borderRadius: 5, padding: '2px 8px', cursor: 'pointer' }}
          >
            Réactiver
          </button>
        ) : (
          <button
            onClick={e => { e.stopPropagation(); onDisregard?.(); }}
            style={{ fontSize: 10, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0' }}
          >
            Ignorer cette évaluation
          </button>
        )}
      </div>
    </div>
  );
}
