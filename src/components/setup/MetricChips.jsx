import { useState, useRef, useEffect } from 'react';
import { predefinedMetrics } from '../../data/elements';

export default function MetricChips({ metrics, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const remove = (id) => onChange(metrics.filter(m => m !== id));
  const add = (id) => {
    onChange([...metrics, id]);
    setOpen(false);
  };

  const getLabel = (id) => predefinedMetrics.find(m => m.id === id)?.label || id;

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2" ref={ref}>
      {metrics.map(m => (
        <span key={m} className="inline-flex items-center gap-1 bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded">
          {getLabel(m)}
          <button
            onClick={() => remove(m)}
            className="text-gray-400 hover:text-gray-700 ml-0.5 leading-none"
          >×</button>
        </span>
      ))}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="inline-flex items-center gap-0.5 bg-gray-50 border border-dashed border-gray-300 text-gray-500 text-xs px-2 py-0.5 rounded hover:bg-gray-100 transition-colors"
        >
          + Ajouter
        </button>
        {open && (
          <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-52 py-1">
            {predefinedMetrics.map(m => {
              const added = metrics.includes(m.id);
              return (
                <button
                  key={m.id}
                  disabled={added}
                  onClick={() => !added && add(m.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left transition-colors ${
                    added
                      ? 'text-gray-300 cursor-default'
                      : 'text-gray-700 hover:bg-gray-50 cursor-pointer'
                  }`}
                >
                  <span className="font-medium">{m.label}</span>
                  <span className={added ? 'text-gray-200' : 'text-gray-400'}>{m.desc}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
