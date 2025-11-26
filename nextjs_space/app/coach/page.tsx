// app/coach/page.tsx
// Coach Overview / Dashboard
// Version: 1.0
// Date: November 26, 2025

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { TrendingUp, TrendingDown, Users, AlertTriangle } from 'lucide-react';
import { CoachLayout } from '@/components/coach/coach-layout';
import type { CoachAssessment, FlowLane, FlowLaneSnapshot, TrendData } from '@/types/coach';

// TODO: Replace with real data from API
const mockTrendData: TrendData[] = [
  { date: '2025-10-27', value: 72 },
  { date: '2025-11-03', value: 74 },
  { date: '2025-11-10', value: 76 },
  { date: '2025-11-17', value: 75 },
  { date: '2025-11-24', value: 78 },
];

const mockFlowSnapshot: FlowLaneSnapshot = {
  groundFlow: 38,
  powerFlow: 27,
  barrelFlow: 35,
};

const mockRecentAssessments: CoachAssessment[] = [
  {
    id: '1',
    playerId: 'p1',
    player: {
      id: 'p1',
      firstName: 'Jalen',
      lastName: 'Brown',
      age: 14,
      level: 'Youth',
      handedness: 'R',
      bats: 'R',
      throws: 'R',
    },
    date: '2025-11-24',
    momentumTransferScore: 78,
    groundFlowScore: 74,
    powerFlowScore: 80,
    barrelFlowScore: 79,
    consistencyScore: 76,
    weakestFlowLane: 'groundFlow',
    band: 'Above Average',
    swingsCompleted: 52,
  },
  {
    id: '2',
    playerId: 'p2',
    player: {
      id: 'p2',
      firstName: 'Marcus',
      lastName: 'Davis',
      age: 16,
      level: 'HS',
      handedness: 'L',
      bats: 'L',
      throws: 'L',
    },
    date: '2025-11-23',
    momentumTransferScore: 85,
    groundFlowScore: 88,
    powerFlowScore: 83,
    barrelFlowScore: 84,
    consistencyScore: 82,
    weakestFlowLane: 'powerFlow',
    band: 'Advanced',
    swingsCompleted: 52,
  },
  {
    id: '3',
    playerId: 'p3',
    player: {
      id: 'p3',
      firstName: 'Tyler',
      lastName: 'Chen',
      age: 15,
      level: 'HS',
      handedness: 'R',
      bats: 'R',
      throws: 'R',
    },
    date: '2025-11-22',
    momentumTransferScore: 68,
    groundFlowScore: 65,
    powerFlowScore: 70,
    barrelFlowScore: 69,
    consistencyScore: 64,
    weakestFlowLane: 'groundFlow',
    band: 'Average',
    swingsCompleted: 48,
  },
];

const mockFlags = {
  TIMING_REGRESSION: 3,
  GROUND_LEAK: 2,
  BARREL_CHAOS: 2,
};

export default function CoachOverviewPage() {
  const currentScore = mockTrendData[mockTrendData.length - 1].value;
  const previousScore = mockTrendData[mockTrendData.length - 2].value;
  const delta = currentScore - previousScore;
  const deltaPercent = ((delta / previousScore) * 100).toFixed(1);

  return (
    <CoachLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-barrels-gold">Overview</h1>
          <p className="text-slate-400 mt-1">
            Your program at a glance — last 30 days
          </p>
        </motion.div>

        {/* Top Row: Momentum Transfer Trend + Flow Lanes Snapshot */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Momentum Transfer Trend */}
          <motion.div
            className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-barrels-gold/20 rounded-2xl p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-200">
                Momentum Transfer Trend
              </h2>
              {delta > 0 ? (
                <TrendingUp size={20} className="text-green-400" />
              ) : (
                <TrendingDown size={20} className="text-red-400" />
              )}
            </div>

            {/* Big number */}
            <div className="mb-6">
              <p className="text-4xl font-bold text-barrels-gold">{currentScore}</p>
              <p
                className={`text-sm mt-1 ${
                  delta > 0 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {delta > 0 ? '+' : ''}{delta} ({delta > 0 ? '+' : ''}{deltaPercent}%)
                vs last period
              </p>
            </div>

            {/* Mini sparkline (simple bars for now) */}
            <div className="flex items-end gap-2 h-20">
              {mockTrendData.map((point, idx) => {
                const heightPercent = (point.value / 100) * 100;
                return (
                  <div
                    key={idx}
                    className="flex-1 bg-gradient-to-t from-barrels-gold to-barrels-gold-light rounded-t"
                    style={{ height: `${heightPercent}%` }}
                    title={`${point.date}: ${point.value}`}
                  />
                );
              })}
            </div>
          </motion.div>

          {/* Flow Lanes Snapshot */}
          <motion.div
            className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-barrels-gold/20 rounded-2xl p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <Users size={20} className="text-barrels-gold" />
              <h2 className="text-lg font-semibold text-slate-200">
                Weakest Flow Lane Distribution
              </h2>
            </div>

            <p className="text-sm text-slate-400 mb-4">
              % of athletes where each flow lane is their weakest:
            </p>

            <div className="space-y-4">
              {/* Ground Flow */}
              <Link href="/coach/players?weakest=groundFlow">
                <div className="group cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-300 group-hover:text-barrels-gold transition-colors">
                      Ground Flow
                    </span>
                    <span className="text-sm font-bold text-barrels-gold">
                      {mockFlowSnapshot.groundFlow}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all group-hover:shadow-lg"
                      style={{ width: `${mockFlowSnapshot.groundFlow}%` }}
                    />
                  </div>
                </div>
              </Link>

              {/* Power Flow */}
              <Link href="/coach/players?weakest=powerFlow">
                <div className="group cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-300 group-hover:text-barrels-gold transition-colors">
                      Power Flow
                    </span>
                    <span className="text-sm font-bold text-barrels-gold">
                      {mockFlowSnapshot.powerFlow}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all group-hover:shadow-lg"
                      style={{ width: `${mockFlowSnapshot.powerFlow}%` }}
                    />
                  </div>
                </div>
              </Link>

              {/* Barrel Flow */}
              <Link href="/coach/players?weakest=barrelFlow">
                <div className="group cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-300 group-hover:text-barrels-gold transition-colors">
                      Barrel Flow
                    </span>
                    <span className="text-sm font-bold text-barrels-gold">
                      {mockFlowSnapshot.barrelFlow}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all group-hover:shadow-lg"
                      style={{ width: `${mockFlowSnapshot.barrelFlow}%` }}
                    />
                  </div>
                </div>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Recent Assessments Table */}
        <motion.div
          className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-barrels-gold/20 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold text-slate-200 mb-4">
            Recent Assessments
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 text-left">
                  <th className="pb-3 text-sm font-medium text-slate-400">Player</th>
                  <th className="pb-3 text-sm font-medium text-slate-400">Date</th>
                  <th className="pb-3 text-sm font-medium text-slate-400">Score</th>
                  <th className="pb-3 text-sm font-medium text-slate-400">
                    Weakest Flow
                  </th>
                  <th className="pb-3 text-sm font-medium text-slate-400">Band</th>
                  <th className="pb-3 text-sm font-medium text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockRecentAssessments.map((assessment, idx) => (
                  <motion.tr
                    key={assessment.id}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.3 + idx * 0.05 }}
                  >
                    <td className="py-4">
                      <Link
                        href={`/coach/players/${assessment.playerId}`}
                        className="text-sm font-medium text-slate-200 hover:text-barrels-gold transition-colors"
                      >
                        {assessment.player.firstName} {assessment.player.lastName}
                      </Link>
                    </td>
                    <td className="py-4 text-sm text-slate-400">
                      {new Date(assessment.date).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      <span className="text-sm font-bold text-barrels-gold">
                        {assessment.momentumTransferScore}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-slate-300 capitalize">
                      {assessment.weakestFlowLane.replace(/([A-Z])/g, ' $1').trim()}
                    </td>
                    <td className="py-4">
                      <span className="text-sm text-slate-300">
                        {assessment.band}
                      </span>
                    </td>
                    <td className="py-4">
                      <Link
                        href={`/assessments/${assessment.id}/report`}
                        className="text-sm text-barrels-gold hover:underline"
                      >
                        View Report
                      </Link>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/coach/assessments"
              className="text-sm text-barrels-gold hover:underline"
            >
              View all assessments →
            </Link>
          </div>
        </motion.div>

        {/* Flags Summary */}
        <motion.div
          className="bg-gradient-to-br from-red-900/20 to-red-900/10 border border-red-500/30 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={20} className="text-red-400" />
            <h2 className="text-lg font-semibold text-slate-200">Active Flags</h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {Object.entries(mockFlags).map(([flagType, count]) => (
              <Link key={flagType} href={`/coach/flags?type=${flagType}`}>
                <div className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-red-500/50 transition-colors cursor-pointer">
                  <span className="text-sm text-slate-300">
                    {flagType.replace(/_/g, ' ')}
                  </span>
                  <span className="ml-2 text-sm font-bold text-red-400">({count})</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-4">
            <Link
              href="/coach/flags"
              className="text-sm text-red-400 hover:underline"
            >
              View all flags →
            </Link>
          </div>
        </motion.div>

        {/* AI "What should I look at?" Panel */}
        <motion.div
          className="bg-gradient-to-br from-barrels-gold/10 to-barrels-gold-light/5 border border-barrels-gold/30 rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <h2 className="text-lg font-semibold text-barrels-gold mb-3">
            🧠 Coach Rick AI Insights
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Coach, in the last 14 days, 3 hitters have lost ground flow consistency,
            and 2 show better contact quality but worse momentum transfer. I'd focus
            on fixing timing gaps first — those are your low-hanging fruit. Want me
            to build you a plan?
          </p>
          <p className="text-xs text-slate-500 mt-3">
            TODO: Integrate with DeepAgent AI for dynamic insights
          </p>
        </motion.div>
      </div>
    </CoachLayout>
  );
}
