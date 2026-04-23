import { useState, useEffect } from 'react';
import ElementRow from './ElementRow';
import DetectionPanel from './DetectionPanel';
import { elementConfig } from '../../data/elements';

export default function DetectionSidebar({
  detectionState, setDetectionState,
  elements, onUpdateMetrics,
  expandedElement, setExpandedElement,
  selectedElement, setSelectedElement,
  hoveredInstance, onHoverInstance,
  completedElements, onPassReview,
}) {
  const [confidence, setConfidence] = useState(65);

  const launchSingle = (id) => {
    if (detectionState[id] === 'running' || detectionState[id] === 'done') return;
    setDetectionState(prev => ({ ...prev, [id]: 'running' }));
    setTimeout(() => {
      setDetectionState(prev => ({ ...prev, [id]: 'done' }));
    }, 2000);
  };

  const launchAll = () => {
    const cvIds = elementConfig.filter(e => e.method === 'cv').map(e => e.id);
    cvIds.forEach((id, i) => {
      setTimeout(() => launchSingle(id), i * 200);
    });
  };

  const total = elementConfig.length;

  return (
    <div className="w-80 flex flex-col bg-white border-l border-gray-200 flex-shrink-0">
      {/* Tab header */}
      <div className="px-3 pt-2.5 pb-0 flex-shrink-0">
        <div className="flex border-b border-gray-200">
          <button className="text-xs font-semibold text-gray-900 pb-2 border-b-2 border-gray-900 px-1">
            Éléments
          </button>
        </div>
      </div>

      {/* Tout lancer */}
      <div className="px-3 pt-2 flex-shrink-0">
        <button
          onClick={launchAll}
          className="w-full bg-gray-900 text-white text-xs py-2 rounded font-medium hover:bg-gray-700 transition-colors"
        >
          ◈ Tout lancer — Porte · Fenêtre
        </button>
      </div>

      {/* Element list */}
      <div className="flex-1 overflow-y-auto mt-2">
        {elements.map(el => (
          <ElementRow
            key={el.id}
            el={el}
            status={detectionState[el.id] || 'idle'}
            expanded={expandedElement === el.id}
            onToggle={() => {
              setExpandedElement(expandedElement === el.id ? null : el.id);
              setSelectedElement(el.id);
            }}
            hoveredInstance={hoveredInstance}
            onHoverInstance={onHoverInstance}
            onLaunch={launchSingle}
            onParentChange={() => {}}
            onUpdateMetrics={onUpdateMetrics}
          />
        ))}
      </div>

      {/* Detection panel */}
      <DetectionPanel
        selectedElement={selectedElement}
        confidence={confidence}
        onConfidenceChange={setConfidence}
        hoveredInstance={hoveredInstance}
        onHoverInstance={onHoverInstance}
      />

      {/* Footer */}
      <div className="px-3 py-3 border-t border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 h-1.5 bg-gray-200 rounded overflow-hidden">
            <div
              className="h-full bg-green-500 rounded transition-all duration-500"
              style={{ width: `${(completedElements / total) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 whitespace-nowrap">{completedElements} / {total} éléments</span>
        </div>
        <button
          onClick={onPassReview}
          className="w-full bg-gray-900 text-white text-sm py-1.5 rounded font-medium hover:bg-gray-700 transition-colors"
        >
          Passer en revue →
        </button>
      </div>
    </div>
  );
}
