const LOUAI_URL = import.meta.env.VITE_ASK_LOUAI_URL as string | undefined;

export interface LouAiMatch {
  field: string;
  text: string;
  score: number;
}

export interface LouAiAnswer {
  answer: string;
  confident: boolean;
  matches: LouAiMatch[];
}

export async function askLouAi(listingId: string, question: string): Promise<LouAiAnswer> {
  if (!LOUAI_URL) throw new Error('LouAI is not configured (VITE_ASK_LOUAI_URL is unset).');

  const res = await fetch(`${LOUAI_URL}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listing_id: listingId, question }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<LouAiAnswer>;
}
