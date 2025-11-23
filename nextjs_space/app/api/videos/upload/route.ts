
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { uploadFile } from '@/lib/s3';

export const dynamic = 'force-dynamic';

// Maximum file size: 500MB
const MAX_FILE_SIZE = 500 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse FormData
    const formData = await request.formData();
    const videoFile = formData.get('video') as File;

    if (!videoFile) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    // Validate file size
    if (videoFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 500MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!videoFile.type.startsWith('video/')) {
      return NextResponse.json({ error: 'File must be a video' }, { status: 400 });
    }

    // Convert File to Buffer
    const arrayBuffer = await videoFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const fileExtension = videoFile.name.split('.').pop() || 'mp4';
    const fileName = `videos/${timestamp}-${videoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Upload to S3
    const cloud_storage_path = await uploadFile(buffer, fileName, videoFile.type);

    // Create database record with cloud_storage_path
    const video = await prisma.video.create({
      data: {
        userId: (session.user as any).id,
        title: `Swing Analysis ${new Date().toLocaleDateString()}`,
        videoUrl: cloud_storage_path, // Store S3 key as videoUrl
        thumbnailUrl: '', // Will be generated later
        analyzed: false,
        uploadDate: new Date(),
      },
    });

    // Trigger background analysis (simulated for Phase 2)
    // In Phase 3, this will call the actual video analysis pipeline
    setTimeout(async () => {
      try {
        // Generate mock scores for now
        const mockScores = {
          balance: Math.floor(Math.random() * 30) + 70,
          anchor: Math.floor(Math.random() * 30) + 70,
          rotation: Math.floor(Math.random() * 30) + 70,
          rearElbow: Math.floor(Math.random() * 30) + 70,
          launch: Math.floor(Math.random() * 30) + 70,
          sequence: Math.floor(Math.random() * 30) + 70,
        };

        const overallScore = Math.round(
          (mockScores.balance +
            mockScores.anchor +
            mockScores.rotation +
            mockScores.rearElbow +
            mockScores.launch +
            mockScores.sequence) /
            6
        );

        const tier =
          overallScore >= 90
            ? 'Elite'
            : overallScore >= 80
            ? 'Advanced'
            : overallScore >= 70
            ? 'Intermediate'
            : 'Developing';

        await prisma.video.update({
          where: { id: video.id },
          data: {
            analyzed: true,
            ...mockScores,
            overallScore,
            tier,
            exitVelocity: Math.floor(Math.random() * 20) + 75,
            coachFeedback: `Great work! Your ${
              Object.entries(mockScores).sort((a, b) => b[1] - a[1])[0][0]
            } looks strong.`,
          },
        });
      } catch (error) {
        console.error('Error updating video analysis:', error);
      }
    }, 5000);

    return NextResponse.json({
      success: true,
      video: {
        id: video.id,
        title: video.title,
        uploadDate: video.uploadDate,
      },
    });
  } catch (error) {
    console.error('Video upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    );
  }
}
