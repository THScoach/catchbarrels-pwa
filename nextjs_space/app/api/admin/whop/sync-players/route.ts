import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { getWhopUserMemberships, getWhopProductTier } from '@/lib/whop-client';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin/coach role
    const userRole = (session.user as any)?.role || 'player';
    if (userRole !== 'admin' && userRole !== 'coach') {
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
      },
    });

    let syncedCount = 0;
    let errors: string[] = [];

    // Sync each user's membership data from Whop
    for (const user of usersWithWhop) {
      try {
        if (!user.whopUserId) continue;

        // Fetch memberships from Whop API
        const memberships = await getWhopUserMemberships(user.whopUserId);
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

          syncedCount++;
        } else {
          // No active memberships, mark as inactive
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
        console.error(`Error syncing user ${user.id}:`, error);
        errors.push(`Failed to sync ${user.email || user.username}`);
      }
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
