export const detections = {
  chambre: [
    { id: 1, name: 'Chambre 1', conf: 97, surface: 12.4,
      poly: { x: 5, y: 5, w: 22, h: 38 } },
    { id: 2, name: 'Chambre 2', conf: 94, surface: 11.8,
      poly: { x: 5, y: 55, w: 22, h: 35 } },
    { id: 3, name: 'Chambre 3', conf: 71, surface: 10.9,
      poly: { x: 68, y: 45, w: 27, h: 45 } },
    { id: 4, name: 'Bureau', conf: 74, surface: 8.3,
      poly: { x: 30, y: 45, w: 36, h: 35 } },
  ],
  porte: [
    { id: 1, name: 'Porte P1', conf: 88, largeur: 0.83,
      poly: { x: 27, y: 40, w: 5, h: 4 } },
    { id: 2, name: 'Porte P2', conf: 75, largeur: 0.78,
      poly: { x: 27, y: 53, w: 5, h: 4 } },
    { id: 3, name: 'Porte P3', conf: 52, largeur: 0.72,
      poly: { x: 64, y: 40, w: 5, h: 4 } },
  ],
  fenetre: [
    { id: 1, name: 'Fenêtre F1', conf: 91, largeur: 1.20, parent: 'Chambre 1',
      poly: { x: 3, y: 18, w: 2, h: 10 } },
    { id: 2, name: 'Fenêtre F2', conf: 83, largeur: 0.60, parent: 'Chambre 3',
      poly: { x: 3, y: 62, w: 2, h: 10 } },
    { id: 3, name: 'Fenêtre F3', conf: 60, largeur: 0.90, parent: 'Séjour',
      poly: { x: 30, y: 3, w: 15, h: 2 } },
  ],
  cuisine: [
    { id: 1, name: 'Cuisine', conf: 99, surface: 9.2,
      poly: { x: 68, y: 5, w: 27, h: 25 } },
  ],
};
