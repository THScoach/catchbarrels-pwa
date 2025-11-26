/**
 * Momentum Transfer Coaching Explanations
 * 
 * BARRELS Flow Path Model™:
 * - Ground Flow (Ground → Hips)
 * - Power Flow (Hips → Torso)
 * - Barrel Flow (Torso → Barrel)
 * 
 * Generates simple, actionable coaching text based on momentum transfer scores.
 * Logic designed by Coach Rick for the BARRELS app.
 */

export interface MomentumScores {
  momentumTransferScore: number;      // 0-100
  groundFlowScore: number;            // 0-100 (Ground → Hips)
  powerFlowScore: number;             // 0-100 (Hips → Torso)
  barrelFlowScore: number;            // 0-100 (Torso → Barrel)
  goatyBandLabel: string;             // "Elite", "Advanced", etc.
  // Legacy field names for backward compatibility
  anchorScore?: number;
  engineScore?: number;
  whipScore?: number;
}

export interface CoachingExplanation {
  overallLine: string;                // 1-2 sentences about MTS
  leakLine: string;                   // 1-2 sentences about where the leak is
  nextStep: string;                   // 1 sentence with a feel cue
  fullText: string;                   // All 3 combined (max 4 sentences)
}

/**
 * Generate coaching explanation based on momentum transfer scores
 */
export function generateMomentumCoaching(scores: MomentumScores): CoachingExplanation {
  const { 
    momentumTransferScore, 
    groundFlowScore, 
    powerFlowScore, 
    barrelFlowScore, 
    goatyBandLabel,
    // Fallback to legacy names if new ones aren't provided
    anchorScore,
    engineScore,
    whipScore
  } = scores;
  
  // Use new field names, with fallback to legacy
  const ground = groundFlowScore ?? anchorScore ?? 0;
  const power = powerFlowScore ?? engineScore ?? 0;
  const barrel = barrelFlowScore ?? whipScore ?? 0;
  
  // Step 1: Overall line based on MTS
  let overallLine = '';
  
  if (momentumTransferScore >= 92) {
    overallLine = `Your momentum transfer is **elite** (${momentumTransferScore}). You're sequencing like a pro and letting the barrel work.`;
  } else if (momentumTransferScore >= 85) {
    overallLine = `Your momentum transfer is **advanced** (${momentumTransferScore}). The pattern is solid – now we're chasing tiny efficiency gains.`;
  } else if (momentumTransferScore >= 75) {
    overallLine = `Your timing pattern is **above average** (${momentumTransferScore}). You create flow; we just need to clean up a small leak or two.`;
  } else if (momentumTransferScore >= 60) {
    overallLine = `You're **creating speed** (${momentumTransferScore}), but you're leaving power on the table as energy moves through the body.`;
  } else {
    overallLine = `Your swing looks like effort, not flow right now (${momentumTransferScore}). The energy isn't traveling smoothly through your body yet.`;
  }
  
  // Step 2: Identify where the main leak is
  const leaks: Array<{ zone: 'groundFlow' | 'powerFlow' | 'barrelFlow'; score: number; gap: number }> = [
    { zone: 'groundFlow', score: ground, gap: momentumTransferScore - ground },
    { zone: 'powerFlow', score: power, gap: momentumTransferScore - power },
    { zone: 'barrelFlow', score: barrel, gap: momentumTransferScore - barrel },
  ];
  
  // Sort by largest gap (biggest leak)
  leaks.sort((a, b) => b.gap - a.gap);
  
  let leakLine = '';
  let nextStep = '';
  
  // Only mention leak if gap is >= 10 points
  const mainLeak = leaks[0];
  if (mainLeak.gap >= 10) {
    switch (mainLeak.zone) {
      case 'groundFlow':
        leakLine = "Your ground flow is inconsistent—the lower body isn't holding or loading long enough for clean hip initiation.";
        nextStep = "Next step: Learn to **load into the ground and hold it** so your hips can fire at the right time.";
        break;
        
      case 'powerFlow':
        leakLine = "Your power flow has a leak—the core isn't fully accepting what the hips started. You're either dumping early or spinning flat.";
        nextStep = "Next step: Learn to **let the hips start and the torso follow**, instead of everything spinning together.";
        break;
        
      case 'barrelFlow':
        leakLine = "Your barrel flow is mistimed—the hands and bat aren't catching the wave of energy from the core.";
        nextStep = "Next step: Learn to **let the barrel snap late**, so it catches the energy instead of forcing it.";
        break;
    }
  } else {
    // No major leak - everything is balanced
    leakLine = "Your energy flow through Ground Flow → Power Flow → Barrel Flow is balanced.";
    nextStep = "Next step: Focus on **consistency** and let the pattern settle in with reps.";
  }
  
  // Step 3: Combine into full text (max 4 sentences)
  const fullText = `${overallLine} ${leakLine} ${nextStep}`;
  
  return {
    overallLine,
    leakLine,
    nextStep,
    fullText,
  };
}

/**
 * Get short header text for momentum transfer card
 */
export function getMomentumHeaderText(score: number): string {
  if (score >= 92) {
    return "Your energy flows through your body like a clean whip. This is big-league level sequencing.";
  } else if (score >= 85) {
    return "Your timing pattern is strong. There are small leaks we can clean up.";
  } else if (score >= 75) {
    return "You create speed, but you're leaking energy between body segments.";
  } else if (score >= 60) {
    return "Your swing has effort, but the energy isn't traveling cleanly through your body yet.";
  } else {
    return "The energy isn't flowing smoothly through your body. Let's build the pattern from the ground up.";
  }
}

/**
 * Get interpretation for sub-score (Anchor/Engine/Whip)
 */
export function getSubScoreInterpretation(score: number): string {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Strong';
  if (score >= 70) return 'Solid';
  if (score >= 60) return 'Fair';
  return 'Needs Work';
}
