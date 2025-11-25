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

  // TEMPORARY: Mock data for preview with delta values
  const scores = {
    barrel: 85,         // Mock: Overall BARREL Score (leaderboard metric)
    anchor: 82,         // Mock: Anchor (Feet & Ground) Score
    engine: 88,         // Mock: Engine (Hips & Shoulders) Score
    whip: 85,           // Mock: Whip (Arms & Bat) Score
    barrelDelta: 3,     // Mock: +3 pts since last session
    anchorDelta: -1,    // Mock: -1 pt since last session
    engineDelta: 2,     // Mock: +2 pts since last session
    whipDelta: 1,       // Mock: +1 pt since last session
  };

  // PRODUCTION: Use real data from assessment
  // const scores = {
  //   barrel: barrelScore,
  //   anchor: latestAssessment?.anchorScore ? Math.round(latestAssessment.anchorScore) : 0,
  //   engine: latestAssessment?.engineScore ? Math.round(latestAssessment.engineScore) : 0,
  //   whip: latestAssessment?.whipScore ? Math.round(latestAssessment.whipScore) : 0,
  //   barrelDelta: 0,  // Calculate from previous assessment
  //   anchorDelta: 0,
  //   engineDelta: 0,
  //   whipDelta: 0,
  // };

  // Extract coaching text from assessment
  // TEMPORARY: Mock coaching text for preview
  const coachingText = "Great progress on your swing mechanics! Your engine score shows strong hip rotation. Focus on maintaining your anchor foundation through contact - this will help stabilize your bat path and improve barrel control. Keep working on staying connected through the hitting zone.";
  
  // PRODUCTION: Use real data from assessment
  // const coachingText = latestAssessment?.coachNotes || null;

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
