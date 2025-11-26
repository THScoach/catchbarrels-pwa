import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
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
    CredentialsProvider({
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
        };
      },
    }),
    // Whop OAuth Provider
    {
      id: 'whop',
      name: 'Whop',
      type: 'oauth',
      clientId: process.env.WHOP_CLIENT_ID,
      clientSecret: process.env.WHOP_CLIENT_SECRET,
      authorization: {
        url: 'https://data.whop.com/api/v3/oauth/authorize',
        params: {
          scope: 'openid profile email',
          response_type: 'code',
        },
      },
      token: 'https://data.whop.com/api/v3/oauth/token',
      userinfo: 'https://api.whop.com/api/v2/me',
      profile(profile: any) {
        return {
          id: profile.id,
          name: profile.name || profile.username,
          email: profile.email,
          username: profile.username,
          whopUserId: profile.id,
        };
      },
    } as any,
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.whopUserId = (user as any).whopUserId;
      }
      
      // If this is a Whop OAuth login, sync membership data
      if (account?.provider === 'whop' && token.whopUserId) {
        try {
          // Find or create user in database
          let dbUser = await prisma.user.findUnique({
            where: { whopUserId: token.whopUserId as string },
          });

          if (!dbUser) {
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
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to dashboard after login
      if (url === baseUrl || url === `${baseUrl}/` || url.includes('/auth/login')) {
        return `${baseUrl}/dashboard`;
      }
      // Allows relative callback URLs
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};
