import { verifyWhopToken, checkWhopAccess } from '@/lib/whop-auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { getWhopUserMemberships, getWhopProductTier } from '@/lib/whop-client';

interface Props {
  params: { experienceId: string };
}

export default async function WhopExperiencePage({ params }: Props) {
  const { experienceId } = params;
  
  const whopUser = await verifyWhopToken();
  
  if (!whopUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center p-8">
          <div className="text-[#F5A623] text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-white mb-2">Authentication Error</h1>
          <p className="text-gray-400 mb-4">Unable to verify your Whop session.</p>
          <p className="text-gray-500 text-sm">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const accessCheck = await checkWhopAccess(whopUser.userId, experienceId);
  
  if (!accessCheck.hasAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center p-8">
          <div className="text-[#F5A623] text-6xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-white mb-2">Access Required</h1>
          <p className="text-gray-400">Please purchase a membership to access CatchBarrels.</p>
        </div>
      </div>
    );
  }

  let user = await prisma.user.findUnique({
    where: { whopUserId: whopUser.userId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        username: whopUser.email || `whop_${whopUser.userId}`,
        email: whopUser.email || null,
        name: whopUser.name || null,
        whopUserId: whopUser.userId,
        membershipTier: 'free',
        membershipStatus: 'inactive',
        profileComplete: false,
        role: accessCheck.accessLevel === 'admin' ? 'coach' : 'player',
      },
    });
  }

  // Sync memberships
  try {
    const memberships = await getWhopUserMemberships(whopUser.userId);
    const activeMemberships = memberships.filter((m) => m.valid);

    if (activeMemberships.length > 0) {
      const tierPriority: Record<string, number> = { elite: 3, pro: 2, athlete: 1, free: 0 };
      let highestTier = 'free';
      let highestMembership = activeMemberships[0];

      for (const membership of activeMemberships) {
        const tier = getWhopProductTier(membership.productId);
        if (tierPriority[tier] > tierPriority[highestTier]) {
          highestTier = tier;
          highestMembership = membership;
        }
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          whopMembershipId: highestMembership.id,
          membershipTier: highestTier,
          membershipStatus: 'active',
          membershipExpiresAt: highestMembership.expiresAt ? new Date(highestMembership.expiresAt) : null,
          lastWhopSync: new Date(),
        },
      });
    }
  } catch (error) {
    console.error('[Whop Experience] Error syncing membership:', error);
  }

  if (!user.profileComplete) {
    redirect(`/experiences/${experienceId}/onboarding`);
  }

  redirect(`/experiences/${experienceId}/dashboard`);
}
