import PlanViewer from '../detection/PlanViewer';
import ComplianceSidebar from './ComplianceSidebar';

export default function ComplianceScreen({
  detectionState,
  evaluationRun,
  ruleStates, onAction,
  ruleNotes, onNote,
  expandedRule, setExpandedRule,
  expandedSections, setExpandedSections,
  compFilter, setCompFilter,
  hoveredInstance, setHoveredInstance,
  highlightedRule, setHighlightedRule,
}) {
  const handlePolygonClick = (type, id) => {
    // Map polygon to rule and scroll to it
    const ruleMap = {
      porte: { 1: 'r1', 2: 'r2', 3: 'r3' },
      chambre: { 3: 'r6', 4: 'r5' },
      fenetre: { 2: 'r8' },
    };
    const ruleId = ruleMap[type]?.[id];
    if (ruleId) {
      setHighlightedRule(ruleId);
      setExpandedRule(ruleId);
      const el = document.getElementById(`rule-${ruleId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => setHighlightedRule(null), 2000);
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <PlanViewer
        detectionState={detectionState}
        selectedElement={null}
        onSelectElement={() => {}}
        hoveredInstance={hoveredInstance}
        onHoverInstance={setHoveredInstance}
        complianceMode={true}
        evaluationRun={evaluationRun}
        onPolygonClick={handlePolygonClick}
      />
      <ComplianceSidebar
        ruleStates={ruleStates}
        onAction={onAction}
        ruleNotes={ruleNotes}
        onNote={onNote}
        expandedRule={expandedRule}
        setExpandedRule={setExpandedRule}
        expandedSections={expandedSections}
        setExpandedSections={setExpandedSections}
        compFilter={compFilter}
        setCompFilter={setCompFilter}
        highlightedRule={highlightedRule}
      />
    </div>
  );
}
