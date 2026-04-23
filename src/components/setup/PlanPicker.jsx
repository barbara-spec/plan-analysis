import { plans } from '../../data/elements';

export default function PlanPicker({ selected, onSelect }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-5 h-5 rounded-full bg-gray-900 text-white text-xs flex items-center justify-center font-semibold flex-shrink-0">1</span>
        <span className="font-semibold text-gray-900 text-sm">Sélection du plan</span>
      </div>
      <div className="space-y-2">
        {plans.map((plan, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg border transition-all text-left ${
              selected === i
                ? 'border-gray-900 bg-gray-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <span className="text-gray-400 text-lg flex-shrink-0">📄</span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">{plan.name}</div>
              <div className="text-xs text-gray-500 mt-0.5">{plan.pages} page{plan.pages > 1 ? 's' : ''} · {plan.size}</div>
            </div>
            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
              selected === i ? 'border-gray-900 bg-gray-900' : 'border-gray-300'
            }`}>
              {selected === i && (
                <span className="block w-full h-full rounded-full scale-50 bg-white" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
