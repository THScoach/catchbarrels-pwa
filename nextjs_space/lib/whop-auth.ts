/**
 * Whop App Store Authentication Helper
 * 
 * This module handles authentication for Whop iframe-embedded apps.
 * When your app runs inside Whop's platform, users are already authenticated -
 * Whop passes their identity via the x-whop-user-token HTTP header.
 */

import { headers } from 'next/headers';
import * as jose from 'jose';

// Whop's public key for JWT verification
const WHOP_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAErz8a8vxvexHC0TLT91g7llOdDOsN
uYiGEfic4Qhni+HMfRBuUphOh7F3k8QgwZc9UlL0AHmyYqtbhL9NuJes6w==
-----END PUBLIC KEY-----`;

export interface WhopUser {
  userId: string;
  email?: string;
  name?: string;
}

export interface WhopTokenPayload {
  sub: string;
  aud: string;
  iss: string;
  email?: string;
  name?: string;
  exp: number;
  iat: number;
}

export async function verifyWhopToken(): Promise<WhopUser | null> {
  try {
    const headersList = await headers();
    const token = headersList.get('x-whop-user-token');
    
    if (!token) {
      console.log('[Whop Auth] No x-whop-user-token header found');
      return null;
    }

    const publicKey = await jose.importSPKI(WHOP_PUBLIC_KEY, 'ES256');
    const { payload } = await jose.jwtVerify(token, publicKey, {
      issuer: 'urn:whopcom:exp-proxy',
    });

    const whopPayload = payload as unknown as WhopTokenPayload;

    const appId = process.env.WHOP_APP_ID;
    if (appId && whopPayload.aud !== appId) {
      console.error('[Whop Auth] Token audience mismatch');
      return null;
    }

    return {
      userId: whopPayload.sub,
      email: whopPayload.email,
      name: whopPayload.name,
    };
  } catch (error) {
    console.error('[Whop Auth] Token verification failed:', error);
    return null;
  }
}

export async function isWhopIframe(): Promise<boolean> {
  const headersList = await headers();
  return headersList.has('x-whop-user-token');
}

export async function checkWhopAccess(
  userId: string, 
  experienceId: string
): Promise<{ hasAccess: boolean; accessLevel: 'customer' | 'admin' | 'no_access' }> {
  try {
    const apiKey = process.env.WHOP_API_KEY;
    if (!apiKey) {
      return { hasAccess: false, accessLevel: 'no_access' };
    }

    const response = await fetch(
      `https://api.whop.com/api/v5/access?user_id=${userId}&resource_id=${experienceId}`,
      {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      }
    );

    if (!response.ok) {
      return { hasAccess: false, accessLevel: 'no_access' };
    }

    const data = await response.json();
    return {
      hasAccess: data.has_access || false,
      accessLevel: data.access_level || 'no_access',
    };
  } catch (error) {
    return { hasAccess: false, accessLevel: 'no_access' };
  }
}
