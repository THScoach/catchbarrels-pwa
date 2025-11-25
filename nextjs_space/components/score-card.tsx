
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, Minus, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { useState } from 'react';
import { MetricValue } from '@/lib/engine-metrics-config';

interface SubCategory {
  name: string;
  score: number;
  description?: string;
}

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore?: number;
  trend?: number;
  icon?: string;
  description?: string;
  color?: string;
  onClick?: () => void;
  subCategories?: SubCategory[];
  detailedMetrics?: MetricValue[]; // New prop for detailed ENGINE metrics
}

export function ScoreCard({
  title,
  score,
  maxScore = 100,
  trend,
  icon,
  description,
  color = 'blue',
  onClick,
  subCategories,
  detailedMetrics,
}: ScoreCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const percentage = (score / maxScore) * 100;

  const colorClasses = {
    blue: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
  };

  const bgClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  // Group detailed metrics by category if available
  const groupedMetrics = detailedMetrics
    ? {
        motion: detailedMetrics.filter((m) => m.category === 'motion'),
        stability: detailedMetrics.filter((m) => m.category === 'stability'),
        sequencing: detailedMetrics.filter((m) => m.category === 'sequencing'),
      }
    : null;

  const handleClick = () => {
    if ((subCategories && subCategories.length > 0) || detailedMetrics) {
      setIsExpanded(!isExpanded);
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative bg-gradient-to-br ${bgClass} border rounded-lg overflow-hidden`}
    >
      <div 
        onClick={handleClick}
        className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
      >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-sm font-medium text-gray-400 uppercase">{title}</h3>
          {icon && <span className="text-2xl mt-1 block">{icon}</span>}
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white">{score}</div>
          <div className="text-xs text-gray-400">/ {maxScore}</div>
        </div>
      </div>

      <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`h-2 rounded-full ${
            percentage >= 80
              ? 'bg-green-500'
              : percentage >= 60
              ? 'bg-orange-500'
              : percentage >= 40
              ? 'bg-orange-500'
              : 'bg-red-500'
          }`}
        />
      </div>

      {description && (
        <p className="text-xs text-gray-400 mb-2">{description}</p>
      )}

      {trend !== undefined && trend !== 0 && (
        <div className="flex items-center gap-1 text-xs">
          {trend > 0 ? (
            <>
              <ArrowUp className="w-3 h-3 text-green-500" />
              <span className="text-green-500">+{trend}</span>
            </>
          ) : trend < 0 ? (
            <>
              <ArrowDown className="w-3 h-3 text-red-500" />
              <span className="text-red-500">{trend}</span>
            </>
          ) : (
            <>
              <Minus className="w-3 h-3 text-gray-400" />
              <span className="text-gray-400">No change</span>
            </>
          )}
          <span className="text-gray-400">vs last week</span>
        </div>
      )}

      {/* Expand/Collapse indicator */}
      {((subCategories && subCategories.length > 0) || detailedMetrics) && (
        <div className="flex items-center justify-center mt-2 text-xs text-gray-400">
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              <span>Hide Details</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              <span>Show Details</span>
            </>
          )}
        </div>
      )}
      </div>

      {/* Detailed Metrics (new ENGINE view) */}
      <AnimatePresence>
        {isExpanded && detailedMetrics && groupedMetrics && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-700/50"
          >
            <div className="p-4 space-y-6 bg-black/20">
              {/* Motion Section */}
              {groupedMetrics.motion.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="bg-blue-500/20 px-2 py-0.5 rounded text-blue-300 text-xs">
                      40%
                    </span>
                    Motion (Timing)
                  </h4>
                  <div className="space-y-4">
                    {groupedMetrics.motion.map((metric, idx) => (
                      <MetricDetailCard
                        key={idx}
                        metric={metric}
                        delay={idx * 0.1}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Stability Section */}
              {groupedMetrics.stability.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="bg-purple-500/20 px-2 py-0.5 rounded text-purple-300 text-xs">
                      30%
                    </span>
                    Stability
                  </h4>
                  <div className="space-y-4">
                    {groupedMetrics.stability.map((metric, idx) => (
                      <MetricDetailCard
                        key={idx}
                        metric={metric}
                        delay={idx * 0.1}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Sequencing Section */}
              {groupedMetrics.sequencing.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="bg-amber-500/20 px-2 py-0.5 rounded text-amber-300 text-xs">
                      20%
                    </span>
                    Sequencing
                  </h4>
                  <div className="space-y-4">
                    {groupedMetrics.sequencing.map((metric, idx) => (
                      <MetricDetailCard
                        key={idx}
                        metric={metric}
                        delay={idx * 0.1}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subcategories (backward compatible) */}
      <AnimatePresence>
        {isExpanded && !detailedMetrics && subCategories && subCategories.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-700/50"
          >
            <div className="p-4 space-y-3 bg-black/20">
              {subCategories.map((sub, index) => {
                const subPercentage = (sub.score / maxScore) * 100;
                return (
                  <div key={index} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-300">{sub.name}</span>
                      <span className="text-white font-semibold">{sub.score}</span>
                    </div>
                    {sub.description && (
                      <p className="text-xs text-gray-500">{sub.description}</p>
                    )}
                    <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${subPercentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={`h-1.5 rounded-full ${
                          subPercentage >= 80
                            ? 'bg-green-500'
                            : subPercentage >= 60
                            ? 'bg-orange-500'
                            : subPercentage >= 40
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * MetricDetailCard - Renders individual metric with kid-friendly explanations and GOAT pattern
 */
function MetricDetailCard({
  metric,
  delay,
}: {
  metric: MetricValue;
  delay: number;
}) {
  const getBadgeColor = (metricColor: string) => {
    const colors: Record<string, string> = {
      green: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      red: 'bg-red-500/20 text-red-300 border-red-500/30',
      gray: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[metricColor] || colors.gray;
  };

  const getProgressColor = (value: number | null) => {
    if (!value || value === 0) return 'bg-gray-600';
    if (value >= 80) return 'bg-gradient-to-r from-emerald-500 to-green-600';
    if (value >= 60) return 'bg-gradient-to-r from-blue-500 to-cyan-600';
    if (value >= 40) return 'bg-gradient-to-r from-orange-500 to-amber-600';
    return 'bg-gradient-to-r from-red-500 to-rose-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-black/30 rounded-lg p-3 border border-white/5"
    >
      {/* Header: Name + Grade */}
      <div className="flex items-start justify-between mb-2">
        <h5 className="text-xs font-semibold text-white">{metric.name}</h5>
        <span
          className={`px-2 py-0.5 rounded text-xs font-medium border ${getBadgeColor(
            metric.color
          )}`}
        >
          {metric.grade}
        </span>
      </div>

      {/* Score bar */}
      {metric.value !== null && metric.value > 0 ? (
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Score</span>
            <span>{metric.value}/100</span>
          </div>
          <div className="h-1.5 bg-gray-700/50 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${metric.value}%` }}
              transition={{ duration: 0.8, delay: delay + 0.2 }}
              className={getProgressColor(metric.value)}
            />
          </div>
        </div>
      ) : (
        <div className="mb-2 text-xs text-gray-500 italic">
          Coming soon - data not yet calculated
        </div>
      )}

      {/* What it is */}
      <p className="text-xs text-gray-300 mb-2">
        <span className="font-medium text-gray-200">What it is: </span>
        {metric.what_it_is}
      </p>

      {/* Why it matters */}
      <p className="text-xs text-gray-300 mb-2">
        <span className="font-medium text-gray-200">Why it matters: </span>
        {metric.why_it_matters}
      </p>

      {/* GOAT pattern - highlighted */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded p-2">
        <div className="flex items-start gap-2">
          <Trophy className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-amber-200 mb-1">
              GOAT Pattern
            </p>
            <p className="text-xs text-amber-100/80 leading-relaxed">
              {metric.goat_pattern}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
