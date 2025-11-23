
'use client';

import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface ScoreCardProps {
  title: string;
  score: number;
  maxScore?: number;
  trend?: number;
  icon?: string;
  description?: string;
  color?: string;
  onClick?: () => void;
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
}: ScoreCardProps) {
  const percentage = (score / maxScore) * 100;

  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-500/30',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
  };

  const bgClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className={`relative bg-gradient-to-br ${bgClass} border rounded-lg p-4 cursor-pointer hover:shadow-lg transition-shadow`}
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
              ? 'bg-blue-500'
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
    </motion.div>
  );
}
