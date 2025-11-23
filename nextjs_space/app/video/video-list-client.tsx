'use client';

import { BottomNav } from '@/components/bottom-nav';
import { Video, Upload } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export function VideoListClient({ videos }: any) {
  return (
    <div className="min-h-screen bg-[#1a2332] pb-20">
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">My Videos</h1>
          <Link
            href="/video/upload"
            className="flex items-center space-x-2 bg-[#2196F3] hover:bg-[#1976D2] text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </Link>
        </div>

        <div className="grid gap-4">
          {videos?.map((video: any) => (
            <Link
              key={video.id}
              href={`/video/${video.id}`}
              className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/70 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                  <Video className="w-10 h-10 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-medium truncate">{video.title}</h3>
                    {video.videoType && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#2196F3]/20 text-[#2196F3] border border-[#2196F3]/30 flex-shrink-0">
                        {video.videoType}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">
                    {formatDistanceToNow(new Date(video.uploadDate), { addSuffix: true })}
                  </p>
                  {video.analyzed ? (
                    <div className="flex flex-wrap gap-3 mt-2">
                      <span className="text-sm text-[#2196F3]">Score: {video.overallScore}</span>
                      <span className="text-sm text-gray-500">{video.tier}</span>
                      {video.exitVelocity && (
                        <span className="text-sm text-gray-500">{video.exitVelocity} mph</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-yellow-500">Analyzing...</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
          {videos?.length === 0 && (
            <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-12 text-center">
              <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-4">No videos yet</p>
              <Link
                href="/video/upload"
                className="inline-flex items-center space-x-2 bg-[#2196F3] hover:bg-[#1976D2] text-white px-6 py-3 rounded-lg transition-colors"
              >
                <Upload className="w-5 h-5" />
                <span>Upload Your First Swing</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
