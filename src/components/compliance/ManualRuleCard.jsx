function StatusChip({ status }) {
  const map = {
    not_automated:  'bg-gray-100 text-gray-500',
    conforme:       'bg-green-100 text-green-700',
    non_conforme:   'bg-red-100 text-red-700',
  };
  const labels = {
    not_automated:  '⚙ Non automatisé',
    conforme:       'Conforme',
    non_conforme:   'Non-conforme',
  };
  const s = status || 'not_automated';
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium ${map[s]}`}>
      {labels[s]}
    </span>
  );
}

export default function ManualRuleCard({
  rule, expanded, onToggle,
  ruleState, onAction, note, onNote,
  aiToggle,
}) {
  const displayStatus = ruleState || 'not_automated';

  return (
    <div className="border-b border-gray-100 last:border-0">
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <span className="text-gray-400 text-sm flex-shrink-0">⚙</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900 truncate">{rule.name}</div>
          <div className="text-xs text-gray-400 mt-0.5">Vérification manuelle requise</div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {aiToggle}
          <StatusChip status={displayStatus} />
          <span className="text-gray-300 text-xs">{expanded ? '▲' : '▾'}</span>
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 border-t border-gray-100 pt-3">
          <p className="text-xs text-gray-600 leading-relaxed mb-2">
            {rule.description || 'À vérifier visuellement sur le plan.'}
          </p>
          {rule.code && (
            <div className="text-xs text-gray-400 font-mono mb-3">Code: {rule.code}</div>
          )}
          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">Note (optionnel)</div>
            <input
              type="text"
              value={note || ''}
              onChange={e => onNote(e.target.value)}
              placeholder="Ajouter une note…"
              className="w-full text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onAction(ruleState === 'conforme' ? null : 'conforme')}
              className={`flex-1 text-xs py-1.5 rounded border font-medium transition-colors ${
                ruleState === 'conforme'
                  ? 'bg-green-500 text-white border-green-500'
                  : 'border-green-300 text-green-600 hover:bg-green-50'
              }`}
            >
              ✓ Conforme
            </button>
            <button
              onClick={() => onAction(ruleState === 'non_conforme' ? null : 'non_conforme')}
              className={`flex-1 text-xs py-1.5 rounded border font-medium transition-colors ${
                ruleState === 'non_conforme'
                  ? 'bg-red-500 text-white border-red-500'
                  : 'border-red-300 text-red-600 hover:bg-red-50'
              }`}
            >
              ✕ Non-conforme
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
