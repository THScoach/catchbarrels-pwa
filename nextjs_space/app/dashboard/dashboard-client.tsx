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

        {/* Hero BARREL Score - Redesigned with Compliance Gauge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative rounded-[20px] p-6 shadow-2xl overflow-hidden"
          style={{ backgroundColor: '#05070B' }}
        >
          <div className="space-y-6">
            {/* Title - Left aligned */}
            <h2 className="text-lg font-semibold" style={{ color: '#F5F5F5' }}>
              BARRELS Score
            </h2>

            {/* Circular Compliance Gauge */}
            <div className="flex items-center justify-center py-4">
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
                    stroke="url(#complianceGradient)"
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
                    <linearGradient id="complianceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FFC93C" />
                      <stop offset="100%" stopColor="#FFD54A" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Center text */}
                <div className="flex flex-col items-center justify-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="text-5xl font-bold leading-none mb-1"
                    style={{ color: '#FFFFFF' }}
                  >
                    {scores?.barrel || 0}%
                  </motion.div>
                  <div className="text-sm font-medium" style={{ color: '#B0B6C3' }}>
                    Compliance
                  </div>
                </div>
              </div>
            </div>

            {/* Sub-scores - Horizontal Row */}
            {scores?.barrel > 0 && (
              <div className="grid grid-cols-3 gap-3 px-2">
                {/* Engine */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                  className="text-center"
                >
                  <div className="text-lg font-semibold mb-0.5" style={{ color: '#FFFFFF' }}>
                    {scores.engine}%
                  </div>
                  <div className="text-xs font-medium" style={{ color: '#B0B6C3' }}>
                    Engine
                  </div>
                  {/* Mini progress bar */}
                  <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#2E3440' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${scores.engine}%` }}
                      transition={{ duration: 1, delay: 0.7 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: '#FFC93C' }}
                    />
                  </div>
                </motion.div>

                {/* Anchor */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                  className="text-center"
                >
                  <div className="text-lg font-semibold mb-0.5" style={{ color: '#FFFFFF' }}>
                    {scores.anchor}%
                  </div>
                  <div className="text-xs font-medium" style={{ color: '#B0B6C3' }}>
                    Anchor
                  </div>
                  {/* Mini progress bar */}
                  <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#2E3440' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${scores.anchor}%` }}
                      transition={{ duration: 1, delay: 0.8 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: '#FFC93C' }}
                    />
                  </div>
                </motion.div>

                {/* Whip */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                  className="text-center"
                >
                  <div className="text-lg font-semibold mb-0.5" style={{ color: '#FFFFFF' }}>
                    {scores.whip}%
                  </div>
                  <div className="text-xs font-medium" style={{ color: '#B0B6C3' }}>
                    Whip
                  </div>
                  {/* Mini progress bar */}
                  <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ backgroundColor: '#2E3440' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${scores.whip}%` }}
                      transition={{ duration: 1, delay: 0.9 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: '#FFC93C' }}
                    />
                  </div>
                </motion.div>
              </div>
            )}

            {/* CTA Button - See Your Progress */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              onClick={() => router.push('/lesson/history')}
              className="w-full h-12 rounded-full font-semibold text-base transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
              style={{ 
                backgroundColor: '#2979FF',
                color: '#FFFFFF'
              }}
            >
              See Your Progress
            </motion.button>
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
