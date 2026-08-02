import { supabase } from '@/lib/supabaseClient';
import type { ListingPhoto } from '@/types';

const BUCKET = 'listing-photos';

export async function uploadListingPhotos(files: File[], ownerId: string): Promise<ListingPhoto[]> {
  if (!supabase) throw new Error('Supabase is not configured.');
  const client = supabase;

  const uploads = files.map(async (file) => {
    const ext = file.name.split('.').pop();
    const path = `${ownerId}/${crypto.randomUUID()}${ext ? `.${ext}` : ''}`;
    const { error } = await client.storage.from(BUCKET).upload(path, file, { upsert: false });
    if (error) throw error;
    const { data } = client.storage.from(BUCKET).getPublicUrl(path);
    return { url: data.publicUrl, name: file.name };
  });

  return Promise.all(uploads);
}
