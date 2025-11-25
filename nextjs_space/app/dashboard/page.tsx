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
    include: {
      videos: {
        orderBy: { uploadDate: 'desc' },
        take: 5,
      },
    },
  });

  // Extract membership info
  const membershipInfo = {
    tier: user?.membershipTier || 'free',
    status: user?.membershipStatus || 'inactive',
    expiresAt: user?.membershipExpiresAt,
  };

  if (!user?.profileComplete) {
    redirect('/onboarding');
  }

  // Calculate progress data for each video
  const allVideos = await prisma.video.findMany({
    where: { 
      userId: (session.user as any).id,
      analyzed: true 
    },
    orderBy: { uploadDate: 'desc' },
  });

  // Calculate personal bests
  const personalBests = {
    overallScore: Math.max(...allVideos.map(v => v.overallScore || 0)),
    anchor: Math.max(...allVideos.map(v => v.anchor || 0)),
    engine: Math.max(...allVideos.map(v => v.engine || 0)),
    whip: Math.max(...allVideos.map(v => v.whip || 0)),
  };

  // Enhance videos with progress data
  const videosWithProgress = user?.videos?.map((video, index) => {
    const videoIndex = allVideos.findIndex(v => v.id === video.id);
    const previousVideo = videoIndex >= 0 && videoIndex < allVideos.length - 1 
      ? allVideos[videoIndex + 1] 
      : null;

    return {
      ...video,
      previousScores: previousVideo ? {
        overallScore: previousVideo.overallScore,
        anchor: previousVideo.anchor,
        engine: previousVideo.engine,
        whip: previousVideo.whip,
      } : null,
      personalBests: video.analyzed ? personalBests : null,
    };
  }) || [];

  // Calculate latest scores from most recent analyzed video
  const latestVideo = user?.videos?.find(v => v.analyzed);
  
  const scores = {
    anchor: latestVideo?.anchor || 0,      // Lower Body
    engine: latestVideo?.engine || 0,      // Trunk/Core
    whip: latestVideo?.whip || 0,          // Arms & Bat
    overall: latestVideo?.overallScore || 0,
    tier: latestVideo?.tier || 'Developing',
    exitVelocity: latestVideo?.exitVelocity || 0,
    // Anchor subcategories
    anchorSubs: {
      stance: latestVideo?.anchorStance || 0,
      weightShift: latestVideo?.anchorWeightShift || 0,
      groundConnection: latestVideo?.anchorGroundConnection || 0,
      lowerBodyMechanics: latestVideo?.anchorLowerBodyMechanics || 0,
    },
    // Engine subcategories
    engineSubs: {
      hipRotation: latestVideo?.engineHipRotation || 0,
      separation: latestVideo?.engineSeparation || 0,
      corePower: latestVideo?.engineCorePower || 0,
      torsoMechanics: latestVideo?.engineTorsoMechanics || 0,
    },
    // Whip subcategories
    whipSubs: {
      armPath: latestVideo?.whipArmPath || 0,
      batSpeed: latestVideo?.whipBatSpeed || 0,
      batPath: latestVideo?.whipBatPath || 0,
      connection: latestVideo?.whipConnection || 0,
    },
  };

  // Fetch latest coaching call
  const latestCoachingCall = await prisma.coachingCall.findFirst({
    orderBy: { callDate: 'desc' },
  });

  return (
    <DashboardClient 
      user={user} 
      scores={scores} 
      videos={videosWithProgress} 
      latestCoachingCall={latestCoachingCall}
      membershipInfo={membershipInfo}
    />
  );
}
