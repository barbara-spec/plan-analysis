const CONF_BAR = (conf) => (
  <div className="flex items-center gap-1.5">
    <div className="w-10 h-1 bg-gray-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full ${conf >= 80 ? 'bg-green-400' : 'bg-amber-400'}`}
        style={{ width: `${conf}%` }}
      />
    </div>
    <span className={`text-xs font-mono ${conf < 80 ? 'text-amber-600 font-semibold' : 'text-gray-400'}`}>
      {conf}%
    </span>
  </div>
);

export default function InstancesRuleCard({ rule }) {
  const failCount = rule.instances.filter(i => !i.pass).length;
  const total = rule.instances.length;

  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden">
      <div className="px-3 pt-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-xs text-gray-400 font-mono">{rule.code}</span>
            <h3 className="text-sm font-semibold text-gray-900 mt-0.5">{rule.name}</h3>
          </div>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
            failCount === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {failCount === 0 ? `${total}/${total} OK` : `${failCount} écart${failCount > 1 ? 's' : ''}`}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Seuil : ≥ {rule.threshold} {rule.unit}
        </p>
      </div>

      <div className="border-t border-gray-100">
        {rule.instances.map((inst, i) => (
          <div
            key={inst.id}
            className={`flex items-center gap-3 px-3 py-2 text-xs ${
              i < rule.instances.length - 1 ? 'border-b border-gray-50' : ''
            } ${!inst.pass ? 'bg-red-50/50' : ''}`}
          >
            <span className="font-mono text-gray-500 w-24 flex-shrink-0">{inst.ref}</span>
            <span className={`font-mono font-semibold flex-shrink-0 ${inst.pass ? 'text-gray-800' : 'text-red-600'}`}>
              {inst.value} {rule.unit}
            </span>
            <span className={`flex-shrink-0 ${inst.pass ? 'text-green-600' : 'text-red-500'}`}>
              {inst.pass ? '✓' : '✗'}
            </span>
            <div className="flex-1" />
            {CONF_BAR(inst.conf)}
          </div>
        ))}
      </div>
    </div>
  );
}
