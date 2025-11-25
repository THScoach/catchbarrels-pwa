'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Upload, TrendingUp, Play, ChevronRight, FileText } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { BottomNav } from '@/components/bottom-nav'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import BarrelsHeader from '@/components/barrels-header'

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
    <div className="min-h-screen bg-barrels-black pb-24">
      {/* BARRELS Header with Navigation */}
      <BarrelsHeader activeTab="dashboard" />

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full bg-barrels-black-light border-b border-barrels-black-lighter"
      >
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="relative w-full aspect-[3/1] rounded-xl overflow-hidden">
            <Image
              src="/banner.png"
              alt="BARRELS - Catch Some Barrels"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </motion.div>

      <div className="p-4 space-y-6 max-w-4xl mx-auto mt-6">

        {/* Hero BARREL Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative bg-gradient-to-br from-barrels-gold/20 via-barrels-gold-light/20 to-barrels-gold/10 border-2 border-barrels-gold/40 rounded-3xl p-12 shadow-2xl overflow-hidden"
        >
          {/* Background gradient accent */}
          <div className="absolute inset-0 bg-gradient-to-tr from-barrels-gold-dark/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-barrels-gold to-barrels-gold-light bg-clip-text text-transparent uppercase tracking-wide mb-2">
                BARREL Score
              </h2>
              <p className="text-sm text-barrels-neutral-gray">Your Overall Swing Performance</p>
            </div>

            {/* Large centered score */}
            <div className="flex items-center justify-center mb-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-9xl md:text-[12rem] font-black bg-gradient-to-br from-barrels-gold to-barrels-gold-light bg-clip-text text-transparent drop-shadow-2xl leading-none"
              >
                {scores?.barrel || '—'}
              </motion.div>
            </div>

            {/* Progress bar */}
            {scores?.barrel > 0 && (
              <div className="w-full bg-barrels-black-lighter/50 rounded-full h-4 mb-6 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${scores.barrel}%` }}
                  transition={{ duration: 1, delay: 0.4 }}
                  className="h-4 rounded-full bg-gradient-to-r from-barrels-gold to-barrels-gold-light shadow-lg shadow-barrels-gold/30"
                />
              </div>
            )}

            {/* Mini sub-scores */}
            {scores?.barrel > 0 && (
              <div className="flex gap-3 justify-center text-sm">
                <div className="bg-barrels-blue/20 rounded-xl px-4 py-3 text-center border border-barrels-blue/30 flex-1 max-w-[100px]">
                  <div className="text-barrels-blue-light font-semibold text-xs mb-1">ANCHOR</div>
                  <div className="text-barrels-neutral-white font-black text-xl">{scores.anchor || 0}</div>
                </div>
                <div className="bg-barrels-gold/20 rounded-xl px-4 py-3 text-center border border-barrels-gold/30 flex-1 max-w-[100px]">
                  <div className="text-barrels-gold-light font-semibold text-xs mb-1">ENGINE</div>
                  <div className="text-white font-black text-xl">{scores.engine || 0}</div>
                </div>
                <div className="bg-barrels-gold/20 rounded-xl px-4 py-3 text-center border border-barrels-gold/30 flex-1 max-w-[100px]">
                  <div className="text-barrels-gold-light font-semibold text-xs mb-1">WHIP</div>
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
          <Card className="bg-gradient-to-br from-barrels-blue/10 to-barrels-blue-light/10 border-barrels-blue/30 p-6 text-center">
            <div className="text-blue-400 text-sm font-semibold uppercase tracking-wide mb-2">
              Anchor
            </div>
            <div className="text-4xl md:text-5xl font-black text-white mb-2">
              {scores?.anchor || '—'}
            </div>
            <p className="text-xs text-barrels-neutral-gray">Stability & ground control</p>
          </Card>

          {/* Engine Tile */}
          <Card className="bg-gradient-to-br from-barrels-blue/10 to-barrels-blue-light/10 border-barrels-blue/30 p-6 text-center">
            <div className="text-barrels-blue-light text-sm font-semibold uppercase tracking-wide mb-2">
              Engine
            </div>
            <div className="text-4xl md:text-5xl font-black text-white mb-2">
              {scores?.engine || '—'}
            </div>
            <p className="text-xs text-barrels-neutral-gray">Hip & shoulder sequence</p>
          </Card>

          {/* Whip Tile */}
          <Card className="bg-gradient-to-br from-barrels-gold/10 to-barrels-gold-light/10 border-barrels-gold/30 p-6 text-center">
            <div className="text-barrels-gold-light text-sm font-semibold uppercase tracking-wide mb-2">
              Whip
            </div>
            <div className="text-4xl md:text-5xl font-black text-white mb-2">
              {scores?.whip || '—'}
            </div>
            <p className="text-xs text-barrels-neutral-gray">Barrel speed & direction</p>
          </Card>
        </motion.div>

        {/* BARRELS-Style Coaching Text Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-barrels-blue/10 to-barrels-blue-light/10 border-barrels-blue/30 p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-barrels-blue/20 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-barrels-blue-light" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Your Current Focus</h3>
                <p className="text-xs text-barrels-neutral-gray">Based on your latest assessment</p>
              </div>
            </div>
            
            {coachingText ? (
              <div className="text-barrels-neutral text-sm leading-relaxed whitespace-pre-wrap">
                {coachingText}
              </div>
            ) : (
              <div className="text-barrels-neutral-gray text-sm italic">
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
              <Card className="bg-gradient-to-br from-barrels-gold/10 to-barrels-gold-light/10 border-barrels-gold/30 p-6">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-barrels-gold/20 flex items-center justify-center flex-shrink-0">
                    <Play className="w-5 h-5 text-barrels-gold-light" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-1">{primaryDrill.name}</h4>
                    <p className="text-sm text-barrels-neutral-gray">
                      {primaryDrill.primaryPurpose || primaryDrill.description || 'Recommended drill for your current focus'}
                    </p>
                  </div>
                </div>
                <Link href={`/drills/${primaryDrill.id}`}>
                  <Button 
                    className="w-full bg-barrels-gold hover:bg-barrels-gold-light text-white font-semibold"
                  >
                    View Drill Details
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </Card>

              {/* Alternate Drills */}
              {alternateDrills.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-barrels-neutral-gray font-medium">Alternate Drills:</p>
                  <div className="flex flex-wrap gap-2">
                    {alternateDrills.map((drill: any) => (
                      <Link key={drill.id} href={`/drills/${drill.id}`}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-barrels-black-light/50 border-barrels-black-lighter hover:border-barrels-gold/50 text-barrels-neutral hover:text-white"
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
            <Card className="bg-barrels-black-light/30 border-barrels-black-lighter p-6 text-center">
              <p className="text-barrels-neutral-gray text-sm mb-4">
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
              className="w-full bg-gradient-to-r from-barrels-gold to-barrels-gold-light hover:from-barrels-gold-light hover:to-barrels-gold-dark text-white font-bold text-base h-14"
            >
              <Upload className="mr-2 h-5 w-5" />
              Start New Lesson
            </Button>
          </Link>
          
          <Link href="/assessments/new" className="block">
            <Button 
              size="lg"
              variant="outline"
              className="w-full bg-barrels-black-light/50 border-barrels-black-lighter hover:border-barrels-gold/50 hover:bg-barrels-black-lighter text-white font-bold text-base h-14"
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
