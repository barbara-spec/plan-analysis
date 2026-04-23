import { detections } from '../../data/detections';
import { elementConfig } from '../../data/elements';

function confBadgeClass(conf) {
  if (conf >= 85) return 'bg-green-100 text-green-700';
  if (conf >= 65) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

export default function DetectionPanel({ selectedElement, confidence, onConfidenceChange, hoveredInstance, onHoverInstance }) {
  const el = elementConfig.find(e => e.id === selectedElement);
  const insts = detections[selectedElement] || [];
  const visible = insts.filter(i => i.conf >= confidence);

  if (!el) return null;

  return (
    <div className="border-t border-gray-200 bg-white p-3 flex-shrink-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-700">
          Détection — <span style={{ color: el.color }}>{el.name}</span>
        </span>
        <span className="text-xs text-gray-400">{visible.length} résultats</span>
      </div>

      {/* Confidence slider */}
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs text-gray-500 w-20 flex-shrink-0">Confiance min.</span>
        <input
          type="range" min={0} max={100} value={confidence}
          onChange={e => onConfidenceChange(Number(e.target.value))}
          className="flex-1 h-1 accent-gray-700"
        />
        <span className="text-xs font-mono text-gray-700 w-8 text-right">{confidence}%</span>
      </div>

      {/* Instance list */}
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {insts.map((inst, i) => {
          const faded = inst.conf < confidence;
          const vals = [
            inst.surface != null && `${inst.surface} m²`,
            inst.largeur  != null && `l: ${inst.largeur} m`,
            inst.hauteur  != null && `h: ${inst.hauteur} m`,
          ].filter(Boolean).join(' · ');
          return (
            <div
              key={inst.id}
              onMouseEnter={() => !faded && onHoverInstance({ type: selectedElement, id: inst.id })}
              onMouseLeave={() => onHoverInstance(null)}
              className={`flex flex-col px-1 py-1 rounded transition-all ${faded ? 'opacity-30' : ''} ${
                hoveredInstance?.type === selectedElement && hoveredInstance?.id === inst.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 w-4 flex-shrink-0">#{i + 1}</span>
                <span className="flex-1 text-xs text-gray-700 truncate">{inst.name}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded font-mono font-medium flex-shrink-0 ${confBadgeClass(inst.conf)}`}>
                  {inst.conf}%
                </span>
                <button className="text-green-500 hover:text-green-700 text-sm flex-shrink-0">✓</button>
                <button className="text-red-400 hover:text-red-600 text-sm flex-shrink-0">✕</button>
              </div>
              {vals && (
                <div className="text-xs font-mono text-gray-400 mt-0.5 pl-5">{vals}</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bulk actions */}
      <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
        <button className="flex-1 text-xs py-1 border border-gray-200 rounded text-gray-600 hover:bg-gray-50">
          ✓ Tout approuver
        </button>
        <button className="flex-1 text-xs py-1 border border-red-200 rounded text-red-500 hover:bg-red-50">
          ✕ Suppr. faible conf.
        </button>
      </div>
    </div>
  );
}
