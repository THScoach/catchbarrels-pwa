'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Upload, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ScoreCard } from '@/components/score-card'
import { BottomNav } from '@/components/bottom-nav'
import { CoachRickDrawer } from '@/components/coach-rick-drawer'
import { StatCardSkeleton, VideoCardSkeleton } from '@/components/ui/skeleton'
import {
  calculateProgress,
  formatProgressChange,
  getProgressIcon,
  getProgressColor,
} from '@/lib/utils'
import {
  mapEngineMetricsFromScores,
  mapAnchorMetricsFromScores,
  mapWhipMetricsFromScores,
} from '@/lib/engine-metrics-config'

interface DashboardClientProps {
  user: any
  scores: any
  videos: any[]
  latestCoachingCall: any
  membershipInfo: any
}

export default function DashboardClient({
  user,
  scores,
  videos,
  latestCoachingCall,
  membershipInfo,
}: DashboardClientProps) {
  const router = useRouter()
  const [isCoachRickOpen, setIsCoachRickOpen] = useState(false)

  const recentVideos = videos?.slice(0, 3) || []

  const engineMetrics = scores?.engine
    ? mapEngineMetricsFromScores(scores)
    : undefined
  const anchorMetrics = scores?.anchor
    ? mapAnchorMetricsFromScores(scores)
    : undefined
  const whipMetrics = scores?.whip ? mapWhipMetricsFromScores(scores) : undefined

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-gray-400 text-sm">{user?.name || 'Athlete'}</p>
          </div>
          <button
            onClick={() => setIsCoachRickOpen(true)}
            className="p-2 rounded-full bg-purple-500/10 hover:bg-purple-500/20 transition-colors"
          >
            <MessageCircle className="h-6 w-6 text-purple-400" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">

        {/* BARREL Score - Primary Metric */}
        <div className="space-y-3">
          {scores ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="relative bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-2 border-orange-500/50 rounded-2xl p-8 shadow-2xl"
            >
              {/* Title */}
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                  BARREL Score
                </h2>
                <p className="text-sm text-gray-400 mt-1">Your Overall Swing Performance</p>
              </div>

              {/* Large centered score */}
              <div className="flex items-center justify-center mb-6">
                <div className="text-7xl md:text-8xl font-black text-white drop-shadow-2xl">
                  {Math.round((scores.anchor + scores.engine + scores.whip) / 3) || 0}
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-700/50 rounded-full h-3 mb-4 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${((scores.anchor + scores.engine + scores.whip) / 3)}%`,
                  }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 shadow-lg"
                />
              </div>

              {/* Mini sub-scores */}
              <div className="flex gap-2 justify-center text-sm">
                <div className="bg-blue-500/20 rounded-lg px-3 py-2 text-center border border-blue-500/30">
                  <div className="text-blue-400 font-semibold">A</div>
                  <div className="text-white font-bold">{scores.anchor || 0}</div>
                </div>
                <div className="bg-purple-500/20 rounded-lg px-3 py-2 text-center border border-purple-500/30">
                  <div className="text-purple-400 font-semibold">E</div>
                  <div className="text-white font-bold">{scores.engine || 0}</div>
                </div>
                <div className="bg-orange-500/20 rounded-lg px-3 py-2 text-center border border-orange-500/30">
                  <div className="text-orange-400 font-semibold">W</div>
                  <div className="text-white font-bold">{scores.whip || 0}</div>
                </div>
              </div>
            </motion.div>
          ) : (
            <StatCardSkeleton />
          )}
        </div>

        {/* 4Bs Detailed Metrics - Secondary */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white">Your 4Bs Breakdown</h2>
          <div className="space-y-3">
            {scores ? (
              <>
                <ScoreCard
                  title="Anchor (Feet & Ground)"
                  score={scores.anchor || 0}
                  maxScore={100}
                  icon="⚓"
                  description="Lower Body Foundation"
                  color="blue"
                  detailedMetrics={anchorMetrics}
                />
                <ScoreCard
                  title="Engine (Hips & Shoulders)"
                  score={scores.engine || 0}
                  maxScore={100}
                  icon="⚡"
                  description="Core Rotation Power"
                  color="purple"
                  detailedMetrics={engineMetrics}
                />
                <ScoreCard
                  title="Whip (Arms & Bat)"
                  score={scores.whip || 0}
                  maxScore={100}
                  icon="🔥"
                  description="Bat Speed & Connection"
                  color="orange"
                  detailedMetrics={whipMetrics}
                />
              </>
            ) : (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            )}
          </div>
        </div>

        {/* Recent Swings */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Recent Swings</h2>
            <Link
              href="/video"
              className="text-sm text-orange-400 hover:text-orange-300"
            >
              View All
            </Link>
          </div>

          {recentVideos.length > 0 ? (
            <div className="space-y-3">
              {recentVideos.map((video: any) => {
                const progress = calculateProgress(
                  video.overallScore || 0,
                  video.previousScores?.overall,
                  video.personalBests?.overall
                )

                return (
                  <Link key={video.id} href={`/video/${video.id}`}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 hover:border-orange-500/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-white font-semibold mb-1">
                            {video.title || 'Untitled Swing'}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(video.uploadDate), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        {video.analyzed && (
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">
                              {video.overallScore || 0}
                            </div>
                            {progress.change !== 0 && (
                              <div
                                className={`text-xs font-medium ${getProgressColor(
                                  progress.direction,
                                  progress.isPersonalBest
                                )}`}
                              >
                                {getProgressIcon(progress.direction)}
                                {formatProgressChange(progress.change)}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {video.analyzed && (
                        <div className="flex gap-2 text-xs">
                          <div className="flex-1 bg-blue-500/10 rounded px-2 py-1">
                            <span className="text-blue-400">A: {video.anchor || 0}</span>
                          </div>
                          <div className="flex-1 bg-purple-500/10 rounded px-2 py-1">
                            <span className="text-purple-400">E: {video.engine || 0}</span>
                          </div>
                          <div className="flex-1 bg-orange-500/10 rounded px-2 py-1">
                            <span className="text-orange-400">W: {video.whip || 0}</span>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          ) : (
            <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-8 text-center">
              <p className="text-gray-400 mb-4">No swings analyzed yet</p>
              <Link
                href="/video/upload"
                className="inline-block px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
              >
                Upload Your First Swing
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Coach Rick Drawer */}
      <CoachRickDrawer
        isOpen={isCoachRickOpen}
        onClose={() => setIsCoachRickOpen(false)}
        context={{ pageType: 'dashboard' }}
      />
    </div>
  )
}
