import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuthHeader } from '../../server/lib/auth';
import { sendError } from '../../server/lib/respond';
import { listMyListings } from '../../server/services/listings.service';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const user = await verifyAuthHeader(req.headers.authorization);
  if (!user) {
    res.status(401).json({ error: 'Sign in required.' });
    return;
  }

  try {
    res.status(200).json(await listMyListings(user.userId));
  } catch (err) {
    sendError(res, err);
  }
}
