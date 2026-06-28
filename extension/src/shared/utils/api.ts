export const BACKEND_URL = 'http://140.245.6.232:3001';

async function getJWT(): Promise<string> {
  const result = await chrome.storage.local.get('ai_rewrite_jwt');
  const token = result['ai_rewrite_jwt'] as string | undefined;
  if (!token) throw new Error('Not authenticated');
  return token;
}

interface FetchOptions extends RequestInit {
  auth?: boolean;
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { auth = true, ...fetchOptions } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string> ?? {}),
  };

  if (auth) {
    const jwt = await getJWT();
    (headers as Record<string, string>)['Authorization'] = `Bearer ${jwt}`;
  }

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...fetchOptions,
    headers,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` })) as { error?: string };
    throw new Error(err.error ?? `Request failed with status ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
  return apiFetch<T>(path, { method: 'GET' });
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
