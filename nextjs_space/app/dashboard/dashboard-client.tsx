'use client';

import { motion } from 'framer-motion';
import { Video as VideoIcon, TrendingUp, Target, Upload } from 'lucide-react';
import { ScoreCard } from '@/components/score-card';
import { BottomNav } from '@/components/bottom-nav';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export function DashboardClient({ user, scores, videos }: any) {
  return (
    <div className="min-h-screen bg-[#1a2332] pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a2332] to-[#2d3a4f] p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white">Welcome back, {user?.name?.split(' ')[0] || 'Athlete'}! 👋</h1>
        <p className="text-gray-400 text-sm mt-1">
          {videos?.length > 0 
            ? `Last swing: ${formatDistanceToNow(new Date(videos[0]?.uploadDate), { addSuffix: true })}`
            : 'Ready to analyze your first swing?'}
        </p>
      </div>

      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/video/upload"
            className="bg-gradient-to-r from-[#2196F3] to-[#1976D2] p-4 rounded-lg flex items-center justify-center space-x-2 hover:shadow-lg transition-shadow"
          >
            <Upload className="w-5 h-5 text-white" />
            <span className="text-white font-medium">Upload Swing</span>
          </Link>
          <Link
            href="/drills"
            className="bg-gradient-to-r from-gray-700 to-gray-800 p-4 rounded-lg flex items-center justify-center space-x-2 hover:shadow-lg transition-shadow border border-gray-700"
          >
            <Target className="w-5 h-5 text-white" />
            <span className="text-white font-medium">View Drills</span>
          </Link>
        </div>

        {/* Overall Score */}
        {scores?.overall > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700 rounded-lg p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Your BARRELS Score</h2>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-5xl font-bold text-white">{scores.overall}</div>
                <div className="text-2xl font-semibold text-[#2196F3] mt-1">{scores.tier}</div>
                <p className="text-gray-400 text-sm mt-2">
                  {scores.overall >= 85
                    ? 'Elite level mechanics!'
                    : scores.overall >= 75
                    ? 'Strong fundamentals!'
                    : scores.overall >= 65
                    ? 'Good progress, keep improving!'
                    : 'Great start! Focus on the basics.'}
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

        {/* BARRELS Breakdown */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">BARRELS Breakdown</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <ScoreCard
              title="Balance"
              score={scores.balance}
              icon="⚖️"
              description="Stance stability"
              color="blue"
            />
            <ScoreCard
              title="Anchor"
              score={scores.anchor}
              icon="⚓"
              description="Foundation"
              color="green"
            />
            <ScoreCard
              title="Rotation"
              score={scores.rotation}
              icon="🔄"
              description="Hip turn"
              color="purple"
            />
            <ScoreCard
              title="Rear Elbow"
              score={scores.rearElbow}
              icon="💪"
              description="Connection"
              color="orange"
            />
            <ScoreCard
              title="Launch"
              score={scores.launch}
              icon="🚀"
              description="Bat path"
              color="red"
            />
            <ScoreCard
              title="Sequence"
              score={scores.sequence}
              icon="⚡"
              description="Timing"
              color="yellow"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div>
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
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
