'use client';

import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Video, User, Calendar, BarChart, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface Session {
  id: string;
  title: string;
  videoType: string | null;
  analyzed: boolean;
  overallScore: number | null;
  anchor: number | null;
  engine: number | null;
  whip: number | null;
  uploadDate: Date;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    username: string;
  };
}

interface SessionsClientProps {
  sessions: Session[];
}

export default function SessionsClient({ sessions }: SessionsClientProps) {
  const [filter, setFilter] = useState<string>('all');

  const filteredSessions = sessions.filter((session) => {
    if (filter === 'all') return true;
    return session.videoType?.toLowerCase() === filter.toLowerCase();
  });

  const videoTypes = Array.from(new Set(sessions.map((s) => s.videoType).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sessions</h1>
          <p className="text-gray-400 mt-1">
            {sessions.length} analyzed {sessions.length === 1 ? 'session' : 'sessions'}
          </p>
        </div>
        {/* Filter Buttons */}
        <div className="flex space-x-2 overflow-x-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
              filter === 'all'
                ? 'bg-[#E8B14E]/20 text-[#E8B14E]'
                : 'bg-black/50 text-gray-400 hover:text-gray-300'
            }`}
          >
            All
          </button>
          {videoTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type || '')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${
                filter === type
                  ? 'bg-[#E8B14E]/20 text-[#E8B14E]'
                  : 'bg-black/50 text-gray-400 hover:text-gray-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-[#1A1A1A] border border-[#E8B14E]/20 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-black/50 border-b border-[#E8B14E]/20">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Player
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Video
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Scores
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8B14E]/10">
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Video className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400">No sessions found</p>
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session, index) => (
                  <motion.tr
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="hover:bg-[#E8B14E]/5 transition"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/players/${session.user.id}`}
                        className="text-[#E8B14E] hover:text-[#F5C76E] transition"
                      >
                        {session.user.name || session.user.username}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-white">{session.title || 'Untitled'}</td>
                    <td className="px-6 py-4 text-gray-300">{session.videoType || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-300 text-sm">
                      {format(new Date(session.uploadDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3 text-sm">
                        <div className="text-center">
                          <p className="text-[#E8B14E] font-bold">{session.overallScore || 'N/A'}</p>
                          <p className="text-gray-500 text-xs">BARREL</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-300">{session.anchor || 'N/A'}</p>
                          <p className="text-gray-500 text-xs">A</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-300">{session.engine || 'N/A'}</p>
                          <p className="text-gray-500 text-xs">E</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-300">{session.whip || 'N/A'}</p>
                          <p className="text-gray-500 text-xs">W</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/video/${session.id}`}
                        className="inline-flex items-center text-[#E8B14E] hover:text-[#F5C76E] transition"
                      >
                        View
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Link>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
