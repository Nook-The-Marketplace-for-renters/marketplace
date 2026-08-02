import { createRemoteJWKSet, jwtVerify } from 'jose';

const jwksUrl = process.env.SUPABASE_JWKS_URL;
if (!jwksUrl) {
  throw new Error('SUPABASE_JWKS_URL must be set for the API to verify requests.');
}

const JWKS = createRemoteJWKSet(new URL(jwksUrl));

export interface AuthedUser {
  userId: string;
  email: string;
}

export async function verifyAuthHeader(authHeader: string | undefined | null): Promise<AuthedUser | null> {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice('Bearer '.length);
  try {
    const { payload } = await jwtVerify(token, JWKS);
    if (!payload.sub) return null;
    return { userId: payload.sub, email: typeof payload.email === 'string' ? payload.email : '' };
  } catch {
    return null;
  }
}
