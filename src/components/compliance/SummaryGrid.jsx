export default function SummaryGrid({ counts }) {
  const items = [
    { label: 'Validé', value: counts.validated || 0, color: 'text-green-600' },
    { label: 'À réviser', value: counts.to_review || 0, color: 'text-amber-600' },
    { label: 'Non-conforme', value: (counts.nc_auto || 0) + (counts.confirmed_nc || 0) + (counts.non_conforme || 0), color: 'text-red-600' },
    { label: 'Override', value: counts.override || 0, color: 'text-amber-700' },
    { label: 'Non évalué', value: counts.not_evaluated || 0, color: 'text-gray-500' },
  ];

  return (
    <div className="grid grid-cols-5 gap-1 px-3 py-2 flex-shrink-0">
      {items.map(item => (
        <div key={item.label} className="flex flex-col items-center bg-gray-50 rounded p-1.5">
          <span className={`text-lg font-bold font-mono ${item.color}`}>{item.value}</span>
          <span className="text-xs text-gray-500 text-center leading-tight mt-0.5">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
