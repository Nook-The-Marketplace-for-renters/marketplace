import { apiFetch } from '@/lib/apiClient';
import type { Listing, ListingPhoto, PropertyType } from '@/types';

export interface NewListingInput {
  title: string;
  address: string;
  neighbourhood: string;
  type: PropertyType;
  unitSize: string;
  baths: number;
  sqft?: number;
  priceMonthly: number;
  tags: string[];
  photos: ListingPhoto[];
  available: string;
  description: string;
  petPolicy?: string;
  leaseTerm?: string;
}

export function fetchListings(): Promise<Listing[]> {
  return apiFetch('/api/listings');
}

export function fetchMyListings(): Promise<Listing[]> {
  return apiFetch('/api/listings/mine');
}

export function createListing(input: NewListingInput): Promise<Listing> {
  return apiFetch('/api/listings', { method: 'POST', body: JSON.stringify(input) });
}

export function deleteListing(id: string): Promise<void> {
  return apiFetch(`/api/listings/${id}`, { method: 'DELETE' });
}
