import { apartments, THRESHOLDS, aptStatus, aptDelta } from '../../data/apartments';

const STATUS_BADGE = {
  pass:           { label: '✓ OK',       cls: 'bg-green-100 text-green-700' },
  fail:           { label: '✗ Écart',    cls: 'bg-red-100 text-red-700' },
  fail_confirmed: { label: '✗ Confirmé', cls: 'bg-red-100 text-red-700' },
  review:         { label: '? À revoir', cls: 'bg-amber-100 text-amber-700' },
  override:       { label: '↩ Modifié',  cls: 'bg-amber-100 text-amber-700' },
  ignored:        { label: '— Ignoré',   cls: 'bg-gray-100 text-gray-500' },
  idle:           { label: '—',          cls: 'bg-gray-100 text-gray-400' },
};

export default function VerificationTable({ overrides, editedValues, onEditValue, activeApt, onAptClick, onZoomApt }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-2 px-3 text-gray-400 font-medium">Réf.</th>
            <th className="text-left py-2 px-2 text-gray-400 font-medium">Type</th>
            <th className="text-right py-2 px-2 text-gray-400 font-medium">Détecté</th>
            <th className="text-right py-2 px-2 text-gray-400 font-medium">Seuil</th>
            <th className="text-right py-2 px-2 text-gray-400 font-medium">Écart</th>
            <th className="text-left py-2 px-2 text-gray-400 font-medium">Conf.</th>
            <th className="text-left py-2 px-2 text-gray-400 font-medium">Statut</th>
            <th className="py-2 px-2"></th>
          </tr>
        </thead>
        <tbody>
          {apartments.map(apt => {
            const status = aptStatus(apt, overrides);
            const delta = aptDelta(apt, editedValues);
            const badge = STATUS_BADGE[status] ?? STATUS_BADGE.idle;
            const surface = editedValues?.[apt.id] ?? apt.surface;
            const threshold = THRESHOLDS[apt.type] ?? 0;
            const isActive = activeApt === apt.id;
            const isLowConf = apt.conf < 80;

            return (
              <tr
                key={apt.id}
                onClick={() => onAptClick?.(apt.id)}
                className={`border-b border-gray-50 cursor-pointer transition-colors ${
                  isActive ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                {/* Ref */}
                <td className="py-2 px-3 font-mono text-gray-700 font-medium">{apt.ref}</td>

                {/* Type */}
                <td className="py-2 px-2 text-gray-600">{apt.type}</td>

                {/* Detected surface — editable */}
                <td className="py-2 px-2 text-right">
                  <input
                    type="number"
                    step="0.1"
                    value={surface}
                    onChange={e => onEditValue?.(apt.id, parseFloat(e.target.value))}
                    onClick={e => e.stopPropagation()}
                    className="w-16 text-right font-mono bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-400 focus:outline-none text-gray-800"
                  />
                  <span className="text-gray-400 ml-0.5">m²</span>
                </td>

                {/* Threshold */}
                <td className="py-2 px-2 text-right font-mono text-gray-500">{threshold} m²</td>

                {/* Delta */}
                <td className={`py-2 px-2 text-right font-mono font-semibold ${
                  delta === null ? 'text-gray-300' :
                  delta >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {delta === null ? '—' : `${delta >= 0 ? '+' : ''}${delta}`}
                </td>

                {/* Confidence */}
                <td className="py-2 px-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${apt.conf >= 80 ? 'bg-green-400' : 'bg-amber-400'}`}
                        style={{ width: `${apt.conf}%` }}
                      />
                    </div>
                    <span className={`font-mono ${isLowConf ? 'text-amber-600 font-semibold' : 'text-gray-400'}`}>
                      {apt.conf}%
                    </span>
                  </div>
                </td>

                {/* Status badge */}
                <td className="py-2 px-2">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>
                    {badge.label}
                  </span>
                </td>

                {/* Actions */}
                <td className="py-2 px-2">
                  {isLowConf && (
                    <button
                      onClick={e => { e.stopPropagation(); onZoomApt?.(apt.id); }}
                      title="Voir OCR brut"
                      className="text-amber-500 hover:text-amber-700 transition-colors"
                    >
                      🔍
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
