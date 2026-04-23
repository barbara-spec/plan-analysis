import { useState } from 'react';
import { METRICS } from '../../data/extractionTasks';

const ALL_IDS = METRICS.map(m => m.id);

const METHOD_LABELS = {
  cv:           { label: 'Vision',        color: 'bg-blue-100 text-blue-700' },
  spatial_text: { label: 'Texte spatial', color: 'bg-purple-100 text-purple-700' },
};

export default function ExtractionTaskCard({ task, status, resultCount, onRequestTextClick, onLaunch, allTasks, parentTaskId, onParentChange }) {
  const [configOpen, setConfigOpen] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState(new Set(task.metrics ?? ALL_IDS));

  const toggleMetric = (id) => {
    setSelectedMetrics(prev => {
      const next = new Set(prev);
      if (next.has(id)) { if (next.size > 1) next.delete(id); }
      else next.add(id);
      return next;
    });
  };

  const m = METHOD_LABELS[task.method] ?? METHOD_LABELS.cv;
  const isRunning  = status === 'running';
  const isDone     = status === 'done';
  const isAwaiting = status === 'awaiting';
  const isSpatialText = task.method === 'spatial_text';

  return (
    <div className={`border rounded-xl bg-white overflow-hidden transition-colors ${
      isAwaiting ? 'border-purple-300 ring-2 ring-purple-100' : 'border-gray-200'
    }`}>
      {/* Header */}
      <div className="flex items-start gap-3 p-3">
        <span className="text-xl leading-none mt-0.5">{task.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">{task.label}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m.color}`}>{m.label}</span>
            {isDone && (
              <span className="text-xs font-mono text-green-600 font-semibold">{resultCount} trouvés</span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{task.description}</p>

          {/* Parent badge */}
          {parentTaskId && allTasks && (() => {
            const parent = allTasks.find(t => t.id === parentTaskId);
            return parent ? (
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                <span>↳ enfant de</span>
                <span className="font-medium text-gray-500">{parent.icon} {parent.label}</span>
              </div>
            ) : null;
          })()}

          {/* Driven-by rules */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {task.drivenBy.map(r => (
              <span key={r.id} className="text-xs bg-gray-50 border border-gray-200 text-gray-500 px-1.5 py-0.5 rounded">
                → {r.label}
              </span>
            ))}
          </div>

          {/* Awaiting click hint */}
          {isAwaiting && (
            <div className="mt-2.5 flex items-center gap-2 text-xs text-purple-600 bg-purple-50 border border-purple-200 rounded-lg px-2.5 py-2">
              <span>👆</span>
              <span>{task.anchorHint}</span>
            </div>
          )}

          {/* Config panel */}
          {configOpen && (
            <div className="mt-3 border border-gray-200 rounded-lg p-3 bg-gray-50 text-xs space-y-3">
              {/* Parent task */}
              {allTasks && (
                <div>
                  <div className="font-semibold text-gray-700 mb-1.5">Élément parent</div>
                  <select
                    value={parentTaskId ?? ''}
                    onChange={e => onParentChange?.(e.target.value || null)}
                    className="w-full border border-gray-200 rounded px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
                  >
                    <option value="">— Aucun parent</option>
                    {allTasks.filter(t => t.id !== task.id).map(t => (
                      <option key={t.id} value={t.id}>{t.icon} {t.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Metrics */}
              <div>
                <div className="font-semibold text-gray-700 mb-1.5">Métriques à extraire</div>
                <div className="space-y-1.5">
                  {METRICS.map(met => (
                    <label key={met.id} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={selectedMetrics.has(met.id)}
                        onChange={() => toggleMetric(met.id)}
                        className="rounded border-gray-300 text-gray-900 focus:ring-0"
                      />
                      <span className={selectedMetrics.has(met.id) ? 'text-gray-700' : 'text-gray-400'}>
                        {met.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Running progress */}
      {isRunning && (
        <div className="mx-3 mb-2">
          <div className="h-1 bg-gray-100 rounded overflow-hidden">
            <div className="h-full bg-blue-400 rounded animate-pulse" style={{ width: '65%' }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">Scan en cours…</p>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center gap-2 px-3 pb-3">
        <button
          onClick={() => setConfigOpen(v => !v)}
          className="text-xs text-gray-500 border border-gray-200 px-2.5 py-1 rounded-lg hover:bg-gray-50 transition-colors"
        >
          {configOpen ? 'Fermer' : 'Configurer'}
        </button>
        <div className="flex-1" />

        {isSpatialText ? (
          isDone ? (
            <button
              onClick={onRequestTextClick}
              className="text-xs text-gray-500 border border-gray-200 px-2.5 py-1 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Relancer
            </button>
          ) : isAwaiting ? (
            <button
              onClick={onRequestTextClick}
              className="text-xs px-3 py-1 rounded-lg font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors"
            >
              Annuler
            </button>
          ) : (
            <button
              onClick={onRequestTextClick}
              disabled={isRunning}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
                isRunning
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-gray-700'
              }`}
            >
              Pointer sur le plan
            </button>
          )
        ) : (
          isDone ? (
            <button
              onClick={onLaunch}
              className="text-xs text-gray-500 border border-gray-200 px-2.5 py-1 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Relancer
            </button>
          ) : (
            <button
              onClick={onLaunch}
              disabled={isRunning}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
                isRunning
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-gray-700'
              }`}
            >
              {isRunning ? 'En cours…' : 'Lancer'}
            </button>
          )
        )}
      </div>
    </div>
  );
}
