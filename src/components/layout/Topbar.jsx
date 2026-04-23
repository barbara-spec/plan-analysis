export default function Topbar({ ctaLabel, onCta }) {
  return (
    <div style={{ background: '#111827' }} className="flex items-center justify-between px-4 h-12 flex-shrink-0">
      <span className="text-white font-semibold text-sm tracking-wide">Plan Analysis</span>
      <div className="flex items-center gap-2">
        <button className="text-gray-400 text-sm px-3 py-1 rounded border border-gray-600 hover:border-gray-400 hover:text-gray-200 transition-colors">
          Docs ↗
        </button>
        {ctaLabel && (
          <button
            onClick={onCta}
            className="text-sm px-3 py-1.5 rounded font-medium bg-white text-gray-900 hover:bg-gray-100 transition-colors"
          >
            {ctaLabel}
          </button>
        )}
      </div>
    </div>
  );
}
