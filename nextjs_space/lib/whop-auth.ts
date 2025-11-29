/**
 * Whop App Store Authentication Helper
 * 
 * This module handles authentication for Whop iframe-embedded apps.
 * When your app runs inside Whop's platform, users are already authenticated -
 * Whop passes their identity via the x-whop-user-token HTTP header.
 */

import { headers } from 'next/headers';
import { validateToken } from '@whop-apps/sdk';

export interface WhopUser {
  userId: string;
  email?: string;
  name?: string;
}

export async function verifyWhopToken(): Promise<WhopUser | null> {
  console.log('[Whop Auth] Starting token verification');
  
  try {
    const headersList = await headers();
    const token = headersList.get('x-whop-user-token');
    
    console.log('[Whop Auth] Token present:', !!token);
    console.log('[Whop Auth] Token length:', token?.length || 0);
    console.log('[Whop Auth] All headers:', Object.fromEntries(headersList.entries()));
    
    if (!token) {
      console.error('[Whop Auth] No x-whop-user-token header found');
      return null;
    }

    console.log('[Whop Auth] Validating token with Whop SDK...');
    
    // Use Whop's SDK to validate the token
    const result = await validateToken({
      token,
      appId: process.env.WHOP_APP_ID || undefined,
    });

    console.log('[Whop Auth] Validation result:', result);

    if (!result || !result.userId) {
      console.error('[Whop Auth] Token validation failed or no userId found');
      return null;
    }

    console.log('[Whop Auth] Token verified successfully for userId:', result.userId);
    
    // SDK only returns userId and appId, not email/name
    return {
      userId: result.userId,
      email: undefined,
      name: undefined,
    };
  } catch (error) {
    console.error('[Whop Auth] Token verification error:', error);
    console.error('[Whop Auth] Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('[Whop Auth] Error message:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

export async function isWhopIframe(): Promise<boolean> {
  try {
    const headersList = await headers();
    const hasToken = headersList.has('x-whop-user-token');
    console.log('[Whop Auth] Is Whop iframe:', hasToken);
    return hasToken;
  } catch (error) {
    console.error('[Whop Auth] Error checking iframe:', error);
    return false;
  }
}

export async function checkWhopAccess(
  userId: string, 
  experienceId: string
): Promise<{ hasAccess: boolean; accessLevel: 'customer' | 'admin' | 'no_access' }> {
  console.log('[Whop Auth] Checking access for userId:', userId, 'experienceId:', experienceId);
  
  try {
    const apiKey = process.env.WHOP_API_KEY;
    if (!apiKey) {
      console.error('[Whop Auth] WHOP_API_KEY not configured');
      return { hasAccess: false, accessLevel: 'no_access' };
    }

    const url = `https://api.whop.com/api/v5/access?user_id=${userId}&resource_id=${experienceId}`;
    console.log('[Whop Auth] Fetching access from:', url);

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });

    console.log('[Whop Auth] Access API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Whop Auth] Access API error:', errorText);
      return { hasAccess: false, accessLevel: 'no_access' };
    }

    const data = await response.json();
    console.log('[Whop Auth] Access API response:', data);
    
    return {
      hasAccess: data.has_access || false,
      accessLevel: data.access_level || 'no_access',
    };
  } catch (error) {
    console.error('[Whop Auth] Access check error:', error);
    console.error('[Whop Auth] Error stack:', error instanceof Error ? error.stack : 'No stack');
    return { hasAccess: false, accessLevel: 'no_access' };
  }
}
