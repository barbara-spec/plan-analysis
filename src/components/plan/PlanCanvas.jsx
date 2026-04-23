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

// Static lookup: doorId → { apt, door }
const DOOR_MAP = {};
apartments.forEach(apt => {
  (apt.doors ?? []).forEach(door => { DOOR_MAP[door.id] = { apt, door }; });
});

// Static lookup: windowId → { apt, win }
const WINDOW_MAP = {};
apartments.forEach(apt => {
  (apt.windows ?? []).forEach(win => { WINDOW_MAP[win.id] = { apt, win }; });
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

// Highlight shown on plan for a click-selected door (from Results tab or plan click)
function DoorSelectionHighlight({ doorId }) {
  const entry = DOOR_MAP[doorId];
  if (!entry) return null;
  const { apt, door } = entry;
  const px = toX(apt.poly.x / 8), py = toY(apt.poly.y / 5);
  const ph = toY(apt.poly.h / 5);
  const wallY = door.side === 'bottom' ? py + ph : py;
  const gapX  = px + door.offset;
  const PAD = 6, DEPTH = 32;
  const boxY = door.side === 'bottom' ? wallY - DEPTH : wallY;
  return (
    <g style={{ pointerEvents: 'none' }}>
      <rect x={gapX - PAD} y={boxY} width={door.w + PAD * 2} height={DEPTH + PAD}
        fill="rgba(81,81,205,0.12)" stroke="#5151cd" strokeWidth={2} rx={3} />
    </g>
  );
}

// Highlight shown on plan for a click-selected window (from Results tab or plan click)
function WindowHighlight({ winId }) {
  const entry = WINDOW_MAP[winId];
  if (!entry) return null;
  const { apt, win } = entry;
  const px = toX(apt.poly.x / 8), py = toY(apt.poly.y / 5);
  const pw = toX(apt.poly.w / 8), ph = toY(apt.poly.h / 5);
  const wx = win.side === 'right' ? px + pw : win.side !== 'left' ? px + win.offset : px;
  const wy = win.side === 'bottom' ? py + ph : win.side !== 'top'  ? py + win.offset : py;
  const PAD = 5, DEPTH = 20;
  let rx, ry, rw, rh;
  if      (win.side === 'top')    { rx = wx - PAD;    ry = wy;        rw = win.w + PAD * 2; rh = DEPTH; }
  else if (win.side === 'bottom') { rx = wx - PAD;    ry = wy - DEPTH; rw = win.w + PAD * 2; rh = DEPTH; }
  else if (win.side === 'right')  { rx = wx - DEPTH;  ry = wy - PAD;  rw = DEPTH; rh = win.w + PAD * 2; }
  else                            { rx = wx;          ry = wy - PAD;  rw = DEPTH; rh = win.w + PAD * 2; }
  return (
    <g style={{ pointerEvents: 'none' }}>
      <rect x={rx} y={ry} width={rw} height={rh}
        fill="rgba(81,81,205,0.12)" stroke="#5151cd" strokeWidth={2} rx={3} />
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

// Check a metric filter against a raw string value
function checkFilter(filter, rawValue) {
  if (!filter) return null;
  const num = parseFloat(String(rawValue ?? ''));
  if (isNaN(num)) return null;
  if (filter.op === '>'  && num <= filter.value) return 'fail';
  if (filter.op === '<'  && num >= filter.value) return 'fail';
  if (filter.op === '≥'  && num <  filter.value) return 'fail';
  if (filter.op === '≤'  && num >  filter.value) return 'fail';
  return 'pass';
}

// Compute pass/fail status for an apartment based on its element's configured metric filters
function aptExtractionStatus(aptId, elements) {
  const entry = APT_INSTANCE_MAP[aptId];
  if (!entry) return null;
  const { inst, elementId } = entry;
  const element = elements?.find(e => e.id === elementId);
  const filters = element?.metricFilters ?? {};
  if (Object.keys(filters).length === 0) return 'extracted';
  const anyFail = Object.entries(filters).some(([mId, f]) => checkFilter(f, inst[mId]) === 'fail');
  return anyFail ? 'fail' : 'pass';
}

export default function PlanCanvas({
  mode,
  extractionDone,
  elements,
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

  // Set of apt IDs for the focused element type — only apartment-level planRefs drive the dim effect
  const APT_ID_SET = new Set(apartments.map(a => a.id));
  const activeTypeAptIds = activeElementType && EXTRACTION_RESULTS[activeElementType]
    ? (() => {
        const refs = EXTRACTION_RESULTS[activeElementType]
          .filter(i => i.planRef && APT_ID_SET.has(i.planRef)).map(i => i.planRef);
        return refs.length > 0 ? new Set(refs) : null;
      })()
    : null;

  // When a door/window is selected, identify its parent apartment for a soft highlight
  const activeParentAptId = activeApt
    ? (DOOR_MAP[activeApt]?.apt.id ?? WINDOW_MAP[activeApt]?.apt.id ?? null)
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
        const isActive       = activeApt === apt.id;
        const isZoomed       = zoomedApt === apt.id;
        const isParentActive = activeParentAptId === apt.id; // door/window inside this apt is selected
        const isTypeMatch    = activeTypeAptIds?.has(apt.id) ?? false;
        const isTypeDim      = activeTypeAptIds != null && !isTypeMatch;
        const surface        = editedValues?.[apt.id] ?? apt.surface;

        return (
          <g
            key={apt.id}
            onClick={() => textSelectMode ? onTextLabelClick?.(apt.id) : onAptClick?.(apt.id)}
            onMouseEnter={() => mode === 'extraction' && APT_INSTANCE_MAP[apt.id] && setHoveredApt(apt.id)}
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
              stroke={isActive || isZoomed ? '#111827' : isParentActive ? '#5151cd' : (mode === 'verification' ? col.stroke : '#374151')}
              strokeWidth={isActive || isZoomed ? 2.5 : isParentActive ? 1.5 : 1.5}
              strokeDasharray={isParentActive && !isActive ? '5 3' : 'none'}
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

            {/* Windows — symbol + transparent hit area */}
            {(apt.windows ?? []).map(win => {
              const isH = win.side === 'top' || win.side === 'bottom';
              const wx = win.side === 'right' ? px + pw : win.side !== 'left' ? px + win.offset : px;
              const wy = win.side === 'bottom' ? py + ph : win.side !== 'top' ? py + win.offset : py;
              const PAD = 5, DEPTH = 20;
              let hx, hy, hw, hh;
              if      (win.side === 'top')    { hx = wx - PAD;   hy = wy;        hw = win.w + PAD * 2; hh = DEPTH; }
              else if (win.side === 'bottom') { hx = wx - PAD;   hy = wy-DEPTH;  hw = win.w + PAD * 2; hh = DEPTH; }
              else if (win.side === 'right')  { hx = wx - DEPTH; hy = wy - PAD;  hw = DEPTH; hh = win.w + PAD * 2; }
              else                            { hx = wx;         hy = wy - PAD;  hw = DEPTH; hh = win.w + PAD * 2; }
              return (
                <g key={win.id}>
                  <WindowSymbol win={win} poly={{ x: px, y: py, w: pw, h: ph }} />
                  <rect x={hx} y={hy} width={hw} height={hh} fill="transparent" style={{ cursor: 'pointer' }}
                    onMouseEnter={e => { e.stopPropagation(); mode === 'extraction' && setHoveredApt(win.id); }}
                    onMouseLeave={e => { e.stopPropagation(); setHoveredApt(null); }}
                    onClick={e => { e.stopPropagation(); onAptClick?.(win.id); }}
                  />
                </g>
              );
            })}
            {/* Doors — symbol + transparent hit area */}
            {(apt.doors ?? []).map(door => {
              const wallY = door.side === 'bottom' ? py + ph : py;
              const gapX  = px + door.offset;
              const PAD = 6, DEPTH = 32;
              const boxY = door.side === 'bottom' ? wallY - DEPTH : wallY;
              return (
                <g key={door.id}>
                  <DoorSymbol door={door} poly={{ x: px, y: py, w: pw, h: ph }} />
                  <rect x={gapX - PAD} y={boxY} width={door.w + PAD * 2} height={DEPTH + PAD}
                    fill="transparent" style={{ cursor: 'pointer' }}
                    onMouseEnter={e => { e.stopPropagation(); mode === 'extraction' && setHoveredApt(door.id); }}
                    onMouseLeave={e => { e.stopPropagation(); setHoveredApt(null); }}
                    onClick={e => { e.stopPropagation(); onAptClick?.(door.id); }}
                  />
                </g>
              );
            })}

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

            {/* Extraction status indicator */}
            {mode === 'extraction' && (() => {
              const status = aptExtractionStatus(apt.id, elements);
              if (!status) return null;
              if (status === 'fail') return (
                <g style={{ pointerEvents: 'none' }}>
                  <circle cx={px + pw - 11} cy={py + 11} r={9} fill="#f59e0b" opacity={0.9} />
                  <text x={px + pw - 11} y={py + 15} textAnchor="middle" fontSize={10} fill="white" fontWeight="800">!</text>
                </g>
              );
              if (status === 'pass') return (
                <g style={{ pointerEvents: 'none' }}>
                  <circle cx={px + pw - 11} cy={py + 11} r={9} fill="#22c55e" opacity={0.9} />
                  <text x={px + pw - 11} y={py + 15.5} textAnchor="middle" fontSize={11} fill="white" fontWeight="800">✓</text>
                </g>
              );
              // 'extracted' — subtle dot, no filter configured
              return (
                <circle cx={px + pw - 11} cy={py + 11} r={5}
                  fill="rgba(81,81,205,0.35)" style={{ pointerEvents: 'none' }} />
              );
            })()}
          </g>
        );
      })}

      {/* Selected door highlight (click from Results tab or plan) */}
      {activeApt && DOOR_MAP[activeApt] && <DoorSelectionHighlight doorId={activeApt} />}

      {/* Selected window highlight */}
      {activeApt && WINDOW_MAP[activeApt] && <WindowHighlight winId={activeApt} />}

      {/* Vision door highlights — numbered bubbles + hover bounding box */}
      {visionDoorItems.map((item, idx) => (
        <DoorHighlight
          key={item.id}
          item={item}
          index={idx}
          isHovered={hoveredVisionItemId === item.id}
        />
      ))}

      {/* Extraction hover card — apartment, door, or window */}
      {hoveredApt && (() => {
        const cardW = 168, rowH = 15;

        // ── Door hover card ────────────────────────────────────────────────────
        if (DOOR_MAP[hoveredApt]) {
          const { apt, door } = DOOR_MAP[hoveredApt];
          const px = toX(apt.poly.x / 8), py = toY(apt.poly.y / 5);
          const ph = toY(apt.poly.h / 5);
          const wallY = door.side === 'bottom' ? py + ph : py;
          const gapCx = px + door.offset + door.w / 2;
          const dInst = EXTRACTION_RESULTS.doors?.find(d => d.planRef === hoveredApt);
          if (!dInst) return null;
          const element = elements?.find(e => e.id === 'doors');
          const filters = element?.metricFilters ?? {};
          const metrics = RESULT_COLS.filter(c => dInst[c.id] != null);
          const cardH = 30 + metrics.length * rowH;
          const cardX = gapCx + cardW / 2 + 4 > VW ? gapCx - cardW - 4 : gapCx + 4;
          const cardY = Math.max(4, Math.min(wallY - cardH / 2, VH - cardH - 4));
          return (
            <g style={{ pointerEvents: 'none' }}>
              <rect x={cardX} y={cardY} width={cardW} height={cardH} rx={7}
                fill="white" stroke="#e5e7eb" strokeWidth={1}
                style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,.14))' }} />
              <text x={cardX + 11} y={cardY + 17} fontSize={10.5} fontWeight="700" fill="#111827">{dInst.label}</text>
              <line x1={cardX + 1} y1={cardY + 22} x2={cardX + cardW - 1} y2={cardY + 22} stroke="#f1f2f4" strokeWidth={1} />
              {metrics.map((col, i) => {
                const fr = checkFilter(filters[col.id], dInst[col.id]);
                const vc = fr === 'fail' ? '#f59e0b' : fr === 'pass' ? '#16a34a' : '#374151';
                return (
                  <g key={col.id}>
                    <text x={cardX + 11} y={cardY + 31 + i * rowH} fontSize={9} fill="#9ca3af">{col.label}</text>
                    {fr === 'fail' && <circle cx={cardX + cardW - 20} cy={cardY + 27 + i * rowH} r={5} fill="#f59e0b" />}
                    {fr === 'pass' && <circle cx={cardX + cardW - 20} cy={cardY + 27 + i * rowH} r={5} fill="#22c55e" />}
                    <text x={fr ? cardX + cardW - 28 : cardX + cardW - 10} y={cardY + 31 + i * rowH}
                      fontSize={10} fill={vc} textAnchor="end" fontFamily="ui-monospace, monospace" fontWeight={fr ? '600' : '400'}>
                      {dInst[col.id]}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        }

        // ── Window hover card ──────────────────────────────────────────────────
        if (WINDOW_MAP[hoveredApt]) {
          const { apt, win } = WINDOW_MAP[hoveredApt];
          const px = toX(apt.poly.x / 8), py = toY(apt.poly.y / 5);
          const pw = toX(apt.poly.w / 8), ph = toY(apt.poly.h / 5);
          const wx = win.side === 'right' ? px + pw : win.side !== 'left' ? px + win.offset : px;
          const wy = win.side === 'bottom' ? py + ph : win.side !== 'top'  ? py + win.offset : py;
          const wInst = EXTRACTION_RESULTS.windows?.find(w => w.planRef === hoveredApt);
          if (!wInst) return null;
          const element = elements?.find(e => e.id === 'windows');
          const filters = element?.metricFilters ?? {};
          const metrics = RESULT_COLS.filter(c => wInst[c.id] != null);
          const cardH = 30 + metrics.length * rowH;
          const isV   = win.side === 'left' || win.side === 'right';
          const anchorX = isV ? (win.side === 'right' ? wx - cardW - 6 : wx + 6) : wx + win.w / 2 - cardW / 2;
          const anchorY = isV ? wy - cardH / 2 : (win.side === 'top' ? wy + 6 : wy - cardH - 6);
          const cardX = Math.max(4, Math.min(anchorX, VW - cardW - 4));
          const cardY = Math.max(4, Math.min(anchorY, VH - cardH - 4));
          return (
            <g style={{ pointerEvents: 'none' }}>
              <rect x={cardX} y={cardY} width={cardW} height={cardH} rx={7}
                fill="white" stroke="#e5e7eb" strokeWidth={1}
                style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,.14))' }} />
              <text x={cardX + 11} y={cardY + 17} fontSize={10.5} fontWeight="700" fill="#111827">{wInst.label}</text>
              <line x1={cardX + 1} y1={cardY + 22} x2={cardX + cardW - 1} y2={cardY + 22} stroke="#f1f2f4" strokeWidth={1} />
              {metrics.map((col, i) => {
                const fr = checkFilter(filters[col.id], wInst[col.id]);
                const vc = fr === 'fail' ? '#f59e0b' : fr === 'pass' ? '#16a34a' : '#374151';
                return (
                  <g key={col.id}>
                    <text x={cardX + 11} y={cardY + 31 + i * rowH} fontSize={9} fill="#9ca3af">{col.label}</text>
                    {fr === 'fail' && <circle cx={cardX + cardW - 20} cy={cardY + 27 + i * rowH} r={5} fill="#f59e0b" />}
                    {fr === 'pass' && <circle cx={cardX + cardW - 20} cy={cardY + 27 + i * rowH} r={5} fill="#22c55e" />}
                    <text x={fr ? cardX + cardW - 28 : cardX + cardW - 10} y={cardY + 31 + i * rowH}
                      fontSize={10} fill={vc} textAnchor="end" fontFamily="ui-monospace, monospace" fontWeight={fr ? '600' : '400'}>
                      {wInst[col.id]}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        }

        // ── Apartment hover card ───────────────────────────────────────────────
        const entry = APT_INSTANCE_MAP[hoveredApt];
        if (!entry) return null;
        const apt = apartments.find(a => a.id === hoveredApt);
        if (!apt) return null;
        const px = toX(apt.poly.x / 8), py = toY(apt.poly.y / 5);
        const pw = toX(apt.poly.w / 8), ph = toY(apt.poly.h / 5);
        const { inst, elementId } = entry;
        const element = elements?.find(e => e.id === elementId);
        const metricFilters = element?.metricFilters ?? {};
        const metrics = RESULT_COLS.filter(c => inst[c.id] != null);
        const cardH = 30 + metrics.length * rowH;
        const cardX = px + pw + 8 > VW - cardW ? px - cardW - 8 : px + pw + 8;
        const cardY = Math.min(py, VH - cardH - 4);
        return (
          <g style={{ pointerEvents: 'none' }}>
            <rect x={cardX} y={cardY} width={cardW} height={cardH} rx={7}
              fill="white" stroke="#e5e7eb" strokeWidth={1}
              style={{ filter: 'drop-shadow(0 4px 16px rgba(0,0,0,.14))' }} />
            <text x={cardX + 11} y={cardY + 17} fontSize={10.5} fontWeight="700" fill="#111827">{inst.label}</text>
            <line x1={cardX + 1} y1={cardY + 22} x2={cardX + cardW - 1} y2={cardY + 22} stroke="#f1f2f4" strokeWidth={1} />
            {metrics.map((col, i) => {
              const filterResult = checkFilter(metricFilters[col.id], inst[col.id]);
              const valColor = filterResult === 'fail' ? '#f59e0b' : filterResult === 'pass' ? '#16a34a' : '#374151';
              return (
                <g key={col.id}>
                  <text x={cardX + 11} y={cardY + 31 + i * rowH} fontSize={9} fill="#9ca3af">{col.label}</text>
                  {filterResult === 'fail' && (
                    <circle cx={cardX + cardW - 20} cy={cardY + 27 + i * rowH} r={5} fill="#f59e0b" />
                  )}
                  {filterResult === 'pass' && (
                    <circle cx={cardX + cardW - 20} cy={cardY + 27 + i * rowH} r={5} fill="#22c55e" />
                  )}
                  <text x={filterResult ? cardX + cardW - 28 : cardX + cardW - 10} y={cardY + 31 + i * rowH}
                    fontSize={10} fill={valColor} textAnchor="end" fontFamily="ui-monospace, monospace" fontWeight={filterResult ? '600' : '400'}>
                    {inst[col.id]}
                  </text>
                </g>
              );
            })}
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
