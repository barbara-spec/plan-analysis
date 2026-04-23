export const METRIC_LABELS = [
  { id: 'count',     label: 'Count' },
  { id: 'surface',   label: 'Surface' },
  { id: 'maxWidth',  label: 'Max Width' },
  { id: 'minWidth',  label: 'Min Width' },
  { id: 'minLength', label: 'Min Length' },
  { id: 'maxLength', label: 'Max Length' },
];

export const elementTypes = [
  {
    id: 'doors',
    label: 'Portes',
    method: 'vision',
    visionCapable: true,
    inScope: true,
    rules: [
      { id: 'r_porte_entree',       label: "Porte d'entrée > 90cm de largeur",   active: true },
      { id: 'r_portes_interieures', label: 'Porte intérieur > 80cm de largeur',  active: true },
    ],
    metrics: { count: false, surface: false, maxWidth: false, minWidth: true, minLength: false, maxLength: false, parent: false },
  },
  {
    id: 'rooms',
    label: 'Logements',
    method: 'text',
    visionCapable: true,
    inScope: true,
    rules: [
      { id: 'r_surface_ch',   label: 'Surface des chambres simples > 11m2',                                    active: true },
      { id: 'r_hsp_sdb',      label: 'Hauteur sous plafond > 250cm dans SdB',                                  active: true },
      { id: 'r_hsp_cuisine',  label: 'Hauteur sous plafond > 250cm dans Cuisine',                              active: true },
      { id: 'r_eclairage',    label: 'Calcul surface éclairante : surface fenêtre = 1/5 de la surface totale', active: true },
    ],
    metrics: { count: false, surface: true, maxWidth: false, minWidth: false, minLength: false, maxLength: false, parent: false },
  },
  {
    id: 'windows',
    label: 'Fenêtres',
    method: 'vision',
    visionCapable: true,
    inScope: true,
    rules: [
      { id: 'r_eclairage_w',  label: 'Calcul surface éclairante : surface fenêtre = 1/5 de la surface totale', active: true },
    ],
    metrics: { count: false, surface: false, maxWidth: false, minWidth: true, minLength: false, maxLength: false, parent: false },
  },
  {
    id: 'walls',
    label: 'Cloisons',
    method: 'text',
    inScope: true,
    rules: [
      { id: 'r_cloisons',    label: 'Dimensions des cloisons inter-appartement > 66mm', active: true },
    ],
    metrics: { count: false, surface: false, maxWidth: false, minWidth: true, minLength: false, maxLength: false, parent: false },
  },
  {
    id: 'stairs',
    label: 'Escaliers',
    method: 'vision',
    inScope: false,
    rules: [
      { id: 'r_marche',       label: 'Hauteur de marche ≤ 17cm',    active: true },
      { id: 'r_giron',        label: 'Giron ≥ 28cm',                active: true },
    ],
    metrics: { count: false, surface: false, maxWidth: false, minWidth: false, minLength: false, maxLength: false, parent: false },
  },
];
