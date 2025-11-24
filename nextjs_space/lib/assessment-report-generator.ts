/**
 * Assessment Report Generator
 * Aggregates swing metrics and generates comprehensive assessment reports
 */

import { prisma } from './db';

export async function generateAssessmentReport(
  sessionId: string
): Promise<void> {
  console.log(`[Report Generator] Starting report generation for session ${sessionId}`);

  // 1. Fetch session with all data
  const session = await prisma.assessmentSession.findUnique({
    where: { id: sessionId },
    include: {
      swings: {
        include: {
          metrics: true,
          joints: true,
          ballData: true,
        },
      },
      ballData: true,
    },
  });

  if (!session) {
    throw new Error('Session not found');
  }

  // 2. Calculate aggregated metrics
  const metrics = calculateAggregatedMetrics(session.swings);

  // 3. Calculate ball data summary
  const ballDataSummary = calculateBallDataSummary(session.ballData);

  // 4. Generate overall score
  const overallScore = calculateOverallScore(metrics, ballDataSummary);

  // 5. Generate summary text
  const summary = generateSummaryText(metrics, ballDataSummary, overallScore, session.swings.length);

  // 6. Identify strengths and weaknesses
  const strengths = identifyStrengths(metrics, ballDataSummary);
  const weaknesses = identifyWeaknesses(metrics, ballDataSummary);

  console.log(`[Report Generator] Overall score: ${overallScore.toFixed(1)}`);

  // 7. Create or update report
  const report = await prisma.assessmentReport.upsert({
    where: { sessionId },
    update: {
      summary,
      overallScore,
      scoreExplanation: generateScoreExplanation(overallScore),
      ballDataSummary: ballDataSummary || undefined,
      strengths,
      weaknesses,
      generatedAt: new Date(),
    },
    create: {
      sessionId,
      summary,
      overallScore,
      scoreExplanation: generateScoreExplanation(overallScore),
      ballDataSummary: ballDataSummary || undefined,
      strengths,
      weaknesses,
      generatedAt: new Date(),
    },
  });

  // 8. Create metrics summary
  await prisma.assessmentMetricsSummary.upsert({
    where: { reportId: report.id },
    update: metrics,
    create: {
      reportId: report.id,
      ...metrics,
    },
  });

  console.log(`[Report Generator] Report generated successfully for session ${sessionId}`);
}

function calculateAggregatedMetrics(swings: any[]) {
  const validSwings = swings.filter((s) => s.metrics);

  if (validSwings.length === 0) {
    console.warn('[Report Generator] No valid swings with metrics found');
    return {};
  }

  const avg = (values: number[]) =>
    values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

  const max = (values: number[]) =>
    values.length > 0 ? Math.max(...values) : 0;

  const stdDev = (values: number[]) => {
    if (values.length === 0) return 0;
    const mean = avg(values);
    const squareDiffs = values.map((v) => Math.pow(v - mean, 2));
    return Math.sqrt(avg(squareDiffs));
  };

  // Extract metrics
  const batSpeeds = validSwings
    .map((s) => s.metrics.batSpeedMph)
    .filter((v): v is number => v !== null && v !== undefined);
  const pelvisVelocities = validSwings
    .map((s) => s.metrics.pelvisMaxVelocity)
    .filter((v): v is number => v !== null && v !== undefined);
  const torsoVelocities = validSwings
    .map((s) => s.metrics.torsoMaxVelocity)
    .filter((v): v is number => v !== null && v !== undefined);
  const armVelocities = validSwings
    .map((s) => s.metrics.armMaxVelocity)
    .filter((v): v is number => v !== null && v !== undefined);
  const sequenceScores = validSwings
    .map((s) => s.metrics.sequenceScore)
    .filter((v): v is number => v !== null && v !== undefined);
  const xFactors = validSwings
    .map((s) => s.metrics.hipShoulderSeparation)
    .filter((v): v is number => v !== null && v !== undefined);
  const frontKneeAngles = validSwings
    .map((s) => s.metrics.frontKneeAngle)
    .filter((v): v is number => v !== null && v !== undefined);
  const swingTimes = validSwings
    .map((s) => s.metrics.totalSwingTimeMs)
    .filter((v): v is number => v !== null && v !== undefined);

  return {
    avgBatSpeed: avg(batSpeeds),
    maxBatSpeed: max(batSpeeds),
    avgSwingTime: avg(swingTimes),
    avgPelvisVelocity: avg(pelvisVelocities),
    avgTorsoVelocity: avg(torsoVelocities),
    avgArmVelocity: avg(armVelocities),
    avgSequenceScore: avg(sequenceScores),
    avgXFactor: avg(xFactors),
    avgFrontKneeAngle: avg(frontKneeAngles),
    consistencyScore: Math.max(0, 100 - stdDev(batSpeeds) * 2), // Lower std dev = higher consistency
  };
}

function calculateBallDataSummary(ballData: any[]) {
  if (ballData.length === 0) {
    return null;
  }

  const exitVelos = ballData.map((b) => b.exitVelocity).filter((v): v is number => v !== null && v !== undefined);
  const launchAngles = ballData.map((b) => b.launchAngle).filter((v): v is number => v !== null && v !== undefined);
  const distances = ballData.map((b) => b.distance).filter((v): v is number => v !== null && v !== undefined);

  const avg = (values: number[]) =>
    values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const max = (values: number[]) =>
    values.length > 0 ? Math.max(...values) : 0;
  const min = (values: number[]) =>
    values.length > 0 ? Math.min(...values) : 0;

  const barrelCount = ballData.filter((b) => b.result === 'barrel').length;
  const solidCount = ballData.filter((b) => b.result === 'solid').length;

  return {
    avgExitVelocity: avg(exitVelos),
    maxExitVelocity: max(exitVelos),
    minExitVelocity: min(exitVelos),
    avgLaunchAngle: avg(launchAngles),
    avgDistance: avg(distances),
    maxDistance: max(distances),
    barrelRate: (barrelCount / ballData.length) * 100,
    solidContactRate: ((barrelCount + solidCount) / ballData.length) * 100,
    totalSwings: ballData.length,
  };
}

function calculateOverallScore(
  metrics: any,
  ballDataSummary: any
): number {
  let score = 0;
  let weight = 0;

  // Bat speed (25%)
  if (metrics.avgBatSpeed) {
    score += normalizeBatSpeed(metrics.avgBatSpeed) * 0.25;
    weight += 0.25;
  }

  // Sequence score (25%)
  if (metrics.avgSequenceScore) {
    score += metrics.avgSequenceScore * 0.25;
    weight += 0.25;
  }

  // Consistency (15%)
  if (metrics.consistencyScore) {
    score += metrics.consistencyScore * 0.15;
    weight += 0.15;
  }

  // Exit velocity (20%)
  if (ballDataSummary?.avgExitVelocity) {
    score += normalizeExitVelo(ballDataSummary.avgExitVelocity) * 0.2;
    weight += 0.2;
  }

  // Barrel rate (15%)
  if (ballDataSummary?.barrelRate !== undefined) {
    score += ballDataSummary.barrelRate * 0.15;
    weight += 0.15;
  }

  // Normalize to 0-100
  return weight > 0 ? score / weight : 0;
}

function normalizeBatSpeed(batSpeedMph: number): number {
  // Normalize to 0-100 scale
  // 60 mph = 0, 80 mph = 100 (typical range)
  return Math.min(100, Math.max(0, ((batSpeedMph - 60) / 20) * 100));
}

function normalizeExitVelo(exitVeloMph: number): number {
  // Normalize to 0-100 scale
  // 70 mph = 0, 95 mph = 100 (typical range)
  return Math.min(100, Math.max(0, ((exitVeloMph - 70) / 25) * 100));
}

function generateSummaryText(
  metrics: any,
  ballDataSummary: any,
  overallScore: number,
  totalSwings: number
): string {
  const tier =
    overallScore >= 85
      ? 'Elite'
      : overallScore >= 70
      ? 'Advanced'
      : overallScore >= 55
      ? 'Intermediate'
      : 'Developing';

  let summary = `Overall Assessment: ${tier} (${overallScore.toFixed(1)}/100)\n\n`;

  summary += `This assessment analyzed ${totalSwings} swings with comprehensive biomechanical and ball flight data.\n\n`;

  if (metrics.avgBatSpeed) {
    summary += `Bat Speed: ${metrics.avgBatSpeed.toFixed(1)} mph (avg), ${metrics.maxBatSpeed?.toFixed(1) || 'N/A'} mph (max)\n`;
  }

  if (metrics.avgSequenceScore) {
    summary += `Kinematic Sequence: ${metrics.avgSequenceScore.toFixed(1)}/100 - ${metrics.avgSequenceScore >= 80 ? 'Excellent' : metrics.avgSequenceScore >= 60 ? 'Good' : 'Needs work'}\n`;
  }

  if (ballDataSummary) {
    summary += `\nBall Contact:\n`;
    summary += `- Exit Velocity: ${ballDataSummary.avgExitVelocity.toFixed(1)} mph (avg), ${ballDataSummary.maxExitVelocity.toFixed(1)} mph (max)\n`;
    summary += `- Barrel Rate: ${ballDataSummary.barrelRate.toFixed(1)}%\n`;
    summary += `- Solid Contact Rate: ${ballDataSummary.solidContactRate.toFixed(1)}%\n`;
  }

  return summary;
}

function generateScoreExplanation(score: number): string {
  if (score >= 85) {
    return 'Elite-level mechanics with excellent kinematic sequencing and consistent ball contact. Minimal mechanical adjustments needed.';
  } else if (score >= 70) {
    return 'Advanced mechanics with good fundamentals. Some refinement opportunities exist in timing and consistency.';
  } else if (score >= 55) {
    return 'Intermediate mechanics with solid foundation. Focus on improving kinematic sequence timing and bat speed development.';
  } else {
    return 'Developing mechanics. Prioritize fundamental movement patterns and consistent practice of key drills.';
  }
}

function identifyStrengths(metrics: any, ballDataSummary: any): any[] {
  const strengths = [];

  if (metrics.avgBatSpeed && metrics.avgBatSpeed >= 75) {
    strengths.push({
      area: 'Bat Speed',
      description: `Strong bat speed averaging ${metrics.avgBatSpeed.toFixed(1)} mph, indicating good rotational power and hand speed.`,
    });
  }

  if (metrics.avgSequenceScore && metrics.avgSequenceScore >= 75) {
    strengths.push({
      area: 'Kinematic Sequence',
      description: `Excellent proximal-to-distal sequencing (${metrics.avgSequenceScore.toFixed(1)}/100), showing efficient energy transfer from pelvis → torso → arms → bat.`,
    });
  }

  if (metrics.consistencyScore && metrics.consistencyScore >= 75) {
    strengths.push({
      area: 'Consistency',
      description: `High swing consistency (${metrics.consistencyScore.toFixed(1)}/100), demonstrating repeatable mechanics and muscle memory.`,
    });
  }

  if (ballDataSummary?.barrelRate && ballDataSummary.barrelRate >= 50) {
    strengths.push({
      area: 'Barrel Contact',
      description: `Strong barrel rate of ${ballDataSummary.barrelRate.toFixed(1)}%, indicating elite bat-to-ball skills and swing decisions.`,
    });
  }

  return strengths;
}

function identifyWeaknesses(metrics: any, ballDataSummary: any): any[] {
  const weaknesses = [];

  if (metrics.avgBatSpeed && metrics.avgBatSpeed < 70) {
    weaknesses.push({
      area: 'Bat Speed',
      description: `Below-average bat speed (${metrics.avgBatSpeed.toFixed(1)} mph). Focus on rotational power development and hand speed drills.`,
      priority: 'high',
    });
  }

  if (metrics.avgSequenceScore && metrics.avgSequenceScore < 60) {
    weaknesses.push({
      area: 'Kinematic Sequence',
      description: `Inefficient movement sequence (${metrics.avgSequenceScore.toFixed(1)}/100). Work on pelvis-first rotation and timing between body segments.`,
      priority: 'high',
    });
  }

  if (metrics.consistencyScore && metrics.consistencyScore < 60) {
    weaknesses.push({
      area: 'Consistency',
      description: `High variability in swing metrics (${metrics.consistencyScore.toFixed(1)}/100). Increase repetitions and focus on repeatable positions.`,
      priority: 'medium',
    });
  }

  if (ballDataSummary?.barrelRate && ballDataSummary.barrelRate < 30) {
    weaknesses.push({
      area: 'Barrel Contact',
      description: `Low barrel rate (${ballDataSummary.barrelRate.toFixed(1)}%). Work on bat path efficiency and pitch recognition.`,
      priority: 'high',
    });
  }

  return weaknesses;
}
