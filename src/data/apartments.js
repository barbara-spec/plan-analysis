export const THRESHOLDS = { T1: 24, T2: 40, T3: 54, T4: 68, T5: 85 };

// Each apartment: position on the SVG (800×500 viewBox), type, detected surface, confidence
// windows: { id, code, side: top|bottom|left|right, offset (from near corner), w (SVG units), dims ('120×135') }
// doors:   { id, side, offset, w (SVG units), swing: left|right (which side the hinge is on) }
export const apartments = [
  {
    id: 'A101', ref: 'A101', type: 'T3', surface: 54.2, conf: 91,
    rawOcr: '54.2 m²',
    poly: { x: 5, y: 5, w: 255, h: 210 },
    windows: [
      { id: 'wA101_1', code: 'F01', side: 'top', offset: 32,  w: 62, dims: '120×135' },
      { id: 'wA101_2', code: 'F02', side: 'top', offset: 155, w: 52, dims: '90×135'  },
    ],
    doors: [
      { id: 'dA101_1', side: 'bottom', offset: 98, w: 36, swing: 'right' },
    ],
  },
  {
    id: 'A201', ref: 'A201', type: 'T4', surface: 70.5, conf: 96,
    rawOcr: '70.5 m²',
    poly: { x: 270, y: 5, w: 255, h: 210 },
    windows: [
      { id: 'wA201_1', code: 'F01', side: 'top', offset: 22,  w: 72, dims: '150×135' },
      { id: 'wA201_2', code: 'F02', side: 'top', offset: 152, w: 72, dims: '150×135' },
    ],
    doors: [
      { id: 'dA201_1', side: 'bottom', offset: 96, w: 36, swing: 'right' },
    ],
  },
  {
    id: 'A301', ref: 'A301', type: 'T2', surface: 41.0, conf: 89,
    rawOcr: '41.0 m²',
    poly: { x: 535, y: 5, w: 260, h: 210 },
    windows: [
      { id: 'wA301_1', code: 'F01', side: 'top',   offset: 38, w: 58, dims: '120×135' },
      { id: 'wA301_2', code: 'F02', side: 'right',  offset: 55, w: 50, dims: '90×135'  },
    ],
    doors: [
      { id: 'dA301_1', side: 'bottom', offset: 108, w: 36, swing: 'left' },
    ],
  },
  {
    id: 'A102', ref: 'A102', type: 'T2', surface: 38.1, conf: 88,
    rawOcr: '38.1 m²',
    poly: { x: 5, y: 285, w: 255, h: 210 },
    windows: [
      { id: 'wA102_1', code: 'F01', side: 'bottom', offset: 38,  w: 58, dims: '120×135' },
      { id: 'wA102_2', code: 'F02', side: 'bottom', offset: 152, w: 52, dims: '90×135'  },
    ],
    doors: [
      { id: 'dA102_1', side: 'top', offset: 98, w: 36, swing: 'right' },
    ],
  },
  {
    id: 'A202', ref: 'A202', type: 'T3', surface: 52.1, conf: 72,
    rawOcr: '52. 1 m²',
    poly: { x: 270, y: 285, w: 255, h: 210 },
    windows: [
      { id: 'wA202_1', code: 'F01', side: 'bottom', offset: 22,  w: 68, dims: '120×135' },
      { id: 'wA202_2', code: 'F02', side: 'bottom', offset: 158, w: 68, dims: '120×135' },
    ],
    doors: [
      { id: 'dA202_1', side: 'top', offset: 96, w: 36, swing: 'right' },
    ],
  },
  {
    id: 'A302', ref: 'A302', type: 'T1', surface: 25.3, conf: 94,
    rawOcr: '25.3 m²',
    poly: { x: 535, y: 285, w: 260, h: 210 },
    windows: [
      { id: 'wA302_1', code: 'F01', side: 'bottom', offset: 78, w: 68, dims: '120×135' },
      { id: 'wA302_2', code: 'F02', side: 'right',  offset: 55, w: 52, dims: '90×135'  },
    ],
    doors: [
      { id: 'dA302_1', side: 'top', offset: 110, w: 36, swing: 'left' },
    ],
  },
];

export function aptStatus(apt, overrides = {}) {
  if (overrides[apt.id] === 'ignored') return 'ignored';
  if (overrides[apt.id] === 'override') return 'override';
  if (overrides[apt.id] === 'confirmed') return apt.surface >= THRESHOLDS[apt.type] ? 'pass' : 'fail_confirmed';
  const threshold = THRESHOLDS[apt.type];
  if (apt.conf < 80) return 'review';
  return apt.surface >= threshold ? 'pass' : 'fail';
}

export function aptDelta(apt, editedValues = {}) {
  const s = editedValues[apt.id] ?? apt.surface;
  const t = THRESHOLDS[apt.type];
  return +(s - t).toFixed(1);
}
