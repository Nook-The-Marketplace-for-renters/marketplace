import type { VercelResponse } from '@vercel/node';
import { ForbiddenError, ValidationError } from '../services/listings.service';

export function sendError(res: VercelResponse, err: unknown): void {
  if (err instanceof ValidationError) {
    res.status(400).json({ error: err.message });
    return;
  }
  if (err instanceof ForbiddenError) {
    res.status(403).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
}
