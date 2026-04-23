import PlanPicker from './PlanPicker';
import ScaleConfig from './ScaleConfig';
import ElementTable from './ElementTable';
import { plans } from '../../data/elements';

export default function SetupScreen({
  selectedPlan, onSelectPlan,
  scales, onScaleChange,
  elements, onUpdateMetrics,
  scaleGatePassed, onLaunch,
}) {
  return (
    <div className="flex-1 overflow-y-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {/* Section 1 */}
            <div className="p-6">
              <PlanPicker selected={selectedPlan} onSelect={onSelectPlan} />
            </div>
            {/* Section 2 */}
            <div className="p-6">
              <ScaleConfig
                selectedPlan={selectedPlan}
                scales={scales}
                onChange={onScaleChange}
              />
            </div>
            {/* Section 3 */}
            <div className="p-6">
              <ElementTable elements={elements} onUpdateMetrics={onUpdateMetrics} />
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            {!scaleGatePassed && (
              <span className="text-xs text-red-500 flex items-center gap-1">
                ⚠ Échelle manquante — renseignez toutes les pages
              </span>
            )}
            {scaleGatePassed && <span />}
            <div className="flex items-center gap-2 ml-auto">
              <button className="text-sm px-3 py-1.5 border border-gray-300 rounded text-gray-600 hover:bg-gray-100 transition-colors">
                Annuler
              </button>
              <button
                onClick={onLaunch}
                disabled={!scaleGatePassed}
                className={`text-sm px-4 py-1.5 rounded font-medium transition-colors ${
                  scaleGatePassed
                    ? 'bg-gray-900 text-white hover:bg-gray-700'
                    : 'bg-gray-900 text-white opacity-40 cursor-not-allowed'
                }`}
              >
                Lancer la détection →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
