/**
 * Type definitions for the new scoring engine
 */

// ========================================
// INPUT TYPES
// ========================================

export interface ScoringInputs {
  // Joint data from video analysis
  jointData: JointFrame[];
  
  // Optional metadata
  playerHeight?: number;              // inches
  fps?: number;                       // frames per second (default 60)
  playerLevel?: string;               // "youth" | "hs" | "college" | "pro" (for display only)
  
  // Optional user-marked frames (overrides auto-detection)
  manualImpactFrame?: number;
  manualLoadFrame?: number;
  manualLaunchFrame?: number;
}

export interface JointFrame {
  frameIndex?: number;                // Optional frame index
  timestamp?: number;                 // milliseconds
  frame?: number;                     // Alternative name for frameIndex
  keypoints?: Joint[];                // Alternative name for joints
  joints?: Joint[];                   // Array of joint positions
}

export interface Joint {
  name: string;                       // e.g., "left_hip", "right_wrist"
  x: number;                          // normalized 0-1
  y: number;                          // normalized 0-1
  z?: number;                         // depth (often unreliable)
  confidence?: number;                // 0-1
  visibility?: number;                // Alternative name for confidence
}

// ========================================
// PHASE DETECTION
// ========================================

export interface SwingPhases {
  loadFrame: number;                  // Phase A endpoint
  launchFrame: number;                // Phase B start
  impactFrame: number;                // Phase C endpoint
  
  // Durations (ms)
  loadDuration: number;               // A→B time
  swingDuration: number;              // B→C time
  totalDuration: number;              // A→C time
  abRatio: number;                    // A:B duration ratio
}

// ========================================
// FEATURE EXTRACTION
// ========================================

export interface ExtractedFeatures {
  // TEMPO features
  tempo: {
    loadDuration: number;             // ms
    swingDuration: number;            // ms
    abRatio: number;                  // ratio
  };
  
  // SEQUENCE features
  sequence: {
    sequenceOrder: string[];          // ["pelvis", "torso", "hands", "bat"]
    pelvisTorsoGap: number;           // ms
    torsoHandsGap: number;            // ms
    handsBatGap: number;              // ms
    pelvisPeakTiming: number;         // ms before impact
    torsoPeakTiming: number;
    handsPeakTiming: number;
    batPeakTiming: number;
  };
  
  // COM / BALANCE features
  comBalance: {
    pelvisJerk: number;               // pixels/s³ (lower is better)
    headDisplacement: number;         // cm
    weightTransfer: number;           // % (0-100)
  };
  
  // HAND PATH features
  handPath: {
    pathEfficiency: number;           // arc length / straight line
    barrelAngleDeviation: number;     // degrees from level
    rearElbowProximity: number;       // cm from torso
  };
  
  // POSTURE features
  posture: {
    spineAngleChange: number;         // degrees (B→C)
    shoulderTiltAtImpact: number;     // degrees from horizontal
  };
}

// ========================================
// FEATURE SCORING
// ========================================

export interface FeatureScore {
  name: string;                       // e.g., "loadDuration"
  category: string;                   // e.g., "tempo"
  rawValue: number | null;            // Raw measured value
  score: number;                      // 0-100 subscore
  weight: number;                     // Weight within category (0-1)
  ideal?: string;                     // Human-readable ideal range
  interpretation?: string;            // "Excellent", "Good", "Needs Work"
}

// ========================================
// OUTPUT TYPES
// ========================================

export interface CategoryScores {
  tempo: number;                      // 0-100
  sequence: number;                   // 0-100
  comBalance: number;                 // 0-100
  handPath: number;                   // 0-100
  posture: number;                    // 0-100
}

export interface LegacyScores {
  anchor: number;                     // 0-100 (maps to comBalance + posture)
  engine: number;                     // 0-100 (maps to sequence + tempo)
  whip: number;                       // 0-100 (maps to handPath)
}

export interface ScoringResult {
  // Final scores
  mechanicsScore: number;             // 0-100 composite
  goatyBand: number;                  // -3 to +3
  goatyBandLabel: string;             // "Elite", "Advanced", etc.
  
  // Category breakdowns
  categoryScores: CategoryScores;
  
  // Legacy scores (for UI continuity)
  legacyScores: LegacyScores;
  
  // Feature-level details (for debug/coaching)
  featureScores: FeatureScore[];
  
  // Debug breakdown
  debugBreakdown: DebugBreakdown;
  
  // Quality indicators
  confidence: number;                 // 0-1 (joint visibility)
  dataQuality: 'high' | 'medium' | 'low';
  
  // Applied adjustments
  adjustments: {
    criticalFeaturePenaltyApplied: boolean;
    lowConfidencePenalty: number;     // Points deducted
    originalScore?: number;           // Before adjustments
  };
}

// ========================================
// DEBUG / BREAKDOWN
// ========================================

export interface DebugBreakdown {
  // Input summary
  input: {
    frameCount: number;
    fps: number;
    confidenceAvg: number;
  };
  
  // Detected phases
  phases: SwingPhases;
  
  // Raw feature values
  features: ExtractedFeatures;
  
  // Scored features with details
  featureScores: FeatureScoreDetail[];
  
  // Category aggregation
  categoryBreakdown: CategoryBreakdown[];
  
  // Final composite calculation
  composite: {
    categoryScores: CategoryScores;
    categoryWeights: Record<string, number>;
    weightedSum: number;
    beforePenalties: number;
    afterPenalties: number;
    finalScore: number;
  };
  
  // Penalties applied
  penalties: {
    criticalFeature?: {
      applied: boolean;
      reason: string;
      impact: string;
    };
    lowConfidence?: {
      applied: boolean;
      confidenceLevel: number;
      pointsDeducted: number;
    };
  };
}

export interface FeatureScoreDetail extends FeatureScore {
  threshold?: {
    type: 'tolerance_band' | 'less_is_better' | 'more_is_better' | 'sequence_order';
    ideal?: [number, number] | number;
    acceptable?: [number, number] | number;
  };
  calculation?: string;               // Formula used to score
}

export interface CategoryBreakdown {
  category: string;
  features: FeatureScoreDetail[];
  weightedScores: number[];           // Feature score * feature weight
  categoryScore: number;              // Aggregated category score (0-100)
  weight: number;                     // Category weight in composite (0-1)
  contributionToComposite: number;    // Category score * category weight
}
