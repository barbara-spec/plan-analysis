export default function FilterBar({ filter, onFilter, counts }) {
  const total = counts.total || 0;
  const actionRequired = (counts.nc_auto || 0) + (counts.confirmed_nc || 0) + (counts.to_review || 0) + (counts.non_conforme || 0);
  const validated = (counts.validated || 0) + (counts.conforme || 0);

  const options = [
    { id: 'all', label: `Tous (${total})` },
    { id: 'action', label: `Action requise (${actionRequired})` },
    { id: 'validated', label: 'Validés' },
    { id: 'not_evaluated', label: 'Non évalués' },
  ];

  return (
    <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 flex-shrink-0 overflow-x-auto">
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => onFilter(opt.id)}
          className={`whitespace-nowrap text-xs px-2.5 py-1 rounded-full border transition-colors ${
            filter === opt.id
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
