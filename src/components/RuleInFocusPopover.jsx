import { useState, useRef, useEffect } from 'react';
import { checklistRules, TRACKS, DEFAULT_IN_REVIEW } from '../data/checklistRules';

const TABS = ['In Review', 'All Rules', 'Verified'];

function TrashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M3 5h10M6 5V3h4v2M6 8v5M10 8v5M4 5l.75 8h6.5L12 5"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <polyline points="3 8 6.5 11.5 13 5"/>
    </svg>
  );
}

function RuleRow({ rule, inReview, verified, onAdd, onRemove, onVerify }) {
  const track = TRACKS.find(t => t.id === rule.id.split('.')[0]);
  return (
    <div className="py-1.5 flex items-start gap-2 group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 leading-none mb-0.5">
          <span className="text-[10px] font-semibold" style={{ color: '#0000ff' }}>{rule.id}</span>
          <span className="text-[10px] font-semibold text-gray-900">{rule.name}</span>
        </div>
        <p className="text-[10px] text-[#4d4c4c] leading-snug line-clamp-1">{rule.desc}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
        {inReview ? (
          <>
            <button
              onClick={onVerify}
              className={`transition-colors ${verified ? 'text-green-500' : 'text-gray-300 hover:text-gray-500'}`}
              title="Marquer vérifiée"
            >
              <CheckIcon />
            </button>
            <button
              onClick={onRemove}
              className="text-gray-300 hover:text-red-400 transition-colors"
              title="Retirer de la revue"
            >
              <TrashIcon />
            </button>
          </>
        ) : (
          <button
            onClick={onAdd}
            className="text-gray-300 hover:text-gray-700 transition-colors"
            title="Ajouter à la revue"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M8 3v10M3 8h10"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export default function RuleInFocusPopover() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('All Rules');
  const [inReview, setInReview] = useState(DEFAULT_IN_REVIEW);
  const [verified, setVerified] = useState(new Set());
  const [search, setSearch] = useState('');
  const [activeTrack, setActiveTrack] = useState(null);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const addToReview   = (id) => setInReview(prev => new Set([...prev, id]));
  const removeReview  = (id) => setInReview(prev => { const s = new Set(prev); s.delete(id); return s; });
  const toggleVerify  = (id) => setVerified(prev => {
    const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s;
  });

  const baseRules = checklistRules.filter(r => {
    if (tab === 'In Review') return inReview.has(r.id);
    if (tab === 'Verified')  return verified.has(r.id);
    return true;
  });

  const filtered = baseRules.filter(r => {
    const matchTrack = !activeTrack || r.track === activeTrack;
    const matchSearch = !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase());
    return matchTrack && matchSearch;
  });

  const reviewCount = inReview.size;

  return (
    <div ref={ref} className="fixed bottom-5 left-12 z-50">
      {/* Popover */}
      {open && (
        <div
          className="absolute bottom-full mb-2 left-0"
          style={{
            width: 298,
            background: '#fff',
            border: '1px solid #e5e5e5',
            borderRadius: 10,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            overflow: 'hidden',
          }}
        >
          <div className="p-2.5 flex flex-col gap-2" style={{ maxHeight: 520 }}>
            {/* Tabs */}
            <div className="flex items-center gap-0 border-b border-gray-100 pb-1.5">
              {TABS.map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="px-1 text-xs transition-colors"
                  style={{
                    fontWeight: tab === t ? 500 : 400,
                    color: tab === t ? '#000' : '#858586',
                    borderBottom: tab === t ? '2px solid #000' : '2px solid transparent',
                    marginBottom: -1.5,
                    paddingBottom: 4,
                  }}
                >
                  {t === 'In Review' ? `In Review (${reviewCount})` : t}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex items-center gap-1.5 px-1.5 py-1 border rounded-lg text-[10px]"
              style={{ borderColor: '#eaebec' }}>
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="#a7a7a8" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search"
                className="flex-1 bg-transparent outline-none text-gray-700 placeholder-[#a7a7a8]"
                style={{ fontSize: 10 }}
              />
            </div>

            {/* Track filters */}
            <div className="flex items-center gap-1.5">
              {TRACKS.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTrack(prev => prev === t.id ? null : t.id)}
                  className="text-[10px] px-1.5 py-0.5 rounded-sm font-medium transition-all"
                  style={{
                    background: activeTrack === t.id ? t.color : t.color,
                    color: activeTrack === t.id ? t.text : '#4d4c4c',
                    outline: activeTrack === t.id ? `1.5px solid ${t.text}` : 'none',
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Rule list */}
            <div className="overflow-y-auto flex-1" style={{ maxHeight: 380 }}>
              {filtered.length === 0 && (
                <div className="text-[10px] text-gray-400 text-center py-6">Aucune règle</div>
              )}
              {filtered.map((rule, i) => (
                <div key={rule.id}>
                  <RuleRow
                    rule={rule}
                    inReview={inReview.has(rule.id)}
                    verified={verified.has(rule.id)}
                    onAdd={() => addToReview(rule.id)}
                    onRemove={() => removeReview(rule.id)}
                    onVerify={() => toggleVerify(rule.id)}
                  />
                  {i < filtered.length - 1 && (
                    <div style={{ height: 1, background: '#f1f2f4' }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trigger button */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-full text-white text-xs font-medium transition-opacity hover:opacity-90"
        style={{ background: '#111827' }}
      >
        <span
          className="flex items-center justify-center rounded"
          style={{ width: 18, height: 18, background: '#f3f4f6', border: '1px solid #e5e7eb' }}
        >
          <span style={{ fontSize: 10, color: '#6b7280', fontWeight: 500 }}>R</span>
        </span>
        <span style={{ fontSize: 12 }}>Rule in Focus</span>
        <span
          className="flex items-center justify-center rounded-full text-white font-bold"
          style={{ width: 18, height: 17, background: '#4f46e5', fontSize: 10 }}
        >
          {reviewCount}
        </span>
      </button>
    </div>
  );
}
