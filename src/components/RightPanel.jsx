import ElementsTab from './detection/ElementsTab';
import EvaluationsTab from './compliance/EvaluationsTab';

export default function RightPanel({
  activeTab, setActiveTab,
  // Elements tab props
  docLoaded,
  detectionState, setDetectionState,
  elements, onUpdateMetrics,
  expandedElement, setExpandedElement,
  selectedElement, setSelectedElement,
  hoveredInstance, setHoveredInstance,
  completedElements, onPassReview,
  // Evaluations tab props
  evaluationRun, onLaunchEvaluation, evaluationLoading,
  ruleStates, onAction,
  ruleNotes, onNote,
  expandedRule, setExpandedRule,
  expandedSections, setExpandedSections,
  compFilter, setCompFilter,
  highlightedRule,
  aiEnabled, onToggleAI,
}) {
  return (
    <div className="w-80 flex flex-col bg-white border-l border-gray-200 flex-shrink-0">
      {/* Tab header */}
      <div className="flex border-b border-gray-200 flex-shrink-0">
        {['elements', 'evaluations'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 text-xs font-medium py-2.5 transition-colors border-b-2 ${
              activeTab === tab
                ? 'text-gray-900 border-gray-900'
                : 'text-gray-400 border-transparent hover:text-gray-600'
            }`}
          >
            {tab === 'elements' ? 'Éléments' : 'Évaluations'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'elements' ? (
        <ElementsTab
          docLoaded={docLoaded}
          detectionState={detectionState}
          setDetectionState={setDetectionState}
          elements={elements}
          onUpdateMetrics={onUpdateMetrics}
          expandedElement={expandedElement}
          setExpandedElement={setExpandedElement}
          selectedElement={selectedElement}
          setSelectedElement={setSelectedElement}
          hoveredInstance={hoveredInstance}
          onHoverInstance={setHoveredInstance}
          completedElements={completedElements}
          onPassReview={onPassReview}
        />
      ) : (
        <EvaluationsTab
          evaluationRun={evaluationRun}
          onLaunchEvaluation={onLaunchEvaluation}
          evaluationLoading={evaluationLoading}
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
          aiEnabled={aiEnabled}
          onToggleAI={onToggleAI}
        />
      )}
    </div>
  );
}
