import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { OAuthConfig, OAuthUserConfig } from 'next-auth/providers/oauth';
// import { PrismaAdapter } from '@next-auth/prisma-adapter'; // Not used with CredentialsProvider + JWT
import { prisma } from './db';
import bcrypt from 'bcryptjs';
import { getWhopUserMemberships, getWhopProductTier } from './whop-client';

// PHASE 5: Whop OAuth integration for subscription management

export const authOptions: NextAuthOptions = {
  // Note: PrismaAdapter is incompatible with CredentialsProvider + JWT strategy
  // adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    // Admin Credentials Provider - Requires admin role
    CredentialsProvider({
      id: 'admin-credentials',
      name: 'Admin Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username: credentials.email },
        });

        if (!user || !user.password) {
          return null;
        }

        // Verify role is admin
        if (user.role !== 'admin' && user.role !== 'coach') {
          console.log(`Admin login rejected: User ${user.email} has role ${user.role}`);
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          isCoach: user.isCoach || false,
          role: user.role || 'player',
        };
      },
    }),
    // Regular Credentials Provider (for athletes/testing)
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.password) {
          return null;
        }

        // Accept either username or email
        const identifier = credentials.username || credentials.email;
        if (!identifier) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { username: identifier },
        });

        if (!user) {
          return null;
        }

        // Handle optional password (for future Whop OAuth users)
        if (!user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          isCoach: user.isCoach || false,
          role: user.role || 'player',
        };
      },
    }),
    // Whop OAuth Provider - Using manual endpoints (wellKnown was causing issues)
    {
      id: 'whop',
      name: 'Whop',
      type: 'oauth',
      clientId: process.env.WHOP_CLIENT_ID,
      clientSecret: process.env.WHOP_CLIENT_SECRET,
      authorization: {
        url: 'https://whop.com/oauth',
        params: {
          scope: 'openid email profile',
          response_type: 'code',
        },
      },
      token: {
        url: 'https://api.whop.com/api/v2/oauth/token',
        async request(context) {
          console.log('[Whop OAuth] Token exchange starting...');
          console.log('[Whop OAuth] Token request context:', {
            url: 'https://api.whop.com/api/v2/oauth/token',
            hasCode: !!context.params.code,
            hasClientId: !!context.provider.clientId,
            hasClientSecret: !!context.provider.clientSecret,
          });

          try {
            const response = await fetch('https://api.whop.com/api/v2/oauth/token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: context.params.code as string,
                redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/whop`,
                client_id: context.provider.clientId as string,
                client_secret: context.provider.clientSecret as string,
              }),
            });

            console.log('[Whop OAuth] Token response status:', response.status);
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('[Whop OAuth] Token exchange failed:', errorText);
              throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
            }

            const tokens = await response.json();
            console.log('[Whop OAuth] Token exchange successful, keys:', Object.keys(tokens));
            return { tokens };
          } catch (error) {
            console.error('[Whop OAuth] Token exchange error:', error);
            throw error;
          }
        },
      },
      userinfo: {
        url: 'https://api.whop.com/api/v2/me',
        async request(context) {
          console.log('[Whop OAuth] Fetching user profile...');
          console.log('[Whop OAuth] Access token present:', !!context.tokens.access_token);

          try {
            const response = await fetch('https://api.whop.com/api/v2/me', {
              headers: {
                Authorization: `Bearer ${context.tokens.access_token}`,
              },
            });

            console.log('[Whop OAuth] Userinfo response status:', response.status);

            if (!response.ok) {
              const errorText = await response.text();
              console.error('[Whop OAuth] Userinfo fetch failed:', errorText);
              throw new Error(`Userinfo fetch failed: ${response.status} - ${errorText}`);
            }

            const profile = await response.json();
            console.log('[Whop OAuth] User profile fetched, keys:', Object.keys(profile));
            return profile;
          } catch (error) {
            console.error('[Whop OAuth] Userinfo fetch error:', error);
            throw error;
          }
        },
      },
      checks: ['state'],
      profile(profile: any) {
        console.log('[Whop OAuth] Processing profile:', JSON.stringify(profile, null, 2));
        
        if (!profile.id) {
          console.error('[Whop OAuth] Profile missing required "id" field');
          throw new Error('Whop profile missing required "id" field');
        }

        const mappedProfile = {
          id: profile.id,
          name: profile.name || profile.username || 'Whop User',
          email: profile.email,
          username: profile.username || profile.email,
          whopUserId: profile.id,
        };

        console.log('[Whop OAuth] Mapped profile:', JSON.stringify(mappedProfile, null, 2));
        return mappedProfile;
      },
    } as OAuthConfig<any>,
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
    newUser: '/dashboard', // Redirect new users here after first OAuth sign-in
  },
  debug: true, // TEMPORARY: Enable debug mode to diagnose OAuthSignin error
  callbacks: {
    async jwt({ token, user, account }) {
      console.log('[NextAuth JWT Callback] Called with:', {
        hasUser: !!user,
        hasAccount: !!account,
        accountProvider: account?.provider,
        tokenId: token.id,
      });

      if (user) {
        console.log('[NextAuth JWT] User data:', JSON.stringify(user, null, 2));
        token.id = user.id;
        token.username = (user as any).username;
        token.whopUserId = (user as any).whopUserId;
        token.isCoach = (user as any).isCoach || false;
        token.role = (user as any).role || 'player';
      }
      
      // If this is a Whop OAuth login, sync membership data
      if (account?.provider === 'whop' && token.whopUserId) {
        console.log('[Whop OAuth] Processing Whop login for user:', token.whopUserId);
        console.log('[Whop OAuth] Account data:', JSON.stringify(account, null, 2));
        try {
          // Find or create user in database
          let dbUser = await prisma.user.findUnique({
            where: { whopUserId: token.whopUserId as string },
          });

          if (!dbUser) {
            console.log('[Whop OAuth] Creating new user from Whop data');
            // Create new user from Whop OAuth data
            dbUser = await prisma.user.create({
              data: {
                username: token.username as string || token.email as string || `whop_${token.whopUserId}`,
                email: token.email as string,
                name: token.name as string,
                whopUserId: token.whopUserId as string,
                membershipTier: 'free',
                membershipStatus: 'inactive',
                profileComplete: false,
              },
            });
            console.log('[Whop OAuth] New user created:', dbUser.id);
          } else {
            console.log('[Whop OAuth] Existing user found:', dbUser.id);
          }

          // Sync membership data from Whop
          const memberships = await getWhopUserMemberships(token.whopUserId as string);
          const activeMemberships = memberships.filter((m) => m.valid);

          if (activeMemberships.length > 0) {
            // Get highest tier membership
            const tierPriority: Record<string, number> = {
              elite: 3,
              pro: 2,
              athlete: 1,
              free: 0,
            };

            let highestTier = 'free';
            let highestMembership = activeMemberships[0];

            for (const membership of activeMemberships) {
              const tier = getWhopProductTier(membership.productId);
              if (tierPriority[tier] > tierPriority[highestTier]) {
                highestTier = tier;
                highestMembership = membership;
              }
            }

            // Update user with membership info
            await prisma.user.update({
              where: { id: dbUser.id },
              data: {
                whopMembershipId: highestMembership.id,
                membershipTier: highestTier,
                membershipStatus: 'active',
                membershipExpiresAt: highestMembership.expiresAt
                  ? new Date(highestMembership.expiresAt)
                  : null,
                lastWhopSync: new Date(),
              },
            });

            token.membershipTier = highestTier;
            token.membershipStatus = 'active';
          }

          token.id = dbUser.id;
        } catch (error) {
          console.error('Error syncing Whop membership:', error);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
        (session.user as any).whopUserId = token.whopUserId;
        (session.user as any).membershipTier = token.membershipTier;
        (session.user as any).membershipStatus = token.membershipStatus;
        (session.user as any).isCoach = token.isCoach || false;
        (session.user as any).role = token.role || 'player';
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle callback URLs properly with context-aware redirects
      try {
        console.log('[NextAuth Redirect] url:', url, 'baseUrl:', baseUrl);
        
        // First, check if URL is relative
        if (url.startsWith('/')) {
          console.log('[NextAuth Redirect] Relative URL detected:', url);
          return `${baseUrl}${url}`;
        }
        
        // Parse the URL to extract callback parameters
        let targetUrl = url;
        try {
          const urlObj = new URL(url);
          
          // Check if this URL has a callbackUrl parameter
          const callbackUrl = urlObj.searchParams.get('callbackUrl');
          if (callbackUrl) {
            console.log('[NextAuth Redirect] Found callbackUrl parameter:', callbackUrl);
            // Use the callback URL if it's on the same origin
            if (callbackUrl.startsWith('/')) {
              targetUrl = `${baseUrl}${callbackUrl}`;
            } else if (callbackUrl.startsWith(baseUrl)) {
              targetUrl = callbackUrl;
            }
          }
          
          // If URL is on the same origin, allow it
          if (urlObj.origin === baseUrl) {
            console.log('[NextAuth Redirect] Same origin URL detected');
            
            // If the URL is the base URL or login page without a callback, redirect to dashboard
            if (urlObj.pathname === '/' || 
                urlObj.pathname === '/auth/login' || 
                urlObj.pathname === '/auth/admin-login') {
              
              // Check if this is an admin login
              const isAdminLogin = urlObj.pathname === '/auth/admin-login' || 
                                  urlObj.searchParams.has('admin');
              
              const defaultRedirect = isAdminLogin ? `${baseUrl}/admin` : `${baseUrl}/dashboard`;
              console.log('[NextAuth Redirect] Login page detected, redirecting to', defaultRedirect);
              return callbackUrl || defaultRedirect;
            }
            
            // Allow the URL if it's on the same origin
            return targetUrl;
          }
        } catch (parseError) {
          console.log('[NextAuth Redirect] URL parse error, treating as relative');
        }
        
        // If URL equals base URL, redirect to dashboard
        if (url === baseUrl || url === `${baseUrl}/`) {
          console.log('[NextAuth Redirect] Base URL detected, redirecting to dashboard');
          return `${baseUrl}/dashboard`;
        }
        
        // Default fallback to dashboard
        console.log('[NextAuth Redirect] Fallback to dashboard');
        return `${baseUrl}/dashboard`;
      } catch (error) {
        console.error('[NextAuth Redirect] Error:', error);
        // Fallback to dashboard on error
        return `${baseUrl}/dashboard`;
      }
    },
  },
};
