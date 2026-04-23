import { elementConfig } from '../../data/elements';
import ManualRuleCard from './ManualRuleCard';

function StatusChip({ status }) {
  const map = {
    validated:      'bg-green-100 text-green-700',
    to_review:      'bg-amber-100 text-amber-700',
    nc_auto:        'bg-red-100 text-red-700',
    confirmed_nc:   'bg-red-500 text-white',
    override:       'bg-amber-400 text-white',
    ignored:        'bg-gray-100 text-gray-500',
    not_evaluated:  'bg-gray-100 text-gray-500',
    conforme:       'bg-green-100 text-green-700',
    non_conforme:   'bg-red-100 text-red-700',
  };
  const labels = {
    validated:      'Validé',
    to_review:      'À réviser',
    nc_auto:        'Non-conforme',
    confirmed_nc:   'NC confirmé',
    override:       'Override',
    ignored:        'Ignoré',
    not_evaluated:  'Non évalué',
    conforme:       'Conforme',
    non_conforme:   'Non-conforme',
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap ${map[status] || 'bg-gray-100 text-gray-500'}`}>
      {labels[status] || status}
    </span>
  );
}

function ConfDot({ conf }) {
  const color = conf >= 90 ? 'bg-green-500' : conf >= 65 ? 'bg-amber-400' : 'bg-red-400';
  const text = conf >= 90 ? 'text-green-600' : conf >= 65 ? 'text-amber-600' : 'text-red-500';
  return (
    <div className="flex items-center gap-1">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      <span className={`text-xs font-mono font-medium ${text}`}>{conf}%</span>
    </div>
  );
}

function ConfBar({ conf }) {
  const color = conf >= 90 ? 'bg-green-500' : conf >= 65 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500 w-20 flex-shrink-0">Confiance IA</span>
      <div className="flex-1 h-1.5 bg-gray-200 rounded overflow-hidden">
        <div className={`h-full ${color} rounded`} style={{ width: `${conf}%` }} />
      </div>
      <span className="text-xs font-mono text-gray-600">{conf}%</span>
    </div>
  );
}

function AIToggle({ enabled, onToggle }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      title={enabled ? 'IA activée — cliquer pour passer en manuel' : 'Manuel — cliquer pour activer l\'IA'}
      className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded border transition-colors ${
        enabled
          ? 'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
          : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'
      }`}
    >
      <span>{enabled ? '🤖' : '👤'}</span>
      <span className="font-medium">{enabled ? 'IA' : 'Manuel'}</span>
    </button>
  );
}

export default function RuleCard({
  rule, status, expanded, onToggle,
  ruleState, onAction, note, onNote,
  highlighted,
  aiIsOn, onToggleAI,
}) {
  const el = elementConfig.find(e => e.id === rule.element);

  // If AI is turned off, render as manual card
  if (!aiIsOn) {
    return (
      <div id={`rule-${rule.id}`} className={highlighted ? 'bg-blue-50' : ''}>
        <ManualRuleCard
          rule={{ ...rule, name: rule.name, description: `Vérification manuelle — ${rule.instance}` }}
          expanded={expanded}
          onToggle={onToggle}
          ruleState={ruleState}
          onAction={onAction}
          note={note}
          onNote={onNote}
          aiToggle={<AIToggle enabled={false} onToggle={onToggleAI} />}
        />
      </div>
    );
  }

  const isDisputable = status === 'validated';
  const showActions = ['nc_auto', 'to_review', 'confirmed_nc', 'override', 'ignored'].includes(status);

  return (
    <div
      id={`rule-${rule.id}`}
      className={`border-b border-gray-100 last:border-0 transition-colors ${highlighted ? 'bg-blue-50' : ''}`}
    >
      <div
        className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: el?.color || '#9ca3af' }} />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-gray-900">{rule.instance}</div>
          <div className="text-xs text-gray-500 truncate mt-0.5">{rule.name} — {rule.found} {rule.unit}</div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <AIToggle enabled={true} onToggle={onToggleAI} />
          <ConfDot conf={rule.conf} />
          <StatusChip status={ruleState || status} />
          <button
            onClick={(e) => { e.stopPropagation(); onAction('ignored'); }}
            className={`text-xs px-2 py-0.5 rounded border transition-colors ${
              ruleState === 'ignored'
                ? 'border-gray-400 bg-gray-100 text-gray-700'
                : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-600'
            }`}
          >
            Ignorer
          </button>
          <span className="text-gray-300 text-xs">{expanded ? '▲' : '▾'}</span>
        </div>
      </div>

      {expanded && (
        <div className="px-3 pb-3 border-t border-gray-100 pt-3">
          <ConfBar conf={rule.conf} />

          {rule.isFormula && (
            <div className="mt-3 mb-3">
              <div className="text-xs text-gray-500 font-medium mb-1.5">Calcul détaillé:</div>
              <div className="bg-gray-50 rounded p-2 space-y-0.5">
                {rule.breakdown.map((line, i) => (
                  <div key={i} className="text-xs font-mono text-gray-600">{line}</div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 mt-3 mb-3">
            <div className="bg-gray-50 rounded p-2">
              <div className="text-xs text-gray-500 mb-1">Détecté</div>
              <div className="text-sm font-mono font-bold text-gray-900">{rule.found} {rule.unit}</div>
              <div className={`text-xs mt-0.5 ${rule.pass ? 'text-green-500' : 'text-red-500'}`}>
                {rule.pass
                  ? `+${(rule.found - rule.threshold).toFixed(1)}${rule.unit}`
                  : `-${(rule.threshold - rule.found).toFixed(1)}${rule.unit} seuil`}
              </div>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <div className="text-xs text-gray-500 mb-1">Requis</div>
              <div className="text-sm font-mono font-bold text-gray-900">{rule.threshold} {rule.unit}</div>
              <div className="text-xs text-gray-400 mt-0.5">min.</div>
            </div>
          </div>

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

          {showActions && (
            <div className="flex gap-2">
              <button
                onClick={() => onAction(ruleState === 'confirmed_nc' ? null : 'confirmed_nc')}
                className={`flex-1 text-xs py-1.5 rounded border font-medium transition-colors ${
                  ruleState === 'confirmed_nc'
                    ? 'bg-red-500 text-white border-red-500'
                    : 'border-red-300 text-red-600 hover:bg-red-50'
                }`}
              >
                Confirmer NC
              </button>
              <button
                onClick={() => onAction(ruleState === 'override' ? null : 'override')}
                className={`flex-1 text-xs py-1.5 rounded border font-medium transition-colors ${
                  ruleState === 'override'
                    ? 'bg-amber-400 text-white border-amber-400'
                    : 'border-amber-300 text-amber-600 hover:bg-amber-50'
                }`}
              >
                Override
              </button>
            </div>
          )}

          {isDisputable && !ruleState && (
            <button
              onClick={() => onAction('to_review')}
              className="text-xs text-gray-400 hover:text-gray-600 mt-1"
            >
              Auto-validé — contester
            </button>
          )}
        </div>
      )}
    </div>
  );
}
