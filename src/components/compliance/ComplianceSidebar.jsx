import ConfidenceLegend from './ConfidenceLegend';
import SummaryGrid from './SummaryGrid';
import FilterBar from './FilterBar';
import SectionGroup from './SectionGroup';
import { rules } from '../../data/rules';

function autoStatus(rule) {
  if (!rule.automated) return 'not_automated';
  if (rule.conf >= 90) return rule.pass ? 'validated' : 'nc_auto';
  return 'to_review';
}

export default function ComplianceSidebar({
  ruleStates, onAction,
  ruleNotes, onNote,
  expandedRule, setExpandedRule,
  expandedSections, setExpandedSections,
  compFilter, setCompFilter,
  highlightedRule,
}) {
  const getStatus = (rule) => ruleStates[rule.id] || autoStatus(rule);

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
    if (compFilter === 'validated') {
      const s = getStatus(rule);
      return s === 'validated' || s === 'conforme';
    }
    if (compFilter === 'not_evaluated') {
      return getStatus(rule) === 'not_evaluated';
    }
    return true;
  };

  const sections = [...new Set(rules.map(r => r.section))];

  const totalActionNeeded = rules.filter(actionNeeded).length;

  const toggleSection = (section) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const toggleRule = (ruleId) => {
    setExpandedRule(expandedRule === ruleId ? null : ruleId);
  };

  return (
    <div style={{ width: 370 }} className="flex flex-col bg-white border-l border-gray-200 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-2 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">Conformité</span>
          {totalActionNeeded > 0 && (
            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
              {totalActionNeeded}
            </span>
          )}
        </div>
        <button className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 px-2 py-0.5 rounded">
          Exporter →
        </button>
      </div>

      <ConfidenceLegend />
      <SummaryGrid counts={counts} />
      <FilterBar filter={compFilter} onFilter={setCompFilter} counts={counts} />

      {/* Rule list */}
      <div className="flex-1 overflow-y-auto">
        {sections.map(section => {
          const sectionRules = rules
            .filter(r => r.section === section)
            .filter(filterRule);

          if (sectionRules.length === 0) return null;

          return (
            <SectionGroup
              key={section}
              section={section}
              rules={sectionRules}
              expanded={expandedSections.includes(section)}
              onToggle={() => toggleSection(section)}
              expandedRule={expandedRule}
              onToggleRule={toggleRule}
              ruleStates={ruleStates}
              onAction={onAction}
              ruleNotes={ruleNotes}
              onNote={onNote}
              highlightedRule={highlightedRule}
            />
          );
        })}
      </div>
    </div>
  );
}
