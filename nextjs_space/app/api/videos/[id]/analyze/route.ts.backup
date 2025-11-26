/**
 * API Route: Analyze Video
 * - Runs skeleton-based swing analysis
 * - Calculates Anchor/Engine/Whip scores
 * - Stores results in database
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/db';
import { analyzeSwing } from '@/lib/swing-analyzer';
import { Decimal } from '@prisma/client/runtime/library';

export const dynamic = 'force-dynamic';

/**
 * POST /api/videos/[id]/analyze
 * Runs full swing analysis on a video with skeleton data
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const startTime = Date.now();
  console.log(`[Analyze] Starting analysis for video ${params.id}`);
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const videoId = params.id;

    // Fetch video with skeleton data
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: {
        id: true,
        userId: true,
        skeletonData: true,
        skeletonExtracted: true,
        skeletonStatus: true,
        impactFrame: true,
        fps: true,
        cameraAngle: true,
        user: {
          select: {
            height: true,
          },
        },
      },
    });

    if (!video || video.userId !== session.user.id) {
      console.error(`[Analyze] Video not found or unauthorized`);
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    if (!video.skeletonExtracted || !video.skeletonData) {
      console.error(`[Analyze] No skeleton data available`);
      return NextResponse.json(
        { error: 'No skeleton data available. Please run skeleton extraction first.' },
        { status: 400 }
      );
    }

    console.log(`[Analyze] Running swing analysis...`);
    
    // Prepare swing data for analysis
    const swing = {
      video: {
        skeletonData: video.skeletonData,
        impactFrame: video.impactFrame,
        fps: video.fps,
        cameraAngle: video.cameraAngle,
        playerHeight: video.user?.height,
      },
    };

    // Run analysis
    const analysis = await analyzeSwing(swing);
    console.log(`[Analyze] Analysis complete. Overall score: ${analysis.metrics.overallScore}`);

    // Calculate Anchor/Engine/Whip scores from metrics
    // These come from the swing analyzer which now uses the fixed timing formulas
    const metrics = analysis.metrics;
    
    // Extract sub-scores if available
    const anchorScore = calculateComponentScore([
      metrics.spineTiltAtLaunchDeg,
      metrics.pelvisAngleAtLaunchDeg,
      metrics.backKneeFlexionAtLaunchDeg,
    ]);
    
    const engineScore = calculateComponentScore([
      metrics.pelvisMaxAngularVelocity,
      metrics.torsoMaxAngularVelocity,
      metrics.hipShoulderSeparation,
    ]);
    
    const whipScore = calculateComponentScore([
      metrics.armMaxAngularVelocity,
      metrics.batMaxAngularVelocity,
      metrics.avgBatSpeedMph,
    ]);

    // Calculate sub-scores using existing Integer fields
    const anchorStance = Math.round(calculateStabilityScore([
      metrics.spineTiltAtLaunchDeg,
    ]));
    const anchorWeightShift = Math.round(calculateTimingScore([
      metrics.loadToLaunchMs,
    ]));
    const engineHipRotation = Math.round(calculateComponentScore([
      metrics.pelvisMaxAngularVelocity,
    ]));
    const engineSeparation = Math.round(calculateComponentScore([
      metrics.hipShoulderSeparation,
    ]));
    const whipBatSpeed = Math.round(calculateComponentScore([
      metrics.avgBatSpeedMph,
    ]));
    const whipBatPath = Math.round(metrics.sequenceScore || 0);

    // Update video with analysis results
    const updatedVideo = await prisma.video.update({
      where: { id: videoId },
      data: {
        analyzed: true,
        overallScore: Math.round(metrics.overallScore || 0),
        anchor: Math.round(anchorScore),
        engine: Math.round(engineScore),
        whip: Math.round(whipScore),
        
        // Sub-scores using existing Integer fields
        anchorStance,
        anchorWeightShift,
        anchorGroundConnection: Math.round(anchorScore), // Duplicate for now
        anchorLowerBodyMechanics: Math.round(anchorScore), // Duplicate for now
        
        engineHipRotation,
        engineSeparation,
        engineCorePower: Math.round(engineScore), // Duplicate for now
        engineTorsoMechanics: Math.round(engineScore), // Duplicate for now
        
        whipBatSpeed,
        whipBatPath,
        whipArmPath: Math.round(whipScore), // Duplicate for now
        whipConnection: Math.round(whipScore), // Duplicate for now
        
        tier: getTier(metrics.overallScore || 0),
      },
    });

    const duration = Date.now() - startTime;
    console.log(`[Analyze] Complete in ${duration}ms. Scores - Anchor: ${anchorScore.toFixed(1)}, Engine: ${engineScore.toFixed(1)}, Whip: ${whipScore.toFixed(1)}`);

    return NextResponse.json({
      success: true,
      video: updatedVideo,
      analysis: {
        overallScore: metrics.overallScore,
        anchorScore,
        engineScore,
        whipScore,
        metrics,
      },
      processingTime: duration,
    });

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Analyze] Error after ${duration}ms:`, error);
    console.error(error instanceof Error ? error.stack : 'Unknown error');
    
    return NextResponse.json(
      {
        error: 'Failed to analyze video',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/videos/[id]/analyze
 * Returns current analysis status
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const video = await prisma.video.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        userId: true,
        analyzed: true,
        skeletonExtracted: true,
        skeletonStatus: true,
        skeletonErrorMessage: true,
        overallScore: true,
        anchor: true,
        engine: true,
        whip: true,
      },
    });

    if (!video || video.userId !== session.user.id) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    return NextResponse.json({
      analyzed: video.analyzed,
      skeletonExtracted: video.skeletonExtracted,
      skeletonStatus: video.skeletonStatus,
      skeletonErrorMessage: video.skeletonErrorMessage,
      scores: video.analyzed
        ? {
            overall: video.overallScore,
            anchor: video.anchor,
            engine: video.engine,
            whip: video.whip,
          }
        : null,
    });

  } catch (error) {
    console.error('[Analyze Status] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis status' },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateComponentScore(values: (number | undefined)[]): number {
  const validValues = values.filter((v): v is number => v !== undefined && v !== null && !isNaN(v));
  if (validValues.length === 0) return 0;
  
  // Normalize and average (assuming values are already scored 0-100 or need normalization)
  const sum = validValues.reduce((acc, val) => acc + Math.abs(val), 0);
  const avg = sum / validValues.length;
  
  // Map to 0-100 range if needed
  return Math.min(100, Math.max(0, avg));
}

function calculateTimingScore(values: (number | undefined)[]): number {
  const validValues = values.filter((v): v is number => v !== undefined && v !== null && !isNaN(v));
  if (validValues.length === 0) return 0;
  
  // Timing scores are complex - for now, use a simplified approach
  // In production, this would use the detailed timing formulas from assessment-report-generator.ts
  const avg = validValues.reduce((acc, val) => acc + Math.abs(val), 0) / validValues.length;
  return Math.min(100, Math.max(0, 100 - (avg / 10))); // Simple inverse scaling
}

function calculateStabilityScore(values: (number | undefined)[]): number {
  const validValues = values.filter((v): v is number => v !== undefined && v !== null && !isNaN(v));
  if (validValues.length === 0) return 0;
  
  // Stability - lower variation is better
  const avg = validValues.reduce((acc, val) => acc + Math.abs(val), 0) / validValues.length;
  return Math.min(100, Math.max(0, 100 - avg));
}

function getTier(score: number): string {
  if (score >= 85) return 'Elite';
  if (score >= 75) return 'Advanced';
  if (score >= 65) return 'Intermediate';
  return 'Developing';
}
