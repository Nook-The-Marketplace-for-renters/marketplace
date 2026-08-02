import { supabaseAdmin } from '../lib/supabaseAdmin';
import type { Lead } from '../../src/types';

interface RequestRow {
  listing_id: string;
  name: string;
  email: string;
  message: string | null;
  created_at: string;
}

export async function insertRequest(listingId: string, lead: Lead): Promise<void> {
  const { error } = await supabaseAdmin.from('requests').insert({
    listing_id: listingId,
    name: lead.name,
    email: lead.email,
    message: lead.message ?? null,
  });
  if (error) throw error;
}

export async function findRequestsByListingIds(listingIds: string[]): Promise<Record<string, Lead[]>> {
  if (listingIds.length === 0) return {};
  const { data, error } = await supabaseAdmin
    .from('requests')
    .select('listing_id, name, email, message, created_at')
    .in('listing_id', listingIds)
    .order('created_at', { ascending: false });
  if (error) throw error;

  const byListing: Record<string, Lead[]> = {};
  for (const row of data as RequestRow[]) {
    const lead: Lead = { name: row.name, email: row.email, message: row.message ?? undefined, createdAt: row.created_at };
    (byListing[row.listing_id] ??= []).push(lead);
  }
  return byListing;
}
