'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Upload, TrendingUp, Play, ChevronRight, FileText, Menu } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { BottomNav } from '@/components/bottom-nav'
import BarrelsHeader from '@/components/barrels-header'
import { CoachRickDrawer } from '@/components/coach-rick-drawer'
import { Tile, TileHeader } from '@/components/ui/tile'
import { PrimaryButton, SecondaryButton } from '@/components/ui/barrels-button'
import { Pill } from '@/components/ui/pill'
import { ScoreItem, ScoreGrid } from '@/components/ui/score-item'

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // Primary drill is the first in the list
  const primaryDrill = recommendedDrills?.[0]
  const alternateDrills = recommendedDrills?.slice(1, 4) || []

  return (
    <div className="min-h-screen bg-barrels-bg pb-24">
      {/* BARRELS Header with Logo */}
      <header className="px-4 pt-4 pb-3 border-b border-barrels-border bg-gradient-to-r from-barrels-surface to-barrels-bg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <img 
            src="/barrels-logo-transparent.png" 
            alt="BARRELS"
            className="h-10 w-auto"
          />
          
          {/* Menu Button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-2 rounded-lg bg-barrels-surface hover:bg-barrels-border border border-barrels-border hover:border-barrels-blue transition-all duration-200"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6 text-barrels-text" />
          </button>
        </div>
      </header>

      {/* BARRELS Navigation */}
      <BarrelsHeader activeTab="dashboard" />

      <main className="p-4 space-y-6 max-w-4xl mx-auto pt-4 mt-4">

        {/* Hero BARREL Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative bg-gradient-to-br from-barrels-gold/20 via-barrels-gold-soft/20 to-barrels-gold/10 border-2 border-barrels-gold/40 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden"
        >
          {/* Background gradient accent */}
          <div className="absolute inset-0 bg-gradient-to-tr from-barrels-gold-dark/10 to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            {/* Title */}
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-barrels-gold to-barrels-gold-soft bg-clip-text text-transparent uppercase tracking-wide mb-2">
                BARREL Score
              </h2>
              <p className="text-sm text-barrels-muted">Your Overall Swing Performance</p>
            </div>

            {/* Main Score Layout - Score with Ring + Vertical Stacked Metrics */}
            <div className="flex items-center justify-center gap-8 md:gap-12">
              {/* Large centered score with ring */}
              <div className="relative flex items-center justify-center">
                {/* Circular progress ring */}
                <svg className="absolute inset-0 w-48 h-48 md:w-64 md:h-64 -rotate-90" viewBox="0 0 100 100">
                  {/* Background ring */}
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    className="text-barrels-border/30"
                  />
                  {/* Progress ring */}
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    stroke="url(#goldGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    initial={{ strokeDashoffset: 2 * Math.PI * 42 }}
                    animate={{ 
                      strokeDashoffset: 2 * Math.PI * 42 * (1 - (scores?.barrel || 0) / 100) 
                    }}
                    transition={{ duration: 1.5, delay: 0.3 }}
                  />
                  <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFC93C" />
                      <stop offset="100%" stopColor="#F8E16A" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Score number */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-6xl md:text-7xl font-black bg-gradient-to-br from-barrels-gold to-barrels-gold-soft bg-clip-text text-transparent drop-shadow-2xl leading-none"
                >
                  {scores?.barrel || '—'}
                </motion.div>
              </div>

              {/* Vertically stacked metric scores */}
              {scores?.barrel > 0 && (
                <div className="flex flex-col gap-3">
                  {/* Anchor */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 }}
                    className="flex items-center gap-3 bg-barrels-surface/50 border border-barrels-border rounded-xl px-4 py-2"
                  >
                    <Pill label="Anchor" variant="gold" className="text-[10px] px-2 py-0.5" />
                    <div className="text-2xl font-black text-barrels-text">{scores.anchor || 0}</div>
                  </motion.div>

                  {/* Engine */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 }}
                    className="flex items-center gap-3 bg-barrels-gold/10 border border-barrels-gold/30 rounded-xl px-4 py-2"
                  >
                    <Pill label="Engine" variant="gold" className="text-[10px] px-2 py-0.5" />
                    <div className="text-2xl font-black text-barrels-text">{scores.engine || 0}</div>
                  </motion.div>

                  {/* Whip */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 }}
                    className="flex items-center gap-3 bg-barrels-surface/50 border border-barrels-border rounded-xl px-4 py-2"
                  >
                    <Pill label="Whip" variant="gold" className="text-[10px] px-2 py-0.5" />
                    <div className="text-2xl font-black text-barrels-text">{scores.whip || 0}</div>
                  </motion.div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

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

      </main>

      {/* Bottom Navigation */}
      <BottomNav />
      
      {/* Coach Rick Drawer */}
      <CoachRickDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  )
}
