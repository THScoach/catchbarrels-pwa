'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { buttonVariants } from '@/lib/animations';
import { Video as VideoIcon, TrendingUp, Target, Upload, Play, Calendar, Clock, Award } from 'lucide-react';
import { ScoreCard } from '@/components/score-card';
import { BottomNav } from '@/components/bottom-nav';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import { StatCardSkeleton, VideoCardSkeleton, Skeleton } from '@/components/ui/skeleton';
import { calculateProgress, formatProgressChange, getProgressIcon, getProgressColor } from '@/lib/utils';
import { mapEngineMetricsFromScores, mapAnchorMetricsFromScores, mapWhipMetricsFromScores } from '@/lib/engine-metrics-config';

export function DashboardClient({ 
  user, 
  scores, 
  videos, 
  latestCoachingCall,
  membershipInfo = { tier: 'free', status: 'inactive' }
}: any) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate smooth loading transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a2332] pb-20">
        {/* Header Skeleton */}
        <div className="bg-gradient-to-r from-[#1a2332] to-[#2d3a4f] p-6 border-b border-gray-800">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="p-6 space-y-6 max-w-7xl mx-auto">
          {/* Quick Actions Skeleton - Compact Row */}
          <div className="flex gap-3 flex-wrap">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-28 rounded-full" />
            ))}
          </div>

          {/* Overall Score Skeleton - Reduced Height */}
          <Skeleton className="h-32 w-full rounded-lg" />

          {/* Body Metrics Skeleton */}
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
          </div>

          {/* Leaderboard Skeleton */}
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a2332] pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-[#1a2332] to-[#2d3a4f] p-6 border-b border-gray-800"
      >
        <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0] || 'Athlete'}! 👋</h1>
        <p className="text-gray-400 text-sm mt-1">
          {videos?.length > 0 
            ? `Last swing: ${formatDistanceToNow(new Date(videos[0]?.uploadDate), { addSuffix: true })}`
            : 'Ready to analyze your first swing?'}
        </p>
      </motion.div>

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Quick Actions - Compact Horizontal Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex gap-3 flex-wrap"
        >
          <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
            <Link
              href="/video/upload"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F5A623] to-[#E89815] px-5 py-3 rounded-full hover:shadow-lg transition-all duration-200 h-12"
            >
              <Upload className="w-4 h-4 text-white" />
              <span className="text-white font-medium text-sm">Upload</span>
            </Link>
          </motion.div>
          <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
            <Link
              href="/drills"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-700 to-gray-800 px-5 py-3 rounded-full hover:shadow-lg transition-all duration-200 border border-gray-700 h-12"
            >
              <Target className="w-4 h-4 text-white" />
              <span className="text-white font-medium text-sm">Drills</span>
            </Link>
          </motion.div>
          <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
            <Link
              href="/progress"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-700 to-gray-800 px-5 py-3 rounded-full hover:shadow-lg transition-all duration-200 border border-gray-700 h-12"
            >
              <TrendingUp className="w-4 h-4 text-white" />
              <span className="text-white font-medium text-sm">Progress</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Overall Score - Reduced Height */}
        {scores?.overall > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-lg p-4"
          >
            <h2 className="text-base font-semibold text-white mb-3">Overall Score</h2>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-4xl font-bold text-white">{scores.overall}</div>
                <div className="text-xl font-semibold text-[#F5A623] mt-0.5">{scores.tier}</div>
                <p className="text-gray-400 text-xs mt-1.5">
                  {scores.overall >= 85
                    ? 'Elite level! All three areas working together.'
                    : scores.overall >= 75
                    ? 'Advanced mechanics! Strong foundation.'
                    : scores.overall >= 65
                    ? 'Intermediate - Keep building consistency.'
                    : 'Developing - Focus on fundamentals.'}
                </p>
              </div>
              <div className="w-24 h-24 relative flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    className="text-gray-700"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="42"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${(scores.overall / 100) * 264} 264`}
                    className="text-[#F5A623]"
                  />
                </svg>
              </div>
            </div>
            {/* See Your Progress Button */}
            <Link href="/progress">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                See Your Progress
              </motion.button>
            </Link>
          </motion.div>
        )}

        {/* 4Bs Body Metrics Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-white mb-4">Body Metrics</h2>
          <p className="text-sm text-gray-400 mb-4">Motion (Timing) • Stability • Sequencing</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ScoreCard
              title="ANCHOR (Feet & Ground)"
              score={scores.anchor}
              icon="⚓"
              description="How well you use the ground to stay balanced and create power"
              color="blue"
              detailedMetrics={mapAnchorMetricsFromScores({
                anchorMotion: Math.round(((scores.anchorSubs?.stance || 0) + (scores.anchorSubs?.weightShift || 0)) / 2),
                anchorStability: Math.round(((scores.anchorSubs?.groundConnection || 0) + (scores.anchorSubs?.lowerBodyMechanics || 0)) / 2),
                anchorSequencing: scores.anchorSubs?.lowerBodyMechanics || 0,
                anchorStance: scores.anchorSubs?.stance || 0,
                anchorWeightShift: scores.anchorSubs?.weightShift || 0,
                anchorGroundConnection: scores.anchorSubs?.groundConnection || 0,
                anchorLowerBodyMechanics: scores.anchorSubs?.lowerBodyMechanics || 0
              })}
            />
            <ScoreCard
              title="ENGINE (Hips & Shoulders)"
              score={scores.engine}
              icon="🔄"
              description="How well your hips and shoulders work together to create power"
              color="green"
              detailedMetrics={mapEngineMetricsFromScores({
                engineMotion: Math.round(((scores.engineSubs?.hipRotation || 0) + (scores.engineSubs?.corePower || 0)) / 2),
                engineStability: scores.engineSubs?.separation || 0,
                engineSequencing: scores.engineSubs?.torsoMechanics || 0,
                engineHipRotation: scores.engineSubs?.hipRotation || 0,
                engineTorsoMechanics: scores.engineSubs?.torsoMechanics || 0,
                engineCorePower: scores.engineSubs?.corePower || 0
              })}
            />
            <ScoreCard
              title="WHIP (Arms & Bat)"
              score={scores.whip}
              icon="⚡"
              description="How well your arms and bat snap through the zone at the right time"
              color="purple"
              detailedMetrics={mapWhipMetricsFromScores({
                whipMotion: Math.round(((scores.whipSubs?.batSpeed || 0) + (scores.whipSubs?.armPath || 0)) / 2),
                whipStability: scores.whipSubs?.connection || 0,
                whipSequencing: scores.whipSubs?.batPath || 0,
                whipBatSpeed: scores.whipSubs?.batSpeed || 0,
                whipArmPath: scores.whipSubs?.armPath || 0,
                whipConnection: scores.whipSubs?.connection || 0
              })}
            />
          </div>
        </motion.div>

        {/* Exit Velocity */}
        {scores.exitVelocity > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-6 border border-orange-500/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-400 mb-1">Exit Velocity</h3>
                <p className="text-3xl font-bold text-white">{scores.exitVelocity} mph</p>
              </div>
              <div className="text-4xl">🚀</div>
            </div>
          </motion.div>
        )}

        {/* Latest Coaching Call */}
        {latestCoachingCall && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-[#F5A623]/10 to-[#E89815]/10 rounded-xl p-6 border border-[#F5A623]/20"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">📹 Latest Coaching Call</h2>
                <p className="text-sm text-gray-400">Watch Monday night recording</p>
              </div>
              <Link
                href="/coaching"
                className="flex items-center gap-2 bg-[#F5A623] hover:bg-[#E89815] text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
              >
                <Play className="w-4 h-4" fill="white" />
                Watch Now
              </Link>
            </div>
            <div className="space-y-2">
              <h3 className="text-white font-medium">{latestCoachingCall.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(latestCoachingCall.callDate), 'MMM dd, yyyy')}
                </span>
                {latestCoachingCall.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {latestCoachingCall.duration} min
                  </span>
                )}
              </div>
              {latestCoachingCall.topics?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {latestCoachingCall.topics.slice(0, 3).map((topic: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#F5A623]/20 text-[#F5A623] text-xs rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-lg p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Leaderboard</h2>
            <Award className="w-5 h-5 text-[#F5A623]" />
          </div>
          <div className="space-y-3">
            {/* Placeholder rows - will wire real data later */}
            {[
              { rank: 1, name: 'Test Player', score: 87, isCurrentUser: true },
              { rank: 2, name: 'Sample Player', score: 82, isCurrentUser: false },
              { rank: 3, name: 'Demo Player', score: 78, isCurrentUser: false },
              { rank: 4, name: 'Practice Player', score: 75, isCurrentUser: false },
              { rank: 5, name: 'Training Player', score: 72, isCurrentUser: false },
            ].map((player) => (
              <div
                key={player.rank}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                  player.isCurrentUser
                    ? 'bg-[#F5A623]/10 border border-[#F5A623]/30'
                    : 'bg-gray-800/30 border border-gray-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      player.rank === 1
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : player.rank === 2
                        ? 'bg-gray-400/20 text-gray-300'
                        : player.rank === 3
                        ? 'bg-orange-500/20 text-orange-400'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {player.rank}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${player.isCurrentUser ? 'text-[#F5A623]' : 'text-white'}`}>
                        {player.name}
                      </span>
                      {player.isCurrentUser && (
                        <span className="text-xs bg-[#F5A623]/20 text-[#F5A623] px-2 py-0.5 rounded-full">
                          You
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">GOAT {player.score}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
