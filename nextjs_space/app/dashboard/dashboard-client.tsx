'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Plus } from 'lucide-react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ScoreCard } from '@/components/score-card'
import { BottomNav } from '@/components/bottom-nav'
import { CoachRickDrawer } from '@/components/coach-rick-drawer'
import { NewLessonModal } from '@/components/new-lesson-modal'
import { StatCardSkeleton, VideoCardSkeleton, Skeleton } from '@/components/ui/skeleton'
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
  const [isNewLessonModalOpen, setIsNewLessonModalOpen] = useState(false)
  const [activeLesson, setActiveLesson] = useState<any>(null)
  const [isLoadingLesson, setIsLoadingLesson] = useState(true)

  // Fetch active lesson on mount
  useEffect(() => {
    const fetchActiveLesson = async () => {
      try {
        const response = await fetch('/api/sessions/active')
        if (response.ok) {
          const data = await response.json()
          setActiveLesson(data.activeSession)
        }
      } catch (error) {
        console.error('Error fetching active lesson:', error)
      } finally {
        setIsLoadingLesson(false)
      }
    }
    fetchActiveLesson()
  }, [])

  const handleStartNewLesson = () => {
    setIsNewLessonModalOpen(true)
  }

  const handleContinueLesson = () => {
    if (activeLesson?.id) {
      router.push(`/sessions/${activeLesson.id}`)
    }
  }

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
        {/* Active Lesson Section */}
        {isLoadingLesson ? (
          <Skeleton className="h-32 w-full rounded-xl" />
        ) : activeLesson ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-xl p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-medium text-green-400">Active Lesson</span>
                </div>
                <h3 className="text-white font-semibold mb-1">
                  {activeLesson.sessionName || 'Current Lesson'}
                </h3>
                {activeLesson.lessonFocus && (
                  <p className="text-sm text-gray-400 mb-2 line-clamp-2">
                    Focus: {activeLesson.lessonFocus}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{activeLesson.swingCount || 0} swings</span>
                  {activeLesson.avgScore && (
                    <span>Avg: {Math.round(activeLesson.avgScore)}/100</span>
                  )}
                </div>
              </div>
              <button
                onClick={handleContinueLesson}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Continue
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleStartNewLesson}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl p-6 text-left transition-all transform hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-1">Start New Lesson</h3>
                <p className="text-white/80 text-sm">Set your focus and begin analyzing swings</p>
              </div>
              <Plus className="h-8 w-8" />
            </div>
          </motion.button>
        )}

        {/* 4Bs Scores */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold text-white">Your 4Bs Metrics</h2>
          <div className="space-y-3">
            {scores ? (
              <>
                <ScoreCard
                  title="Anchor"
                  score={scores.anchor || 0}
                  maxScore={100}
                  icon="⚓"
                  description="Lower Body Foundation"
                  color="blue"
                  detailedMetrics={anchorMetrics}
                />
                <ScoreCard
                  title="Engine"
                  score={scores.engine || 0}
                  maxScore={100}
                  icon="⚡"
                  description="Core Rotation Power"
                  color="purple"
                  detailedMetrics={engineMetrics}
                />
                <ScoreCard
                  title="Whip"
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
              href="/sessions"
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
              <button
                onClick={handleStartNewLesson}
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
              >
                Start Your First Lesson
              </button>
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

      {/* New Lesson Modal */}
      <NewLessonModal
        isOpen={isNewLessonModalOpen}
        onClose={() => setIsNewLessonModalOpen(false)}
      />
    </div>
  )
}
