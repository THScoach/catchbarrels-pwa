# Momentum-Transfer First Scoring Model

## Overview

The BARRELS scoring engine has been refactored to implement a **momentum-transfer and timing first** approach, where the quality of energy transfer from Anchor → Engine → Whip is the primary driver of the score.

## Core Philosophy

> **"Momentum Transfer Score (MTS)**: How well does energy/speed hand off from lower body → core → arms/bat over time?"

### Scoring Breakdown

**Final Mechanics Score (0-100):**
```
mechanicsScore = 
  0.60 × momentumTransferScore +
  0.15 × anchorScore +
  0.15 × engineScore +
  0.10 × whipScore
```

- **Momentum Transfer (60%)**: Global timing & sequencing quality
- **Anchor (15%)**: Lower body momentum setup
- **Engine (15%)**: Core momentum amplification  
- **Whip (10%)**: Arms/bat momentum release

---

## Momentum Transfer Score (MTS)

### Components (weighted):

1. **Sequence Order Score (30%)**
   - Correct pelvis → torso → hands → bat order
   - 100 = perfect order
   - 75 = one adjacent swap
   - 50 = two segments out of order
   - 25 = clearly broken

2. **Timing Gap Scores (40% total)**
   - **Pelvis→Torso Gap (15%)**: Ideal 30-50ms
   - **Torso→Hands Gap (15%)**: Ideal 35-55ms
   - **Hands→Bat Gap (10%)**: Ideal 20-40ms
   - Uses tolerance band scoring

3. **Deceleration Quality Score (15%)**
   - Upstream segments should decelerate while downstream peaks
   - Checks pelvis decel before torso peak
   - Checks torso decel before hands peak

4. **Smoothness Score (10%)**
   - Uses pelvis jerk metric (lower = smoother)
   - Smooth momentum flow = higher score

5. **A-B-C Tempo Score (5%)**
   - Evaluates Load (A→B) and Swing (B→C) durations
   - Rewards consistent A:B:C ratio

---

## Sub-Scores

### Anchor Score (Lower Body)
**Question**: "How well does the lower body set up and launch momentum transfer?"

**Calculation**:
```
anchorScore = 
  0.70 × comBalance +    // pelvis trajectory, weight transfer
  0.30 × posture         // base stability
```

### Engine Score (Core/Torso)
**Question**: "Does the torso accept and amplify what the Anchor gives it?"

**Calculation**:
```
engineScore = 
  0.60 × sequence +      // kinematic chain timing
  0.40 × tempo           // A-B-C timing
```

### Whip Score (Arms/Bat)
**Question**: "Did the arms and bat accept upstream energy and release it at the right moment?"

**Calculation**:
```
whipScore = handPath   // efficiency and barrel delivery
```

---

## Momentum Transfer Caps

### Global Rule: MTS Caps Everything

To prevent "pretty positions, bad flow" scores:

- **If MTS < 40**: Cap final score at **60**
- **If MTS < 50**: Cap final score at **70**

A hitter **cannot** achieve a high score through position alone with broken timing/sequencing.

---

## Calibration Targets

### MTS Bands:
- **90-100**: Elite transfer (MLB all-star level)
- **80-89**: Pro / D1 level transfer
- **70-79**: Advanced amateur
- **60-69**: Solid but leaky
- **< 60**: Major sequencing or timing issues

### Expected Final Scores:
- **MLB hitters**: 85-95 (consistent good sequencing)
- **College/HS**: 65-80
- **Youth/Poor mechanics**: < 60

---

## Configuration

All weights and thresholds are in `lib/scoring/config.ts`:

### Composite Weights:
```typescript
export const COMPOSITE_WEIGHTS = {
  momentumTransfer: 0.60,
  anchor: 0.15,
  engine: 0.15,
  whip: 0.10,
};
```

### Momentum Transfer Component Weights:
```typescript
export const MOMENTUM_TRANSFER_WEIGHTS = {
  sequenceOrderScore: 0.30,
  pelvisTorsoGapScore: 0.15,
  torsoHandsGapScore: 0.15,
  handsBatGapScore: 0.10,
  decelQualityScore: 0.15,
  smoothnessScore: 0.10,
  abcTempoScore: 0.05,
};
```

### Penalties:
```typescript
export const PENALTIES = {
  momentumTransferCaps: {
    enabled: true,
    cap70Threshold: 50,
    cap60Threshold: 40,
  },
  // ...
};
```

---

## Debug API

### Endpoint:
```
GET /api/dev/videos/[videoId]/scoring-debug
```

### Response includes:
```json
{
  "momentumTransferScore": 82,
  "momentumComponents": {
    "sequenceOrderScore": 100,
    "pelvisTorsoGapScore": 85,
    "torsoHandsGapScore": 78,
    "handsBatGapScore": 90,
    "decelQualityScore": 70,
    "smoothnessScore": 88,
    "abcTempoScore": 80
  },
  "anchorScore": 76,
  "engineScore": 82,
  "whipScore": 78,
  "finalMechanicsScore": 80,
  "debugBreakdown": { /* full breakdown */ }
}
```

---

## Implementation Details

### Files Modified:
1. **lib/scoring/types.ts**
   - Added `MomentumTransferComponents` interface
   - Added `MomentumTransferScore` interface
   - Added `SubScores` interface
   - Updated `ScoringResult` with momentum transfer data
   - Updated `DebugBreakdown` structure

2. **lib/scoring/config.ts**
   - Added `COMPOSITE_WEIGHTS`
   - Added `MOMENTUM_TRANSFER_WEIGHTS`
   - Added `momentumTransferCaps` penalty

3. **lib/scoring/newScoringEngine.ts**
   - Added `calculateMomentumTransferScore()` function
   - Added `calculateDecelQualityScore()` function
   - Added `calculateAnchorScore()` function
   - Added `calculateEngineScore()` function
   - Added `calculateWhipScore()` function
   - Updated `scoreSwing()` to use new model
   - Updated `buildDebugBreakdown()` with momentum data

4. **app/api/dev/videos/[id]/scoring-debug/route.ts**
   - Enhanced response to show momentum transfer scores at top level
   - Added composite weights to config output

---

## Key Changes from Previous Model

### Before (Category-based):
```
mechanicsScore = 
  0.35 × sequence +
  0.25 × tempo +
  0.15 × comBalance +
  0.15 × handPath +
  0.10 × posture
```

### After (Momentum-Transfer First):
```
mechanicsScore = 
  0.60 × momentumTransferScore +
  0.15 × anchor +
  0.15 × engine +
  0.10 × whip
```

**Why?** 
- Timing & sequencing now dominate (60% vs 35%)
- Position-based metrics (Anchor/Engine/Whip) are supporting factors
- Caps prevent high scores with poor momentum transfer
- MLB-calibrated: Good sequencers always score higher

---

## Tuning Guide

To adjust calibration:

1. **Increase MTS importance**: Raise `COMPOSITE_WEIGHTS.momentumTransfer` (max 0.80)
2. **Emphasize sequence order**: Raise `MOMENTUM_TRANSFER_WEIGHTS.sequenceOrderScore`
3. **Tighten timing gaps**: Adjust `THRESHOLDS.pelvisTorsoGap` ideal range
4. **Stricter caps**: Raise `cap70Threshold` to 55-60
5. **Test with real swings**: Use debug API to inspect MTS components

---

## Testing

### Unit Testing:
1. Upload videos at different skill levels
2. Check MTS scores via debug API
3. Verify caps are applied when MTS < 50
4. Ensure MLB swings score 85+

### Expected Behavior:
- ✅ MLB with good sequence: 85-95
- ✅ Amateur with broken sequence: capped at 60-70
- ✅ HS with solid timing: 70-80
- ✅ Youth with poor flow: < 60

---

## Rollback

To revert to the old model:
```typescript
// lib/scoring/config.ts
export const NEW_SCORING_ENGINE_ENABLED = false;
```

Then redeploy.
