import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { DashboardClient } from './dashboard-client';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/welcome');
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: {
      videos: {
        orderBy: { uploadDate: 'desc' },
        take: 5,
      },
    },
  });

  if (!user?.profileComplete) {
    redirect('/onboarding');
  }

  // Calculate latest scores from most recent analyzed video
  const latestVideo = user?.videos?.find(v => v.analyzed);
  
  const scores = {
    anchor: latestVideo?.anchor || 0,      // Lower Body
    engine: latestVideo?.engine || 0,      // Trunk/Core
    whip: latestVideo?.whip || 0,          // Arms & Bat
    overall: latestVideo?.overallScore || 0,
    tier: latestVideo?.tier || 'Developing',
    exitVelocity: latestVideo?.exitVelocity || 0,
  };

  return <DashboardClient user={user} scores={scores} videos={user?.videos || []} />;
}
