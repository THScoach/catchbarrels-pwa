import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { VideoDetailClient } from './video-detail-client';

export default async function VideoDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/auth/login');
  }

  const video = await prisma.video.findUnique({
    where: { id: params.id },
  });

  if (!video || video.userId !== (session.user as any).id) {
    redirect('/video');
  }

  return <VideoDetailClient video={video} />;
}
