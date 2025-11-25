'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Upload, TrendingUp, Play, ChevronRight, FileText } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { BottomNav } from '@/components/bottom-nav'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import GoatyHeader from '@/components/goaty-header'

interface DashboardClientProps {
  user: any
  scores: {
    barrel: number
    anchor: number
    engine: number
    whip: number
  }
  coachingText: string | null
  recommendedDrills: any[]
  latestAssessmentDate: Date | null
  membershipInfo: any
}

export default function DashboardClient({
  user,
  scores,
  coachingText,
  recommendedDrills,
  latestAssessmentDate,
  membershipInfo,
}: DashboardClientProps) {
  const router = useRouter()

  // Primary drill is the first in the list
  const primaryDrill = recommendedDrills?.[0]
  const alternateDrills = recommendedDrills?.slice(1, 4) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pb-24">
      {/* GOATY Header with Navigation */}
      <GoatyHeader activeTab="dashboard" />

      <div className="p-4 space-y-6 max-w-4xl mx-auto mt-6">

        {/* Hero BARREL Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative bg-gradient-to-br from-orange-500/20 via-orange-600/20 to-orange-500/10 border-2 border-orange-500/40 rounded-3xl p-12 shadow-2xl overflow-hidden"
        >
          {/* Background gradient accent */}
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-wide mb-2">
                BARREL Score
              </h2>
              <p className="text-sm text-gray-300">Your Overall Swing Performance</p>
            </div>

            {/* Large centered score */}
            <div className="flex items-center justify-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-9xl md:text-[12rem] font-black text-white drop-shadow-2xl leading-none"
              >
                {scores?.barrel || '—'}
              </motion.div>
            </div>

            {/* Progress bar */}
            {scores?.barrel > 0 && (
              <div className="w-full bg-gray-700/50 rounded-full h-4 mb-6 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${scores.barrel}%` }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="h-4 rounded-full bg-gradient-to-r from-orange-500 to-orange-400 shadow-lg"
                />
              </div>
            )}

            {/* Mini sub-scores */}
            {scores?.barrel > 0 && (
              <div className="flex gap-3 justify-center text-sm">
                <div className="bg-blue-500/20 rounded-xl px-4 py-3 text-center border border-blue-500/30 flex-1 max-w-[100px]">
                  <div className="text-blue-400 font-semibold text-xs mb-1">ANCHOR</div>
                  <div className="text-white font-black text-xl">{scores.anchor || 0}</div>
                </div>
                <div className="bg-purple-500/20 rounded-xl px-4 py-3 text-center border border-purple-500/30 flex-1 max-w-[100px]">
                  <div className="text-purple-400 font-semibold text-xs mb-1">ENGINE</div>
                  <div className="text-white font-black text-xl">{scores.engine || 0}</div>
                </div>
                <div className="bg-orange-500/20 rounded-xl px-4 py-3 text-center border border-orange-500/30 flex-1 max-w-[100px]">
                  <div className="text-orange-400 font-semibold text-xs mb-1">WHIP</div>
                  <div className="text-white font-black text-xl">{scores.whip || 0}</div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Secondary Tiles - Anchor, Engine, Whip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* Anchor Tile */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/30 p-6 text-center">
            <div className="text-blue-400 text-sm font-semibold uppercase tracking-wide mb-2">
              Anchor
            </div>
            <div className="text-4xl md:text-5xl font-black text-white mb-2">
              {scores?.anchor || '—'}
            </div>
            <p className="text-xs text-gray-400">Stability & ground control</p>
          </Card>

          {/* Engine Tile */}
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/30 p-6 text-center">
            <div className="text-purple-400 text-sm font-semibold uppercase tracking-wide mb-2">
              Engine
            </div>
            <div className="text-4xl md:text-5xl font-black text-white mb-2">
              {scores?.engine || '—'}
            </div>
            <p className="text-xs text-gray-400">Hip & shoulder sequence</p>
          </Card>

          {/* Whip Tile */}
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/30 p-6 text-center">
            <div className="text-orange-400 text-sm font-semibold uppercase tracking-wide mb-2">
              Whip
            </div>
            <div className="text-4xl md:text-5xl font-black text-white mb-2">
              {scores?.whip || '—'}
            </div>
            <p className="text-xs text-gray-400">Barrel speed & direction</p>
          </Card>
        </motion.div>

        {/* GOATY-Style Coaching Text Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border-purple-500/30 p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Your Current Focus</h3>
                <p className="text-xs text-gray-400">Based on your latest assessment</p>
              </div>
            </div>
            
            {coachingText ? (
              <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                {coachingText}
              </div>
            ) : (
              <div className="text-gray-400 text-sm italic">
                Complete your first assessment to receive personalized coaching guidance.
              </div>
            )}
          </Card>
        </motion.div>

        {/* Recommended Work (Drills) Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-bold text-white">Recommended Work</h3>
          
          {primaryDrill ? (
            <>
              {/* Primary Drill */}
              <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/30 p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                    <Play className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-1">{primaryDrill.name}</h4>
                    <p className="text-sm text-gray-400">
                      {primaryDrill.primaryPurpose || primaryDrill.description || 'Recommended drill for your current focus'}
                    </p>
                  </div>
                </div>
                <Link href={`/drills/${primaryDrill.id}`}>
                  <Button 
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                  >
                    View Drill Details
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </Card>

              {/* Alternate Drills */}
              {alternateDrills.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400 font-medium">Alternate Drills:</p>
                  <div className="flex flex-wrap gap-2">
                    {alternateDrills.map((drill: any) => (
                      <Link key={drill.id} href={`/drills/${drill.id}`}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-gray-800/50 border-gray-700 hover:border-orange-500/50 text-gray-300 hover:text-white"
                        >
                          {drill.name}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <Card className="bg-gray-800/30 border-gray-700 p-6 text-center">
              <p className="text-gray-400 text-sm mb-4">
                No drills recommended yet. Complete your first assessment to get personalized drill recommendations.
              </p>
            </Card>
          )}
        </motion.div>

        {/* Primary Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Link href="/lesson/new" className="block">
            <Button 
              size="lg"
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-base h-14"
            >
              <Upload className="mr-2 h-5 w-5" />
              Start New Lesson
            </Button>
          </Link>
          
          <Link href="/assessments/new" className="block">
            <Button 
              size="lg"
              variant="outline"
              className="w-full bg-gray-800/50 border-gray-700 hover:border-orange-500/50 hover:bg-gray-800 text-white font-bold text-base h-14"
            >
              <FileText className="mr-2 h-5 w-5" />
              View Full Report
            </Button>
          </Link>
        </motion.div>

      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}
