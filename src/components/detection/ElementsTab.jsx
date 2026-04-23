import { useState } from 'react';
import ElementRow from './ElementRow';
import DetectionPanel from './DetectionPanel';
import MetricChips from '../setup/MetricChips';
import { predefinedMetrics } from '../../data/elements';

// CV method is only available for: rooms (chambre, cuisine, bureau), doors, windows, walls
const CV_ELIGIBLE = ['chambre', 'porte', 'fenetre', 'cuisine'];

export default function ElementsTab({
  docLoaded,
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
    setTimeout(() => setDetectionState(prev => ({ ...prev, [id]: 'done' })), 2000);
  };

  const launchAll = () => {
    const cvIds = elements.filter(e => e.method === 'cv' && CV_ELIGIBLE.includes(e.id)).map(e => e.id);
    cvIds.forEach((id, i) => setTimeout(() => launchSingle(id), i * 200));
  };

  const total = elements.length;

  if (!docLoaded) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center text-xs text-gray-400">
          <div className="text-2xl mb-2">📋</div>
          Sélectionnez un plan pour configurer les éléments
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Tout lancer */}
      <div className="px-3 pt-2 pb-1 flex-shrink-0">
        <button
          onClick={launchAll}
          className="w-full bg-gray-900 text-white text-xs py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
        >
          ◈ Tout lancer — Porte · Fenêtre
        </button>
        <p className="text-xs text-gray-400 mt-1 text-center">
          CV disponible pour pièces, portes, fenêtres · Texte pour labels & métriques
        </p>
      </div>

      {/* Element list */}
      <div className="flex-1 overflow-y-auto">
        {elements.map(el => (
          <ElementRow
            key={el.id}
            el={el}
            cvEligible={CV_ELIGIBLE.includes(el.id)}
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
          className="w-full bg-gray-900 text-white text-sm py-1.5 rounded-lg font-medium hover:bg-gray-700 transition-colors"
        >
          Passer en conformité →
        </button>
      </div>
    </div>
  );
}
