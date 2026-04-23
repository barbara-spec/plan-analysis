// type: 'table' → renders as VerificationTable
//       'instances' → renders as instance list with cards
//       'manual'    → manual check only

export const rules = [
  {
    id: 'r_surface',
    section: 'Surfaces habitables',
    name: 'Surface minimale par type de logement',
    description: 'Sur chaque plan, relever la surface affichée de chaque logement (indiquée en m² sur les plans). Vérifier que T1 ≥ 24 m², T2 ≥ 40 m², T3 ≥ 54 m², T4 ≥ 68 m², T5 ≥ 85 m².',
    code: 'Art. R. 111-2',
    type: 'table',
    extractedBy: 'ext_logements',
    thresholds: { T1: 24, T2: 40, T3: 54, T4: 68, T5: 85 },
  },

  {
    id: 'r_porte_entree',
    section: 'Accessibilité — portes',
    name: "Porte d'entrée logement ≥ 0.90m",
    code: '33.16.50.1',
    type: 'instances',
    extractedBy: 'ext_portes',
    threshold: 0.90, unit: 'm',
    instances: [
      { id: 'p1', ref: 'P-A101', value: 0.93, conf: 92, pass: true },
      { id: 'p2', ref: 'P-A102', value: 0.91, conf: 88, pass: true },
      { id: 'p3', ref: 'P-A201', value: 0.90, conf: 95, pass: true },
    ],
  },

  {
    id: 'r_portes_interieures',
    section: 'Accessibilité — portes',
    name: 'Portes intérieures ≥ 0.80m',
    code: '33.16.50.9',
    type: 'instances',
    extractedBy: 'ext_portes',
    threshold: 0.80, unit: 'm',
    instances: [
      { id: 'pi1', ref: 'PI-A101-1', value: 0.83, conf: 91, pass: true },
      { id: 'pi2', ref: 'PI-A101-2', value: 0.78, conf: 89, pass: false },
      { id: 'pi3', ref: 'PI-A102-1', value: 0.72, conf: 55, pass: false },
      { id: 'pi4', ref: 'PI-A201-1', value: 0.85, conf: 93, pass: true },
    ],
  },

  {
    id: 'r_circulation',
    section: 'Accessibilité — portes',
    name: '1.20×1.70m libre devant porte',
    code: '33.16.50.10',
    type: 'manual',
    description: "Espace de manœuvre de 1.20m × 1.70m devant chaque porte côté couloir. À vérifier visuellement.",
  },

  {
    id: 'r_pmr_parking',
    section: 'Stationnement',
    name: 'Place PMR ≥ 3.30m de largeur',
    code: '33.22.10.2',
    type: 'manual',
    description: "Vérifier la présence et la largeur des places de stationnement PMR (minimum 3.30m).",
  },
];
