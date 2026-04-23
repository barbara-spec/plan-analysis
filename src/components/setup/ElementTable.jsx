import { useState, Fragment } from 'react';
import MetricChips from './MetricChips';
import { predefinedMetrics } from '../../data/elements';

const METHOD_COLORS = {
  cv: 'bg-blue-100 text-blue-700',
  text: 'bg-purple-100 text-purple-700',
};

export default function ElementTable({ elements, onUpdateMetrics }) {
  const [expanded, setExpanded] = useState(null);

  const toggle = (id) => setExpanded(expanded === id ? null : id);

  const getLabel = (id) => predefinedMetrics.find(m => m.id === id)?.label || id;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-semibold flex-shrink-0">3</span>
        <span className="font-semibold text-gray-900 text-sm">Éléments & métriques</span>
      </div>
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Élément</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Méthode</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Métriques</th>
              <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Règles</th>
            </tr>
          </thead>
          <tbody>
            {elements.map((el) => (
              <Fragment key={el.id}>
                <tr
                  onClick={() => toggle(el.id)}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: el.color }} />
                      <span className="font-medium text-gray-900">{el.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${METHOD_COLORS[el.method]}`}>
                      {el.method === 'cv' ? 'CV' : 'Texte'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {el.metrics.map(m => (
                        <span key={m} className="font-mono text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          {getLabel(m)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-gray-500 text-xs">
                    {el.relatedRules} règle{el.relatedRules > 1 ? 's' : ''}
                  </td>
                </tr>
                {expanded === el.id && (
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <td colSpan={4} className="px-3 py-3">
                      <div className="text-xs text-gray-500 mb-1.5 font-medium">Modifier les métriques</div>
                      <MetricChips
                        metrics={el.metrics}
                        onChange={(newMetrics) => onUpdateMetrics(el.id, newMetrics)}
                      />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
