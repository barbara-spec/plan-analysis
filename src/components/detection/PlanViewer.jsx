import DocSelector from './DocSelector';
import ScaleOverlay from './ScaleOverlay';
import { detections } from '../../data/detections';
import { elementConfig } from '../../data/elements';

const ROOMS = [
  { id: 'chambre1', label: 'Chambre 1', surface: '12.4 m²', x: 5,  y: 5,  w: 22, h: 38 },
  { id: 'chambre2', label: 'Chambre 2', surface: '11.8 m²', x: 5,  y: 55, w: 22, h: 35 },
  { id: 'sejour',   label: 'Séjour',    surface: '28.6 m²', x: 27, y: 5,  w: 39, h: 40 },
  { id: 'cuisine',  label: 'Cuisine',   surface: '9.2 m²',  x: 68, y: 5,  w: 27, h: 25 },
  { id: 'sdb',      label: 'SDB',       surface: '5.1 m²',  x: 68, y: 30, w: 27, h: 15 },
  { id: 'bureau',   label: 'Bureau',    surface: '8.3 m²',  x: 27, y: 45, w: 39, h: 35 },
  { id: 'chambre3', label: 'Chambre 3', surface: '10.9 m²', x: 68, y: 45, w: 27, h: 45 },
  { id: 'couloir',  label: 'Couloir',   surface: '',        x: 5,  y: 43, w: 22, h: 12 },
];

const DOORS = [
  { x: 27, y: 40, w: 5, h: 3 },
  { x: 27, y: 52, w: 5, h: 3 },
  { x: 64, y: 40, w: 5, h: 3 },
  { x: 5,  y: 43, w: 3, h: 5 },
  { x: 64, y: 30, w: 5, h: 3 },
];

function toSVG(pct, dim) { return (pct / 100) * dim; }

const COMPLIANCE_COLORS = {
  chambre: { 1: '#22c55e', 2: '#22c55e', 3: '#f59e0b', 4: '#ef4444' },
  porte:   { 1: '#22c55e', 2: '#ef4444', 3: '#ef4444' },
  fenetre: { 1: '#f59e0b', 2: '#ef4444', 3: '#22c55e' },
  cuisine: { 1: '#22c55e' },
};

const INLINE_LABELS = {
  chambre: { 4: '8.3m² — sous le seuil: 9.0m²' },
  porte:   { 2: '0.78m — sous le seuil: 0.80m', 3: '0.72m — sous le seuil: 0.80m' },
  fenetre: { 2: '5.8% — sous le seuil: 8%' },
};

export default function PlanViewer({
  // Doc/plan state
  docLoaded, onSelectDoc,
  selectedPlan, scales, onScaleChange,
  // Detection state
  detectionState, selectedElement,
  hoveredInstance, onHoverInstance,
  // Compliance state
  complianceMode, evaluationRun,
  onPolygonClick,
}) {
  const VW = 800, VH = 600;

  if (!docLoaded) {
    return <DocSelector onSelect={onSelectDoc} />;
  }

  const renderPolygons = (type, instances, elConfig) => {
    if (!instances || detectionState[type] !== 'done') return null;
    const baseColor = elConfig.color;

    return instances.map(inst => {
      const px = toSVG(inst.poly.x, VW);
      const py = toSVG(inst.poly.y, VH);
      const pw = toSVG(inst.poly.w, VW);
      const ph = toSVG(inst.poly.h, VH);
      const isHovered = hoveredInstance?.type === type && hoveredInstance?.id === inst.id;

      let fillColor = baseColor;
      let strokeColor = baseColor;
      let typeOpacity = 1;

      if (complianceMode && evaluationRun) {
        fillColor = COMPLIANCE_COLORS[type]?.[inst.id] || '#9ca3af';
        strokeColor = fillColor;
      } else {
        if (selectedElement && selectedElement !== type) typeOpacity = 0.15;
        if (isHovered) strokeColor = '#111827';
      }

      const inlineLabel = complianceMode && evaluationRun ? INLINE_LABELS[type]?.[inst.id] : null;
      const shortName = inst.name
        .replace('Fenêtre ', 'F')
        .replace('Porte ', 'P')
        .replace('Chambre ', 'C')
        .replace('Cuisine', 'Cuis')
        .replace('Bureau', 'Bur');

      return (
        <g key={`${type}-${inst.id}`}>
          <rect
            x={px} y={py} width={pw} height={ph}
            fill={fillColor} fillOpacity={typeOpacity === 0.15 ? 0.05 : 0.15}
            stroke={strokeColor} strokeWidth={isHovered ? 2.5 : 2}
            strokeOpacity={typeOpacity} rx={2}
            style={{ cursor: complianceMode ? 'pointer' : 'default', transition: 'all 0.3s' }}
            onMouseEnter={() => onHoverInstance({ type, id: inst.id })}
            onMouseLeave={() => onHoverInstance(null)}
            onClick={() => complianceMode && onPolygonClick?.(type, inst.id)}
          />
          {/* Polygon label tag */}
          <rect x={px + 2} y={py + 2} width={32} height={12} fill={fillColor} rx={2} fillOpacity={typeOpacity} style={{ transition: 'all 0.3s' }} />
          <text x={px + 18} y={py + 11} textAnchor="middle" fontSize={7} fill="white" fontWeight="600" style={{ pointerEvents: 'none' }}>
            {shortName}
          </text>
          {/* Inline compliance label */}
          {inlineLabel && (
            <g>
              <rect x={px + 2} y={py - 14} width={Math.min(pw - 4, 130)} height={13} fill="#ef4444" rx={3} />
              <text
                x={px + Math.min((pw - 4) / 2 + 2, 67)} y={py - 4}
                textAnchor="middle" fontSize={7} fill="white"
                fontFamily="ui-monospace, monospace"
                style={{ pointerEvents: 'none' }}
              >
                {inlineLabel}
              </text>
            </g>
          )}
          {/* Hover tooltip */}
          {isHovered && !complianceMode && (
            <g>
              <rect x={px + pw + 4} y={py} width={120} height={inst.parent ? 50 : 38}
                fill="white" stroke="#e5e7eb" strokeWidth={1} rx={4}
                style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
              <text x={px + pw + 10} y={py + 13} fontSize={9} fill="#374151" fontWeight="600">{inst.name}</text>
              {inst.surface && (
                <text x={px + pw + 10} y={py + 27} fontSize={8} fill="#6b7280" fontFamily="ui-monospace,monospace">
                  surface: {inst.surface} m²
                </text>
              )}
              {inst.largeur && (
                <text x={px + pw + 10} y={py + 27} fontSize={8} fill="#6b7280" fontFamily="ui-monospace,monospace">
                  largeur: {inst.largeur} m
                </text>
              )}
              {inst.parent && (
                <text x={px + pw + 10} y={py + 40} fontSize={8} fill="#9ca3af">↳ {inst.parent}</text>
              )}
            </g>
          )}
        </g>
      );
    });
  };

  return (
    <div className="relative flex-1 overflow-hidden bg-gray-100">
      {/* Scale overlay */}
      <ScaleOverlay
        selectedPlan={selectedPlan}
        scales={scales}
        onChange={onScaleChange}
      />

      {/* Mode badge */}
      <div className="absolute top-3 left-3 z-10 bg-gray-900 bg-opacity-75 text-white text-xs px-2.5 py-1 rounded-full">
        {complianceMode ? '◉ Mode conformité' : '⊹ Sélection'}
      </div>

      <svg viewBox={`0 0 ${VW} ${VH}`} className="w-full h-full" style={{ background: '#fafafa' }}>
        {/* Rooms */}
        {ROOMS.map(r => (
          <g key={r.id}>
            <rect x={toSVG(r.x, VW)} y={toSVG(r.y, VH)} width={toSVG(r.w, VW)} height={toSVG(r.h, VH)}
              fill="white" stroke="#374151" strokeWidth={1.5} />
            <text x={toSVG(r.x + r.w / 2, VW)} y={toSVG(r.y + r.h / 2 - 2, VH)}
              textAnchor="middle" fontSize={9} fontWeight="bold" fill="#374151">{r.label}</text>
            {r.surface && (
              <text x={toSVG(r.x + r.w / 2, VW)} y={toSVG(r.y + r.h / 2 + 8, VH)}
                textAnchor="middle" fontSize={8} fill="#9ca3af">{r.surface}</text>
            )}
          </g>
        ))}
        {/* Doors */}
        {DOORS.map((d, i) => (
          <rect key={i} x={toSVG(d.x, VW)} y={toSVG(d.y, VH)} width={toSVG(d.w, VW)} height={toSVG(d.h, VH)}
            fill="#d1d5db" stroke="#9ca3af" strokeWidth={1} />
        ))}
        {/* Detection / compliance overlays */}
        {elementConfig.map(el => renderPolygons(el.id, detections[el.id], el))}
      </svg>

      {/* Page flipper */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-gray-800 bg-opacity-90 text-white text-xs px-4 py-1.5 rounded-full">
        <button className="hover:text-gray-300">←</button>
        <span>Page 1 / 3</span>
        <button className="hover:text-gray-300">→</button>
      </div>

      {/* Plan toolbar */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-gray-800 bg-opacity-90 text-white text-xs px-3 py-1.5 rounded-full">
        <button className="px-1.5 py-0.5 hover:text-gray-300">T</button>
        <button className="px-1.5 py-0.5 hover:text-gray-300">⊹</button>
        <button className="px-1.5 py-0.5 hover:text-gray-300">⬜</button>
        <span className="text-gray-600">|</span>
        <button className="px-1.5 py-0.5 hover:text-gray-300">+</button>
        <button className="px-1.5 py-0.5 hover:text-gray-300">−</button>
        <button className="px-1.5 py-0.5 hover:text-gray-300">⊡</button>
      </div>
    </div>
  );
}
