'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/bottom-nav';
import { UploadErrorState } from '@/components/ui/error-state';
import { OnFormImportPanel } from '@/components/onform/onform-import-panel';
import { toast } from 'sonner';
import { Upload, Loader2, CheckCircle, AlertCircle, Video as VideoIcon, Info, Zap } from 'lucide-react';

export function VideoUploadClient() {
  const router = useRouter();
  const [mode, setMode] = useState<'upload' | 'onform'>('upload');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [catastrophicError, setCatastrophicError] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoType, setVideoType] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // OnForm import states
  const [showOnFormPanel, setShowOnFormPanel] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        setError('Please select a video file');
        return;
      }

      // Validate file size (max 500MB)
      const maxSize = 500 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('Video file is too large. Maximum size is 500MB');
        return;
      }

      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a video file');
      return;
    }

    if (!videoType) {
      setError('Please select a video type before uploading');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Create FormData and append video file and type
      const formData = new FormData();
      formData.append('video', selectedFile);
      formData.append('videoType', videoType);

      // Upload with progress tracking
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          setProgress(Math.round(percentComplete));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          setSuccess(true);
          
          // Parse response to get video ID
          try {
            const response = JSON.parse(xhr.responseText);
            const videoId = response.id || response.videoId;
            
            toast.success('Upload successful!', {
              description: 'Redirecting to analysis view...',
            });
            
            // Navigate directly to the video detail page for analysis
            setTimeout(() => {
              router.push(`/video/${videoId}`);
            }, 1000);
          } catch (err) {
            console.error('Failed to parse upload response:', err);
            toast.success('Upload successful!', {
              description: 'Your swing is being analyzed.',
            });
            setTimeout(() => {
              router.push('/video');
            }, 1500);
          }
        } else if (xhr.status >= 500) {
          // Server error - catastrophic failure
          setCatastrophicError(true);
          setUploading(false);
          setProgress(0);
          toast.error('Server error', {
            description: 'Something went wrong on our end. Please try again later.',
          });
        } else if (xhr.status === 413) {
          setError('Video file is too large. Please try a smaller file.');
          setUploading(false);
          setProgress(0);
          toast.error('File too large', {
            description: 'Maximum file size is 500MB. Please compress your video.',
          });
        } else {
          setError('Upload failed. Please check your file and try again.');
          setUploading(false);
          setProgress(0);
          toast.error('Upload failed', {
            description: 'Please check your file and try again.',
          });
        }
      });

      xhr.addEventListener('error', () => {
        setError('Upload failed. Please check your internet connection and try again.');
        setUploading(false);
        setProgress(0);
        toast.error('Network error', {
          description: 'Please check your internet connection and try again.',
        });
      });

      xhr.addEventListener('timeout', () => {
        setError('Upload timed out. Please try again with a better connection.');
        setUploading(false);
        setProgress(0);
        toast.error('Upload timed out', {
          description: 'The upload took too long. Try with a better connection.',
        });
      });

      xhr.open('POST', '/api/videos/upload');
      xhr.timeout = 300000; // 5 minute timeout for large video uploads
      xhr.send(formData);
    } catch (err) {
      console.error('Upload error:', err);
      setCatastrophicError(true);
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRetry = () => {
    setCatastrophicError(false);
    setError(null);
    setProgress(0);
    // Reset to allow new upload
  };

  // Show catastrophic error state
  if (catastrophicError) {
    return (
      <div className="min-h-screen bg-[#1a2332] pb-20">
        <div className="p-6 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-6">New Analysis</h1>
          <UploadErrorState onRetry={handleRetry} />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a2332] pb-20">
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">New Analysis</h1>

        {/* Mode Switcher Tabs */}
        <div className="mb-6 grid grid-cols-2 gap-2 p-1 bg-gray-800/50 rounded-lg">
          <button
            onClick={() => {
              setMode('upload');
              setError(null);
            }}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg font-medium transition-all ${
              mode === 'upload'
                ? 'bg-[#F5A623] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Upload className="w-5 h-5" />
            <span className="text-xs">Upload Video</span>
            <span className="text-[10px] opacity-80">From Library</span>
          </button>
          <button
            onClick={() => {
              setShowOnFormPanel(true);
              setError(null);
            }}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg font-medium transition-all ${
              mode === 'onform'
                ? 'bg-[#F5A623] text-white'
                : 'text-gray-400 hover:text-white hover:bg-[#F5A623]/10'
            }`}
          >
            <Zap className="w-5 h-5" />
            <span className="text-xs">OnForm</span>
            <span className="text-[10px] opacity-80">120 FPS ⭐</span>
          </button>
        </div>

        {/* Baseball Hitting Only Notice */}
        <div className="mb-6 bg-[#F5A623]/10 border border-[#F5A623] rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-[#F5A623] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-medium">Baseball Hitting Videos Only</p>
            <p className="text-gray-300 text-sm mt-1">
              This tool is designed specifically for baseball swing analysis. Please {mode === 'upload' ? 'upload' : 'import'} videos of batting practice, cage work, tee work, or game swings only.
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-900/20 border border-red-500 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Video Type Selector */}
        {!success && !uploading && (
          <div className="mb-6">
            <label className="block text-white font-medium mb-2">
              Video Type <span className="text-red-400">*</span>
            </label>
            <select
              value={videoType}
              onChange={(e) => setVideoType(e.target.value)}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-[#F5A623] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20"
            >
              <option value="">Select video type...</option>
              <option value="Tee Work">Tee Work</option>
              <option value="Front Toss">Front Toss</option>
              <option value="Cage Work">Cage Work</option>
              <option value="Live BP">Live BP</option>
              <option value="Game Swings">Game Swings</option>
              <option value="Other">Other Hitting Drills</option>
            </select>
            <p className="text-gray-400 text-sm mt-2">
              This helps categorize your swings and provides better analysis context.
            </p>
          </div>
        )}

        {/* Upload Mode */}
        {mode === 'upload' && (
          <div className="bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-lg p-12 text-center">
          {success ? (
            <div className="space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <p className="text-white text-lg">Upload successful!</p>
              <p className="text-gray-400">Analyzing your swing...</p>
            </div>
          ) : uploading ? (
            <div className="space-y-4">
              <Loader2 className="w-16 h-16 text-[#F5A623] mx-auto animate-spin" />
              <p className="text-white text-lg">Uploading... {progress}%</p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-[#F5A623] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-gray-400 text-sm">Please don't close this page</p>
            </div>
          ) : selectedFile ? (
            <div className="space-y-4">
              <VideoIcon className="w-16 h-16 text-[#F5A623] mx-auto" />
              <div className="bg-gray-900/50 rounded-lg p-4 max-w-md mx-auto">
                <p className="text-white font-medium">{selectedFile.name}</p>
                <p className="text-gray-400 text-sm mt-1">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  className="bg-[#F5A623] hover:bg-[#E89815] text-white px-8 py-3 rounded-lg transition-colors"
                >
                  Upload Video
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-16 h-16 text-gray-600 mx-auto" />
              <p className="text-white text-lg">Select your swing video</p>
              <p className="text-gray-400 text-sm">MP4, MOV, AVI up to 500MB</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 bg-[#F5A623] hover:bg-[#E89815] text-white px-8 py-3 rounded-lg transition-colors"
              >
                Select Video
              </button>
            </div>
          )}
          </div>
        )}

        {/* OnForm Import Panel */}
        <OnFormImportPanel
          open={showOnFormPanel}
          onOpenChange={setShowOnFormPanel}
          onImported={(result) => {
            toast.success('Video imported successfully!');
            setTimeout(() => {
              router.push('/video');
              router.refresh();
            }, 1500);
          }}
        />

        {/* Tips Section */}
        <div className="mt-6 bg-gray-800/30 border border-gray-700 rounded-lg p-4">
          <h3 className="text-white font-medium mb-3">
            {mode === 'upload' ? '📹 Video Recording Tips:' : '🎥 OnForm Capture Tips:'}
          </h3>
          <ul className="text-gray-400 text-sm space-y-2">
            {mode === 'upload' ? (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-[#F5A623] font-bold">•</span>
                  <span><strong className="text-gray-300">120 FPS capture:</strong> Record at 120 FPS for detailed swing analysis (OnForm offers up to 240 FPS for pro-level detail)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F5A623] font-bold">•</span>
                  <span><strong className="text-gray-300">Camera angle:</strong> Record from the side (perpendicular to your stance) for best swing mechanics analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F5A623] font-bold">•</span>
                  <span><strong className="text-gray-300">Full body visible:</strong> Ensure entire swing path is captured from stance to follow-through</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F5A623] font-bold">•</span>
                  <span><strong className="text-gray-300">Steady camera:</strong> Use a tripod or stable surface to avoid camera shake</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F5A623] font-bold">•</span>
                  <span><strong className="text-gray-300">Good lighting:</strong> Bright, even lighting improves skeleton extraction accuracy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F5A623] font-bold">•</span>
                  <span><strong className="text-gray-300">Keep it short:</strong> 5-10 second clips work best for accurate analysis</span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-[#F5A623] font-bold">•</span>
                  <span><strong className="text-gray-300">Use OnForm's high FPS:</strong> Capture at 120-240 FPS for detailed biomechanical analysis</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F5A623] font-bold">•</span>
                  <span><strong className="text-gray-300">Auto-capture feature:</strong> OnForm can automatically detect and clip your swings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F5A623] font-bold">•</span>
                  <span><strong className="text-gray-300">Side angle works best:</strong> Position camera perpendicular to your stance</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F5A623] font-bold">•</span>
                  <span><strong className="text-gray-300">Share publicly:</strong> Make sure your video is shared publicly so BARRELS can access it</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F5A623] font-bold">•</span>
                  <span><strong className="text-gray-300">Batch import:</strong> Import multiple swings to track your progress over time</span>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
