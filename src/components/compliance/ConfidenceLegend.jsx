export default function ConfidenceLegend() {
  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 border-b border-gray-100 flex-shrink-0">
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-green-500" />
        <span className="text-xs text-gray-600">≥90% — Auto-validé</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-amber-400" />
        <span className="text-xs text-gray-600">65–89% — À réviser</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-red-400" />
        <span className="text-xs text-gray-600">&lt;65% — Faible conf.</span>
      </div>
    </div>
  );
}
