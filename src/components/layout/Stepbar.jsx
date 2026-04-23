const STEPS = [
  { n: 1, label: 'Sélection' },
  { n: 2, label: 'Extraction' },
  { n: 3, label: 'Vérification' },
];

export default function Stepbar({ currentStep, visitedSteps, onStepClick, selectedPlanName }) {
  return (
    <div className="flex items-center justify-between px-5 h-10 bg-white border-b border-gray-200 flex-shrink-0">
      <div className="flex items-center gap-0">
        {STEPS.map((step, i) => {
          const isDone = visitedSteps.has(step.n) && step.n < currentStep;
          const isActive = step.n === currentStep;
          const isClickable = visitedSteps.has(step.n) && step.n !== currentStep;

          return (
            <div key={step.n} className="flex items-center">
              {i > 0 && (
                <div className={`w-8 h-px mx-2 ${step.n <= currentStep ? 'bg-gray-400' : 'bg-gray-200'}`} />
              )}
              <button
                onClick={() => isClickable && onStepClick(step.n)}
                disabled={!isClickable}
                className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                  isClickable ? 'cursor-pointer hover:opacity-80' : 'cursor-default'
                } ${isActive ? 'text-gray-900' : isDone ? 'text-gray-600' : 'text-gray-400'}`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                  isDone ? 'bg-green-500 text-white' : isActive ? 'bg-gray-900 text-white' : 'border-2 border-gray-300 text-gray-400'
                }`}>
                  {isDone ? '✓' : step.n}
                </span>
                <span>{step.label}</span>
              </button>
            </div>
          );
        })}
      </div>

      {selectedPlanName && (
        <div className="flex items-center gap-2 text-xs text-gray-500 ml-auto pl-4">
          <span className="font-medium text-gray-700 truncate max-w-44">{selectedPlanName}</span>
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono flex-shrink-0">1:100</span>
        </div>
      )}
    </div>
  );
}
