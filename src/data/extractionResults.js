// Metric columns shown in the results table (no count/parent)
export const RESULT_COLS = [
  { id: 'surface',   label: 'Surface' },
  { id: 'maxLength', label: 'Max Length' },
  { id: 'maxWidth',  label: 'Max Width' },
  { id: 'minLength', label: 'Min Length' },
  { id: 'minWidth',  label: 'Min Width' },
];

// Mock extracted instances keyed by element type id
export const EXTRACTION_RESULTS = {
  rooms: [
    { id: 'r1', planRef: 'A101', label: 'T3 — A101', surface: '62 m²', maxLength: '520 cm', maxWidth: '380 cm', minLength: '280 cm', minWidth: '240 cm' },
    { id: 'r2', planRef: 'A201', label: 'T4 — A201', surface: '78 m²', maxLength: '580 cm', maxWidth: '410 cm', minLength: '310 cm', minWidth: '260 cm' },
    { id: 'r3', planRef: 'A301', label: 'T2 — A301', surface: '45 m²', maxLength: '420 cm', maxWidth: '320 cm', minLength: '240 cm', minWidth: '200 cm' },
    { id: 'r4', planRef: 'A102', label: 'T2 — A102', surface: '47 m²', maxLength: '430 cm', maxWidth: '325 cm', minLength: '245 cm', minWidth: '205 cm' },
    { id: 'r5', planRef: 'A202', label: 'T3 — A202', surface: '64 m²', maxLength: '525 cm', maxWidth: '385 cm', minLength: '285 cm', minWidth: '245 cm' },
    { id: 'r6', planRef: 'A302', label: 'T1 — A302', surface: '32 m²', maxLength: '350 cm', maxWidth: '280 cm', minLength: '210 cm', minWidth: '180 cm' },
  ],
  doors: [
    { id: 'd1', planRef: 'dA101_1', label: 'Porte A101',   surface: null, maxLength: '220 cm', maxWidth: '110 cm', minLength: '200 cm', minWidth: '90 cm' },
    { id: 'd2', planRef: 'dA201_1', label: 'Porte A201-1', surface: null, maxLength: '215 cm', maxWidth: '90 cm',  minLength: '195 cm', minWidth: '83 cm' },
    { id: 'd3', planRef: 'dA201_2', label: 'Porte A201-2', surface: null, maxLength: '220 cm', maxWidth: '100 cm', minLength: '200 cm', minWidth: '80 cm' },
    { id: 'd4', planRef: 'dA301_1', label: 'Porte A301',   surface: null, maxLength: '220 cm', maxWidth: '110 cm', minLength: '200 cm', minWidth: '90 cm' },
    { id: 'd5', planRef: 'dA102_1', label: 'Porte A102',   surface: null, maxLength: '215 cm', maxWidth: '95 cm',  minLength: '195 cm', minWidth: '83 cm' },
    { id: 'd6', planRef: 'dA202_1', label: 'Porte A202',   surface: null, maxLength: '220 cm', maxWidth: '100 cm', minLength: '200 cm', minWidth: '80 cm' },
    { id: 'd7', planRef: 'dA302_1', label: 'Porte A302',   surface: null, maxLength: '215 cm', maxWidth: '90 cm',  minLength: '195 cm', minWidth: '80 cm' },
  ],
  windows: [
    { id: 'w1',  planRef: 'wA101_1', label: 'Fenêtre A101 — F01', surface: null, maxWidth: '120 cm', minWidth: '120 cm', maxLength: '135 cm', minLength: '135 cm' },
    { id: 'w2',  planRef: 'wA101_2', label: 'Fenêtre A101 — F02', surface: null, maxWidth: '90 cm',  minWidth: '90 cm',  maxLength: '135 cm', minLength: '135 cm' },
    { id: 'w3',  planRef: 'wA201_1', label: 'Fenêtre A201 — F01', surface: null, maxWidth: '150 cm', minWidth: '150 cm', maxLength: '135 cm', minLength: '135 cm' },
    { id: 'w4',  planRef: 'wA201_2', label: 'Fenêtre A201 — F02', surface: null, maxWidth: '150 cm', minWidth: '150 cm', maxLength: '135 cm', minLength: '135 cm' },
    { id: 'w5',  planRef: 'wA301_1', label: 'Fenêtre A301 — F01', surface: null, maxWidth: '120 cm', minWidth: '120 cm', maxLength: '135 cm', minLength: '135 cm' },
    { id: 'w6',  planRef: 'wA301_2', label: 'Fenêtre A301 — F02', surface: null, maxWidth: '90 cm',  minWidth: '90 cm',  maxLength: '135 cm', minLength: '135 cm' },
    { id: 'w7',  planRef: 'wA102_1', label: 'Fenêtre A102 — F01', surface: null, maxWidth: '120 cm', minWidth: '120 cm', maxLength: '135 cm', minLength: '135 cm' },
    { id: 'w8',  planRef: 'wA102_2', label: 'Fenêtre A102 — F02', surface: null, maxWidth: '90 cm',  minWidth: '90 cm',  maxLength: '135 cm', minLength: '135 cm' },
    { id: 'w9',  planRef: 'wA202_1', label: 'Fenêtre A202 — F01', surface: null, maxWidth: '120 cm', minWidth: '120 cm', maxLength: '135 cm', minLength: '135 cm' },
    { id: 'w10', planRef: 'wA202_2', label: 'Fenêtre A202 — F02', surface: null, maxWidth: '120 cm', minWidth: '120 cm', maxLength: '135 cm', minLength: '135 cm' },
    { id: 'w11', planRef: 'wA302_1', label: 'Fenêtre A302 — F01', surface: null, maxWidth: '120 cm', minWidth: '120 cm', maxLength: '135 cm', minLength: '135 cm' },
    { id: 'w12', planRef: 'wA302_2', label: 'Fenêtre A302 — F02', surface: null, maxWidth: '90 cm',  minWidth: '90 cm',  maxLength: '135 cm', minLength: '135 cm' },
  ],
  parking: [
    { id: 'p1', label: 'Place PMR 1', surface: null, maxLength: '500 cm', maxWidth: '360 cm', minLength: '480 cm', minWidth: '330 cm' },
    { id: 'p2', label: 'Place PMR 2', surface: null, maxLength: '500 cm', maxWidth: '360 cm', minLength: '480 cm', minWidth: '330 cm' },
  ],
};

// Maps element type id → extraction task id
export const ELEMENT_TASK_MAP = {
  rooms:   'ext_logements',
  doors:   'ext_portes',
  windows: 'ext_fenetres',
  parking: 'ext_stationnement',
};
