import * as listingsRepo from '../repositories/listings.repository';
import * as requestsRepo from '../repositories/requests.repository';
import { ValidationError } from './listings.service';
import type { Lead } from '../../src/types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendRequest(listingId: string, lead: Lead): Promise<void> {
  if (!listingId) throw new ValidationError('listingId is required.');
  if (!lead.name?.trim()) throw new ValidationError('Name is required.');
  if (!lead.email || !EMAIL_RE.test(lead.email)) throw new ValidationError('A valid email is required.');
  await requestsRepo.insertRequest(listingId, lead);
}

// Only returns requests for listings the caller actually owns — any ids in
// listingIds that aren't theirs are silently dropped rather than erroring.
export async function listRequestsForOwner(listingIds: string[], userId: string): Promise<Record<string, Lead[]>> {
  const myListings = await listingsRepo.findListingsByOwner(userId);
  const myIds = new Set(myListings.map((l) => l.id));
  const allowedIds = listingIds.filter((id) => myIds.has(id));
  return requestsRepo.findRequestsByListingIds(allowedIds);
}
