
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import SessionsClient from './sessions-client';

/**
 * Sessions Page - Organize videos by training sessions
 * Shows a list of training sessions with the ability to create new ones
 */
export default async function SessionsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  const userId = (session.user as any).id;

  // Fetch user's videos grouped by upload date (simulated sessions)
  const videos = await prisma.video.findMany({
    where: { userId },
    orderBy: { uploadDate: 'desc' },
    select: {
      id: true,
      title: true,
      videoType: true,
      source: true,
      uploadDate: true,
      analyzed: true,
      overallScore: true,
      anchor: true,
      engine: true,
      whip: true,
    },
  });

  // Group videos by date as "sessions"
  const sessionsByDate: { [key: string]: any[] } = {};
  videos.forEach((video) => {
    const dateKey = new Date(video.uploadDate).toLocaleDateString();
    if (!sessionsByDate[dateKey]) {
      sessionsByDate[dateKey] = [];
    }
    sessionsByDate[dateKey].push(video);
  });

  const sessions = Object.entries(sessionsByDate).map(([date, videos]) => ({
    id: date.replace(/\//g, '-'),
    date: new Date(videos[0].uploadDate),
    title: `Training Session - ${date}`,
    videoCount: videos.length,
    videos,
    avgScore: videos.filter(v => v.analyzed && v.overallScore).length > 0
      ? Math.round(
          videos
            .filter(v => v.analyzed && v.overallScore)
            .reduce((sum, v) => sum + (v.overallScore || 0), 0) /
            videos.filter(v => v.analyzed && v.overallScore).length
        )
      : null,
  }));

  return <SessionsClient sessions={sessions} userId={userId} />;
}
