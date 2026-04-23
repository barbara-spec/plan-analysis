import { useState, useRef, useEffect } from 'react';

export default function ParentTagDropdown({ parent, availableParents, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handle(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}
        className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded hover:bg-gray-200 transition-colors"
      >
        {parent} ▾
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-36 py-1">
          {availableParents.map(p => (
            <button
              key={p}
              onClick={(e) => { e.stopPropagation(); onChange(p); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-xs transition-colors ${
                p === parent ? 'bg-gray-50 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
