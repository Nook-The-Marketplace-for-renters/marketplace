import * as listingsRepo from '../repositories/listings.repository';
import type { Listing } from '../../src/types';
import type { NewListingInput } from '../repositories/listings.repository';

export class ForbiddenError extends Error {}
export class ValidationError extends Error {}

export function listPublicListings(): Promise<Listing[]> {
  return listingsRepo.findAllListings();
}

export function listMyListings(userId: string): Promise<Listing[]> {
  return listingsRepo.findListingsByOwner(userId);
}

function validateNewListing(input: NewListingInput): void {
  if (!input.title?.trim()) throw new ValidationError('Title is required.');
  if (!input.address?.trim()) throw new ValidationError('Address is required.');
  if (!input.neighbourhood?.trim()) throw new ValidationError('Neighbourhood is required.');
  if (!input.unitSize?.trim()) throw new ValidationError('Unit size is required.');
  if (!Number.isFinite(input.baths) || input.baths <= 0) throw new ValidationError('Bathrooms must be greater than 0.');
  if (!Number.isFinite(input.priceMonthly) || input.priceMonthly <= 0) {
    throw new ValidationError('Monthly rent must be greater than 0.');
  }
  if (!input.available?.trim()) throw new ValidationError('Availability is required.');
  if (!input.description?.trim()) throw new ValidationError('Description is required.');
  if (input.photos.length === 0) throw new ValidationError('At least one photo is required.');
}

export function createListing(input: NewListingInput, ownerId: string): Promise<Listing> {
  validateNewListing(input);
  return listingsRepo.insertListing(input, ownerId);
}

export async function deleteListing(listingId: string, userId: string): Promise<void> {
  const ownerId = await listingsRepo.findListingOwnerId(listingId);
  if (!ownerId) return; // already gone — deleting is idempotent
  if (ownerId !== userId) throw new ForbiddenError('You do not own this listing.');
  await listingsRepo.removeListing(listingId);
}
