"use client";

import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AutoSkeletonExtractorProps {
  videoId: string;
  videoUrl: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

export function AutoSkeletonExtractor({
  videoId,
  videoUrl,
  onComplete,
  onError,
}: AutoSkeletonExtractorProps) {
  const [status, setStatus] = useState<'checking' | 'extracting' | 'processing' | 'complete' | 'error'>('checking');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Checking skeleton data...');
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    checkAndExtract();
  }, [videoId]);

  async function checkAndExtract() {
    try {
      // Check if skeleton data already exists
      const checkResponse = await fetch(`/api/videos/${videoId}/process-skeleton`);
      
      if (!checkResponse.ok) {
        throw new Error('Failed to check skeleton status');
      }

      const videoData = await checkResponse.json();
      
      // If skeleton already extracted, we're done
      if (videoData.skeletonExtracted && videoData.skeletonData) {
        console.log('[AutoSkeleton] Skeleton data already exists, skipping extraction');
        setStatus('complete');
        setMessage('Skeleton data ready');
        setProgress(100);
        onComplete?.();
        return;
      }

      // Start extraction
      console.log('[AutoSkeleton] Starting skeleton extraction...');
      setStatus('extracting');
      setMessage('Extracting skeleton data from video...');
      
      await runSkeletonExtraction();
      
    } catch (error) {
      console.error('[AutoSkeleton] Error:', error);
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Extraction failed');
      onError?.(error instanceof Error ? error.message : 'Unknown error');
      toast.error('Skeleton extraction failed', {
        description: 'The system couldn\'t analyze this swing automatically.',
      });
    }
  }

  async function runSkeletonExtraction() {
    // This is where we'd integrate with MediaPipe
    // For now, we'll use a simplified approach that calls the extraction API
    
    try {
      // Import MediaPipe dynamically
      const { Pose } = await import('@mediapipe/pose');
      
      setProgress(10);
      setMessage('Loading AI models...');
      
      // Initialize MediaPipe Pose
      const pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        },
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      setProgress(20);
      setMessage('Loading video...');

      // Create video element
      const video = document.createElement('video');
      video.src = videoUrl;
      video.crossOrigin = 'anonymous';
      video.muted = true;

      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = reject;
      });

      const fps = video.duration > 0 ? 30 : 60; // Estimate or detect FPS
      const totalFrames = Math.floor(video.duration * fps);
      const frameInterval = 1 / fps;
      
      setProgress(30);
      setMessage(`Analyzing ${totalFrames} frames...`);

      const skeletonFrames: any[] = [];
      let currentFrame = 0;

      // Process frames
      for (let time = 0; time < video.duration; time += frameInterval) {
        video.currentTime = time;
        
        await new Promise((resolve) => {
          video.onseeked = resolve;
        });

        // Create canvas for frame
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(video, 0, 0);

        // Get landmarks from MediaPipe
        const results = await new Promise<any>((resolve) => {
          pose.onResults((results) => resolve(results));
          pose.send({ image: canvas });
        });

        if (results.poseLandmarks) {
          skeletonFrames.push({
            frameIndex: currentFrame,
            timestamp: time,
            keypoints: results.poseLandmarks.map((landmark: any, index: number) => ({
              x: landmark.x,
              y: landmark.y,
              z: landmark.z,
              visibility: landmark.visibility,
              name: index, // MediaPipe index
            })),
          });
        }

        currentFrame++;
        const progress = 30 + Math.floor((currentFrame / totalFrames) * 50);
        setProgress(progress);
        setMessage(`Processing frame ${currentFrame}/${totalFrames}...`);
      }

      pose.close();

      if (skeletonFrames.length === 0) {
        throw new Error('No skeleton data extracted from video');
      }

      setProgress(85);
      setMessage('Saving skeleton data...');

      // Send to server for processing
      const processResponse = await fetch(`/api/videos/${videoId}/process-skeleton`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skeletonData: skeletonFrames,
          fps,
        }),
      });

      if (!processResponse.ok) {
        const error = await processResponse.json();
        throw new Error(error.message || 'Failed to process skeleton data');
      }

      setProgress(95);
      setMessage('Running swing analysis...');

      // Trigger scoring
      await fetch(`/api/videos/${videoId}/analyze`, {
        method: 'POST',
      });

      setProgress(100);
      setStatus('complete');
      setMessage('Analysis complete!');
      onComplete?.();
      
      toast.success('Swing analysis complete', {
        description: 'Your 4Bs metrics are now available.',
      });

    } catch (error) {
      console.error('[AutoSkeleton] Extraction error:', error);
      throw error;
    }
  }

  // Don't show anything when complete
  if (status === 'complete') {
    return null;
  }

  // Show extraction progress or error
  const isError = status === 'error';
  const isRunning = status !== 'error';

  return (
    <Card className="p-6 mb-4 bg-gray-800/50 border-gray-700">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          {isError ? (
            <AlertCircle className="w-8 h-8 text-red-500" />
          ) : (
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          )}
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {isError ? 'Extraction Failed' : 'Analyzing Swing...'}
            </h3>
            <p className="text-sm text-gray-400 mt-1">{message}</p>
          </div>
          
          {isRunning && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-gray-500">{progress}% complete</p>
            </div>
          )}
          
          {isError && (
            <p className="text-sm text-red-400">
              Try refreshing the page or contact support if this persists.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
