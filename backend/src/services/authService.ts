import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import { userCache } from '../utils/cache';

export interface GoogleUserPayload {
  sub: string;      // Google user ID
  email: string;
  name: string;
  picture?: string;
}

export async function verifyGoogleToken(token: string): Promise<GoogleUserPayload> {
  // chrome.identity.getAuthToken() returns an OAuth2 access token (not an ID token),
  // so we use Google's userinfo endpoint to validate and get user info.
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Google userinfo request failed with status ${res.status}`);
  }

  const payload = await res.json() as { sub?: string; email?: string; name?: string; picture?: string };

  if (!payload.sub || !payload.email || !payload.name) {
    throw new Error('Invalid Google token payload');
  }

  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
  };
}

export async function upsertUser(googlePayload: GoogleUserPayload): Promise<IUser> {
  const defaultModel = 'gpt-oss-120b';
  const user = await User.findOneAndUpdate(
    { googleId: googlePayload.sub },
    {
      $setOnInsert: {
        googleId: googlePayload.sub,
        plan: 'free',
        selectedModel: defaultModel,
      },
      $set: {
        email: googlePayload.email,
        name: googlePayload.name,
      },
    },
    { upsert: true, new: true }
  );
  
  if (user) {
    userCache.set(user._id.toString(), user);
  }
  
  return user;
}

export function generateJWT(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');
  return jwt.sign({ userId }, secret, { expiresIn: '30d' });
}
