import { supabase } from '@/lib/supabaseClient';
import type { OwnerProfile } from '@/types';

interface ProfileRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  picture_url: string | null;
}

function mapProfile(row: ProfileRow): OwnerProfile {
  return {
    name: row.name,
    email: row.email,
    phone: row.phone ?? undefined,
    picture: row.picture_url ?? undefined,
  };
}

export async function fetchProfile(userId: string): Promise<OwnerProfile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email, phone, picture_url')
    .eq('id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return mapProfile(data);
}

// Self-heals an account whose profile row never got created (e.g. it signed
// up before the auto-create trigger existed in the DB).
export async function upsertOwnProfile(
  userId: string,
  defaults: { name: string; email: string; picture?: string }
): Promise<OwnerProfile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, name: defaults.name, email: defaults.email, picture_url: defaults.picture ?? null })
    .select('id, name, email, phone, picture_url')
    .single();
  if (error || !data) return null;
  return mapProfile(data);
}

export async function updateProfile(userId: string, patch: Partial<Pick<OwnerProfile, 'name' | 'phone'>>): Promise<void> {
  if (!supabase) return;
  const row: Record<string, string> = {};
  if (patch.name !== undefined) row.name = patch.name;
  if (patch.phone !== undefined) row.phone = patch.phone;
  if (Object.keys(row).length === 0) return;
  const { error } = await supabase.from('profiles').update(row).eq('id', userId);
  if (error) throw error;
}
