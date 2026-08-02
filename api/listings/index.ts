import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuthHeader } from '../../server/lib/auth';
import { sendError } from '../../server/lib/respond';
import { createListing, listPublicListings } from '../../server/services/listings.service';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      res.status(200).json(await listPublicListings());
    } catch (err) {
      sendError(res, err);
    }
    return;
  }

  if (req.method === 'POST') {
    const user = await verifyAuthHeader(req.headers.authorization);
    if (!user) {
      res.status(401).json({ error: 'Sign in required.' });
      return;
    }
    try {
      const listing = await createListing(req.body, user.userId);
      res.status(201).json(listing);
    } catch (err) {
      sendError(res, err);
    }
    return;
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).json({ error: 'Method not allowed.' });
}
