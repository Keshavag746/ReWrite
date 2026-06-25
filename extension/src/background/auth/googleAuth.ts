import { User } from '../../shared/types/index';

const BACKEND_URL = 'https://rewrite-8jxg.onrender.com';
const JWT_KEY = 'ai_rewrite_jwt';
const USER_KEY = 'ai_rewrite_user';

export async function getStoredJWT(): Promise<string> {
  const result = await chrome.storage.local.get(JWT_KEY);
  const token = result[JWT_KEY] as string | undefined;
  if (!token) throw new Error('Not authenticated. Please login.');
  return token;
}

export async function getStoredUser(): Promise<User | null> {
  const result = await chrome.storage.local.get(USER_KEY);
  return (result[USER_KEY] as User | undefined) ?? null;
}

export async function loginWithGoogle(): Promise<{ token: string; user: User }> {
  let googleToken: string;
  try {
    // Get Google OAuth token from Chrome identity API
    googleToken = await new Promise<string>((resolve, reject) => {
      chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (chrome.runtime.lastError || !token) {
          reject(new Error(chrome.runtime.lastError?.message ?? 'Auth failed'));
        } else {
          resolve(token);
        }
      });
    });
  } catch (err) {
    console.warn('[Auth] Google OAuth failed or not configured, using mock dev login:', err);
    googleToken = 'mock-dev-token';
  }

  // Exchange with backend
  const res = await fetch(`${BACKEND_URL}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ googleToken }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? 'Login failed');
  }

  const data = await res.json() as { token: string; user: User };

  // Persist JWT and user
  await chrome.storage.local.set({
    [JWT_KEY]: data.token,
    [USER_KEY]: data.user,
  });

  return data;
}

export async function logout(): Promise<void> {
  await chrome.storage.local.remove([JWT_KEY, USER_KEY]);
}
