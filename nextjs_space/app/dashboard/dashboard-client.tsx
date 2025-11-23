'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { buttonVariants } from '@/lib/animations';
import { Video as VideoIcon, TrendingUp, Target, Upload, Play, Calendar, Clock } from 'lucide-react';
import { ScoreCard } from '@/components/score-card';
import { BottomNav } from '@/components/bottom-nav';
import Link from 'next/link';
import { formatDistanceToNow, format } from 'date-fns';
import { StatCardSkeleton, VideoCardSkeleton, Skeleton } from '@/components/ui/skeleton';

export function DashboardClient({ user, scores, videos, latestCoachingCall }: any) {
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
          {/* Quick Actions Skeleton */}
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>

          {/* Overall Score Skeleton */}
          <Skeleton className="h-48 w-full rounded-lg" />

          {/* Body Metrics Skeleton */}
          <div>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
          </div>

          {/* Recent Swings Skeleton */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="w-16 h-16 rounded flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
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
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-3 gap-4"
        >
          <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
            <Link
              href="/video/upload"
              className="block bg-gradient-to-r from-[#2196F3] to-[#1976D2] p-4 rounded-lg flex flex-col items-center justify-center hover:shadow-xl transition-all duration-200"
            >
              <Upload className="w-5 h-5 text-white mb-1" />
              <span className="text-white font-medium text-sm">Upload</span>
            </Link>
          </motion.div>
          <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
            <Link
              href="/drills"
              className="block bg-gradient-to-r from-gray-700 to-gray-800 p-4 rounded-lg flex flex-col items-center justify-center hover:shadow-xl transition-all duration-200 border border-gray-700"
            >
              <Target className="w-5 h-5 text-white mb-1" />
              <span className="text-white font-medium text-sm">Drills</span>
            </Link>
          </motion.div>
          <motion.div whileHover="hover" whileTap="tap" variants={buttonVariants}>
            <Link
              href="/progress"
              className="block bg-gradient-to-r from-gray-700 to-gray-800 p-4 rounded-lg flex flex-col items-center justify-center hover:shadow-xl transition-all duration-200 border border-gray-700"
            >
              <TrendingUp className="w-5 h-5 text-white mb-1" />
              <span className="text-white font-medium text-sm">Progress</span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Overall Score */}
        {scores?.overall > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-lg p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Overall Score</h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-5xl font-bold text-white">{scores.overall}</div>
                <div className="text-2xl font-semibold text-[#2196F3] mt-1">{scores.tier}</div>
                <p className="text-gray-400 text-sm mt-2">
                  {scores.overall >= 85
                    ? 'Elite level! All three areas working together.'
                    : scores.overall >= 75
                    ? 'Advanced mechanics! Strong foundation.'
                    : scores.overall >= 65
                    ? 'Intermediate - Keep building consistency.'
                    : 'Developing - Focus on fundamentals.'}
                </p>
              </div>
              <div className="w-32 h-32 relative">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-gray-700"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${(scores.overall / 100) * 352} 352`}
                    className="text-[#2196F3]"
                  />
                </svg>
              </div>
            </div>
          </motion.div>
        )}

        {/* 4Bs Body Metrics Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-lg font-semibold text-white mb-4">Body Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ScoreCard
              title="Anchor"
              score={scores.anchor}
              icon="⚓"
              description="Lower Body"
              color="blue"
              subCategories={[
                { name: 'Stance/Setup', score: scores.anchorSubs?.stance || 0, description: 'Initial position quality' },
                { name: 'Weight Shift', score: scores.anchorSubs?.weightShift || 0, description: 'Weight transfer efficiency' },
                { name: 'Ground Connection', score: scores.anchorSubs?.groundConnection || 0, description: 'Ground force utilization' },
                { name: 'Lower Body Mechanics', score: scores.anchorSubs?.lowerBodyMechanics || 0, description: 'Overall leg movement' },
              ]}
            />
            <ScoreCard
              title="Engine"
              score={scores.engine}
              icon="🔄"
              description="Trunk/Core"
              color="green"
              subCategories={[
                { name: 'Hip Rotation', score: scores.engineSubs?.hipRotation || 0, description: 'Hip rotation power' },
                { name: 'Separation', score: scores.engineSubs?.separation || 0, description: 'Upper/lower body separation' },
                { name: 'Core Power', score: scores.engineSubs?.corePower || 0, description: 'Core engagement & strength' },
                { name: 'Torso Mechanics', score: scores.engineSubs?.torsoMechanics || 0, description: 'Torso rotation quality' },
              ]}
            />
            <ScoreCard
              title="Whip"
              score={scores.whip}
              icon="⚡"
              description="Arms & Bat"
              color="purple"
              subCategories={[
                { name: 'Arm Path', score: scores.whipSubs?.armPath || 0, description: 'Arm path efficiency' },
                { name: 'Bat Speed', score: scores.whipSubs?.batSpeed || 0, description: 'Bat speed generation' },
                { name: 'Bat Path', score: scores.whipSubs?.batPath || 0, description: 'Bat path quality' },
                { name: 'Connection', score: scores.whipSubs?.connection || 0, description: 'Arms-body connection' },
              ]}
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
            className="bg-gradient-to-br from-[#2196F3]/10 to-[#1976D2]/10 rounded-xl p-6 border border-[#2196F3]/20"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-lg font-semibold text-white mb-1">📹 Latest Coaching Call</h2>
                <p className="text-sm text-gray-400">Watch Monday night recording</p>
              </div>
              <Link
                href="/coaching"
                className="flex items-center gap-2 bg-[#2196F3] hover:bg-[#1976D2] text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
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
                      className="px-3 py-1 bg-[#2196F3]/20 text-[#2196F3] text-xs rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Swings</h2>
            <Link href="/video" className="text-[#2196F3] text-sm hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {videos?.slice(0, 3)?.map((video: any) => (
              <Link
                key={video?.id}
                href={`/video/${video?.id}`}
                className="block bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/70 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-700 rounded flex items-center justify-center">
                    <VideoIcon className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium">{video?.title}</h3>
                    <p className="text-gray-400 text-sm">
                      {formatDistanceToNow(new Date(video?.uploadDate), { addSuffix: true })}
                    </p>
                    {video?.analyzed && (
                      <div className="flex items-center space-x-4 mt-1">
                        <span className="text-sm text-[#2196F3]">
                          Overall: {video.overallScore}
                        </span>
                        {video?.exitVelocity && (
                          <span className="text-sm text-gray-500">
                            {video.exitVelocity} mph
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
            {videos?.length === 0 && (
              <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-8 text-center">
                <VideoIcon className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 mb-4">No swings yet</p>
                <Link
                  href="/video/upload"
                  className="inline-flex items-center space-x-2 bg-[#2196F3] hover:bg-[#1976D2] text-white px-6 py-2 rounded-lg transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload Your First Swing</span>
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
