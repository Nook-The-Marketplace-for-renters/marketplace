import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuthHeader } from '../../server/lib/auth';
import { sendError } from '../../server/lib/respond';
import { deleteListing } from '../../server/services/listings.service';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE');
    res.status(405).json({ error: 'Method not allowed.' });
    return;
  }

  const user = await verifyAuthHeader(req.headers.authorization);
  if (!user) {
    res.status(401).json({ error: 'Sign in required.' });
    return;
  }

  const id = req.query.id;
  if (typeof id !== 'string') {
    res.status(400).json({ error: 'Invalid listing id.' });
    return;
  }

  try {
    await deleteListing(id, user.userId);
    res.status(204).end();
  } catch (err) {
    sendError(res, err);
  }
}
