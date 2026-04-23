import { useState } from 'react';
import MetricChips from '../setup/MetricChips';
import InstanceList from './InstanceList';
import { detections } from '../../data/detections';

const STATUS_CONFIG = {
  idle: { dot: 'bg-gray-300', text: 'Non démarré' },
  running: { dot: 'bg-amber-400 animate-pulse', text: 'Scan en cours…' },
  done: { dot: 'bg-green-500', text: null },
};

export default function ElementRow({
  el, cvEligible = true, status, expanded, onToggle,
  hoveredInstance, onHoverInstance,
  onLaunch, onParentChange, onUpdateMetrics,
}) {
  const [method, setMethod] = useState(el.method);
  const insts = detections[el.id] || [];
  const sc = STATUS_CONFIG[status] || STATUS_CONFIG.idle;

  return (
    <div className={`border-b border-gray-100 last:border-0 ${expanded ? 'bg-gray-50' : ''}`}>
      <div
        className="px-3 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: el.color }} />
          <span className="flex-1 text-sm font-semibold text-gray-900">{el.name}</span>

          {/* Method toggle */}
          <div
            className="flex items-center border border-gray-200 rounded overflow-hidden text-xs"
            onClick={e => e.stopPropagation()}
          >
            {cvEligible && (
              <button
                onClick={() => setMethod('cv')}
                className={`px-2 py-0.5 transition-colors ${method === 'cv' ? 'bg-blue-100 text-blue-700 font-medium' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
              >CV</button>
            )}
            <button
              onClick={() => setMethod('text')}
              className={`px-2 py-0.5 transition-colors ${method === 'text' ? 'bg-purple-100 text-purple-700 font-medium' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >Texte</button>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); onLaunch(el.id); }}
            className="text-xs px-2 py-0.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            Lancer
          </button>
        </div>

        {/* Metrics row — editable */}
        <div className="mt-1.5 pl-4" onClick={e => e.stopPropagation()}>
          <MetricChips
            metrics={el.metrics}
            onChange={(newMetrics) => onUpdateMetrics(el.id, newMetrics)}
          />
        </div>

        {/* Status row */}
        <div className="flex items-center justify-between mt-1.5 pl-4">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
            <span className="text-xs text-gray-500">
              {sc.text || (status === 'done' ? `${insts.length} détecté${insts.length > 1 ? 'es' : 'e'}` : '')}
            </span>
          </div>
          {status === 'done' && (
            <span className="text-sm font-mono font-semibold text-gray-700">{insts.length}</span>
          )}
          {status === 'idle' && method === 'cv' && (
            <span className="text-xs text-gray-400">En attente CV</span>
          )}
        </div>

        {/* Running progress bar */}
        {status === 'running' && (
          <div className="mt-2 mx-4">
            <div className="h-1 bg-gray-200 rounded overflow-hidden">
              <div className="h-full bg-amber-400 rounded animate-pulse" style={{ width: '60%', transition: 'width 2s linear' }} />
            </div>
          </div>
        )}
      </div>

      {/* Expanded content */}
      {expanded && status === 'done' && (
        <div className="px-3 pb-3">
          <InstanceList
            type={el.id}
            instances={insts}
            hoveredInstance={hoveredInstance}
            onHoverInstance={onHoverInstance}
            hasParent={el.hasParent}
            availableParents={el.availableParents}
            onParentChange={(instId, parent) => onParentChange(el.id, instId, parent)}
            onAddMissed={() => {}}
          />
        </div>
      )}
    </div>
  );
}
