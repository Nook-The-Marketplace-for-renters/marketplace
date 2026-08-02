import { apiFetch } from '@/lib/apiClient';
import type { Lead } from '@/types';

export function createRequest(listingId: string, lead: Lead): Promise<void> {
  return apiFetch('/api/requests', { method: 'POST', body: JSON.stringify({ listingId, ...lead }) });
}

export function fetchRequestsForListings(listingIds: string[]): Promise<Record<string, Lead[]>> {
  if (listingIds.length === 0) return Promise.resolve({});
  const qs = new URLSearchParams({ listingIds: listingIds.join(',') });
  return apiFetch(`/api/requests?${qs}`);
}
