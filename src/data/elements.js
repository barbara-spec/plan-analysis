export const elementConfig = [
  { id: 'chambre', name: 'Chambre', color: '#f59e0b',
    method: 'text', metrics: ['count', 'surface', 'min_surface'],
    relatedRules: 3 },
  { id: 'porte', name: 'Porte', color: '#3b82f6',
    method: 'cv', metrics: ['count', 'largeur', 'hauteur'],
    relatedRules: 2 },
  { id: 'fenetre', name: 'Fenêtre', color: '#8b5cf6',
    method: 'cv', metrics: ['count', 'largeur', 'min_largeur'],
    hasParent: true, parentType: 'chambre',
    availableParents: ['Chambre 1', 'Chambre 2', 'Chambre 3', 'Séjour', 'Cuisine'],
    relatedRules: 2 },
  { id: 'cuisine', name: 'Cuisine', color: '#10b981',
    method: 'text', metrics: ['count', 'surface'],
    relatedRules: 1 },
];

export const predefinedMetrics = [
  { id: 'count',        label: 'count',         desc: 'Nombre total' },
  { id: 'surface',      label: 'surface',        desc: 'Surface en m²' },
  { id: 'min_surface',  label: 'surface min.',   desc: 'Surface minimale' },
  { id: 'largeur',      label: 'largeur',        desc: 'Largeur en m' },
  { id: 'min_largeur',  label: 'largeur min.',   desc: 'Largeur minimale' },
  { id: 'hauteur',      label: 'hauteur',        desc: 'Hauteur en m' },
  { id: 'longueur',     label: 'longueur',       desc: 'Longueur en m' },
  { id: 'min_longueur', label: 'longueur min.',  desc: 'Longueur minimale' },
  { id: 'perimetre',    label: 'périmètre',      desc: 'Périmètre en m' },
];

export const plans = [
  { name: 'Bâtiment A — RDC.pdf', pages: 3, size: '4.2 MB', scales: [100, null, null] },
  { name: 'Bâtiment A — R+1.pdf', pages: 2, size: '3.8 MB', scales: [100, null] },
  { name: 'Bâtiment B — RDC.pdf', pages: 1, size: '5.1 MB', scales: [100] },
];
