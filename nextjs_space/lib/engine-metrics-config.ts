/**
 * ENGINE Metrics Configuration
 * Kid-friendly language for 8th grade / HS hitters with GOAT pattern guidance
 */

export type MetricGrade = 'A' | 'B' | 'C' | 'D' | 'F' | 'Good' | 'OK' | 'Needs Work';

export interface MetricDefinition {
  name: string;
  what_it_is: string;
  why_it_matters: string;
  goat_pattern: string;
  category: 'motion' | 'stability' | 'sequencing';
  weight: number; // percentage contribution to category
}

export interface MetricValue extends MetricDefinition {
  value: number | null;
  grade: MetricGrade;
  color: 'green' | 'yellow' | 'red' | 'gray';
}

/**
 * ENGINE (Hips & Shoulders) - How well your hips and shoulders work together to create power
 */
export const ENGINE_METRICS: Record<string, MetricDefinition> = {
  // MOTION (40%) - How your hips and shoulders move
  hipTurn: {
    name: 'Hip Turn',
    what_it_is: 'How much your hips turn during the swing.',
    why_it_matters: 'Strong hip turn drives power from the ground up.',
    goat_pattern: 'In GOAT swings, the hips get all the way through toward the pitcher by contact, not stuck facing home plate.',
    category: 'motion',
    weight: 40
  },
  
  shoulderTurn: {
    name: 'Shoulder Turn',
    what_it_is: 'How much your shoulders and chest turn.',
    why_it_matters: 'Your shoulders carry power from your hips into your arms and bat.',
    goat_pattern: 'In GOAT swings, the back shoulder really comes through the ball, not just the arms swinging.',
    category: 'motion',
    weight: 30
  },
  
  hipShoulderStretch: {
    name: 'Hip–Shoulder Stretch',
    what_it_is: 'How much your hips start to open while your shoulders stay back—the stretch you feel across your core.',
    why_it_matters: 'That stretch works like a pulled rubber band and helps snap the bat through the zone.',
    goat_pattern: 'In GOAT swings, the hips fire first while the chest stays back for a split second, then the chest launches like a whip.',
    category: 'motion',
    weight: 30
  },
  
  // STABILITY (30%) - How under control your body is
  postureControl: {
    name: 'Posture Control',
    what_it_is: 'How steady your body angle stays from start of swing to contact.',
    why_it_matters: 'Good posture means better balance and more consistent contact.',
    goat_pattern: 'In GOAT swings, the head stays about the same height while the lower body works underneath.',
    category: 'stability',
    weight: 35
  },
  
  shoulderFinish: {
    name: 'Shoulder Finish',
    what_it_is: 'Where your shoulders are at contact—under‑turned, just right, or spun too far.',
    why_it_matters: 'Too little turn kills power; too much turn makes you spin off the ball.',
    goat_pattern: 'In GOAT swings, the shoulders finish turned toward the pitcher but still "on" the ball, not flying open toward the dugout.',
    category: 'stability',
    weight: 35
  },
  
  backLegSupport: {
    name: 'Back Leg Support',
    what_it_is: 'How well your back leg holds you up instead of the back knee caving in.',
    why_it_matters: 'A strong back leg lets you drive the ground and keep your swing stable.',
    goat_pattern: 'In GOAT swings, the back leg stays strong and drives the ground instead of the back knee just collapsing.',
    category: 'stability',
    weight: 30
  },
  
  // SEQUENCING (20%) - Order and timing of hips & shoulders
  hipsFirst: {
    name: 'Hips First',
    what_it_is: 'Do your hips start turning before your shoulders?',
    why_it_matters: 'Great swings go hips → shoulders → arms → bat.',
    goat_pattern: 'In GOAT swings, the hips clearly win the race and the shoulders chase a split second later.',
    category: 'sequencing',
    weight: 30
  },
  
  hipsToShouldersTiming: {
    name: 'Hips‑to‑Shoulders Timing',
    what_it_is: 'How smoothly your shoulders speed up right after your hips are moving fastest.',
    why_it_matters: 'Shows how cleanly you pass power from hips to shoulders.',
    goat_pattern: 'In GOAT swings, it looks like a smooth wave—hips fire, then shoulders catch and go, not everything jerking at once.',
    category: 'sequencing',
    weight: 40
  },
  
  engineSequence: {
    name: 'Engine Sequence',
    what_it_is: 'Overall grade for how well your hips and shoulders follow the right order and timing.',
    why_it_matters: 'Summarizes how well your "engine" is working.',
    goat_pattern: 'GOAT swings almost always show a clean chain: hips → shoulders → bat.',
    category: 'sequencing',
    weight: 30
  }
};

/**
 * Calculate grade and color based on score (0-100)
 */
export function getGradeFromScore(score: number | null): { grade: MetricGrade; color: 'green' | 'yellow' | 'red' | 'gray' } {
  if (score === null || score === 0) {
    return { grade: 'Needs Work', color: 'gray' };
  }
  
  if (score >= 90) return { grade: 'A', color: 'green' };
  if (score >= 80) return { grade: 'B', color: 'green' };
  if (score >= 70) return { grade: 'C', color: 'yellow' };
  if (score >= 60) return { grade: 'D', color: 'yellow' };
  return { grade: 'F', color: 'red' };
}

/**
 * Map existing database fields to ENGINE metrics
 * This allows us to use existing data while introducing new UI
 */
export function mapEngineMetricsFromScores(scores: any): MetricValue[] {
  // Extract relevant scores
  const engineMotion = scores?.engineMotion || 0;
  const engineStability = scores?.engineStability || 0;
  const engineSequencing = scores?.engineSequencing || 0;
  const engineHipRotation = scores?.engineHipRotation || 0;
  const engineTorsoMechanics = scores?.engineTorsoMechanics || 0;
  const engineCorePower = scores?.engineCorePower || 0;
  
  // For now, map existing scores to the 9 metrics
  // In the future, these will be calculated individually in swing-analyzer.ts
  const metrics: MetricValue[] = [
    // MOTION (40%)
    {
      ...ENGINE_METRICS.hipTurn,
      value: engineHipRotation,
      ...getGradeFromScore(engineHipRotation)
    },
    {
      ...ENGINE_METRICS.shoulderTurn,
      value: engineTorsoMechanics,
      ...getGradeFromScore(engineTorsoMechanics)
    },
    {
      ...ENGINE_METRICS.hipShoulderStretch,
      value: engineCorePower,
      ...getGradeFromScore(engineCorePower)
    },
    
    // STABILITY (30%)
    {
      ...ENGINE_METRICS.postureControl,
      value: Math.round(engineStability * 0.35),
      ...getGradeFromScore(Math.round(engineStability * 0.35))
    },
    {
      ...ENGINE_METRICS.shoulderFinish,
      value: Math.round(engineStability * 0.35),
      ...getGradeFromScore(Math.round(engineStability * 0.35))
    },
    {
      ...ENGINE_METRICS.backLegSupport,
      value: Math.round(engineStability * 0.30),
      ...getGradeFromScore(Math.round(engineStability * 0.30))
    },
    
    // SEQUENCING (20%)
    {
      ...ENGINE_METRICS.hipsFirst,
      value: Math.round(engineSequencing * 0.30),
      ...getGradeFromScore(Math.round(engineSequencing * 0.30))
    },
    {
      ...ENGINE_METRICS.hipsToShouldersTiming,
      value: Math.round(engineSequencing * 0.40),
      ...getGradeFromScore(Math.round(engineSequencing * 0.40))
    },
    {
      ...ENGINE_METRICS.engineSequence,
      value: engineSequencing,
      ...getGradeFromScore(engineSequencing)
    }
  ];
  
  return metrics;
}

/**
 * GOAT target score for gap calculations
 */
export const GOAT_TARGET = 95;

/**
 * Calculate gap to GOAT for a given score
 */
export function calculateGapToGOAT(score: number): number {
  return Math.max(0, GOAT_TARGET - score);
}
