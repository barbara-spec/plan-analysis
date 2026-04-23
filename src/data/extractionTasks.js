// Fixed metrics available for any extraction task
export const METRICS = [
  { id: 'surface',      label: 'Surface' },
  { id: 'length_max',   label: 'Longueur max' },
  { id: 'length_min',   label: 'Longueur min' },
  { id: 'width_max',    label: 'Largeur max' },
  { id: 'width_min',    label: 'Largeur min' },
];

const ALL_METRIC_IDS = METRICS.map(m => m.id);

export const extractionTasks = [
  {
    id: 'ext_logements',
    label: 'Logements',
    icon: '🏠',
    description: 'Labels de type (T1–T5) + métriques associées',
    method: 'spatial_text',
    anchorHint: 'Cliquez sur un label de logement (T1–T5) sur le plan',
    metrics: ALL_METRIC_IDS,
    drivenBy: [{ id: 'r_surface', label: 'Surface min. par type' }],
  },
  {
    id: 'ext_portes',
    label: 'Portes',
    icon: '🚪',
    description: 'Ouvertures — métriques mesurées par vision',
    method: 'cv',
    metrics: ALL_METRIC_IDS,
    drivenBy: [
      { id: 'r_porte_entree',       label: "Porte d'entrée ≥ 0.90m" },
      { id: 'r_portes_interieures', label: 'Portes intérieures ≥ 0.80m' },
    ],
  },
  {
    id: 'ext_stationnement',
    label: 'Places PMR',
    icon: '🅿',
    description: 'Places de stationnement accessibles — marquage sol',
    method: 'cv',
    metrics: ALL_METRIC_IDS,
    drivenBy: [{ id: 'r_pmr_parking', label: 'Place PMR ≥ 3.30m largeur' }],
  },
];
