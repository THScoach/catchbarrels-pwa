/**
 * Momentum Transfer Card Component
 * 
 * Hero card showing Momentum Transfer Score (60% weight) with
 * Anchor/Engine/Whip sub-scores (40% weight total) as mini-bars.
 */

'use client';

import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { generateMomentumCoaching, getMomentumHeaderText, getSubScoreInterpretation } from '@/lib/momentum-coaching';

interface MomentumTransferCardProps {
  momentumTransferScore: number;      // 0-100
  anchorScore: number;                // 0-100
  engineScore: number;                // 0-100
  whipScore: number;                  // 0-100
  goatyBand: number;                  // -3 to +3
  goatyBandLabel: string;             // "Elite", "Advanced", etc.
  showCoaching?: boolean;             // Show full coaching text
}

export function MomentumTransferCard({
  momentumTransferScore,
  anchorScore,
  engineScore,
  whipScore,
  goatyBand,
  goatyBandLabel,
  showCoaching = true,
}: MomentumTransferCardProps) {
  // Generate coaching text
  const coaching = generateMomentumCoaching({
    momentumTransferScore,
    anchorScore,
    engineScore,
    whipScore,
    goatyBandLabel,
  });
  
  const headerText = getMomentumHeaderText(momentumTransferScore);
  
  // Get color based on band
  const getBandColor = (band: number) => {
    if (band >= 2) return 'from-green-500 to-green-600';
    if (band >= 1) return 'from-barrels-gold to-barrels-gold-light';
    if (band >= 0) return 'from-blue-500 to-blue-600';
    return 'from-gray-500 to-gray-600';
  };
  
  const bandColor = getBandColor(goatyBand);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-barrels-black to-barrels-black-light border border-barrels-gold/20 rounded-xl p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-barrels-gold" />
          <h3 className="text-lg font-bold text-white">Momentum Transfer</h3>
        </div>
        <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${bandColor} text-white text-sm font-bold`}>
          {goatyBandLabel}
        </div>
      </div>
      
      {/* Big Score */}
      <div className="mb-4">
        <div className="text-6xl font-bold text-white mb-1">
          {momentumTransferScore}
        </div>
        <div className="text-sm text-gray-400">
          Energy flow: Anchor → Engine → Whip
        </div>
      </div>
      
      {/* Header Text */}
      <p className="text-gray-300 text-sm mb-6">
        {headerText}
      </p>
      
      {/* Sub-Scores Mini-Bars */}
      <div className="space-y-3 mb-6">
        {/* Anchor */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-300">Anchor</span>
            <span className="text-sm font-bold text-white">{anchorScore}</span>
          </div>
          <div className="w-full bg-barrels-black-light rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${anchorScore}%` }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-gradient-to-r from-barrels-gold to-barrels-gold-light h-2 rounded-full"
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {getSubScoreInterpretation(anchorScore)} - Ground → Hips
          </div>
        </div>
        
        {/* Engine */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-300">Engine</span>
            <span className="text-sm font-bold text-white">{engineScore}</span>
          </div>
          <div className="w-full bg-barrels-black-light rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${engineScore}%` }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-gradient-to-r from-barrels-blue to-blue-500 h-2 rounded-full"
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {getSubScoreInterpretation(engineScore)} - Hips → Torso
          </div>
        </div>
        
        {/* Whip */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-300">Whip</span>
            <span className="text-sm font-bold text-white">{whipScore}</span>
          </div>
          <div className="w-full bg-barrels-black-light rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${whipScore}%` }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
            />
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {getSubScoreInterpretation(whipScore)} - Torso → Barrel
          </div>
        </div>
      </div>
      
      {/* Coaching Text */}
      {showCoaching && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="bg-barrels-black-light/50 rounded-lg p-4 border border-barrels-gold/10"
        >
          <div className="text-sm text-gray-300 space-y-2">
            <p>{coaching.overallLine}</p>
            <p>{coaching.leakLine}</p>
            <p className="text-barrels-gold font-medium">{coaching.nextStep}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
