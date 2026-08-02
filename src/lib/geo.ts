export interface Coords {
  lat: number;
  lng: number;
}

export const MONTREAL_CENTER: Coords = { lat: 45.5019, lng: -73.5674 };

const NEIGHBOURHOOD_COORDS: Record<string, Coords> = {
  'Le Plateau-Mont-Royal': { lat: 45.5234, lng: -73.582 },
  'Mile End': { lat: 45.5227, lng: -73.6033 },
  Griffintown: { lat: 45.4924, lng: -73.5614 },
  Villeray: { lat: 45.5477, lng: -73.6198 },
  'Hochelaga-Maisonneuve': { lat: 45.5517, lng: -73.5378 },
  Ahuntsic: { lat: 45.5591, lng: -73.6535 },
};

export function coordsForNeighbourhood(neighbourhood: string): Coords {
  return NEIGHBOURHOOD_COORDS[neighbourhood] ?? MONTREAL_CENTER;
}
