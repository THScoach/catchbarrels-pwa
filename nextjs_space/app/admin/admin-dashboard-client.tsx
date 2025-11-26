'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, Activity, TrendingUp, TrendingDown, AlertTriangle, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { AdminDashboardData } from '@/lib/admin/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HelpBeacon } from '@/components/help/HelpBeacon';

interface AdminDashboardClientProps {
  data: AdminDashboardData;
}

export default function AdminDashboardClient({ data }: AdminDashboardClientProps) {
  const router = useRouter();
  const [expandedRoster, setExpandedRoster] = useState(false);

  const statsCards = [
    {
      title: 'Total Athletes',
      value: data.totalAthletes,
      icon: Users,
      color: 'text-blue-400',
    },
    {
      title: 'Active (7 Days)',
      value: data.activeLast7Days,
      icon: Activity,
      color: 'text-green-400',
    },
    {
      title: 'Avg Momentum Score',
      value: data.avgMomentumScore,
      icon: TrendingUp,
      color: 'text-barrels-gold',
    },
  ];

  return (
    <div className="min-h-screen bg-barrels-black">
      {/* Header */}
      <div className="bg-gradient-to-r from-barrels-black via-barrels-black-light to-barrels-black border-b border-gray-800 p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Coach Control Room
            </h1>
            <p className="text-gray-400 text-lg">
              Deep view of your roster, sessions, and momentum transfer patterns.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {statsCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card className="bg-barrels-black-light border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 font-medium">{stat.title}</p>
                      <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-barrels-black ${stat.color}`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Roster Snapshot */}
        <Card className="bg-barrels-black-light border-gray-800">
          <CardHeader className="border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">Roster Snapshot</CardTitle>
                <CardDescription className="text-gray-400">
                  Your athletes, sorted by most recent activity
                </CardDescription>
              </div>
              <button
                onClick={() => setExpandedRoster(!expandedRoster)}
                className="text-barrels-gold hover:text-barrels-gold-light transition-colors flex items-center gap-2"
              >
                {expandedRoster ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show All ({data.rosterSummary.length})
                  </>
                )}
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {data.rosterSummary
                .slice(0, expandedRoster ? data.rosterSummary.length : 5)
                .map((athlete) => (
                  <motion.div
                    key={athlete.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-barrels-black border border-gray-800 rounded-lg p-4 hover:border-barrels-gold/30 transition-all cursor-pointer"
                    onClick={() => router.push(`/admin/athlete/${athlete.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold">{athlete.name}</h3>
                          {athlete.level && (
                            <Badge variant="outline" className="text-xs text-gray-400 border-gray-700">
                              {athlete.level}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>
                            Last session:{' '}
                            {athlete.lastSessionDate
                              ? format(new Date(athlete.lastSessionDate), 'MMM d, yyyy')
                              : 'Never'}
                          </span>
                          <span>•</span>
                          <span>{athlete.totalSessions} sessions (30d)</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-xs text-gray-400 mb-1">30-Day Avg</p>
                          <p className="text-2xl font-bold text-white">{athlete.thirtyDayAvgScore}</p>
                        </div>
                        <div className="flex items-center">
                          {athlete.recentTrend === 'up' && (
                            <TrendingUp className="w-5 h-5 text-green-400" />
                          )}
                          {athlete.recentTrend === 'down' && (
                            <TrendingDown className="w-5 h-5 text-red-400" />
                          )}
                          {athlete.recentTrend === 'flat' && (
                            <div className="w-5 h-0.5 bg-gray-600" />
                          )}
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-600" />
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Sessions & Flags */}
        <Card className="bg-barrels-black-light border-gray-800">
          <CardHeader className="border-b border-gray-800">
            <CardTitle className="text-white">Recent Sessions & Flags</CardTitle>
            <CardDescription className="text-gray-400">
              Last 30 sessions across all athletes
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3">
              {data.recentSessions.map((session) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  whileHover={{ scale: 1.01 }}
                  className={`bg-barrels-black border rounded-lg p-4 transition-all cursor-pointer ${
                    session.flagged
                      ? 'border-red-600/50 hover:border-red-500'
                      : 'border-gray-800 hover:border-barrels-gold/30'
                  }`}
                  onClick={() => router.push(`/admin/session/${session.videoId}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-semibold">{session.playerName}</h3>
                        {session.flagged && (
                          <Badge className="bg-red-600/20 text-red-400 border-red-600/30">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {session.flagReason}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>{format(new Date(session.date), 'MMM d, yyyy h:mm a')}</span>
                        <span>•</span>
                        <span>
                          Weakest: {session.weakestFlow} ({session.weakestScore})
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-xs text-gray-400 mb-1">Momentum</p>
                        <p
                          className={`text-2xl font-bold ${
                            session.momentumScore >= 80
                              ? 'text-green-400'
                              : session.momentumScore >= 60
                              ? 'text-barrels-gold'
                              : 'text-red-400'
                          }`}
                        >
                          {session.momentumScore}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help Beacon */}
      <HelpBeacon 
        pageId="admin-dashboard"
        contextData={{
          rosterSize: data.totalAthletes,
          flaggedSessions: data.recentSessions.filter(s => s.flagged).length,
        }}
        variant="icon"
      />
    </div>
  );
}
