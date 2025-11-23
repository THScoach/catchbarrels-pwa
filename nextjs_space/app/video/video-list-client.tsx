'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp, cardHover } from '@/lib/animations';
import { BottomNav } from '@/components/bottom-nav';
import { Video, Upload, VideoIcon, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { usePullToRefresh } from '@/hooks/use-pull-to-refresh';
import { useRouter } from 'next/navigation';
import { triggerHaptic } from '@/lib/mobile-utils';

export function VideoListClient({ videos }: any) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const { scrollableRef, pullDistance, isRefreshing, isReady } = usePullToRefresh({
    onRefresh: async () => {
      triggerHaptic('medium');
      router.refresh();
      await new Promise(resolve => setTimeout(resolve, 1000));
    },
    threshold: 80,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#1a2332] pb-20">
        <div className="p-6 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>

          <div className="grid gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-20 h-20 rounded flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex gap-3">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <BottomNav />
      </div>
    );
  }

  return (
    <div ref={scrollableRef} className="min-h-screen bg-[#1a2332] pb-20 overflow-y-auto scroll-container">
      {/* Pull to Refresh Indicator */}
      <div 
        className="flex items-center justify-center transition-all duration-200"
        style={{ 
          height: `${pullDistance}px`,
          opacity: pullDistance > 0 ? 1 : 0,
        }}
      >
        <motion.div
          animate={{ rotate: isRefreshing ? 360 : 0 }}
          transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}
        >
          <RefreshCw 
            className={`w-5 h-5 ${isReady ? 'text-[#2196F3]' : 'text-gray-400'}`}
          />
        </motion.div>
      </div>
      
      <div className="p-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-6"
        >
          <h1 className="text-2xl font-bold text-white">My Videos</h1>
          <Link
            href="/video/upload"
            className="flex items-center space-x-2 bg-[#2196F3] hover:bg-[#1976D2] text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Upload</span>
          </Link>
        </motion.div>

        <motion.div 
          className="grid gap-4"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {videos?.map((video: any, index: number) => (
            <motion.div
              key={video.id}
              variants={fadeInUp}
              whileHover="hover"
              whileTap="tap"
              initial="rest"
              animate="rest"
              {...cardHover}
            >
              <Link
                href={`/video/${video.id}`}
                className="block bg-gray-800 border border-gray-700 rounded-lg p-4 hover:bg-gray-700 hover:border-gray-600 hover:shadow-lg transition-all duration-200"
              >
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                  <Video className="w-10 h-10 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-semibold truncate">{video.title}</h3>
                    {video.videoType && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#2196F3]/30 text-[#60A5FA] border border-[#2196F3]/50 flex-shrink-0">
                        {video.videoType}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">
                    {formatDistanceToNow(new Date(video.uploadDate), { addSuffix: true })}
                  </p>
                  {video.analyzed ? (
                    <div className="flex flex-wrap gap-3 mt-2">
                      <span className="text-sm text-[#2196F3] font-semibold">Score: {video.overallScore}</span>
                      <span className="text-sm text-white font-medium">{video.tier}</span>
                      {video.exitVelocity && (
                        <span className="text-sm text-white font-medium">{video.exitVelocity} mph</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-sm text-yellow-300 font-semibold">Analyzing...</span>
                  )}
                </div>
              </div>
              </Link>
            </motion.div>
          ))}
          {videos?.length === 0 && (
            <EmptyState
              icon={VideoIcon}
              title="No Swings Yet"
              description="Upload your first swing video to start analyzing your technique and tracking your progress with BARRELS."
              actionLabel="Upload Your First Swing"
              actionHref="/video/upload"
              secondaryActionLabel="Learn About Analysis"
              secondaryActionHref="/library"
            />
          )}
        </motion.div>
      </div>

      <BottomNav />
    </div>
  );
}
