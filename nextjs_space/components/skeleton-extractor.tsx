
'use client';

/**
 * Skeleton Extractor Component
 * Uses MediaPipe Pose to extract joint coordinates from video
 * Runs in browser to avoid server costs
 */

import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { segmentPlayer, applyMaskToCanvas } from '@/lib/player-segmentation';

interface SkeletonExtractorProps {
  videoId: string;
  videoUrl: string;
  onComplete: (data: { skeletonData: any[]; fps: number; isolatedFrames?: any[] }) => void;
  onError?: (error: Error) => void;
}

interface MediaPipeKeypoint {
  x: number;
  y: number;
  z: number;
  visibility: number;
  name: string;
}

// MediaPipe Pose keypoint names (33 landmarks)
const POSE_LANDMARKS = [
  'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer',
  'right_eye_inner', 'right_eye', 'right_eye_outer',
  'left_ear', 'right_ear', 'mouth_left', 'mouth_right',
  'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
  'left_wrist', 'right_wrist', 'left_pinky', 'right_pinky',
  'left_index', 'right_index', 'left_thumb', 'right_thumb',
  'left_hip', 'right_hip', 'left_knee', 'right_knee',
  'left_ankle', 'right_ankle', 'left_heel', 'right_heel',
  'left_foot_index', 'right_foot_index'
];

export function SkeletonExtractor({ videoId, videoUrl, onComplete, onError }: SkeletonExtractorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>('Ready to extract skeleton');
  const [skeletonData, setSkeletonData] = useState<any[]>([]);
  const [enablePlayerIsolation, setEnablePlayerIsolation] = useState(false); // Default OFF for stability
  const [isolatedFrames, setIsolatedFrames] = useState<any[]>([]);

  const extractSkeleton = async () => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error('Video or canvas not initialized');
      return;
    }

    const video = videoRef.current;
    
    // Check video duration - warn if too long
    if (video.duration > 30) {
      toast.error('Video is too long. Please trim to under 30 seconds for best results.');
      return;
    }
    
    // Disable player isolation for videos longer than 15 seconds
    if (video.duration > 15 && enablePlayerIsolation) {
      toast.warning('Video is long - disabling player isolation to prevent crashes');
      setEnablePlayerIsolation(false);
    }

    setIsProcessing(true);
    setProgress(0);
    setStatus('Loading MediaPipe Pose...');

    try {
      // Dynamically import MediaPipe Pose
      const { Pose, POSE_CONNECTIONS } = await import('@mediapipe/pose');
      const { Camera } = await import('@mediapipe/camera_utils');

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Failed to get canvas context');
      }

      // Set canvas size to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const extractedFrames: any[] = [];
      const isolatedPlayerFrames: any[] = [];
      // Extract at 60 FPS to prevent browser crashes (120 FPS causes memory issues)
      const fps = 60;
      let frameCount = 0;
      const totalFrames = Math.floor(video.duration * fps);

      setStatus(enablePlayerIsolation 
        ? 'Extracting skeleton + isolating player...' 
        : 'Extracting skeleton from video...');

      // Initialize MediaPipe Pose
      const pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        }
      });

      pose.setOptions({
        modelComplexity: 2, // Highest accuracy
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      // Process each frame with error handling
      const processFrame = async (currentTime: number): Promise<void> => {
        return new Promise((resolve, reject) => {
          video.currentTime = currentTime;
          
          const timeoutId = setTimeout(() => {
            reject(new Error('Frame processing timeout'));
          }, 5000); // 5 second timeout per frame
          
          video.onseeked = async () => {
            try {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

              pose.onResults(async (results: any) => {
                try {
                  clearTimeout(timeoutId);
                  
                  if (results.poseLandmarks) {
                    const keypoints: MediaPipeKeypoint[] = results.poseLandmarks.map(
                      (landmark: any, idx: number) => ({
                        x: landmark.x * canvas.width,
                        y: landmark.y * canvas.height,
                        z: landmark.z,
                        visibility: landmark.visibility || 1.0,
                        name: POSE_LANDMARKS[idx]
                      })
                    );

                    extractedFrames.push({
                      frame: frameCount,
                      timestamp: currentTime,
                      keypoints
                    });

                    // Player isolation (if enabled) - only every 10th frame to reduce memory usage
                    if (enablePlayerIsolation && frameCount % 10 === 0) {
                      try {
                        const segmentation = await segmentPlayer(canvas, keypoints);
                        // Store compressed mask data
                        isolatedPlayerFrames.push({
                          frame: frameCount,
                          mask: {
                            width: segmentation.mask.width,
                            height: segmentation.mask.height,
                            data: Array.from(segmentation.mask.data) // Convert to regular array to save memory
                          },
                          bbox: segmentation.bbox
                        });
                      } catch (error) {
                        console.warn('Player isolation failed for frame', frameCount, error);
                      }
                    }
                  }

                  frameCount++;
                  setProgress((frameCount / totalFrames) * 100);
                  resolve();
                } catch (error) {
                  clearTimeout(timeoutId);
                  console.error('Error processing pose results:', error);
                  resolve(); // Continue with next frame
                }
              });

              await pose.send({ image: canvas });
            } catch (error) {
              clearTimeout(timeoutId);
              console.error('Error in frame processing:', error);
              reject(error);
            }
          };
          
          video.onerror = () => {
            clearTimeout(timeoutId);
            reject(new Error('Video seek error'));
          };
        });
      };

      // Extract frames at regular intervals
      for (let t = 0; t < video.duration; t += 1 / fps) {
        await processFrame(t);
      }

      setStatus('Processing complete!');
      setSkeletonData(extractedFrames);
      setIsolatedFrames(isolatedPlayerFrames);
      
      // Call completion callback
      onComplete({
        skeletonData: extractedFrames,
        fps,
        isolatedFrames: enablePlayerIsolation ? isolatedPlayerFrames : undefined
      });

      toast.success(`Extracted ${extractedFrames.length} frames of skeleton data`);

    } catch (error) {
      console.error('Skeleton extraction error:', error);
      setStatus('Extraction failed');
      toast.error('Failed to extract skeleton data');
      if (onError) {
        onError(error as Error);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          src={videoUrl}
          crossOrigin="anonymous"
          className="w-full h-auto"
          preload="metadata"
        />
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full opacity-0"
        />
      </div>

      {isProcessing && (
        <div className="space-y-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Loader2 className="w-4 h-4 animate-spin text-[#F5A623]" />
              <span>{status}</span>
            </div>
            <span className="text-xs font-mono text-gray-500">
              {progress.toFixed(0)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Processing at 60 FPS</span>
            <span>{enablePlayerIsolation ? 'With Player Isolation' : 'Skeleton Only'}</span>
          </div>
        </div>
      )}

      {!isProcessing && skeletonData.length === 0 && (
        <>
          {/* Tips Card */}
          <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
            <h4 className="text-sm font-semibold text-blue-400 mb-2">💡 Swing Analysis Tips</h4>
            <ul className="text-xs text-gray-300 space-y-1">
              <li>• 60 FPS provides excellent precision for swing analysis</li>
              <li>• Keep videos under 15 seconds for best performance</li>
              <li>• Player isolation is optional - try without it first</li>
              <li>• Extraction takes ~20-40 seconds for short videos</li>
            </ul>
          </div>

          {/* Player Isolation Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#F5A623]" />
              <div>
                <Label htmlFor="player-isolation" className="text-sm font-medium cursor-pointer">
                  Player Isolation (Experimental)
                </Label>
                <p className="text-xs text-gray-400 mt-0.5">
                  May slow down processing - recommended OFF
                </p>
              </div>
            </div>
            <Switch
              id="player-isolation"
              checked={enablePlayerIsolation}
              onCheckedChange={setEnablePlayerIsolation}
            />
          </div>

          <Button
            onClick={extractSkeleton}
            className="w-full bg-[#F5A623] hover:bg-[#E89815] text-white font-semibold"
          >
            Extract Skeleton Data {enablePlayerIsolation && '+ Isolate Player'}
          </Button>
        </>
      )}

      {skeletonData.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle2 className="w-5 h-5" />
            <span>Skeleton extracted: {skeletonData.length} frames</span>
          </div>
          {isolatedFrames.length > 0 && (
            <div className="flex items-center gap-2 text-[#F5A623] text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Player isolated: {isolatedFrames.length} frames</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
