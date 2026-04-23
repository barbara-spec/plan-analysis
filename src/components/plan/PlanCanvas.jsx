import { useState, useRef, useCallback } from 'react';
import { apartments, THRESHOLDS, aptStatus, aptDelta } from '../../data/apartments';
import { AI_EVALUATIONS } from '../../data/evaluations';
import { EXTRACTION_RESULTS, RESULT_COLS } from '../../data/extractionResults';

// Static reverse map: aptId → { inst, elementId }
const APT_INSTANCE_MAP = {};
Object.entries(EXTRACTION_RESULTS).forEach(([elementId, instances]) => {
  instances.forEach(inst => {
    if (inst.planRef) APT_INSTANCE_MAP[inst.planRef] = { inst, elementId };
  });
});

// Static lookup: doorId → { apt, door } — used for vision hover highlights
const DOOR_MAP = {};
apartments.forEach(apt => {
  (apt.doors ?? []).forEach(door => { DOOR_MAP[door.id] = { apt, door }; });
});

const VW = 800, VH = 500;
const HALL = { y: 220, h: 60 };

// ─── Architectural symbols ────────────────────────────────────────────────────

const BG      = '#fafafa';
const WALL    = '#374151';
const GLASS   = '#93c5fd';
const DOOR_C  = '#475569';

function WindowSymbol({ win, poly }) {
  const { x: px, y: py, w: pw, h: ph } = poly;
  const isH = win.side === 'top' || win.side === 'bottom';

  // Wall-edge coordinate
  const wx = win.side === 'right'  ? px + pw : win.side !== 'left' ? px + win.offset : px;
  const wy = win.side === 'bottom' ? py + ph : win.side !== 'top'  ? py + win.offset : py;

  // For horizontal walls (top/bottom)
  if (isH) {
    const x = wx, y = wy, w = win.w;
    // Labels: outside for top wall, inside for bottom wall (avoids off-screen)
    const codeY = win.side === 'top' ? y - 7  : y - 8;   // code
    const dimsY = win.side === 'top' ? y - 15 : y - 16;  // dims
    return (
      <g style={{ pointerEvents: 'none' }}>
        {/* Erase wall stroke */}
        <rect x={x} y={y - 2} width={w} height={4} fill={BG} />
        {/* Glass pane */}
        <rect x={x} y={y - 1.5} width={w} height={3} fill={GLASS} opacity={0.55} />
        {/* Outer sill line */}
        <line x1={x} y1={win.side === 'top' ? y - 2.5 : y + 2.5}
              x2={x + w} y2={win.side === 'top' ? y - 2.5 : y + 2.5}
              stroke={WALL} strokeWidth={0.8} opacity={0.4} />
        {/* Left jamb */}
        <line x1={x}   y1={y - 3} x2={x}   y2={y + 3} stroke={WALL} strokeWidth={1.5} />
        {/* Right jamb */}
        <line x1={x+w} y1={y - 3} x2={x+w} y2={y + 3} stroke={WALL} strokeWidth={1.5} />
        {/* Code */}
        <text x={x + w / 2} y={codeY} textAnchor="middle"
          fontSize={7} fontWeight="600" fill="#2563eb">{win.code}</text>
        {/* Dims */}
        <text x={x + w / 2} y={dimsY} textAnchor="middle"
          fontSize={6} fill="#94a3b8" fontFamily="ui-monospace,monospace">{win.dims}</text>
      </g>
    );
  }

  // Vertical walls (left / right)
  const x = wx, y = wy, w = win.w;
  const labelX = win.side === 'left' ? x - 8 : x + 8;
  const anchor  = win.side === 'left' ? 'end' : 'start';
  return (
    <g style={{ pointerEvents: 'none' }}>
      <rect x={x - 2} y={y} width={4} height={w} fill={BG} />
      <rect x={x - 1.5} y={y} width={3} height={w} fill={GLASS} opacity={0.55} />
      <line y1={y}   x1={win.side === 'left' ? x - 2.5 : x + 2.5}
            y2={y}   x2={win.side === 'left' ? x - 2.5 : x + 2.5}
            stroke={WALL} strokeWidth={0.8} opacity={0.4} />
      <line y1={y}   x1={x - 3} y2={y}   x2={x + 3} stroke={WALL} strokeWidth={1.5} />
      <line y1={y+w} x1={x - 3} y2={y+w} x2={x + 3} stroke={WALL} strokeWidth={1.5} />
      {/* Rotated code + dims */}
      <text
        x={labelX} y={y + w / 2 + 2}
        fontSize={7} fontWeight="600" fill="#2563eb"
        textAnchor="middle"
        transform={`rotate(-90 ${labelX} ${y + w / 2})`}
      >{win.code}</text>
      <text
        x={labelX - (win.side === 'left' ? -10 : 10)} y={y + w / 2 + 2}
        fontSize={6} fill="#94a3b8" fontFamily="ui-monospace,monospace"
        textAnchor="middle"
        transform={`rotate(-90 ${labelX - (win.side === 'left' ? -10 : 10)} ${y + w / 2})`}
      >{win.dims}</text>
    </g>
  );
}

function DoorSymbol({ door, poly }) {
  const { x: px, y: py, h: ph } = poly;
  const dw = door.w;

  // Determine hinge-side x and wall y
  const wallY = door.side === 'bottom' ? py + ph : py;
  const gapX  = px + door.offset;
  // hinge is on the 'swing' side: 'right' means hinge is on the left (standard), 'left' = hinge on right
  const hingeX = door.swing === 'right' ? gapX : gapX + dw;

  // Door opens INTO the room (away from wall)
  const intoY = door.side === 'bottom' ? wallY - dw : wallY + dw;

  // Arc end point (far side of gap on wall)
  const arcEndX = door.swing === 'right' ? gapX + dw : gapX;

  // sweep flags
  const leafX2 = hingeX; // leaf goes straight (horizontal swing = vertical leaf)
  const leafY2 = intoY;

  let arcD;
  if (door.side === 'bottom') {
    arcD = door.swing === 'right'
      ? `M ${hingeX},${intoY} A ${dw},${dw} 0 0 1 ${arcEndX},${wallY}`
      : `M ${hingeX},${intoY} A ${dw},${dw} 0 0 0 ${arcEndX},${wallY}`;
  } else {
    // top wall, opens downward
    arcD = door.swing === 'right'
      ? `M ${hingeX},${intoY} A ${dw},${dw} 0 0 0 ${arcEndX},${wallY}`
      : `M ${hingeX},${intoY} A ${dw},${dw} 0 0 1 ${arcEndX},${wallY}`;
  }

  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* Erase wall at gap */}
      <rect x={gapX} y={wallY - 2} width={dw} height={4} fill={BG} />
      {/* Door leaf */}
      <line x1={hingeX} y1={wallY} x2={leafX2} y2={leafY2}
        stroke={DOOR_C} strokeWidth={1.5} />
      {/* Swing arc */}
      <path d={arcD} fill="none"
        stroke={DOOR_C} strokeWidth={0.8} strokeDasharray="3 2" />
    </g>
  );
}

// Overlay shown on the plan for each vision-detected door.
// Ambient (all detected): small numbered bubble at the door gap.
// Hovered item: prominent bounding box around the door opening.
function DoorHighlight({ item, index, isHovered }) {
  const entry = DOOR_MAP[item.planRef];
  if (!entry) return null;
  const { apt, door } = entry;

  // Coordinates are in SVG px (the toX/toY round-trip is a no-op for this data)
  const px = apt.poly.x, py = apt.poly.y, ph = apt.poly.h;
  const wallY = door.side === 'bottom' ? py + ph : py;
  const gapX  = px + door.offset;
  const dw    = door.w;
  const cx    = gapX + dw / 2;
  const DEPTH = 32, PAD = 6;

  // Box extends into the room (away from the wall)
  const boxY  = door.side === 'bottom' ? wallY - DEPTH : wallY;
  const boxH  = DEPTH + PAD;
  // Bubble sits just inside the room, centred on the gap
  const bubY  = door.side === 'bottom' ? wallY - 12 : wallY + 12;

  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* Hover bounding box */}
      {isHovered && (
        <rect
          x={gapX - PAD} y={boxY}
          width={dw + PAD * 2} height={boxH}
          fill="rgba(81,81,205,0.10)"
          stroke="#5151cd" strokeWidth={2} rx={3}
        />
      )}
      {/* Numbered bubble — always visible when vision review is open */}
      <circle
        cx={cx} cy={bubY}
        r={isHovered ? 10 : 8}
        fill={isHovered ? '#5151cd' : 'rgba(99,99,205,0.72)'}
        style={{ transition: 'r 0.15s, fill 0.15s' }}
      />
      <text x={cx} y={bubY + 3.5}
        textAnchor="middle" fontSize={9} fontWeight="700" fill="white">
        {index + 1}
      </text>
    </g>
  );
}

const STATUS_COLOR = {
  pass:           { fill: '#22c55e', stroke: '#16a34a', light: '#dcfce7' },
  fail:           { fill: '#ef4444', stroke: '#dc2626', light: '#fee2e2' },
  fail_confirmed: { fill: '#ef4444', stroke: '#dc2626', light: '#fee2e2' },
  review:         { fill: '#f59e0b', stroke: '#d97706', light: '#fef3c7' },
  override:       { fill: '#f59e0b', stroke: '#d97706', light: '#fef3c7' },
  ignored:        { fill: '#9ca3af', stroke: '#6b7280', light: '#f3f4f6' },
  idle:           { fill: '#6b7280', stroke: '#4b5563', light: '#f9fafb' },
};

function toX(pct) { return (pct / 100) * VW; }
function toY(pct) { return (pct / 100) * VH; }

// Compute an apartment's worst evaluation status across all AI evaluations
function aiAptStatus(aptId) {
  const matching = AI_EVALUATIONS.filter(e => e.nonCompliantElements?.some(el => el.id === aptId));
  if (matching.some(e => e.status === 'fail'))   return 'fail';
  if (matching.some(e => e.status === 'review')) return 'review';
  if (AI_EVALUATIONS.length > 0) return 'pass';
  return 'idle';
}

export default function PlanCanvas({
  mode,
  extractionDone,
  activeApt, onAptClick,
  activeElementType,
  visionDoorItems = [],
  hoveredVisionItemId,
  overrides, editedValues,
  zoomedApt,
  textSelectMode,
  onTextLabelClick,
  aiState,
  activeEvalId,
  drawingMode,     // { elementId } | null
  onDrawingSave,   // (elementId, count) => void
  onCancelDrawing, // () => void
}) {
  const activeEval = activeEvalId
    ? AI_EVALUATIONS.find(e => e.id === activeEvalId)
    : null;

  // Set of apt IDs belonging to the focused element type (panel → plan highlight)
  const activeTypeAptIds = activeElementType && EXTRACTION_RESULTS[activeElementType]
    ? new Set(EXTRACTION_RESULTS[activeElementType].filter(i => i.planRef).map(i => i.planRef))
    : null;

  const [hoveredApt, setHoveredApt] = useState(null);

  // Drawing state
  const svgRef = useRef(null);
  const [drawnBoxes, setDrawnBoxes] = useState([]);   // [{ id, x, y, w, h }]
  const [currentDraw, setCurrentDraw] = useState(null); // { sx, sy, ex, ey }
  const isDrawing = useRef(false);

  // Reset drawn boxes when drawing mode changes
  const prevDrawingMode = useRef(null);
  if (drawingMode?.elementId !== prevDrawingMode.current) {
    prevDrawingMode.current = drawingMode?.elementId ?? null;
    if (!drawingMode && drawnBoxes.length > 0) setDrawnBoxes([]);
    if (!drawingMode && currentDraw) setCurrentDraw(null);
  }

  const svgCoords = useCallback((e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * VW,
      y: ((e.clientY - rect.top) / rect.height) * VH,
    };
  }, []);

  const handleDrawMouseDown = (e) => {
    if (!drawingMode) return;
    e.preventDefault();
    isDrawing.current = true;
    const { x, y } = svgCoords(e);
    setCurrentDraw({ sx: x, sy: y, ex: x, ey: y });
  };

  const handleDrawMouseMove = (e) => {
    if (!isDrawing.current || !drawingMode) return;
    const { x, y } = svgCoords(e);
    setCurrentDraw(prev => prev ? { ...prev, ex: x, ey: y } : null);
  };

  const handleDrawMouseUp = (e) => {
    if (!isDrawing.current || !drawingMode || !currentDraw) return;
    isDrawing.current = false;
    const { sx, sy, ex, ey } = currentDraw;
    const w = Math.abs(ex - sx), h = Math.abs(ey - sy);
    if (w > 8 && h > 8) {
      setDrawnBoxes(prev => [...prev, {
        id: `box_${Date.now()}`,
        x: Math.min(sx, ex), y: Math.min(sy, ey), w, h,
      }]);
    }
    setCurrentDraw(null);
  };

  const handleSave = () => {
    if (drawnBoxes.length > 0) onDrawingSave?.(drawingMode.elementId, drawnBoxes.length);
    setDrawnBoxes([]);
    setCurrentDraw(null);
  };

  const handleCancel = () => {
    setDrawnBoxes([]);
    setCurrentDraw(null);
    onCancelDrawing?.();
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${VW} ${VH}`}
      className="w-full h-full"
      style={{ background: '#fafafa', cursor: drawingMode ? 'crosshair' : 'default' }}
      onMouseLeave={() => { if (isDrawing.current) { isDrawing.current = false; setCurrentDraw(null); } }}
    >
      {/* Hall */}
      <rect x={0} y={HALL.y} width={VW} height={HALL.h}
        fill="#f3f4f6" stroke="#d1d5db" strokeWidth={1} />
      <text x={VW / 2} y={HALL.y + HALL.h / 2 + 4}
        textAnchor="middle" fontSize={11} fill="#9ca3af" letterSpacing={3}>
        HALL — COULOIR
      </text>

      {/* Apartment units */}
      {apartments.map(apt => {
        const px = toX(apt.poly.x / 8), py = toY(apt.poly.y / 5);
        const pw = toX(apt.poly.w / 8), ph = toY(apt.poly.h / 5);
        const status = mode === 'verification' && aiState === 'done'
          ? aiAptStatus(apt.id)
          : mode === 'verification' ? aptStatus(apt, overrides) : 'idle';
        const col = STATUS_COLOR[status];
        const delta = mode === 'verification' ? aptDelta(apt, editedValues) : null;
        const isActive    = activeApt === apt.id;
        const isZoomed    = zoomedApt === apt.id;
        const isTypeMatch = activeTypeAptIds?.has(apt.id) ?? false;
        const isTypeDim   = activeTypeAptIds != null && !isTypeMatch;
        const surface     = editedValues?.[apt.id] ?? apt.surface;

        return (
          <g
            key={apt.id}
            onClick={() => textSelectMode ? onTextLabelClick?.(apt.id) : onAptClick?.(apt.id)}
            onMouseEnter={() => mode === 'extraction' && extractionDone && setHoveredApt(apt.id)}
            onMouseLeave={() => setHoveredApt(null)}
            style={{
              cursor: textSelectMode ? 'crosshair' : 'pointer',
              opacity: isTypeDim ? 0.35 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {/* Background fill */}
            <rect
              x={px} y={py} width={pw} height={ph}
              fill={mode === 'verification' ? col.light : 'white'}
              stroke={isActive || isZoomed ? '#111827' : (mode === 'verification' ? col.stroke : '#374151')}
              strokeWidth={isActive || isZoomed ? 2.5 : 1.5}
              style={{ transition: 'all 0.25s' }}
            />

            {/* Zoomed highlight ring */}
            {isZoomed && (
              <rect
                x={px - 3} y={py - 3} width={pw + 6} height={ph + 6}
                fill="none" stroke="#3b82f6" strokeWidth={2} strokeDasharray="6 3" rx={2}
              />
            )}

            {/* Element-type focus ring (panel → plan) */}
            {isTypeMatch && (
              <rect
                x={px + 1} y={py + 1} width={pw - 2} height={ph - 2}
                fill="rgba(81,81,205,0.06)"
                stroke="#5151cd"
                strokeWidth={2}
                rx={2}
                style={{ pointerEvents: 'none' }}
              />
            )}

            {/* Active evaluation highlight */}
            {activeEval?.nonCompliantElements?.some(el => el.id === apt.id) && (
              <rect
                x={px - 4} y={py - 4} width={pw + 8} height={ph + 8}
                fill="none" stroke={col.stroke} strokeWidth={2.5} strokeDasharray="5 3" rx={3}
              />
            )}

            {/* Ref label top-left */}
            <text x={px + 8} y={py + 16} fontSize={8} fill="#9ca3af" fontWeight="500">
              {apt.ref}
            </text>

            {/* Type label */}
            <text
              x={px + pw / 2} y={py + ph / 2 - 8}
              textAnchor="middle" fontSize={16} fontWeight="700"
              fill={textSelectMode ? '#7c3aed' : mode === 'verification' ? col.stroke : '#1f2937'}
              style={{ transition: 'fill 0.25s', textDecoration: textSelectMode ? 'underline' : 'none' }}
            >
              {apt.type}
            </text>
            {textSelectMode && (
              <rect x={px + pw / 2 - 16} y={py + ph / 2 - 3} width={32} height={3} rx={1.5} fill="#7c3aed" opacity={0.5} />
            )}

            {/* Surface — always shown */}
            <text
              x={px + pw / 2} y={py + ph / 2 + 10}
              textAnchor="middle" fontSize={12} fontWeight="600"
              fill={mode === 'verification' ? col.stroke : mode === 'raw' ? '#6b7280' : '#2563eb'}
              fontFamily="ui-monospace, monospace"
              style={{ transition: 'fill 0.25s' }}
            >
              {surface.toFixed(1)} m²
            </text>

            {/* Windows */}
            {(apt.windows ?? []).map(win => (
              <WindowSymbol key={win.id} win={win} poly={{ x: px, y: py, w: pw, h: ph }} />
            ))}
            {/* Doors */}
            {(apt.doors ?? []).map(door => (
              <DoorSymbol key={door.id} door={door} poly={{ x: px, y: py, w: pw, h: ph }} />
            ))}

            {/* Verification: delta badge */}
            {mode === 'verification' && delta !== null && (
              <g>
                <rect
                  x={px + pw / 2 - 28} y={py + ph / 2 + 14}
                  width={56} height={16} rx={8}
                  fill={delta >= 0 ? '#dcfce7' : '#fee2e2'}
                />
                <text
                  x={px + pw / 2} y={py + ph / 2 + 25}
                  textAnchor="middle" fontSize={9} fontWeight="600"
                  fill={delta >= 0 ? '#16a34a' : '#dc2626'}
                  fontFamily="ui-monospace, monospace"
                >
                  {delta >= 0 ? '+' : ''}{delta} m²
                </text>
              </g>
            )}

            {/* Verification: status icon */}
            {mode === 'verification' && (
              <text
                x={px + pw - 14} y={py + 18}
                textAnchor="middle" fontSize={14}
              >
                {status === 'pass' ? '✓' :
                 status === 'fail' || status === 'fail_confirmed' ? '✗' :
                 status === 'review' ? '?' :
                 status === 'override' ? '↩' : '–'}
              </text>
            )}

            {/* Extraction highlight: red bounding box */}
            {mode === 'extraction' && extractionDone && (
              <rect
                x={px + 2} y={py + 2} width={pw - 4} height={ph - 4}
                fill="rgba(239,68,68,0.04)"
                stroke="#ef4444"
                strokeWidth={1.5}
                strokeDasharray="0"
                rx={2}
                style={{ pointerEvents: 'none' }}
              />
            )}

            {/* Low-confidence marker (extraction mode) */}
            {mode === 'extraction' && extractionDone && apt.conf < 80 && (
              <g>
                <circle cx={px + pw - 10} cy={py + 10} r={8} fill="#f59e0b" />
                <text x={px + pw - 10} y={py + 14} textAnchor="middle" fontSize={9} fill="white" fontWeight="700">!</text>
              </g>
            )}
          </g>
        );
      })}

      {/* Vision door highlights — numbered bubbles + hover bounding box */}
      {visionDoorItems.map((item, idx) => (
        <DoorHighlight
          key={item.id}
          item={item}
          index={idx}
          isHovered={hoveredVisionItemId === item.id}
        />
      ))}

      {/* Extraction hover card */}
      {hoveredApt && (() => {
        const entry = APT_INSTANCE_MAP[hoveredApt];
        if (!entry) return null;
        const apt = apartments.find(a => a.id === hoveredApt);
        if (!apt) return null;
        const px = toX(apt.poly.x / 8), py = toY(apt.poly.y / 5);
        const pw = toX(apt.poly.w / 8), ph = toY(apt.poly.h / 5);
        const { inst } = entry;
        const metrics = RESULT_COLS.filter(c => inst[c.id] != null);
        const cardW = 158, rowH = 14, cardH = 26 + metrics.length * rowH;
        const cardX = px + pw + 6 > VW - cardW ? px - cardW - 6 : px + pw + 6;
        const cardY = Math.min(py, VH - cardH - 4);
        return (
          <g style={{ pointerEvents: 'none' }}>
            <rect x={cardX} y={cardY} width={cardW} height={cardH} rx={6}
              fill="white" stroke="#e5e7eb" strokeWidth={1}
              style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,.12))' }} />
            <text x={cardX + 10} y={cardY + 15} fontSize={10} fontWeight="600" fill="#111827">{inst.label}</text>
            {metrics.map((col, i) => (
              <g key={col.id}>
                <text x={cardX + 10} y={cardY + 26 + i * rowH} fontSize={9} fill="#858586">{col.label}</text>
                <text x={cardX + cardW - 10} y={cardY + 26 + i * rowH} fontSize={9} fill="#111827"
                  textAnchor="end" fontFamily="ui-monospace, monospace">{inst[col.id]}</text>
              </g>
            ))}
          </g>
        );
      })()}

      {/* Raw OCR tooltip for zoomed low-conf apt */}
      {zoomedApt && (() => {
        const apt = apartments.find(a => a.id === zoomedApt);
        if (!apt || apt.conf >= 80) return null;
        const px = toX(apt.poly.x / 8);
        const py = toY(apt.poly.y / 5);
        const pw = toX(apt.poly.w / 8);
        return (
          <g>
            <rect x={px + pw + 6} y={py + 4} width={160} height={56} rx={6}
              fill="white" stroke="#f59e0b" strokeWidth={1.5}
              style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,.15))' }} />
            <text x={px + pw + 14} y={py + 20} fontSize={9} fill="#92400e" fontWeight="600">Lecture OCR brute</text>
            <text x={px + pw + 14} y={py + 34} fontSize={10} fill="#374151"
              fontFamily="ui-monospace, monospace">"{apt.rawOcr}"</text>
            <text x={px + pw + 14} y={py + 48} fontSize={8} fill="#9ca3af">
              Confiance : {apt.conf}% — à confirmer
            </text>
          </g>
        );
      })()}

      {/* Drawing mode: transparent capture overlay */}
      {drawingMode && (
        <rect
          x={0} y={0} width={VW} height={VH}
          fill="rgba(81,81,205,0.03)"
          style={{ cursor: 'crosshair' }}
          onMouseDown={handleDrawMouseDown}
          onMouseMove={handleDrawMouseMove}
          onMouseUp={handleDrawMouseUp}
        />
      )}

      {/* Drawn boxes */}
      {drawnBoxes.map((box, i) => (
        <g key={box.id}>
          <rect x={box.x} y={box.y} width={box.w} height={box.h}
            fill="rgba(81,81,205,0.08)" stroke="#5151cd" strokeWidth={1.5}
            strokeDasharray="5 3" rx={2} style={{ pointerEvents: 'none' }} />
          <circle cx={box.x + 10} cy={box.y + 10} r={9} fill="#5151cd" style={{ pointerEvents: 'none' }} />
          <text x={box.x + 10} y={box.y + 14} textAnchor="middle" fontSize={9}
            fill="white" fontWeight="700" style={{ pointerEvents: 'none' }}>{i + 1}</text>
          <text x={box.x + box.w - 6} y={box.y + 13} textAnchor="end"
            fontSize={8} fill="#5151cd" style={{ pointerEvents: 'none' }}>
            {Math.round(box.w)} × {Math.round(box.h)}
          </text>
        </g>
      ))}

      {/* Current box being drawn */}
      {currentDraw && (() => {
        const x = Math.min(currentDraw.sx, currentDraw.ex);
        const y = Math.min(currentDraw.sy, currentDraw.ey);
        const w = Math.abs(currentDraw.ex - currentDraw.sx);
        const h = Math.abs(currentDraw.ey - currentDraw.sy);
        return (
          <rect x={x} y={y} width={w} height={h}
            fill="rgba(81,81,205,0.06)" stroke="#5151cd" strokeWidth={1.5}
            strokeDasharray="4 2" rx={2} style={{ pointerEvents: 'none' }} />
        );
      })()}

      {/* Save / Cancel bar */}
      {drawingMode && (
        <foreignObject x={VW / 2 - 110} y={VH - 46} width={220} height={38}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
            <button
              onClick={handleSave}
              disabled={drawnBoxes.length === 0}
              style={{
                padding: '6px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                background: drawnBoxes.length > 0 ? '#5151cd' : '#e5e7eb',
                color: drawnBoxes.length > 0 ? 'white' : '#9ca3af',
                border: 'none', cursor: drawnBoxes.length > 0 ? 'pointer' : 'default',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}
            >
              {drawnBoxes.length > 0 ? `Save (${drawnBoxes.length})` : 'Draw elements…'}
            </button>
            <button
              onClick={handleCancel}
              style={{
                padding: '6px 12px', borderRadius: 8, fontSize: 12,
                background: 'rgba(255,255,255,0.9)', color: '#636464',
                border: '1px solid #e5e7eb', cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
            >Cancel</button>
          </div>
        </foreignObject>
      )}
    </svg>
  );
}
