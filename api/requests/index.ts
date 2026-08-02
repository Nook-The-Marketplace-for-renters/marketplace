import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuthHeader } from '../../server/lib/auth';
import { sendError } from '../../server/lib/respond';
import { listRequestsForOwner, sendRequest } from '../../server/services/requests.service';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { listingId, ...lead } = req.body ?? {};
    try {
      await sendRequest(listingId, lead);
      res.status(201).json({ ok: true });
    } catch (err) {
      sendError(res, err);
    }
    return;
  }

  if (req.method === 'GET') {
    const user = await verifyAuthHeader(req.headers.authorization);
    if (!user) {
      res.status(401).json({ error: 'Sign in required.' });
      return;
    }
    const raw = req.query.listingIds;
    const listingIds = typeof raw === 'string' ? raw.split(',').filter(Boolean) : [];
    try {
      res.status(200).json(await listRequestsForOwner(listingIds, user.userId));
    } catch (err) {
      sendError(res, err);
    }
    return;
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).json({ error: 'Method not allowed.' });
}
