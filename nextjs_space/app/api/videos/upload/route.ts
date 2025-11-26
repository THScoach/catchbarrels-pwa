
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
    const sessionId = formData.get('sessionId') as string | null;

    if (!videoFile) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    if (!videoType) {
      return NextResponse.json({ error: 'Video type is required' }, { status: 400 });
    }

    // Validate file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv', 'video/webm'];
    if (!validTypes.includes(videoFile.type) && !videoFile.name.match(/\.(mp4|mov|avi|wmv|webm)$/i)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload MP4, MOV, AVI, WMV, or WEBM files.' },
        { status: 400 }
      );
    }

    // Validate file size (max 500MB)
    const maxSize = 500 * 1024 * 1024;
    if (videoFile.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 500MB.' },
        { status: 413 }
      );
    }

    console.log(`[Video Upload] Starting upload for user ${(session.user as any).id}: ${videoFile.name}`);

    // Convert file to buffer
    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = videoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `videos/${timestamp}-${sanitizedName}`;

    // Upload to S3 with error handling
    let cloudStoragePath: string;
    try {
      cloudStoragePath = await uploadFile(buffer, fileName);
      console.log(`[Video Upload] S3 upload successful: ${cloudStoragePath}`);
    } catch (s3Error) {
      console.error('[Video Upload] S3 upload failed:', s3Error);
      return NextResponse.json(
        { error: 'Failed to upload video to storage. Please try again.' },
        { status: 500 }
      );
    }

    // Create video record in database
    const video = await prisma.video.create({
      data: {
        userId: (session.user as any).id,
        sessionId: sessionId || null, // Optional - links video to training session
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
        
        console.log(`[Video Upload] Analysis complete for video ${video.id}`);
      } catch (error) {
        console.error('Error updating video analysis:', error);
      }
    }, 5000); // 5 seconds to simulate processing time

    // Return video with id at top level for easier client parsing
    return NextResponse.json(
      { 
        id: video.id,
        videoId: video.id, // Backwards compatibility
        video,
        message: 'Video uploaded successfully'
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Video Upload] Error:', error);
    
    // Return more specific error message
    const errorMessage = error?.message || 'Failed to upload video';
    return NextResponse.json(
      { error: errorMessage, details: 'Please check your file and try again.' },
      { status: 500 }
    );
  }
}
