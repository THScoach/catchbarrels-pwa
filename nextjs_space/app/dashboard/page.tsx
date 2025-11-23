import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { DashboardClient } from './dashboard-client';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login');
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
    balance: latestVideo?.balanceScore || 0,
    anchor: latestVideo?.anchorScore || 0,
    rotation: latestVideo?.rotationScore || 0,
    rearElbow: latestVideo?.rearElbowScore || 0,
    launch: latestVideo?.launchScore || 0,
    sequence: latestVideo?.sequenceScore || 0,
    overall: latestVideo?.overallScore || 0,
    tier: latestVideo?.tier || 'Beginner',
  };

  return <DashboardClient user={user} scores={scores} videos={user?.videos || []} />;
}
