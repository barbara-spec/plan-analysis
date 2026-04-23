import { plans } from '../../data/elements';

export default function ScaleConfig({ selectedPlan, scales, onChange }) {
  const plan = plans[selectedPlan];
  const pageScales = scales[selectedPlan] || [];

  const handleChange = (pageIdx, value) => {
    const newScales = [...pageScales];
    newScales[pageIdx] = value === '' ? null : parseInt(value, 10) || null;
    onChange(selectedPlan, newScales);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-semibold flex-shrink-0">2</span>
        <span className="font-semibold text-gray-900 text-sm">Échelle</span>
        <span className="text-xs text-gray-400 ml-1">— requis pour toutes les pages</span>
      </div>
      <div className="space-y-2">
        {Array.from({ length: plan.pages }).map((_, i) => {
          const val = pageScales[i];
          const isFirst = i === 0;
          const hasValue = val !== null && val !== undefined && val > 0;
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-14 flex-shrink-0">Page {i + 1}</span>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-sm text-gray-400">1 :</span>
                <input
                  type="number"
                  value={val ?? ''}
                  onChange={e => handleChange(i, e.target.value)}
                  readOnly={isFirst}
                  placeholder={isFirst ? '' : '---'}
                  className={`w-20 px-2 py-1 text-sm font-mono border rounded focus:outline-none focus:ring-1 focus:ring-gray-400 ${
                    isFirst ? 'bg-gray-50 text-gray-600 cursor-default' : 'bg-white text-gray-900'
                  } ${!hasValue && !isFirst ? 'border-red-300' : 'border-gray-200'}`}
                />
              </div>
              {hasValue ? (
                <span className="text-xs text-green-600 font-medium">✓ Calibrée</span>
              ) : (
                <span className="text-xs text-red-500 font-medium">Obligatoire</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
