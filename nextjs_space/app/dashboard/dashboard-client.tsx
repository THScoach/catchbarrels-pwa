'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Upload, TrendingUp, Play, ChevronRight, FileText } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { CoachRickDrawer } from '@/components/coach-rick-drawer'
import { Tile, TileHeader } from '@/components/ui/tile'
import { PrimaryButton, SecondaryButton } from '@/components/ui/barrels-button'
import { Pill } from '@/components/ui/pill'
import { ScoreItem, ScoreGrid } from '@/components/ui/score-item'
import { FourBTile } from '@/components/four-b-tile'

interface DashboardClientProps {
  user: any
  scores: {
    barrel: number
    anchor: number
    engine: number
    whip: number
    barrelDelta?: number  // Change vs last session
    anchorDelta?: number
    engineDelta?: number
    whipDelta?: number
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Primary drill is the first in the list
  const primaryDrill = recommendedDrills?.[0]
  const alternateDrills = recommendedDrills?.slice(1, 4) || []

  return (
    <div className="min-h-screen bg-barrels-bg">
      <main className="p-4 space-y-6 max-w-4xl mx-auto pt-4 mt-4">
        
        {/* Welcome Message with Branding */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center space-y-3"
        >
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Welcome back, {user?.name?.split(' ')[0] || 'Player'}.
          </h1>
          <div className="space-y-1">
            <h2 className="text-lg md:text-xl font-semibold text-barrels-gold">
              CatchBarrels Momentum Dashboard
            </h2>
            <p className="text-barrels-muted text-sm md:text-base max-w-2xl mx-auto">
              Built by Coach Rick to measure how well you move energy, not just how hard you swing.
            </p>
          </div>
        </motion.div>

        {/* Primary Action - Start New Session */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Link href="/lesson/new">
            <button className="w-full h-16 rounded-xl bg-gradient-to-r from-barrels-gold to-barrels-gold-light text-barrels-black font-bold text-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-3 shadow-lg">
              <Upload className="w-6 h-6" />
              Start New Session
            </button>
          </Link>
        </motion.div>

        {/* Hero BARREL Score - Two Column Layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl bg-barrels-surface border border-barrels-border p-4 md:p-5 text-barrels-text"
        >
          <div className="flex gap-4 md:gap-6 items-stretch">
            {/* LEFT: Circular BARREL Score Gauge */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="relative flex items-center justify-center" style={{ width: '200px', height: '200px' }}>
                {/* SVG Circular Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background track */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#2E3440"
                    strokeWidth="12"
                  />
                  {/* Progress ring - Electric Gold */}
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#barrelsGradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                    animate={{ 
                      strokeDashoffset: 2 * Math.PI * 40 * (1 - (scores?.barrel || 0) / 100) 
                    }}
                    transition={{ duration: 1.8, delay: 0.2, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="barrelsGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFC93C" />
                      <stop offset="100%" stopColor="#FFD54A" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Center text - Score only, no percentage */}
                <div className="flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-5xl md:text-6xl font-bold leading-none"
                    style={{ color: '#FFFFFF' }}
                  >
                    {scores?.barrel || 0}
                  </motion.div>
                  <div className="mt-1 text-xs text-barrels-muted uppercase tracking-wide">
                    Score
                  </div>
                </div>
              </div>

              {/* Delta indicator below circle */}
              {scores?.barrel > 0 && scores?.barrelDelta !== undefined && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  className={
                    "mt-3 text-xs font-medium " +
                    (scores.barrelDelta >= 0 ? "text-emerald-400" : "text-red-400")
                  }
                >
                  {scores.barrelDelta >= 0 ? "▲" : "▼"} {Math.abs(scores.barrelDelta)} pts since last session
                </motion.p>
              )}
            </div>

            {/* RIGHT: Stacked Anchor/Engine/Whip Mini-Cards */}
            <div className="w-40 md:w-48 flex flex-col space-y-2">
              {/* Anchor Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="flex items-center justify-between rounded-xl bg-white/3 border border-barrels-border px-3 py-2"
              >
                <div>
                  <p className="text-[11px] text-barrels-muted uppercase tracking-wide">
                    Anchor
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">
                      {scores?.anchor || 0}
                    </span>
                    <span className="text-[10px] text-barrels-muted uppercase tracking-wide">
                      Score
                    </span>
                  </div>
                </div>

                {scores?.anchorDelta !== undefined && (
                  <div className="flex flex-col items-end">
                    <span
                      className={
                        "text-[11px] font-semibold " +
                        (scores.anchorDelta >= 0 ? "text-emerald-400" : "text-red-400")
                      }
                    >
                      {scores.anchorDelta >= 0 ? "▲" : "▼"} {Math.abs(scores.anchorDelta)} pts
                    </span>
                    <span className="text-[10px] text-barrels-muted">
                      vs last
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Engine Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="flex items-center justify-between rounded-xl bg-white/3 border border-barrels-border px-3 py-2"
              >
                <div>
                  <p className="text-[11px] text-barrels-muted uppercase tracking-wide">
                    Engine
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">
                      {scores?.engine || 0}
                    </span>
                    <span className="text-[10px] text-barrels-muted uppercase tracking-wide">
                      Score
                    </span>
                  </div>
                </div>

                {scores?.engineDelta !== undefined && (
                  <div className="flex flex-col items-end">
                    <span
                      className={
                        "text-[11px] font-semibold " +
                        (scores.engineDelta >= 0 ? "text-emerald-400" : "text-red-400")
                      }
                    >
                      {scores.engineDelta >= 0 ? "▲" : "▼"} {Math.abs(scores.engineDelta)} pts
                    </span>
                    <span className="text-[10px] text-barrels-muted">
                      vs last
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Whip Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.6 }}
                className="flex items-center justify-between rounded-xl bg-white/3 border border-barrels-border px-3 py-2"
              >
                <div>
                  <p className="text-[11px] text-barrels-muted uppercase tracking-wide">
                    Whip
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">
                      {scores?.whip || 0}
                    </span>
                    <span className="text-[10px] text-barrels-muted uppercase tracking-wide">
                      Score
                    </span>
                  </div>
                </div>

                {scores?.whipDelta !== undefined && (
                  <div className="flex flex-col items-end">
                    <span
                      className={
                        "text-[11px] font-semibold " +
                        (scores.whipDelta >= 0 ? "text-emerald-400" : "text-red-400")
                      }
                    >
                      {scores.whipDelta >= 0 ? "▲" : "▼"} {Math.abs(scores.whipDelta)} pts
                    </span>
                    <span className="text-[10px] text-barrels-muted">
                      vs last
                    </span>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Tiles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          {/* Sessions This Week */}
          <div className="bg-barrels-surface border border-barrels-border rounded-xl p-4">
            <div className="text-barrels-muted text-xs uppercase tracking-wide mb-2">
              This Week
            </div>
            <div className="text-2xl font-bold text-white">
              {/* Mock data - replace with real data */}
              5
            </div>
            <div className="text-barrels-muted text-xs mt-1">
              Sessions
            </div>
          </div>

          {/* Average Momentum Transfer (30 days) */}
          <div className="bg-barrels-surface border border-barrels-border rounded-xl p-4">
            <div className="text-barrels-muted text-xs uppercase tracking-wide mb-2">
              30-Day Avg
            </div>
            <div className="text-2xl font-bold text-barrels-gold">
              {scores?.barrel || 0}
            </div>
            <div className="text-barrels-muted text-xs mt-1">
              Momentum
            </div>
          </div>

          {/* Best Session */}
          <div className="bg-barrels-surface border border-barrels-border rounded-xl p-4">
            <div className="text-barrels-muted text-xs uppercase tracking-wide mb-2">
              Best Session
            </div>
            <div className="text-2xl font-bold text-emerald-400">
              {Math.min((scores?.barrel || 0) + 8, 100)}
            </div>
            <div className="text-barrels-muted text-xs mt-1">
              Score
            </div>
          </div>

          {/* Last Update */}
          <div className="bg-barrels-surface border border-barrels-border rounded-xl p-4">
            <div className="text-barrels-muted text-xs uppercase tracking-wide mb-2">
              Last Update
            </div>
            <div className="text-sm font-bold text-white">
              {latestAssessmentDate 
                ? format(new Date(latestAssessmentDate), 'MMM d')
                : 'N/A'
              }
            </div>
            <div className="text-barrels-muted text-xs mt-1">
              {latestAssessmentDate 
                ? format(new Date(latestAssessmentDate), 'yyyy')
                : 'No data'
              }
            </div>
          </div>
        </motion.div>

        {/* 4B System Tile */}
        <FourBTile />

        {/* BARRELS-Style Coaching Text Block */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Tile>
            <TileHeader 
              title="Your Current Focus"
              subtitle="Based on your latest assessment"
              action={
                <div className="w-10 h-10 rounded-full bg-barrels-gold/20 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-barrels-gold" />
                </div>
              }
            />
            
            {coachingText ? (
              <div className="text-barrels-text text-sm leading-relaxed whitespace-pre-wrap">
                {coachingText}
              </div>
            ) : (
              <div className="text-barrels-muted text-sm italic">
                Complete your first assessment to receive personalized coaching guidance.
              </div>
            )}
          </Tile>
        </motion.div>

        {/* Recommended Work (Drills) Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-bold text-barrels-text">Recommended Work</h3>
          
          {primaryDrill ? (
            <>
              {/* Primary Drill */}
              <Tile className="bg-gradient-to-br from-barrels-gold/5 to-barrels-surface border-barrels-gold/20">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-barrels-gold/20 flex items-center justify-center flex-shrink-0">
                    <Play className="w-5 h-5 text-barrels-gold" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-barrels-text mb-1">{primaryDrill.name}</h4>
                    <p className="text-sm text-barrels-muted">
                      {primaryDrill.primaryPurpose || primaryDrill.description || 'Recommended drill for your current focus'}
                    </p>
                  </div>
                </div>
                <Link href={`/drills/${primaryDrill.id}`}>
                  <PrimaryButton icon={ChevronRight}>
                    View Drill Details
                  </PrimaryButton>
                </Link>
              </Tile>

              {/* Alternate Drills */}
              {alternateDrills.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-barrels-muted font-medium">Alternate Drills:</p>
                  <div className="flex flex-wrap gap-2">
                    {alternateDrills.map((drill: any) => (
                      <Link key={drill.id} href={`/drills/${drill.id}`}>
                        <SecondaryButton className="w-auto">
                          {drill.name}
                        </SecondaryButton>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <Tile className="text-center">
              <p className="text-barrels-muted text-sm mb-4">
                No drills recommended yet. Complete your first assessment to get personalized drill recommendations.
              </p>
            </Tile>
          )}
        </motion.div>

        {/* Primary Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Link href="/lesson/new">
            <PrimaryButton icon={Upload} className="h-14 text-base">
              Start New Lesson
            </PrimaryButton>
          </Link>
          
          <Link href="/assessments/new">
            <SecondaryButton icon={FileText} className="w-full h-14 text-base">
              View Full Report
            </SecondaryButton>
          </Link>
        </motion.div>

        {/* Need Help? */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="text-center py-4"
        >
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="text-barrels-gold hover:text-barrels-gold-light text-sm font-medium transition-colors"
          >
            Need help? Ask Coach Rick →
          </button>
        </motion.div>

      </main>

      {/* Bottom Navigation */}
      
      {/* Coach Rick Drawer */}
      <CoachRickDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)}
        context={{ pageType: 'dashboard' }}
      />
    </div>
  )
}
