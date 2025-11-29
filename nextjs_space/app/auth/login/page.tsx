import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import LoginClient from './login-client';

export default async function LoginPage() {
  console.log('[Login Page] Starting login page load...');

  // If already authenticated via NextAuth, redirect to dashboard
  const session = await getServerSession(authOptions);
  
  if (session) {
    console.log('[Login Page] User already has NextAuth session, redirecting to dashboard');
    redirect('/dashboard');
  }

  // Check if request is from Whop (simple referer check)
  const headersList = headers();
  const referer = headersList.get('referer') || '';
  const isWhopRequest = referer.includes('whop.com');
  
  console.log('[Login Page] Whop detection:', {
    referer,
    isWhopRequest
  });

  // If this is a Whop request, just create a user and redirect to dashboard
  if (isWhopRequest) {
    console.log('[Login Page] Detected Whop request - creating/finding user and redirecting...');
    
    // Create a simple timestamp-based identifier
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const whopUserId = `whop_${timestamp}_${randomId}`;
    
    // Try to find or create user
    let user = await prisma.user.findFirst({
      where: {
        email: 'whop-user@temp.com'
      }
    });

    if (!user) {
      console.log('[Login Page] Creating new Whop user...');
      user = await prisma.user.create({
        data: {
          whopUserId: whopUserId,
          email: 'whop-user@temp.com',
          name: 'Whop User',
          username: `whop_user_${randomId}`,
          role: 'player',
          profileComplete: false,
          membershipTier: 'free',
          membershipStatus: 'active'
        }
      });
      console.log('[Login Page] Created user:', user.id);
    } else {
      console.log('[Login Page] Found existing Whop user:', user.id);
    }
    
    // Just redirect to dashboard
    console.log('[Login Page] Redirecting to dashboard');
    redirect('/dashboard');
  }

  // Normal login flow - show login form (ONLY for direct browser access, not Whop)
  console.log('[Login Page] Showing normal login form (direct browser access)');
  return <LoginClient />;
}
