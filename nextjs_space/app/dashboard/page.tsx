import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import DashboardClient from './dashboard-client';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
  });

  if (!user?.profileComplete) {
    redirect('/onboarding');
  }

  // Fetch latest completed assessment
  const latestAssessment = await prisma.assessment.findFirst({
    where: {
      userId: (session.user as any).id,
      status: 'completed',
    },
    orderBy: {
      completedAt: 'desc',
    },
  });

  // Extract scores from assessment (or default to 0)
  const barrelScore = latestAssessment 
    ? Math.round(((latestAssessment.anchorScore || 0) + (latestAssessment.engineScore || 0) + (latestAssessment.whipScore || 0)) / 3)
    : 0;

  const scores = {
    barrel: barrelScore,
    anchor: latestAssessment?.anchorScore ? Math.round(latestAssessment.anchorScore) : 0,
    engine: latestAssessment?.engineScore ? Math.round(latestAssessment.engineScore) : 0,
    whip: latestAssessment?.whipScore ? Math.round(latestAssessment.whipScore) : 0,
  };

  // Extract coaching text from assessment
  const coachingText = latestAssessment?.coachNotes || null;

  // Parse recommended drills from assessment (stored as JSON array)
  let recommendedDrills: any[] = [];
  if (latestAssessment?.recommendations) {
    try {
      const recommendations = latestAssessment.recommendations as any;
      if (Array.isArray(recommendations)) {
        recommendedDrills = recommendations;
      }
    } catch (e) {
      console.error('Error parsing recommendations:', e);
    }
  }

  // If no drills in assessment, fetch some default drills
  if (recommendedDrills.length === 0) {
    const defaultDrills = await prisma.drill.findMany({
      take: 3,
      orderBy: { name: 'asc' },
    });
    recommendedDrills = defaultDrills;
  }

  // Extract membership info
  const membershipInfo = {
    tier: user?.membershipTier || 'free',
    status: user?.membershipStatus || 'inactive',
    expiresAt: user?.membershipExpiresAt,
  };

  return (
    <DashboardClient 
      user={user}
      scores={scores}
      coachingText={coachingText}
      recommendedDrills={recommendedDrills}
      latestAssessmentDate={latestAssessment?.completedAt || null}
      membershipInfo={membershipInfo}
    />
  );
}
