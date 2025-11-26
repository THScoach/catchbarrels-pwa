# Momentum Transfer Card — UI Specification

**Version:** 1.0  
**Last Updated:** November 26, 2024

---

## Overview

The **Momentum Transfer Card** is the primary visual component for displaying swing analysis results in the BARRELS app. It shows the Momentum Transfer Score (the master metric) along with Anchor/Engine/Whip sub-scores and AI-generated coaching feedback.

---

## 1. Visual Layout

The card appears at the **TOP** of every swing report, above detailed metrics and drill recommendations.

```
┌──────────────────────────────────────────────┐
│ ⚡ MOMENTUM TRANSFER          [Advanced]     │
│                                              │
│   87                                         │
│   How cleanly energy passes Ground→Barrel    │
│                                              │
│   Anchor  ▓▓▓▓▓░░░░░  72  (Ground → Hips)   │
│   Engine  ▓▓▓▓▓▓▓▓▓░  90  (Hips → Torso)    │
│   Whip    ▓▓▓▓▓▓▓▓░░  85  (Torso → Barrel)  │
│                                              │
│   "Your energy flows well, with a small leak │
│    in the lower half."                       │
└──────────────────────────────────────────────┘
```

---

## 2. Component Props (TypeScript)

```typescript
import type { MomentumTransferAnalysis } from '@/lib/scoring/analysis-output-types';

interface MomentumTransferCardProps {
  analysis: MomentumTransferAnalysis;  // Full JSON structure
  showCoaching?: boolean;              // Show AI-generated coaching text
  showTimingDetails?: boolean;         // Show expandable timing section
}
```

### Full Data Structure:

```typescript
interface MomentumTransferAnalysis {
  videoId: string;
  athlete: {
    name: string;
    level: 'MLB' | 'College' | 'HS' | 'Youth';
    age: number;
    bats: 'R' | 'L' | 'S';
    throws: 'R' | 'L' | 'S';
  };
  scores: {
    momentumTransfer: {
      score: number;              // 0-100
      goatyBand: number;          // -3 to +3
      goatyLabel: string;         // "Elite", "Advanced", etc.
      confidence: number;         // 0.0-1.0
    };
    anchor: {
      score: number;              // 0-100
      label: string;              // "Ground → Hips"
      leakSeverity: 'none' | 'mild' | 'moderate' | 'severe';
    };
    engine: {
      score: number;
      label: string;              // "Hips → Torso"
      leakSeverity: 'none' | 'mild' | 'moderate' | 'severe';
    };
    whip: {
      score: number;
      label: string;              // "Torso → Barrel"
      leakSeverity: 'none' | 'mild' | 'moderate' | 'severe';
    };
  };
  timing: {
    abRatio: number;
    loadDurationMs: number;
    swingDurationMs: number;
    sequenceOrder: string[];
    segmentGapsMs: {
      pelvisToTorso: number;
      torsoToHands: number;
      handsToBat: number;
    };
  };
  flags: {
    mainLeak: 'anchor' | 'engine' | 'whip' | 'none';
    secondaryLeak: 'anchor' | 'engine' | 'whip' | null;
    sequenceBroken: boolean;
  };
  coachSummary: {
    overall: string;              // 1-2 sentences about MTS
    leak: string;                 // 1-2 sentences about leak location
    nextStep: string;             // 1 sentence with actionable focus
  };
}
```

---

## 3. UI Elements & Mapping

### 3.1 Header Section

| UI Element | JSON Path | Example Value |
|------------|-----------|---------------|
| Icon | Static | ⚡ (Zap icon) |
| Title | Static | "MOMENTUM TRANSFER" |
| Badge | `scores.momentumTransfer.goatyLabel` | "Advanced" |
| Badge Color | Based on `scores.momentumTransfer.goatyBand` | Gold gradient |

### 3.2 Main Score Display

| UI Element | JSON Path | Example Value |
|------------|-----------|---------------|
| Score Number | `scores.momentumTransfer.score` | 87 |
| Subtitle | Static | "How cleanly your swing passes energy Ground → Hips → Torso → Barrel" |

### 3.3 Sub-Scores (Anchor/Engine/Whip)

| UI Element | JSON Path | Example Value |
|------------|-----------|---------------|
| Anchor Score | `scores.anchor.score` | 72 |
| Anchor Label | `scores.anchor.label` | "Ground → Hips" |
| Anchor Bar | Progress bar (0-100%) | 72% filled |
| Anchor Leak | `scores.anchor.leakSeverity` | 🔥 (1 flame) |
| Engine Score | `scores.engine.score` | 90 |
| Engine Label | `scores.engine.label` | "Hips → Torso" |
| Whip Score | `scores.whip.score` | 85 |
| Whip Label | `scores.whip.label` | "Torso → Barrel" |

### 3.4 Leak Indicators

Use `leakSeverity` to show flame emojis:

- **none**: No indicator
- **mild**: 🔥 (1 flame, yellow)
- **moderate**: 🔥🔥 (2 flames, orange)
- **severe**: 🔥🔥🔥 (3 flames, red)

Highlight the **main leak** with a red border around the sub-score card.

### 3.5 Coaching Text

| UI Element | JSON Path | Example Value |
|------------|-----------|---------------|
| Overall | `coachSummary.overall` | "Your momentum transfer is 87, which is advanced..." |
| Leak | `coachSummary.leak` | "The lower body is late or unstable..." |
| Next Step | `coachSummary.nextStep` | "Next step: Learn to load into the ground..." |

---

## 4. Color Rules (GOATY Bands)

Badge and accent colors based on `goatyBand` (-3 to +3):

| Band | Label | Color | Tailwind Classes |
|------|-------|-------|------------------|
| +3 | Elite | Green | `from-green-500 to-emerald-600` |
| +2 | Advanced | Gold | `from-barrels-gold to-barrels-gold-light` |
| +1 | Above Average | Blue | `from-blue-500 to-blue-600` |
| 0 | Average | Gray | `from-gray-400 to-gray-500` |
| -1 | Below Average | Orange | `from-orange-500 to-orange-600` |
| -2, -3 | Poor/Needs Work | Red | `from-red-500 to-red-600` |

---

## 5. Usage Example

### In a Video Analysis Page:

```tsx
import { MomentumTransferCard } from '@/components/momentum-transfer-card';

export default async function VideoAnalysisPage({ params }: { params: { id: string } }) {
  // Fetch analysis data from API
  const response = await fetch(`/api/videos/${params.id}/analysis-summary`);
  const analysis = await response.json();
  
  return (
    <div className="max-w-2xl mx-auto p-4">
      <MomentumTransferCard 
        analysis={analysis}
        showCoaching={true}
        showTimingDetails={true}
      />
      
      {/* Other analysis components below... */}
    </div>
  );
}
```

---

## 6. API Integration

### Endpoint: `GET /api/videos/[id]/analysis-summary`

Returns the full `MomentumTransferAnalysis` JSON structure.

**Example Response:**

```json
{
  "videoId": "mlb_ohtani_hr_01",
  "athlete": {
    "name": "Shohei Ohtani",
    "level": "MLB",
    "age": 30,
    "bats": "L",
    "throws": "R"
  },
  "scores": {
    "momentumTransfer": {
      "score": 94,
      "goatyBand": 3,
      "goatyLabel": "Elite",
      "confidence": 0.93
    },
    "anchor": {
      "score": 92,
      "label": "Ground → Hips",
      "leakSeverity": "none"
    },
    "engine": {
      "score": 96,
      "label": "Hips → Torso",
      "leakSeverity": "none"
    },
    "whip": {
      "score": 93,
      "label": "Torso → Barrel",
      "leakSeverity": "none"
    }
  },
  "timing": {
    "abRatio": 1.37,
    "loadDurationMs": 212,
    "swingDurationMs": 155,
    "sequenceOrder": ["pelvis", "torso", "hands", "bat"],
    "segmentGapsMs": {
      "pelvisToTorso": 38,
      "torsoToHands": 43,
      "handsToBat": 26
    }
  },
  "flags": {
    "mainLeak": "none",
    "secondaryLeak": null,
    "sequenceBroken": false
  },
  "coachSummary": {
    "overall": "Your momentum transfer is 94, which is elite. The energy flows from the ground, through your body, into the barrel with almost no leaks.",
    "leak": "There's no major leak here – the lower body, core, and barrel are all playing in the right order.",
    "nextStep": "The focus at this level is tiny refinements and repeating this pattern under different speeds and pitch types."
  }
}
```

---

## 7. Coach Rick AI Integration

The `coachSummary` field is generated by Coach Rick AI using the `/api/coach-rick` endpoint.

### How It Works:

1. Scoring engine produces raw scores (Momentum Transfer, Anchor, Engine, Whip)
2. `formatAnalysisOutput()` in `lib/scoring/analysis-output.ts` calls `generateMomentumCoaching()`
3. Coaching logic identifies the main leak and generates 3-part explanation
4. Result is stored in `coachSummary` field
5. UI displays the coaching text directly

**3-Part Structure:**

1. **Overall**: Explain the Momentum Transfer score in 1-2 sentences
2. **Leak**: Identify where energy is lost (Anchor/Engine/Whip)
3. **Next Step**: One simple focus for the next rep (no drill names)

---

## 8. Responsive Design

- **Mobile (< 640px)**: Single column, full-width bars
- **Tablet (640-1024px)**: Slightly larger text, more spacing
- **Desktop (> 1024px)**: Max width 700px, centered

---

## 9. Animations

- **Card entry**: Fade in + slide up (0.5s duration)
- **Score counter**: Count up animation (0.8s duration)
- **Progress bars**: Fill from left to right with stagger (0.8s total)
- **Coaching text**: Fade in after bars complete (0.8s delay)

---

## 10. Accessibility

- All colors meet WCAG AA contrast standards (4.5:1 minimum)
- Progress bars include `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- Coaching text is semantic HTML (`<p>` tags)
- Keyboard navigation supported (expandable timing section)

---

## 11. Testing Checklist

### Visual Tests:
- [ ] Card displays correctly on mobile (< 640px)
- [ ] Card displays correctly on desktop (> 1024px)
- [ ] All GOATY band colors render correctly (Elite, Advanced, Average, etc.)
- [ ] Leak indicators show correct number of flames
- [ ] Main leak has red border highlight
- [ ] Progress bars fill to correct percentages
- [ ] Coaching text is readable and wraps properly

### Functional Tests:
- [ ] Timing details expand/collapse on button click
- [ ] All scores display correct values from API
- [ ] Coach summary text matches mock data
- [ ] No console errors or warnings
- [ ] TypeScript compiles without errors

### Edge Cases:
- [ ] Score = 0 (should show empty bar)
- [ ] Score = 100 (should show full bar)
- [ ] All leakSeverity = "none" (no flame icons)
- [ ] All leakSeverity = "severe" (3 flames each)
- [ ] sequenceBroken = true (should show warning)
- [ ] Missing athlete data (graceful degradation)

---

## 12. File References

| File | Purpose |
|------|----------|
| `/components/momentum-transfer-card.tsx` | Main UI component |
| `/lib/scoring/analysis-output-types.ts` | TypeScript interfaces |
| `/lib/scoring/analysis-output.ts` | Output formatting logic |
| `/lib/momentum-coaching.ts` | Coaching text generation |
| `/app/api/videos/[id]/analysis-summary/route.ts` | API endpoint |
| `/app/api/coach-rick/route.ts` | Coach Rick AI endpoint |

---

## 13. Future Enhancements

- [ ] Add "Compare to Previous" button
- [ ] Show historical trend (Momentum Transfer over time)
- [ ] Add "Ask Coach Rick" inline chat button
- [ ] Show drill recommendations based on main leak
- [ ] Add video overlay showing leak location on skeleton
- [ ] Export report as PDF

---

## Summary

The Momentum Transfer Card is a production-ready component that displays swing analysis results in a clear, mobile-friendly format. It integrates seamlessly with the scoring engine, Coach Rick AI, and the BARRELS design system.

**Key Features:**
- ✅ Standardized JSON structure
- ✅ GOATY band color coding
- ✅ Leak severity indicators
- ✅ AI-generated coaching feedback
- ✅ Expandable timing details
- ✅ Responsive design
- ✅ WCAG AA accessible
- ✅ TypeScript type-safe

---

**Questions?** Contact the development team or refer to the implementation files listed above.
