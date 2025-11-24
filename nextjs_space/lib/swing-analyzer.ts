/**
 * Swing Analyzer
 * Processes video/skeleton data and calculates all swing metrics
 */

import { analyzeSwingBiomechanics } from './biomechanical-analysis';
import { calculateKinematicSequence } from './kinematic-sequence';

interface SwingAnalysisResult {
  metrics: {
    loadToLaunchMs?: number;
    launchToImpactMs?: number;
    totalSwingTimeMs?: number;
    batSpeedMph?: number;
    handSpeedMph?: number;
    pelvisMaxVelocity?: number;
    torsoMaxVelocity?: number;
    armMaxVelocity?: number;
    batMaxVelocity?: number;
    pelvisPeakTimingMs?: number;
    torsoPeakTimingMs?: number;
    armPeakTimingMs?: number;
    batPeakTimingMs?: number;
    sequenceScore?: number;
    sequenceOrder?: string[];
    hipShoulderSeparation?: number;
    frontKneeAngle?: number;
    leadElbowAngle?: number;
    rearElbowAngle?: number;
    strideLength?: number;
    confidence?: number;
    overallScore?: number;
  };
  joints?: any;
  impactFrame?: number;
}

export async function analyzeSwing(swing: any): Promise<SwingAnalysisResult> {
  // 1. Get skeleton data from video
  let skeletonData = swing.video?.skeletonData;
  let impactFrame = swing.video?.impactFrame;
  let fps = swing.video?.fps || 60;

  if (!skeletonData || !Array.isArray(skeletonData) || skeletonData.length === 0) {
    throw new Error('No skeleton data available for analysis');
  }

  // 2. Calculate biomechanical metrics
  const biomechanics = analyzeSwingBiomechanics(
    skeletonData,
    impactFrame || Math.floor(skeletonData.length / 2),
    swing.video?.cameraAngle === 'face-on' ? 'right' : 'right' // Default handedness
  );

  // 3. Calculate kinematic sequence metrics (Dr. Kwon)
  const sequence = calculateKinematicSequence(
    skeletonData,
    impactFrame || Math.floor(skeletonData.length / 2),
    fps
  );

  // 4. Calculate timing metrics
  const timing = calculateTimingMetrics(skeletonData, impactFrame || Math.floor(skeletonData.length / 2), fps);

  // 5. Calculate overall score
  const overallScore = calculateOverallScore(biomechanics, sequence, timing);

  // 6. Compile metrics
  const metrics = {
    // Timing
    loadToLaunchMs: timing.loadToLaunch,
    launchToImpactMs: timing.launchToImpact,
    totalSwingTimeMs: timing.totalSwingTime,

    // Speed
    batSpeedMph: biomechanics.batSpeed.batSpeed * 0.682, // Convert to mph approximation
    handSpeedMph: biomechanics.batSpeed.maxSpeed * 0.682,

    // Kinematic Sequence (Dr. Kwon)
    pelvisMaxVelocity: sequence.pelvisMaxVelocity,
    torsoMaxVelocity: sequence.torsoMaxVelocity,
    armMaxVelocity: sequence.armMaxVelocity,
    batMaxVelocity: sequence.batMaxVelocity,

    pelvisPeakTimingMs: sequence.pelvisPeakTiming,
    torsoPeakTimingMs: sequence.torsoPeakTiming,
    armPeakTimingMs: sequence.armPeakTiming,
    batPeakTimingMs: sequence.batPeakTiming,

    sequenceScore: sequence.sequenceScore,
    sequenceOrder: sequence.sequenceOrder,

    // Joint Angles
    hipShoulderSeparation: biomechanics.hipRotation.rotationAngle,
    frontKneeAngle: biomechanics.frontKneeAngle,
    leadElbowAngle: biomechanics.elbowAngles.leadElbow,
    rearElbowAngle: biomechanics.elbowAngles.rearElbow,

    // Quality
    confidence: calculateConfidence(skeletonData),
    overallScore,
  };

  return {
    metrics,
    joints: skeletonData,
    impactFrame: impactFrame || Math.floor(skeletonData.length / 2),
  };
}

function calculateTimingMetrics(skeletonData: any[], impactFrame: number, fps: number) {
  // Detect load frame (lowest COM, highest knee flexion)
  const loadFrame = detectLoadFrame(skeletonData);

  // Detect launch frame (start of forward movement)
  const launchFrame = detectLaunchFrame(skeletonData, loadFrame);

  const msPerFrame = 1000 / fps;

  return {
    loadToLaunch: (launchFrame - loadFrame) * msPerFrame,
    launchToImpact: (impactFrame - launchFrame) * msPerFrame,
    totalSwingTime: (impactFrame - loadFrame) * msPerFrame,
  };
}

function calculateConfidence(skeletonData: any[]): number {
  // Average visibility/confidence across all joints and frames
  let totalConfidence = 0;
  let count = 0;

  for (const frame of skeletonData) {
    for (const kp of frame.keypoints || []) {
      if (kp.visibility !== undefined) {
        totalConfidence += kp.visibility;
        count++;
      }
    }
  }

  return count > 0 ? totalConfidence / count : 0;
}

function detectLoadFrame(skeletonData: any[]): number {
  // Simple heuristic: frame with lowest hip position (COM proxy)
  let minY = Infinity;
  let loadFrame = 0;

  for (let i = 0; i < skeletonData.length; i++) {
    const frame = skeletonData[i];
    const hipLeft = frame.keypoints?.[23];
    const hipRight = frame.keypoints?.[24];

    if (hipLeft && hipRight) {
      const avgY = (hipLeft.y + hipRight.y) / 2;
      if (avgY < minY) {
        minY = avgY;
        loadFrame = i;
      }
    }
  }

  return Math.max(0, loadFrame - 5); // Start a bit before the lowest point
}

function detectLaunchFrame(skeletonData: any[], loadFrame: number): number {
  // Frame after load where forward movement begins
  // For now, simple heuristic: 10 frames after load
  return Math.min(loadFrame + 10, skeletonData.length - 1);
}

function calculateOverallScore(
  biomechanics: any,
  sequence: any,
  timing: any
): number {
  // Simple composite score (0-100)
  let score = 0;
  let weight = 0;

  // Sequence score (40%)
  if (sequence.sequenceScore) {
    score += sequence.sequenceScore * 0.4;
    weight += 0.4;
  }

  // Bat speed (30%) - normalize to 0-100 range
  if (biomechanics.batSpeed?.batSpeed) {
    const batSpeedMph = biomechanics.batSpeed.batSpeed * 0.682;
    const batSpeedScore = Math.min(100, Math.max(0, ((batSpeedMph - 60) / 20) * 100));
    score += batSpeedScore * 0.3;
    weight += 0.3;
  }

  // Timing (15%) - based on total swing time
  if (timing.totalSwingTime) {
    // Ideal swing time: 400-600ms
    const idealTime = 500;
    const timingScore = Math.max(0, 100 - Math.abs(timing.totalSwingTime - idealTime) / 5);
    score += timingScore * 0.15;
    weight += 0.15;
  }

  // Hip-shoulder separation (15%)
  if (biomechanics.hipRotation?.rotationAngle) {
    // Ideal: 40-60 degrees
    const xFactor = biomechanics.hipRotation.rotationAngle;
    const xFactorScore = Math.max(0, 100 - Math.abs(xFactor - 50) * 2);
    score += xFactorScore * 0.15;
    weight += 0.15;
  }

  return weight > 0 ? score / weight : 0;
}
