'use client';

import { motion } from 'framer-motion';
import { ScoreCard } from '@/components/score-card';
import { MetricValue } from '@/lib/engine-metrics-config';

interface SubCategory {
  name: string;
  score: number;
  description?: string;
}

interface AEWCardsSectionProps {
  anchorScore: number;
  engineScore: number;
  whipScore: number;
  anchorMetrics?: MetricValue[];
  engineMetrics?: MetricValue[];
  whipMetrics?: MetricValue[];
  anchorSubCategories?: SubCategory[];
  engineSubCategories?: SubCategory[];
  whipSubCategories?: SubCategory[];
}

export function AEWCardsSection({
  anchorScore,
  engineScore,
  whipScore,
  anchorMetrics,
  engineMetrics,
  whipMetrics,
  anchorSubCategories,
  engineSubCategories,
  whipSubCategories,
}: AEWCardsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="mb-6"
    >
      {/* Section Header */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white mb-1">Body Metrics Breakdown</h2>
        <p className="text-sm text-gray-400">
          Motion (Timing) • Stability • Sequencing
        </p>
      </div>

      {/* Three cards stacked vertically */}
      <div className="space-y-4">
        {/* ANCHOR Card */}
        <ScoreCard
          title="ANCHOR (FEET & GROUND)"
          score={anchorScore}
          maxScore={100}
          icon="⚓"
          description="How well you use the ground to stay balanced and create power"
          color="orange"
          detailedMetrics={anchorMetrics}
          subCategories={anchorSubCategories}
        />

        {/* ENGINE Card */}
        <ScoreCard
          title="ENGINE (HIPS & SHOULDERS)"
          score={engineScore}
          maxScore={100}
          icon="🔄"
          description="How well your hips and shoulders work together to create power"
          color="green"
          detailedMetrics={engineMetrics}
          subCategories={engineSubCategories}
        />

        {/* WHIP Card */}
        <ScoreCard
          title="WHIP (ARMS & BAT)"
          score={whipScore}
          maxScore={100}
          icon="⚡"
          description="How well you transfer energy through your arms to the bat"
          color="purple"
          detailedMetrics={whipMetrics}
          subCategories={whipSubCategories}
        />
      </div>
    </motion.div>
  );
}
