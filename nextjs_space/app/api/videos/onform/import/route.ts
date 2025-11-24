
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { uploadFile } from '@/lib/s3';
import { Prisma } from '@prisma/client';

export const dynamic = 'force-dynamic';

/**
 * OnForm Video Import API
 * Handles both file uploads and link imports from OnForm
 */

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const contentType = request.headers.get('content-type');

    // Handle file upload (multipart/form-data)
    if (contentType?.includes('multipart/form-data')) {
      return handleFileImport(request, userId);
    }

    // Handle link import (application/json)
    return handleLinkImport(request, userId);

  } catch (error) {
    console.error('Error importing OnForm video:', error);
    return NextResponse.json(
      { error: 'Failed to import video' },
      { status: 500 }
    );
  }
}

async function handleFileImport(request: NextRequest, userId: string) {
  try {
    const formData = await request.formData();
    const videoFile = formData.get('file') as File || formData.get('video') as File; // Support both 'file' and 'video'
    const videoType = formData.get('videoType') as string;
    const cameraAngle = (formData.get('cameraAngle') as string) || 'side';
    const athleteId = (formData.get('athleteId') as string) || undefined;
    const sessionId = (formData.get('sessionId') as string) || undefined;

    if (!videoFile) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    if (!videoType) {
      return NextResponse.json({ error: 'Video type is required' }, { status: 400 });
    }

    // Validate file size (limit to 500MB)
    if (videoFile.size > 500 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File too large',
        message: 'OnForm videos must be under 500MB. Please compress or trim the video.'
      }, { status: 413 });
    }

    // Convert file to buffer
    const bytes = await videoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename with OnForm prefix
    const timestamp = Date.now();
    const sanitizedName = videoFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `uploads/${userId}/onform_${timestamp}_${sanitizedName}`;

    // Upload to S3
    console.log('Uploading OnForm file to S3:', fileName);
    const cloudStoragePath = await uploadFile(buffer, fileName);

    // Create video record with OnForm source
    const video = await prisma.video.create({
      data: {
        userId,
        title: videoFile.name.replace(/\.[^/.]+$/, ''),
        videoType,
        source: 'onform',
        videoUrl: cloudStoragePath,
        cameraAngle,
        thumbnailUrl: '',
        analyzed: false,
        skeletonExtracted: false,
        // Future-proofing for 3D data - omit null values to use schema defaults
      }
    });

    console.log('OnForm file imported successfully:', {
      videoId: video.id,
      fileName: videoFile.name,
      size: videoFile.size,
      athleteId,
      sessionId
    });

    return NextResponse.json({
      success: true,
      video: {
        id: video.id,
        userId: video.userId,
        title: video.title,
        videoType: video.videoType,
        source: video.source,
        cameraAngle: video.cameraAngle,
        uploadDate: video.uploadDate
      },
      metadata: {
        athleteId,
        sessionId,
        importMethod: 'file_upload'
      },
      message: 'OnForm video imported successfully. Analysis will begin automatically.'
    });

  } catch (error) {
    console.error('Error in file import:', error);
    throw error;
  }
}

async function handleLinkImport(request: NextRequest, userId: string) {
  try {
    const body = await request.json();
    const { shareUrl, onformUrl, videoType, cameraAngle = 'side', athleteId, sessionId } = body;

    // Support both 'shareUrl' and 'onformUrl' for backwards compatibility
    const url = shareUrl || onformUrl;

    if (!url || !videoType) {
      return NextResponse.json({ 
        error: 'Missing required fields',
        message: 'OnForm share URL and video type are required'
      }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (e) {
      return NextResponse.json({ 
        error: 'Invalid URL',
        message: 'Please provide a valid OnForm share link'
      }, { status: 400 });
    }

    // Parse OnForm video ID for better tracking
    const onformVideoIdMatch = url.match(/(?:id=|\/view\/)([a-zA-Z0-9_-]+)/);
    const onformVideoId = onformVideoIdMatch ? onformVideoIdMatch[1] : undefined;

    console.log('Importing OnForm share link:', {
      url,
      videoType,
      onformVideoId,
      athleteId,
      sessionId
    });

    // Create video record with external URL
    // Note: For true download+import, we'd use the downloadOnFormVideo function from lib/onform-import
    // For now, we're storing the external URL as a reference
    const video = await prisma.video.create({
      data: {
        userId,
        title: `OnForm Import ${new Date().toLocaleDateString()}`,
        videoType,
        source: 'onform',
        originalUrl: url,
        videoUrl: url, // Store external URL; future: download and upload to S3
        cameraAngle,
        thumbnailUrl: '',
        analyzed: false,
        skeletonExtracted: false,
        // Future-proofing for 3D data - omit null values to use schema defaults
      }
    });

    console.log('OnForm share link imported successfully:', {
      videoId: video.id,
      onformVideoId,
      athleteId,
      sessionId
    });

    return NextResponse.json({
      success: true,
      video: {
        id: video.id,
        userId: video.userId,
        title: video.title,
        videoType: video.videoType,
        source: video.source,
        originalUrl: video.originalUrl,
        cameraAngle: video.cameraAngle,
        uploadDate: video.uploadDate
      },
      metadata: {
        onformVideoId,
        athleteId,
        sessionId,
        importMethod: 'share_link'
      },
      message: 'OnForm link imported successfully. Video is ready to view.'
    });

  } catch (error) {
    console.error('Error in link import:', error);
    throw error;
  }
}

// GET endpoint to check import status (optional)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Get recent OnForm imports
    const onformVideos = await prisma.video.findMany({
      where: {
        userId,
        source: 'onform'
      },
      orderBy: {
        uploadDate: 'desc'
      },
      take: 10,
      select: {
        id: true,
        title: true,
        videoType: true,
        source: true,
        originalUrl: true,
        cameraAngle: true,
        analyzed: true,
        skeletonExtracted: true,
        uploadDate: true
      }
    });

    return NextResponse.json({
      count: onformVideos.length,
      videos: onformVideos
    });

  } catch (error) {
    console.error('Error fetching OnForm imports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch imports' },
      { status: 500 }
    );
  }
}
