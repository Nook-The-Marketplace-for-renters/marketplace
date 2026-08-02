export type PropertyType = 'Apartment' | 'Condo' | 'Loft' | 'House' | 'Studio';

export interface ListingPhoto {
  url: string;
  name?: string;
}

export interface OwnerProfile {
  name: string;
  email: string;
  phone?: string;
  picture?: string;
}

export interface Lead {
  name: string;
  email: string;
  message?: string;
  createdAt: string;
}

export interface Listing {
  id: string;
  title: string;
  address: string;
  neighbourhood: string;
  type: PropertyType;
  unitSize: string;
  baths: number;
  sqft?: number;
  priceMonthly: number;
  rating: number;
  reviews: number;
  tags: string[];
  photos: ListingPhoto[];
  available: string;
  favorite?: boolean;
  description: string;
  petPolicy?: string;
  leaseTerm?: string;
  owner?: OwnerProfile;
}
