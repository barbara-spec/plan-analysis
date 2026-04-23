import { useState, useMemo } from 'react';
import { documents, DOC_TYPES } from '../../data/documents';

// Swap icon (⇄) for unselected rows
function SwapIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 5h10M9 2l3 3-3 3M14 11H4M7 8l-3 3 3 3"/>
    </svg>
  );
}

// Checkmark icon for selected row
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#5151cd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 8 6.5 11.5 13 5"/>
    </svg>
  );
}

// Search icon
function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="#a7a7a8" strokeWidth="1.5" strokeLinecap="round">
      <circle cx="7" cy="7" r="4.5"/>
      <path d="M10.5 10.5L14 14"/>
    </svg>
  );
}

export default function DocSelector({ onSelect, selectedId }) {
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState(null);

  const filtered = useMemo(() => {
    return documents.filter(doc => {
      const matchType = !activeType || doc.type === activeType;
      const matchSearch = !search || doc.name.toLowerCase().includes(search.toLowerCase()) || doc.type.toLowerCase().includes(search.toLowerCase());
      return matchType && matchSearch;
    });
  }, [search, activeType]);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Page header */}
      <div className="px-8 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
        <h1 className="text-sm font-semibold text-gray-900">Résidence Les Acacias — APD</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col px-8 py-5">
        {/* Section title */}
        <div className="mb-4 flex-shrink-0">
          <span className="text-xs font-semibold text-gray-900">Document Selection</span>
        </div>

        {/* Search + filters */}
        <div className="flex flex-col gap-2 mb-3 flex-shrink-0">
          {/* Search */}
          <div className="flex items-center gap-2 px-2 py-1.5 bg-white rounded-lg border border-[#eaebec]">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 text-[10px] text-gray-700 placeholder-[#a7a7a8] bg-transparent outline-none"
            />
          </div>

          {/* Type filter chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {DOC_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setActiveType(prev => prev === type ? null : type)}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] transition-colors"
                style={{
                  background: activeType === type ? '#5151cd' : '#eaebec',
                  color: activeType === type ? '#fff' : '#636464',
                }}
              >
                <span
                  className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: activeType === type ? 'rgba(255,255,255,0.4)' : '#c7c8ff' }}
                />
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Document list */}
        <div className="flex-1 overflow-y-auto space-y-2.5">
          {filtered.map(doc => {
            const isSelected = selectedId === doc.id;
            return (
              <button
                key={doc.id}
                onClick={() => onSelect(doc.id)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors"
                style={{
                  background: isSelected ? '#f8f8ff' : '#ffffff',
                  border: `1px solid ${isSelected ? '#5151cd' : '#f8f8ff'}`,
                  boxShadow: isSelected ? 'none' : '0 0 0 1px #f0f0f0',
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-[#636464] mb-0.5">{doc.type}</div>
                  <div className="text-xs font-medium text-gray-900 truncate">{doc.name}</div>
                </div>
                <div className={`flex-shrink-0 ${isSelected ? 'text-[#5151cd]' : 'text-gray-300'}`}>
                  {isSelected ? <CheckIcon /> : <SwapIcon />}
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="text-xs text-gray-400 text-center py-8">Aucun document trouvé</div>
          )}
        </div>
      </div>

    </div>
  );
}
