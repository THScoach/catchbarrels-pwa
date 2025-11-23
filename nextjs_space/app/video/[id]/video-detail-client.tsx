'use client';

import { useState, useEffect } from 'react';
import { BottomNav } from '@/components/bottom-nav';
import { ScoreCard } from '@/components/score-card';
import { VideoLoadErrorState } from '@/components/ui/error-state';
import { toast } from 'sonner';
import { ChevronLeft, Video, Loader2, Sparkles, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

export function VideoDetailClient({ video }: any) {
  const [activeTab, setActiveTab] = useState<'analysis' | 'coach'>('analysis');
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [coachFeedback, setCoachFeedback] = useState(video?.coachFeedback || '');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(true);
  const [videoError, setVideoError] = useState(false);

  // Fetch signed URL for video playback
  useEffect(() => {
    const fetchVideoUrl = async () => {
      try {
        setVideoError(false);
        setLoadingUrl(true);
        
        const response = await fetch(`/api/videos/${video.id}/signed-url`);
        if (!response.ok) {
          throw new Error(`Failed to load video: ${response.status}`);
        }
        
        const data = await response.json();
        setVideoUrl(data.signedUrl);
      } catch (error) {
        console.error('Error fetching video URL:', error);
        setVideoError(true);
      } finally {
        setLoadingUrl(false);
      }
    };

    if (video?.id) {
      fetchVideoUrl();
    }
  }, [video?.id]);

  const handleRetryVideo = () => {
    setVideoError(false);
    setLoadingUrl(true);
    toast.info('Retrying...', {
      description: 'Attempting to load your video again.',
    });
    
    // Trigger re-fetch by updating a dependency
    const fetchVideoUrl = async () => {
      try {
        const response = await fetch(`/api/videos/${video.id}/signed-url`);
        if (!response.ok) {
          throw new Error(`Failed to load video: ${response.status}`);
        }
        
        const data = await response.json();
        setVideoUrl(data.signedUrl);
        toast.success('Video loaded!', {
          description: 'Your video is ready to play.',
        });
      } catch (error) {
        console.error('Error fetching video URL:', error);
        setVideoError(true);
        toast.error('Still unavailable', {
          description: 'Please try again in a moment or contact support.',
        });
      } finally {
        setLoadingUrl(false);
      }
    };
    fetchVideoUrl();
  };

  const getAIFeedback = async () => {
    setLoadingFeedback(true);
    try {
      const response = await fetch('/api/coach-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoId: video?.id,
          scores: {
            anchor: video?.anchor,
            engine: video?.engine,
            whip: video?.whip,
            overallScore: video?.overallScore,
            exitVelocity: video?.exitVelocity,
          },
        }),
      });

      const data = await response.json();
      setCoachFeedback(data?.feedback || 'Great swing! Keep practicing.');
    } catch (error) {
      console.error('Error getting coach feedback:', error);
      setCoachFeedback('Keep working on your mechanics. Practice makes perfect!');
    } finally {
      setLoadingFeedback(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a2332] pb-20">
      <div className="p-6 max-w-7xl mx-auto">
        <Link
          href="/video"
          className="inline-flex items-center text-gray-400 hover:text-white mb-4"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Videos
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-white">{video?.title}</h1>
          {video?.videoType && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#2196F3]/20 text-[#2196F3] border border-[#2196F3]/30">
              {video.videoType}
            </span>
          )}
        </div>
        <p className="text-gray-400 text-sm mb-6">
          {formatDistanceToNow(new Date(video?.uploadDate), { addSuffix: true })}
        </p>

        {/* Video Player */}
        <div className="bg-gray-900 border border-gray-700 rounded-lg aspect-video flex items-center justify-center mb-6 overflow-hidden">
          {videoError ? (
            <div className="flex flex-col items-center gap-4 p-8">
              <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <Video className="w-8 h-8 text-red-400" />
              </div>
              <div className="text-center">
                <h3 className="text-white font-semibold mb-2">Video Unavailable</h3>
                <p className="text-gray-400 text-sm mb-4">
                  We couldn't load this video. It might be processing or temporarily unavailable.
                </p>
              </div>
              <button
                onClick={handleRetryVideo}
                className="bg-[#2196F3] hover:bg-[#1976D2] text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          ) : loadingUrl ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-12 h-12 text-[#2196F3] animate-spin" />
              <p className="text-gray-400 text-sm">Loading video...</p>
            </div>
          ) : videoUrl ? (
            <video
              src={videoUrl}
              controls
              className="w-full h-full object-contain"
              preload="metadata"
            >
              Your browser does not support video playback.
            </video>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Video className="w-16 h-16 text-gray-600" />
              <p className="text-gray-400 text-sm">Unable to load video</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-700">
          <button
            onClick={() => setActiveTab('analysis')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'analysis'
                ? 'border-[#2196F3] text-white'
                : 'border-transparent text-gray-400'
            }`}
          >
            Analysis
          </button>
          <button
            onClick={() => setActiveTab('coach')}
            className={`pb-3 px-1 border-b-2 transition-colors ${
              activeTab === 'coach'
                ? 'border-[#2196F3] text-white'
                : 'border-transparent text-gray-400'
            }`}
          >
            Coach Rick AI
          </button>
        </div>

        {activeTab === 'analysis' ? (
          <div>
            {video?.analyzed ? (
              <div className="space-y-6">
                <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-white mb-4">Overall Score</h2>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-5xl font-bold text-white">{video.overallScore}</div>
                      <div className="text-2xl font-semibold text-[#2196F3] mt-1">{video.tier}</div>
                    </div>
                    {video?.exitVelocity && (
                      <div className="text-right">
                        <div className="text-gray-400 text-sm">Exit Velocity</div>
                        <div className="text-3xl font-bold text-white">{video.exitVelocity}</div>
                        <div className="text-gray-400 text-sm">mph</div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">Body Metrics Breakdown</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ScoreCard 
                      title="Anchor" 
                      score={video.anchor} 
                      icon="⚓" 
                      description="Lower Body" 
                      color="blue"
                      subCategories={[
                        { name: 'Stance/Setup', score: video.anchorStance || 0, description: 'Initial position quality' },
                        { name: 'Weight Shift', score: video.anchorWeightShift || 0, description: 'Weight transfer efficiency' },
                        { name: 'Ground Connection', score: video.anchorGroundConnection || 0, description: 'Ground force utilization' },
                        { name: 'Lower Body Mechanics', score: video.anchorLowerBodyMechanics || 0, description: 'Overall leg movement' },
                      ]}
                    />
                    <ScoreCard 
                      title="Engine" 
                      score={video.engine} 
                      icon="🔄" 
                      description="Trunk/Core" 
                      color="green"
                      subCategories={[
                        { name: 'Hip Rotation', score: video.engineHipRotation || 0, description: 'Hip rotation power' },
                        { name: 'Separation', score: video.engineSeparation || 0, description: 'Upper/lower body separation' },
                        { name: 'Core Power', score: video.engineCorePower || 0, description: 'Core engagement & strength' },
                        { name: 'Torso Mechanics', score: video.engineTorsoMechanics || 0, description: 'Torso rotation quality' },
                      ]}
                    />
                    <ScoreCard 
                      title="Whip" 
                      score={video.whip} 
                      icon="⚡" 
                      description="Arms & Bat" 
                      color="purple"
                      subCategories={[
                        { name: 'Arm Path', score: video.whipArmPath || 0, description: 'Arm path efficiency' },
                        { name: 'Bat Speed', score: video.whipBatSpeed || 0, description: 'Bat speed generation' },
                        { name: 'Bat Path', score: video.whipBatPath || 0, description: 'Bat path quality' },
                        { name: 'Connection', score: video.whipConnection || 0, description: 'Arms-body connection' },
                      ]}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-8 text-center">
                <Loader2 className="w-12 h-12 text-[#2196F3] mx-auto mb-4 animate-spin" />
                <p className="text-white text-lg">Analyzing your swing...</p>
                <p className="text-gray-400 text-sm mt-2">This usually takes 30-60 seconds</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-[#2196F3] rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Coach Rick</h3>
                <p className="text-gray-400 text-sm">AI Hitting Coach</p>
              </div>
            </div>

            {coachFeedback ? (
              <div className="bg-gray-900 rounded-lg p-4 text-gray-300">
                {coachFeedback}
              </div>
            ) : (
              <div className="text-center py-8">
                {loadingFeedback ? (
                  <div>
                    <Loader2 className="w-8 h-8 text-[#2196F3] mx-auto mb-3 animate-spin" />
                    <p className="text-gray-400">Generating personalized feedback...</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-400 mb-4">Get personalized coaching feedback from Coach Rick</p>
                    <button
                      onClick={getAIFeedback}
                      className="bg-[#2196F3] hover:bg-[#1976D2] text-white px-6 py-3 rounded-lg transition-colors"
                    >
                      Get AI Feedback
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
