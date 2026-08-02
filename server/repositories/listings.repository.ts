import { supabaseAdmin } from '../lib/supabaseAdmin';
import type { Listing, ListingPhoto, OwnerProfile, PropertyType } from '../../src/types';

interface ListingRow {
  id: string;
  title: string;
  address: string;
  neighbourhood: string;
  type: PropertyType;
  unit_size: string;
  baths: number;
  sqft: number | null;
  price_monthly: number;
  rating: number;
  reviews: number;
  tags: string[];
  photos: ListingPhoto[];
  available: string;
  favorite: boolean;
  description: string;
  pet_policy: string | null;
  lease_term: string | null;
  profiles: { name: string; email: string; phone: string | null; picture_url: string | null } | null;
}

const SELECT_WITH_OWNER = '*, profiles!listings_owner_id_fkey(name, email, phone, picture_url)';

function mapRow(row: ListingRow): Listing {
  const owner: OwnerProfile | undefined = row.profiles
    ? {
        name: row.profiles.name,
        email: row.profiles.email,
        phone: row.profiles.phone ?? undefined,
        picture: row.profiles.picture_url ?? undefined,
      }
    : undefined;

  return {
    id: row.id,
    title: row.title,
    address: row.address,
    neighbourhood: row.neighbourhood,
    type: row.type,
    unitSize: row.unit_size,
    baths: row.baths,
    sqft: row.sqft ?? undefined,
    priceMonthly: row.price_monthly,
    rating: row.rating,
    reviews: row.reviews,
    tags: row.tags,
    photos: row.photos,
    available: row.available,
    favorite: row.favorite,
    description: row.description,
    petPolicy: row.pet_policy ?? undefined,
    leaseTerm: row.lease_term ?? undefined,
    owner,
  };
}

export async function findAllListings(): Promise<Listing[]> {
  const { data, error } = await supabaseAdmin
    .from('listings')
    .select(SELECT_WITH_OWNER)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as unknown as ListingRow[]).map(mapRow);
}

export async function findListingsByOwner(ownerId: string): Promise<Listing[]> {
  const { data, error } = await supabaseAdmin
    .from('listings')
    .select(SELECT_WITH_OWNER)
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as unknown as ListingRow[]).map(mapRow);
}

export async function findListingOwnerId(listingId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin.from('listings').select('owner_id').eq('id', listingId).maybeSingle();
  if (error) throw error;
  return data?.owner_id ?? null;
}

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

export async function insertListing(input: NewListingInput, ownerId: string): Promise<Listing> {
  const { data, error } = await supabaseAdmin
    .from('listings')
    .insert({
      owner_id: ownerId,
      title: input.title,
      address: input.address,
      neighbourhood: input.neighbourhood,
      type: input.type,
      unit_size: input.unitSize,
      baths: input.baths,
      sqft: input.sqft ?? null,
      price_monthly: input.priceMonthly,
      tags: input.tags,
      photos: input.photos,
      available: input.available,
      description: input.description,
      pet_policy: input.petPolicy ?? null,
      lease_term: input.leaseTerm ?? null,
    })
    .select(SELECT_WITH_OWNER)
    .single();
  if (error) throw error;
  return mapRow(data as unknown as ListingRow);
}

export async function removeListing(listingId: string): Promise<void> {
  const { error } = await supabaseAdmin.from('listings').delete().eq('id', listingId);
  if (error) throw error;
}
