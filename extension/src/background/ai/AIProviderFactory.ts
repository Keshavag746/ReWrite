import { RewriteMode, RewriteResponse } from '../../shared/types/index';
import { getStoredJWT } from '../auth/googleAuth';

const BACKEND_URL = 'https://rewrite-8jxg.onrender.com';

export async function rewriteWithFallback(
  text: string,
  mode: RewriteMode,
  _preferredModel?: string,
  customPrompt?: string
): Promise<RewriteResponse> {
  const jwt = await getStoredJWT();
  const res = await fetch(`${BACKEND_URL}/api/rewrite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({ text, mode, customPrompt }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? `Rewrite failed with status ${res.status}`);
  }

  const data = await res.json() as { output: string; modelUsed: string; tokensUsed?: number };
  return {
    output: data.output,
    modelUsed: 'gpt-oss-120b',
    tokensUsed: data.tokensUsed,
  };
}
