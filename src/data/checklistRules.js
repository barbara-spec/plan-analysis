export const TRACKS = [
  { id: 'A', label: 'Track A', color: 'rgba(121,32,238,0.12)',  text: '#7920ee' },
  { id: 'B', label: 'Track B', color: 'rgba(29,16,203,0.12)',   text: '#1d10cb' },
  { id: 'C', label: 'Track C', color: 'rgba(165,137,26,0.12)',  text: '#a5891a' },
  { id: 'D', label: 'Track D', color: 'rgba(15,116,17,0.12)',   text: '#0f7411' },
];

export const checklistRules = [
  { id: 'A.2.1', track: 'A', name: 'Largeur de passage minimale',   desc: 'Tout passage doit avoir une largeur minimale de 0.9M pour être PMR et valide.' },
  { id: 'A.2.2', track: 'A', name: 'Hauteur de passage',            desc: 'La hauteur minimale de passage doit être de 2.10M pour permettre le passage des usagers.' },
  { id: 'A.2.3', track: 'A', name: 'Éclairage',                     desc: 'Tous les passages doivent être éclairés avec un minimum de 100 lux pour garantir la sécurité.' },
  { id: 'A.2.4', track: 'A', name: 'Signalisation',                 desc: 'Une signalisation claire doit être présente pour orienter les usagers dans les passages.' },
  { id: 'A.2.5', track: 'A', name: 'Revêtement de sol',             desc: 'Le sol doit être de type antidérapant pour éviter les accidents.' },
  { id: 'A.2.6', track: 'A', name: 'Accessibilité',                 desc: 'Tous les passages doivent être accessibles aux personnes à mobilité réduite.' },
  { id: 'A.2.7', track: 'A', name: 'Sécurité incendie',             desc: 'Les passages doivent être dégagés pour permettre une évacuation rapide en cas d\'urgence.' },
  { id: 'A.2.8', track: 'A', name: 'Durabilité des matériaux',      desc: 'Les matériaux utilisés doivent résister aux intempéries et à l\'usure.' },
  { id: 'A.2.9', track: 'A', name: 'Entretien régulier',            desc: 'Un programme d\'entretien doit être mis en place pour assurer la conformité des passages.' },
  { id: 'A.3',   track: 'A', name: 'Largeur de fenêtres',           desc: 'Toute fenêtre de type RET26 doit avoir une largeur minimale de 0.9M.' },
  { id: 'B.1.1', track: 'B', name: 'Surface minimale T1',           desc: 'Un logement T1 doit avoir une surface habitable d\'au moins 24 m².' },
  { id: 'B.1.2', track: 'B', name: 'Surface minimale T2',           desc: 'Un logement T2 doit avoir une surface habitable d\'au moins 40 m².' },
  { id: 'B.1.3', track: 'B', name: 'Surface minimale T3',           desc: 'Un logement T3 doit avoir une surface habitable d\'au moins 54 m².' },
  { id: 'B.2.1', track: 'B', name: 'Hauteur sous plafond',          desc: 'La hauteur sous plafond des pièces principales doit être d\'au moins 2.5m.' },
  { id: 'C.1.1', track: 'C', name: 'Place PMR largeur',             desc: 'Chaque place PMR doit avoir une largeur d\'au moins 3.30m.' },
  { id: 'C.1.2', track: 'C', name: 'Place PMR marquage',            desc: 'Les places PMR doivent être clairement marquées au sol et signalées verticalement.' },
  { id: 'C.2.1', track: 'C', name: 'Rampe d\'accès pente',          desc: 'Les rampes d\'accès PMR ne doivent pas dépasser 5% de pente.' },
  { id: 'D.1.1', track: 'D', name: 'Ventilation naturelle',         desc: 'Chaque pièce principale doit disposer d\'une ouverture sur l\'extérieur.' },
  { id: 'D.1.2', track: 'D', name: 'Éclairage naturel',             desc: 'La surface vitrée doit représenter au moins 1/6 de la surface de la pièce.' },
  { id: 'D.2.1', track: 'D', name: 'Isolation thermique',           desc: 'Les parois extérieures doivent respecter les valeurs de résistance thermique RT2020.' },
];

// Default rules in review tray
export const DEFAULT_IN_REVIEW = new Set(['A.2.1', 'A.2.3', 'A.3']);
