import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { verifyWhopToken, checkWhopAccess } from '@/lib/whop-auth';
import { prisma } from '@/lib/db';
import { getWhopUserMemberships, getWhopProductTier } from '@/lib/whop-client';
import LoginClient from './login-client';

export default async function LoginPage() {
  console.log('[Login Page] Starting login page load...');

  // If already authenticated via NextAuth, redirect to dashboard
  const session = await getServerSession(authOptions);
  
  if (session) {
    console.log('[Login Page] User already has NextAuth session, redirecting to dashboard');
    redirect('/dashboard');
  }

  // Check for Whop token in headers (iframe authentication)
  const headersList = headers();
  const whopToken = headersList.get('x-whop-user-token');
  const referer = headersList.get('referer') || '';
  
  const isWhopRequest = !!whopToken || referer.includes('whop.com');
  
  console.log('[Login Page] Whop detection:', {
    hasWhopToken: !!whopToken,
    tokenLength: whopToken?.length,
    referer,
    isWhopRequest
  });

  // If this is a Whop request, handle Whop authentication
  if (isWhopRequest && whopToken) {
    console.log('[Login Page] Detected Whop iframe request, attempting automatic authentication...');
    
    try {
      // Step 1: Verify Whop token
      console.log('[Login Page] Step 1: Verifying Whop token...');
      const whopUser = await verifyWhopToken();
      
      if (!whopUser || !whopUser.userId) {
        console.error('[Login Page] Whop token verification failed');
        throw new Error('Invalid Whop token');
      }
      
      console.log('[Login Page] Whop token verified for user:', whopUser.userId);

      // Step 2: Check access (using default experience ID for login page)
      console.log('[Login Page] Step 2: Checking Whop access...');
      const accessCheck = await checkWhopAccess(whopUser.userId, 'default');
      
      if (!accessCheck.hasAccess) {
        console.error('[Login Page] User does not have access:', accessCheck);
        // Redirect to purchase page
        redirect('/purchase-required');
      }

      console.log('[Login Page] User has access, level:', accessCheck.accessLevel);

      // Step 3: Find or create user in database
      console.log('[Login Page] Step 3: Finding or creating user...');
      let user = await prisma.user.findUnique({
        where: { whopUserId: whopUser.userId }
      });

      if (!user) {
        console.log('[Login Page] User not found, creating new user');
        user = await prisma.user.create({
          data: {
            whopUserId: whopUser.userId,
            email: whopUser.email || `whop_${whopUser.userId}@catchbarrels.app`,
            name: whopUser.name || 'Athlete',
            username: `whop_${whopUser.userId}`,
            role: 'player',
            profileComplete: false,
            membershipTier: 'free',
            membershipStatus: 'active'
          }
        });
        console.log('[Login Page] New user created:', user.id);
      } else {
        console.log('[Login Page] Existing user found:', user.id);
      }

      // Step 4: Sync Whop membership data
      console.log('[Login Page] Step 4: Syncing Whop membership...');
      try {
        const memberships = await getWhopUserMemberships(whopUser.userId);
        console.log('[Login Page] Found memberships:', memberships?.length);

        if (memberships && memberships.length > 0) {
          const activeMembership = memberships.find((m: any) => m.status === 'active' || m.valid);
          
          if (activeMembership) {
            const productId = activeMembership.productId || activeMembership.planId;
            
            if (productId) {
              const tier = getWhopProductTier(productId);
              
              console.log('[Login Page] Updating user membership:', { productId, tier });
              
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  membershipTier: tier,
                  membershipStatus: 'active',
                  whopMembershipId: activeMembership.id,
                  lastWhopSync: new Date()
                }
              });
            }
          }
        }
      } catch (syncError) {
        console.error('[Login Page] Membership sync error:', syncError);
        // Continue anyway - user can still access
      }

      // Step 5: Redirect to appropriate page
      console.log('[Login Page] Step 5: Redirecting...');
      
      // If profile is incomplete, redirect to onboarding
      if (!user.profileComplete) {
        console.log('[Login Page] Profile incomplete, redirecting to onboarding');
        redirect('/onboarding');
      }
      
      // Otherwise redirect to dashboard
      console.log('[Login Page] Redirecting to dashboard');
      redirect('/dashboard');

    } catch (error) {
      console.error('[Login Page] Whop authentication error:', error);
      // Fall through to show normal login form
    }
  }

  // Normal login flow - show login form
  console.log('[Login Page] Showing normal login form');
  return <LoginClient />;
}
