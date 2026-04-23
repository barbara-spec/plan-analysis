import EvaluationCard from './EvaluationCard';

const INDIGO = '#5151cd';

function SummaryBar({ evaluations }) {
  const active  = evaluations.filter(e => e.status !== 'disregarded');
  const fail    = active.filter(e => e.status === 'fail').length;
  const review  = active.filter(e => e.status === 'review').length;
  const pass    = active.filter(e => e.status === 'pass').length;
  const ignored = evaluations.length - active.length;
  return (
    <div className="flex items-center gap-5 px-4 py-2.5 flex-shrink-0"
      style={{ borderBottom: '1px solid #f1f2f4', background: '#fafafa' }}>
      {fail > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold" style={{ color: '#e11d48' }}>{fail}</span>
          <span className="text-xs text-gray-500">non conforme{fail > 1 ? 's' : ''}</span>
        </div>
      )}
      {review > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold" style={{ color: '#d97706' }}>{review}</span>
          <span className="text-xs text-gray-500">à vérifier</span>
        </div>
      )}
      {pass > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold" style={{ color: '#16a34a' }}>{pass}</span>
          <span className="text-xs text-gray-500">conforme{pass > 1 ? 's' : ''}</span>
        </div>
      )}
      {ignored > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-gray-400">{ignored}</span>
          <span className="text-xs text-gray-400">ignoré{ignored > 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
}

function LaunchIdle({ onLaunch }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-5 px-6 text-center">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
        style={{ background: 'rgba(81,81,205,0.07)', border: '1px solid rgba(81,81,205,0.12)' }}>
        <svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke={INDIGO} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="10" r="8"/>
          <path d="M10 6v4l3 3"/>
        </svg>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800 mb-1.5">Vérification IA</p>
        <p className="text-xs text-gray-400 leading-relaxed max-w-[200px] mx-auto">
          L'IA analyse les éléments extraits au regard des règles sélectionnées.
        </p>
      </div>
      <button
        onClick={onLaunch}
        className="px-5 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-85"
        style={{ background: INDIGO, color: 'white', letterSpacing: '-0.01em' }}
      >
        Lancer la vérification
      </button>
    </div>
  );
}

function LaunchRunning() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-3 px-6 text-center">
      <div className="flex gap-1.5">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{
              background: INDIGO,
              animation: `dot-bounce 1.2s ease-in-out ${i * 0.18}s infinite`,
            }}
          />
        ))}
      </div>
      <p className="text-xs text-gray-400 tracking-wide">Analyse en cours…</p>
    </div>
  );
}

export default function VerificationPanel({
  aiState, onLaunchAI,
  evaluations = [],
  ruleOverrides = {},
  onDisregard,
  onReactivate,
  activeEvalId, onSetActiveEvalId,
  activeApt,
  onElementClick,
}) {
  // Apply overrides: disregarded evals change their displayed status
  const displayEvaluations = evaluations.map(ev =>
    ruleOverrides[ev.id] === 'disregarded'
      ? { ...ev, status: 'disregarded' }
      : ev
  );

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white"
      style={{ borderLeft: '1px solid #f1f2f4' }}>

      {/* Panel header */}
      <div className="px-4 pt-3.5 pb-3 flex-shrink-0" style={{ borderBottom: '1px solid #f1f2f4' }}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">Vérification IA</span>
          {aiState === 'done' && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded-md font-semibold tracking-wide"
              style={{ background: '#f1f2f4', color: '#636464' }}
            >
              {evaluations.length} règles
            </span>
          )}
        </div>
      </div>

      {aiState === 'idle'    && <LaunchIdle onLaunch={onLaunchAI} />}
      {aiState === 'running' && <LaunchRunning />}

      {aiState === 'done' && (
        <>
          <SummaryBar evaluations={displayEvaluations} />
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {displayEvaluations.map(ev => (
              <EvaluationCard
                key={ev.id}
                evaluation={ev}
                isActive={activeEvalId === ev.id}
                onActivate={() => onSetActiveEvalId(prev => prev === ev.id ? null : ev.id)}
                onElementClick={onElementClick}
                isDisregarded={ev.status === 'disregarded'}
                onDisregard={() => onDisregard?.(ev.id)}
                onReactivate={() => onReactivate?.(ev.id)}
                aptHighlight={activeApt && ev.nonCompliantElements?.some(el => el.id === activeApt)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
