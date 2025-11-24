
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

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

  const handleClick = () => {
    if (subCategories && subCategories.length > 0) {
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
      {subCategories && subCategories.length > 0 && (
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

      {/* Subcategories */}
      <AnimatePresence>
        {isExpanded && subCategories && subCategories.length > 0 && (
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
