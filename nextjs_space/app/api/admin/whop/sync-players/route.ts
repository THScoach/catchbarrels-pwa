import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { getWhopUserMemberships, getWhopProductTier } from '@/lib/whop-client';

export async function POST(request: NextRequest) {
  try {
    console.log('[Whop Sync] Starting player sync from Whop');
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      console.error('[Whop Sync] No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin/coach role
    const userRole = (session.user as any)?.role || 'player';
    console.log(`[Whop Sync] User ${(session.user as any).email} (role: ${userRole}) initiated sync`);
    
    if (userRole !== 'admin' && userRole !== 'coach') {
      console.error('[Whop Sync] User lacks admin/coach role');
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch all users with Whop IDs from database
    const usersWithWhop = await prisma.user.findMany({
      where: {
        whopUserId: { not: null },
      },
      select: {
        id: true,
        whopUserId: true,
        email: true,
        name: true,
        username: true,
        membershipTier: true,
        membershipStatus: true,
      },
    });

    console.log(`[Whop Sync] Found ${usersWithWhop.length} users with Whop IDs in database`);

    let syncedCount = 0;
    let errors: string[] = [];

    // Sync each user's membership data from Whop
    for (const user of usersWithWhop) {
      try {
        if (!user.whopUserId) continue;

        console.log(`[Whop Sync] Syncing user ${user.email || user.username} (${user.whopUserId})`);

        // Fetch memberships from Whop API
        const memberships = await getWhopUserMemberships(user.whopUserId);
        const activeMemberships = memberships.filter((m) => m.valid);

        console.log(`[Whop Sync] Found ${memberships.length} total memberships, ${activeMemberships.length} active`);

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
            console.log(`[Whop Sync] Product ${membership.productId} maps to tier: ${tier}`);
            if (tierPriority[tier] > tierPriority[highestTier]) {
              highestTier = tier;
              highestMembership = membership;
            }
          }

          console.log(`[Whop Sync] Highest tier: ${highestTier}, updating user ${user.id}`);

          // Update user with membership info
          await prisma.user.update({
            where: { id: user.id },
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

          console.log(`[Whop Sync] ✅ Updated ${user.email} to ${highestTier} (${highestMembership.status})`);
          syncedCount++;
        } else {
          // No active memberships, mark as inactive
          console.log(`[Whop Sync] No active memberships for ${user.email}, marking inactive`);
          await prisma.user.update({
            where: { id: user.id },
            data: {
              membershipStatus: 'inactive',
              lastWhopSync: new Date(),
            },
          });
          syncedCount++;
        }
      } catch (error) {
        console.error(`[Whop Sync] ❌ Error syncing user ${user.id}:`, error);
        errors.push(`Failed to sync ${user.email || user.username}`);
      }
    }

    console.log(`[Whop Sync] Completed: ${syncedCount}/${usersWithWhop.length} users synced`);
    if (errors.length > 0) {
      console.error(`[Whop Sync] ${errors.length} errors:`, errors);
    }

    return NextResponse.json({
      success: true,
      syncedCount,
      totalUsers: usersWithWhop.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Whop sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync players from Whop' },
      { status: 500 }
    );
  }
}
