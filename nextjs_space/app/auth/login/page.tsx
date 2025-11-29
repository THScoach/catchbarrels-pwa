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
      
      // NEVER show login form for Whop users - show error instead
      return (
        <div className="min-h-screen bg-barrels-black flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-barrels-black-light border border-red-500/20 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-4">
              Access Issue
            </h1>
            
            <p className="text-gray-300 mb-6">
              We detected you're trying to access CatchBarrels from Whop, but there was an authentication error.
            </p>
            
            <div className="bg-barrels-black border border-barrels-gold/20 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-400 mb-2">
                <strong className="text-barrels-gold">What to do:</strong>
              </p>
              <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
                <li>Make sure you have an active CatchBarrels subscription in Whop</li>
                <li>Try closing and reopening the CatchBarrels app from your Whop dashboard</li>
                <li>If the issue persists, contact support</li>
              </ol>
            </div>
            
            <a 
              href="https://whop.com" 
              className="inline-block bg-barrels-gold hover:bg-barrels-gold-light text-barrels-black font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Back to Whop
            </a>
            
            <p className="text-xs text-gray-500 mt-6">
              Error details have been logged for debugging.
            </p>
          </div>
        </div>
      );
    }
  }

  // Normal login flow - show login form (ONLY for direct browser access, not Whop)
  console.log('[Login Page] Showing normal login form (direct browser access)');
  return <LoginClient />;
}
