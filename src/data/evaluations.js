import { TRACKS } from './checklistRules';

export function trackMeta(trackId) {
  return TRACKS.find(t => t.id === trackId) ?? { color: '#f1f2f4', text: '#636464' };
}

export const AI_EVALUATIONS = [
  {
    id: 'eval_B12',
    ruleId: 'B.1.2',
    ruleCode: 'Art. R. 111-2',
    ruleName: 'Surface minimale T2',
    track: 'B',
    status: 'fail',
    observation: 'Un logement T2 est en dessous du seuil réglementaire de 40 m².',
    nonCompliantElements: [
      { id: 'A102', detail: 'A102 — 38,1 m² mesuré, 40 m² requis (−1,9 m²)' },
    ],
  },
  {
    id: 'eval_B13',
    ruleId: 'B.1.3',
    ruleCode: 'Art. R. 111-2',
    ruleName: 'Surface minimale T3',
    track: 'B',
    status: 'fail',
    observation: 'Un logement T3 est en dessous du seuil réglementaire de 54 m².',
    nonCompliantElements: [
      { id: 'A202', detail: 'A202 — 52,1 m² mesuré, 54 m² requis (−1,9 m²)' },
    ],
  },
  {
    id: 'eval_A21',
    ruleId: 'A.2.1',
    ruleCode: '33.16.50.1',
    ruleName: 'Largeur de passage minimale',
    track: 'A',
    status: 'fail',
    observation: '2 portes intérieures ne respectent pas le seuil PMR de 0,90 m.',
    nonCompliantElements: [
      { id: 'A101', detail: 'PI-A101-2 — 0,78 m mesuré, 0,90 m requis (−12 cm)' },
      { id: 'A102', detail: 'PI-A102-1 — 0,72 m mesuré, 0,90 m requis (−18 cm)' },
    ],
  },
  {
    id: 'eval_D12',
    ruleId: 'D.1.2',
    ruleCode: 'Art. R. 111-8',
    ruleName: 'Éclairage naturel — ratio 1/6',
    track: 'D',
    status: 'fail',
    observation: '2 logements ne respectent pas le ratio fenêtre/surface de 1/6.',
    nonCompliantElements: [
      { id: 'A201', detail: 'A201 — ratio 1/9,2 mesuré, 1/6 requis (−35 %)' },
      { id: 'A302', detail: 'A302 — ratio 1/8,7 mesuré, 1/6 requis (−31 %)' },
    ],
  },
];
