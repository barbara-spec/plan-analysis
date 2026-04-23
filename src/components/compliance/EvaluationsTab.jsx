import ConfidenceLegend from './ConfidenceLegend';
import SummaryGrid from './SummaryGrid';
import FilterBar from './FilterBar';
import SectionGroup from './SectionGroup';
import { rules } from '../../data/rules';

function autoStatus(rule, aiEnabled) {
  if (!rule.automated || aiEnabled === false) return 'not_automated';
  if (rule.conf >= 90) return rule.pass ? 'validated' : 'nc_auto';
  return 'to_review';
}

export default function EvaluationsTab({
  evaluationRun, onLaunchEvaluation, evaluationLoading,
  ruleStates, onAction,
  ruleNotes, onNote,
  expandedRule, setExpandedRule,
  expandedSections, setExpandedSections,
  compFilter, setCompFilter,
  highlightedRule,
  aiEnabled, onToggleAI,
}) {
  const getStatus = (rule) => {
    const override = ruleStates[rule.id];
    if (override) return override;
    return autoStatus(rule, aiEnabled[rule.id]);
  };

  const counts = rules.reduce((acc, r) => {
    const s = getStatus(r);
    acc[s] = (acc[s] || 0) + 1;
    acc.total = (acc.total || 0) + 1;
    return acc;
  }, {});

  const actionNeeded = (rule) => {
    const s = getStatus(rule);
    return s === 'nc_auto' || s === 'confirmed_nc' || s === 'to_review' || s === 'non_conforme';
  };

  const filterRule = (rule) => {
    if (compFilter === 'all') return true;
    if (compFilter === 'action') return actionNeeded(rule);
    if (compFilter === 'validated') { const s = getStatus(rule); return s === 'validated' || s === 'conforme'; }
    if (compFilter === 'not_evaluated') return getStatus(rule) === 'not_evaluated';
    return true;
  };

  const sections = [...new Set(rules.map(r => r.section))];
  const totalActionNeeded = rules.filter(actionNeeded).length;

  const toggleSection = (section) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  if (!evaluationRun) {
    return (
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 0 2 2h11"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Aucune évaluation lancée</p>
            <p className="text-xs text-gray-400 mt-1">Lancez l'évaluation pour voir les résultats de conformité</p>
          </div>
          <button
            onClick={onLaunchEvaluation}
            disabled={evaluationLoading}
            className="mt-1 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {evaluationLoading ? '…' : 'Lancer l\'évaluation'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center justify-between px-3 pt-2 pb-1 flex-shrink-0 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-700">Résultats</span>
          {totalActionNeeded > 0 && (
            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{totalActionNeeded}</span>
          )}
        </div>
        <button className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 px-2 py-0.5 rounded">
          Exporter →
        </button>
      </div>

      <ConfidenceLegend />
      <SummaryGrid counts={counts} />
      <FilterBar filter={compFilter} onFilter={setCompFilter} counts={counts} />

      <div className="flex-1 overflow-y-auto">
        {sections.map(section => {
          const sectionRules = rules.filter(r => r.section === section).filter(filterRule);
          if (sectionRules.length === 0) return null;
          return (
            <SectionGroup
              key={section}
              section={section}
              rules={sectionRules}
              expanded={expandedSections.includes(section)}
              onToggle={() => toggleSection(section)}
              expandedRule={expandedRule}
              onToggleRule={id => setExpandedRule(expandedRule === id ? null : id)}
              ruleStates={ruleStates}
              onAction={onAction}
              ruleNotes={ruleNotes}
              onNote={onNote}
              highlightedRule={highlightedRule}
              aiEnabled={aiEnabled}
              onToggleAI={onToggleAI}
            />
          );
        })}
      </div>
    </div>
  );
}
