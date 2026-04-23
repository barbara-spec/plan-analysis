import ParentTagDropdown from './ParentTagDropdown';

function confBadgeClass(conf) {
  if (conf >= 85) return 'bg-green-100 text-green-700';
  if (conf >= 65) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

function metricValues(inst) {
  const parts = [];
  if (inst.surface != null) parts.push(`${inst.surface} m²`);
  if (inst.largeur  != null) parts.push(`l: ${inst.largeur} m`);
  if (inst.hauteur  != null) parts.push(`h: ${inst.hauteur} m`);
  return parts.join(' · ');
}

export default function InstanceList({
  type, instances, hoveredInstance, onHoverInstance,
  hasParent, availableParents, onParentChange,
  onAddMissed,
}) {
  return (
    <div className="mt-2 space-y-1">
      <div className="flex items-center justify-between mb-1">
        <button className="text-xs text-gray-500 hover:text-gray-700">✓ Tout approuver</button>
        <button className="text-xs text-gray-500 hover:text-red-500">✕ Suppr. faible conf.</button>
      </div>
      {instances.map((inst, i) => {
        const vals = metricValues(inst);
        return (
          <div
            key={inst.id}
            onMouseEnter={() => onHoverInstance({ type, id: inst.id })}
            onMouseLeave={() => onHoverInstance(null)}
            className={`flex flex-col px-2 py-1.5 rounded transition-colors ${
              hoveredInstance?.type === type && hoveredInstance?.id === inst.id
                ? 'bg-blue-50 border-l-2 border-blue-400'
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-4 flex-shrink-0">#{i + 1}</span>
              <span className="flex-1 text-xs text-gray-700 font-medium truncate">{inst.name}</span>
              {hasParent && inst.parent && availableParents && (
                <ParentTagDropdown
                  parent={inst.parent}
                  availableParents={availableParents}
                  onChange={(p) => onParentChange(inst.id, p)}
                />
              )}
              <span className={`text-xs px-1.5 py-0.5 rounded font-mono font-medium flex-shrink-0 ${confBadgeClass(inst.conf)}`}>
                {inst.conf}%
              </span>
              <button className="text-green-500 hover:text-green-700 text-sm leading-none flex-shrink-0">✓</button>
              <button className="text-red-400 hover:text-red-600 text-sm leading-none flex-shrink-0">✕</button>
            </div>
            {vals && (
              <div className="text-xs font-mono text-gray-400 mt-0.5 pl-6">{vals}</div>
            )}
          </div>
        );
      })}
      <button
        onClick={onAddMissed}
        className="w-full text-left text-xs text-blue-500 hover:text-blue-700 mt-2 pl-2"
      >
        + Ajouter un élément manqué
      </button>
    </div>
  );
}
