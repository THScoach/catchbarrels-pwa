
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { uploadFile } from '@/lib/s3';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const videoFile = formData.get('video') as File;
    const videoType = formData.get('videoType') as string;

    if (!videoFile) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    if (!videoType) {
      return NextResponse.json({ error: 'Video type is required' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = videoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `videos/${timestamp}-${sanitizedName}`;

    // Upload to S3
    const cloudStoragePath = await uploadFile(buffer, fileName);

    // Create video record in database
    const video = await prisma.video.create({
      data: {
        userId: (session.user as any).id,
        title: videoFile.name.replace(/\.[^/.]+$/, ''), // Remove file extension
        videoType: videoType,
        videoUrl: cloudStoragePath, // Store S3 key
        thumbnailUrl: '', // Will be generated later
        analyzed: false,
        skeletonStatus: 'PENDING', // Automatic skeleton extraction will process this
      },
    });

    console.log(`[Video Upload] Created video ${video.id} with skeleton status PENDING`);

    // Simulate async AI analysis - in production, this would be a background job
    setTimeout(async () => {
      try {
        // Generate main metric scores
        const anchor = 68 + Math.floor(Math.random() * 25);  // Lower Body
        const engine = 75 + Math.floor(Math.random() * 20);  // Trunk/Core
        const whip = 70 + Math.floor(Math.random() * 25);    // Arms & Bat
        
        const overall = Math.round((anchor + engine + whip) / 3);

        const tier =
          overall >= 85
            ? 'Elite'
            : overall >= 75
            ? 'Advanced'
            : overall >= 65
            ? 'Intermediate'
            : 'Developing';

        // Generate subcategory scores (variations around main scores)
        const generateSubScores = (mainScore: number) => ({
          sub1: Math.max(0, Math.min(100, mainScore + Math.floor(Math.random() * 7) - 3)),
          sub2: Math.max(0, Math.min(100, mainScore + Math.floor(Math.random() * 7) - 3)),
          sub3: Math.max(0, Math.min(100, mainScore + Math.floor(Math.random() * 7) - 3)),
          sub4: Math.max(0, Math.min(100, mainScore + Math.floor(Math.random() * 7) - 3)),
        });

        const anchorSubs = generateSubScores(anchor);
        const engineSubs = generateSubScores(engine);
        const whipSubs = generateSubScores(whip);

        const strongestMetric = [
          { name: 'anchor', score: anchor },
          { name: 'engine', score: engine },
          { name: 'whip', score: whip }
        ].sort((a, b) => b.score - a.score)[0].name;
        
        const metricNames: Record<string, string> = {
          anchor: 'lower body',
          engine: 'trunk rotation',
          whip: 'arms and bat path'
        };

        await prisma.video.update({
          where: { id: video.id },
          data: {
            anchor,
            engine,
            whip,
            overallScore: overall,
            tier,
            // Anchor subcategories
            anchorStance: anchorSubs.sub1,
            anchorWeightShift: anchorSubs.sub2,
            anchorGroundConnection: anchorSubs.sub3,
            anchorLowerBodyMechanics: anchorSubs.sub4,
            // Engine subcategories
            engineHipRotation: engineSubs.sub1,
            engineSeparation: engineSubs.sub2,
            engineCorePower: engineSubs.sub3,
            engineTorsoMechanics: engineSubs.sub4,
            // Whip subcategories
            whipArmPath: whipSubs.sub1,
            whipBatSpeed: whipSubs.sub2,
            whipBatPath: whipSubs.sub3,
            whipConnection: whipSubs.sub4,
            exitVelocity: 80 + Math.floor(Math.random() * 20),
            analyzed: true,
            coachFeedback: `Nice swing! Your ${metricNames[strongestMetric]} is your strongest component. Keep working on consistency across all three areas.`,
          },
        });
      } catch (error) {
        console.error('Error updating video analysis:', error);
      }
    }, 5000); // 5 seconds to simulate processing time

    return NextResponse.json({ video, message: 'Video uploaded successfully' }, { status: 200 });
  } catch (error) {
    console.error('Video upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    );
  }
}
