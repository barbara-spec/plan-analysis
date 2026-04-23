import { useState } from 'react';
import { plans } from '../../data/elements';

export default function ScaleOverlay({ selectedPlan, scales, onChange }) {
  const [open, setOpen] = useState(false);
  const plan = plans[selectedPlan];
  const pageScales = scales[selectedPlan] || [];
  const allSet = pageScales.every(s => s !== null && s !== undefined && s > 0);

  const handleChange = (pageIdx, value) => {
    const newScales = [...pageScales];
    newScales[pageIdx] = value === '' ? null : parseInt(value, 10) || null;
    onChange(selectedPlan, newScales);
  };

  return (
    <div className="absolute top-3 right-3 z-20">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full shadow-sm border transition-colors ${
          allSet
            ? 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
            : 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100'
        }`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${allSet ? 'bg-green-500' : 'bg-amber-400'}`} />
        Échelle {allSet ? `1:${pageScales[0]}` : '— à calibrer'}
        <span className="text-gray-400 ml-0.5">✎</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-lg p-3 w-52">
          <div className="text-xs font-semibold text-gray-700 mb-2">Calibration de l'échelle</div>
          <div className="space-y-2">
            {Array.from({ length: plan.pages }).map((_, i) => {
              const val = pageScales[i];
              const hasValue = val !== null && val !== undefined && val > 0;
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-12 flex-shrink-0">Page {i + 1}</span>
                  <span className="text-xs text-gray-400">1 :</span>
                  <input
                    type="number"
                    value={val ?? ''}
                    onChange={e => handleChange(i, e.target.value)}
                    readOnly={i === 0}
                    placeholder="—"
                    className={`flex-1 px-2 py-1 text-xs font-mono border rounded focus:outline-none focus:ring-1 focus:ring-gray-400 ${
                      i === 0 ? 'bg-gray-50 text-gray-500 cursor-default' : 'bg-white'
                    } ${!hasValue && i > 0 ? 'border-amber-300' : 'border-gray-200'}`}
                  />
                  {hasValue
                    ? <span className="text-green-500 text-xs">✓</span>
                    : <span className="text-amber-400 text-xs">!</span>
                  }
                </div>
              );
            })}
          </div>
          <button
            onClick={() => setOpen(false)}
            className="mt-3 w-full text-xs bg-gray-900 text-white py-1.5 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Valider
          </button>
        </div>
      )}
    </div>
  );
}
