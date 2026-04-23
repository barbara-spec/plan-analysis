import RuleCard from './RuleCard';
import ManualRuleCard from './ManualRuleCard';

function autoStatus(rule, aiIsOn) {
  if (!rule.automated || !aiIsOn) return 'not_automated';
  if (rule.conf >= 90) return rule.pass ? 'validated' : 'nc_auto';
  return 'to_review';
}

export default function SectionGroup({
  section, rules, expanded, onToggle,
  expandedRule, onToggleRule,
  ruleStates, onAction, ruleNotes, onNote,
  highlightedRule,
  aiEnabled = {}, onToggleAI,
}) {
  const getStatus = (rule) => {
    const override = ruleStates[rule.id];
    if (override) return override;
    return autoStatus(rule, aiEnabled[rule.id] !== false);
  };

  const ncCount = rules.filter(r => {
    const s = getStatus(r);
    return s === 'nc_auto' || s === 'confirmed_nc' || s === 'non_conforme';
  }).length;
  const reviewCount = rules.filter(r => getStatus(r) === 'to_review').length;
  const manualCount = rules.filter(r => !r.automated || aiEnabled[r.id] === false).length;

  const summaryParts = [];
  if (ncCount) summaryParts.push(`${ncCount} non-conforme`);
  if (reviewCount) summaryParts.push(`${reviewCount} à réviser`);
  if (manualCount) summaryParts.push(`${manualCount} non automatisé`);

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
      >
        <span className="text-xs font-semibold text-gray-700">§ {section}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{summaryParts.join(' · ')}</span>
          <span className="text-gray-400 text-xs">{expanded ? '▲' : '▾'}</span>
        </div>
      </button>

      {expanded && (
        <div>
          {rules.map(rule => {
            const aiIsOn = aiEnabled[rule.id] !== false;
            if (!rule.automated) {
              return (
                <ManualRuleCard
                  key={rule.id}
                  rule={rule}
                  expanded={expandedRule === rule.id}
                  onToggle={() => onToggleRule(rule.id)}
                  ruleState={ruleStates[rule.id]}
                  onAction={(action) => onAction(rule.id, action)}
                  note={ruleNotes[rule.id]}
                  onNote={(v) => onNote(rule.id, v)}
                />
              );
            }
            return (
              <RuleCard
                key={rule.id}
                rule={rule}
                status={autoStatus(rule, aiIsOn)}
                expanded={expandedRule === rule.id}
                onToggle={() => onToggleRule(rule.id)}
                ruleState={ruleStates[rule.id]}
                onAction={(action) => onAction(rule.id, action)}
                note={ruleNotes[rule.id]}
                onNote={(v) => onNote(rule.id, v)}
                highlighted={highlightedRule === rule.id}
                aiIsOn={aiIsOn}
                onToggleAI={() => onToggleAI(rule.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
