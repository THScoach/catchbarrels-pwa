import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
// import { PrismaAdapter } from '@next-auth/prisma-adapter'; // Not used with CredentialsProvider + JWT
import { prisma } from './db';
import bcrypt from 'bcryptjs';

// PHASE 1: Simple credentials auth for prototype
// PHASE 5: Will add Whop OAuth provider here for subscription management

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
    // Phase 5: Add Whop OAuth provider here
    // WhopProvider({
    //   clientId: process.env.WHOP_CLIENT_ID,
    //   clientSecret: process.env.WHOP_CLIENT_SECRET,
    // }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).username = token.username;
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
