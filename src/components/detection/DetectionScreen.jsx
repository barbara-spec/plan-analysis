import PlanViewer from './PlanViewer';
import DetectionSidebar from './DetectionSidebar';

export default function DetectionScreen({
  detectionState, setDetectionState,
  elements, onUpdateMetrics,
  expandedElement, setExpandedElement,
  selectedElement, setSelectedElement,
  hoveredInstance, setHoveredInstance,
  completedElements, onPassReview,
}) {
  return (
    <div className="flex flex-1 overflow-hidden">
      <PlanViewer
        detectionState={detectionState}
        selectedElement={selectedElement}
        onSelectElement={setSelectedElement}
        hoveredInstance={hoveredInstance}
        onHoverInstance={setHoveredInstance}
      />
      <DetectionSidebar
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
    </div>
  );
}
