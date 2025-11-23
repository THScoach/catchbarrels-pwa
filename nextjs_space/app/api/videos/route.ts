
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const videos = await prisma.video.findMany({
      where: { userId: (session.user as any).id },
      orderBy: { uploadDate: 'desc' },
    });

    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Videos fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Simulate video upload and analysis
    const video = await prisma.video.create({
      data: {
        userId: (session.user as any).id,
        title: body?.title || 'New Swing',
        videoUrl: '/videos/mock-swing.mp4',
        thumbnailUrl: '/images/thumbnails/swing-thumb.jpg',
        analyzed: false,
      },
    });

    // Simulate async processing - in real app would be background job
    setTimeout(async () => {
      const mockScores = {
        balanceScore: 70 + Math.floor(Math.random() * 25),
        anchorScore: 68 + Math.floor(Math.random() * 25),
        rotationScore: 75 + Math.floor(Math.random() * 20),
        rearElbowScore: 65 + Math.floor(Math.random() * 25),
        launchScore: 72 + Math.floor(Math.random() * 23),
        sequenceScore: 70 + Math.floor(Math.random() * 25),
      };

      const overall = Math.round(
        (mockScores.balanceScore +
          mockScores.anchorScore +
          mockScores.rotationScore +
          mockScores.rearElbowScore +
          mockScores.launchScore +
          mockScores.sequenceScore) /
          6
      );

      const tier =
        overall >= 85
          ? 'College'
          : overall >= 75
          ? 'Varsity'
          : overall >= 65
          ? 'JV'
          : 'Beginner';

      await prisma.video.update({
        where: { id: video.id },
        data: {
          ...mockScores,
          overallScore: overall,
          tier,
          exitVelocity: 80 + Math.floor(Math.random() * 20),
          analyzed: true,
          coachFeedback: `Nice swing! Your ${
            Object.entries(mockScores).sort((a, b) => b[1] - a[1])[0][0].replace('Score', '')
          } is your strongest component. Keep working on consistency.`,
        },
      });
    }, 3000);

    return NextResponse.json({ video }, { status: 201 });
  } catch (error) {
    console.error('Video upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    );
  }
}
