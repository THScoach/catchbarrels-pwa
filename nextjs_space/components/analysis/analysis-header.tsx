'use client';

import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AnalysisHeaderProps {
  player: {
    name: string;
  };
  session: {
    label: string;
    date: string;
  };
  scores: {
    goat: number;
    anchor: number;
    engine: number;
    whip: number;
  };
}

export function AnalysisHeader({ player, session, scores }: AnalysisHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-lg p-4 mb-4"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Player info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-white truncate">{player.name}</h1>
          <p className="text-sm text-gray-400 truncate">{session.label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{session.date}</p>
        </div>

        {/* Right: GOAT + Chips */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {/* GOAT Score */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-lg px-3 py-1.5">
            <Trophy className="w-4 h-4 text-orange-500" />
            <div className="flex flex-col items-end">
              <span className="text-xs text-orange-300 font-medium leading-none">GOAT</span>
              <span className="text-xl font-bold text-orange-500 leading-none">{scores.goat}</span>
              <span className="text-[10px] text-gray-400 leading-none">/100</span>
            </div>
          </div>

          {/* AEW Chips */}
          <div className="flex items-center gap-1.5">
            <Badge 
              variant="outline" 
              className="text-[11px] px-2 py-0.5 bg-orange-500/10 border-orange-500/30 text-orange-400"
            >
              ANCHOR {scores.anchor}
            </Badge>
            <Badge 
              variant="outline" 
              className="text-[11px] px-2 py-0.5 bg-green-500/10 border-green-500/30 text-green-400"
            >
              ENGINE {scores.engine}
            </Badge>
            <Badge 
              variant="outline" 
              className="text-[11px] px-2 py-0.5 bg-purple-500/10 border-purple-500/30 text-purple-400"
            >
              WHIP {scores.whip}
            </Badge>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
