'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/bottom-nav';
import { UploadErrorState } from '@/components/ui/error-state';
import { toast } from 'sonner';
import { Upload, Loader2, CheckCircle, AlertCircle, Video as VideoIcon, Info, Link as LinkIcon, Camera, StopCircle, Zap } from 'lucide-react';

export function VideoUploadClient() {
  const router = useRouter();
  const [mode, setMode] = useState<'upload' | 'onform' | 'record'>('record');
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [catastrophicError, setCatastrophicError] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoType, setVideoType] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // OnForm import states
  const [onformUrl, setOnformUrl] = useState<string>('');
  const [importing, setImporting] = useState(false);

  // Camera recording states
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

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
          toast.success('Upload successful!', {
            description: 'Your swing is being analyzed. This may take a few moments.',
          });
          setTimeout(() => {
            router.push('/video');
            router.refresh();
          }, 1500);
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

  const handleOnFormImport = async () => {
    if (!onformUrl.trim()) {
      setError('Please enter an OnForm share link');
      return;
    }

    if (!videoType) {
      setError('Please select a video type before importing');
      return;
    }

    // Basic URL validation
    if (!onformUrl.includes('getonform.com')) {
      setError('Please enter a valid OnForm share link (e.g., https://link.getonform.com/view?id=...)');
      return;
    }

    setImporting(true);
    setError(null);
    setProgress(0);

    try {
      const response = await fetch('/api/videos/import-onform', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shareUrl: onformUrl,
          videoType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setSuccess(true);
      toast.success('OnForm video imported!', {
        description: 'Your swing is being analyzed. This may take a few moments.',
      });

      setTimeout(() => {
        router.push('/video');
        router.refresh();
      }, 1500);

    } catch (err) {
      console.error('OnForm import error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to import OnForm video';
      setError(errorMessage);
      setImporting(false);
      toast.error('Import failed', {
        description: errorMessage,
      });
    }
  };

  // Camera Recording Functions
  const startCamera = async () => {
    setCameraError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // Use rear camera on mobile
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60 } // Request 60 FPS (max for iOS Safari PWA)
        },
        audio: false
      });

      setStream(mediaStream);

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = mediaStream;
        videoPreviewRef.current.play();
      }

      toast.success('Camera ready!', {
        description: 'Position yourself and start recording.',
      });
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera. Please check permissions in your browser settings.');
      toast.error('Camera access denied', {
        description: 'Please allow camera access in your browser settings.',
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
  };

  const startRecording = () => {
    if (!stream) return;

    if (!videoType) {
      setError('Please select a video type before recording');
      return;
    }

    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp8',
      videoBitsPerSecond: 5000000 // 5 Mbps for good quality
    });

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const file = new File([blob], `swing-${Date.now()}.webm`, { type: 'video/webm' });
      setSelectedFile(file);
      setRecordedChunks(chunks);
      stopCamera();
      toast.success('Recording complete!', {
        description: 'Ready to upload your swing.',
      });
    };

    recorder.start();
    setMediaRecorder(recorder);
    setRecording(true);
    setRecordingTime(0);

    // Start timer
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= 30) {
          // Auto-stop after 30 seconds
          stopRecording();
          return 30;
        }
        return prev + 1;
      });
    }, 1000);

    toast.success('Recording started!', {
      description: 'Take your swing. Tap Stop when done.',
    });
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    setRecording(false);
  };

  const resetRecording = () => {
    setSelectedFile(null);
    setRecordedChunks([]);
    setRecordingTime(0);
    startCamera();
  };

  // Cleanup on unmount or mode change
  useEffect(() => {
    return () => {
      stopCamera();
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (mode !== 'record') {
      stopCamera();
    }
  }, [mode]);

  // Show catastrophic error state
  if (catastrophicError) {
    return (
      <div className="min-h-screen bg-[#1a2332] pb-20">
        <div className="p-6 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-white mb-6">Upload Swing Video</h1>
          <UploadErrorState onRetry={handleRetry} />
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a2332] pb-20">
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Add Swing Video</h1>

        {/* Mode Switcher Tabs */}
        <div className="mb-6 grid grid-cols-3 gap-2 p-1 bg-gray-800/50 rounded-lg">
          <button
            onClick={() => {
              setMode('record');
              setError(null);
              setCameraError(null);
            }}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg font-medium transition-all ${
              mode === 'record'
                ? 'bg-[#F5A623] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Camera className="w-5 h-5" />
            <span className="text-xs">Record</span>
            <span className="text-[10px] opacity-80">60 FPS</span>
          </button>
          <button
            onClick={() => {
              setMode('onform');
              setError(null);
            }}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-3 rounded-lg font-medium transition-all ${
              mode === 'onform'
                ? 'bg-[#F5A623] text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Zap className="w-5 h-5" />
            <span className="text-xs">OnForm</span>
            <span className="text-[10px] opacity-80">Best ⭐</span>
          </button>
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
            <span className="text-xs">Upload</span>
            <span className="text-[10px] opacity-80">From Library</span>
          </button>
        </div>

        {/* Baseball Hitting Only Notice */}
        <div className="mb-6 bg-[#F5A623]/10 border border-[#F5A623] rounded-lg p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-[#F5A623] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-medium">Baseball Hitting Videos Only</p>
            <p className="text-gray-300 text-sm mt-1">
              This tool is designed specifically for baseball swing analysis. Please {mode === 'record' ? 'record' : mode === 'upload' ? 'upload' : 'import'} videos of batting practice, cage work, tee work, or game swings only.
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
        {!success && !uploading && !importing && (
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

        {/* Camera Record Mode */}
        {mode === 'record' && (
          <div className="bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-lg overflow-hidden">
            {success ? (
              <div className="p-12 space-y-4 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <p className="text-white text-lg">Upload successful!</p>
                <p className="text-gray-400">Analyzing your swing...</p>
              </div>
            ) : uploading ? (
              <div className="p-12 space-y-4 text-center">
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
              // Recorded video preview
              <div className="p-8 space-y-4">
                <div className="bg-black rounded-lg overflow-hidden aspect-video">
                  <video
                    src={URL.createObjectURL(selectedFile)}
                    controls
                    className="w-full h-full"
                  />
                </div>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-white font-medium">{selectedFile.name}</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {recordingTime}s
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded">
                      60 FPS Recorded
                    </div>
                    <div className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded">
                      Ready for Analysis
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={resetRecording}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
                  >
                    Record Again
                  </button>
                  <button
                    onClick={handleUpload}
                    className="flex-1 bg-[#F5A623] hover:bg-[#E89815] text-white px-8 py-3 rounded-lg transition-colors font-medium"
                  >
                    Upload Video
                  </button>
                </div>
              </div>
            ) : stream ? (
              // Camera preview with recording controls
              <div>
                <div className="bg-black relative aspect-video">
                  <video
                    ref={videoPreviewRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {recording && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-2 animate-pulse">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span className="font-medium">REC {recordingTime}s</span>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2">
                    <div className="bg-blue-500/20 text-blue-300 text-xs px-3 py-1 rounded-full backdrop-blur">
                      60 FPS • 1080p
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {!recording ? (
                    <button
                      onClick={startRecording}
                      disabled={!videoType}
                      className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-4 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                      Start Recording
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="w-full bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                    >
                      <StopCircle className="w-5 h-5" />
                      Stop Recording
                    </button>
                  )}
                  <p className="text-gray-400 text-sm text-center">
                    {recording
                      ? 'Recording will auto-stop after 30 seconds'
                      : 'Position yourself, then tap Start Recording'}
                  </p>
                </div>
              </div>
            ) : (
              // Initial camera access
              <div className="p-12 text-center space-y-4">
                <Camera className="w-16 h-16 text-gray-600 mx-auto" />
                <p className="text-white text-lg">Record Your Swing</p>
                <p className="text-gray-400 text-sm">
                  60 FPS • 1080p Quality • Max 30 seconds
                </p>
                {cameraError ? (
                  <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-red-200 text-sm">{cameraError}</p>
                  </div>
                ) : null}
                <button
                  onClick={startCamera}
                  className="mt-4 bg-[#F5A623] hover:bg-[#E89815] text-white px-8 py-3 rounded-lg transition-colors font-medium"
                >
                  Enable Camera
                </button>
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 max-w-md mx-auto text-left">
                  <h4 className="text-blue-300 font-medium mb-2">Camera Tips:</h4>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Position camera perpendicular to your stance</li>
                    <li>• Ensure full body is visible in frame</li>
                    <li>• Use good lighting for best results</li>
                    <li>• Keep camera stable during recording</li>
                  </ul>
                </div>
              </div>
            )}
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

        {/* OnForm Import Mode */}
        {mode === 'onform' && (
          <div className="bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-lg p-12">
            {success ? (
              <div className="space-y-4 text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                <p className="text-white text-lg">Import successful!</p>
                <p className="text-gray-400">Analyzing your swing...</p>
              </div>
            ) : importing ? (
              <div className="space-y-4 text-center">
                <Loader2 className="w-16 h-16 text-[#F5A623] mx-auto animate-spin" />
                <p className="text-white text-lg">Importing OnForm video...</p>
                <p className="text-gray-400 text-sm">This may take a minute</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <LinkIcon className="w-16 h-16 text-[#F5A623] mx-auto" />
                  <p className="text-white text-lg font-medium">Import from OnForm</p>
                  <p className="text-gray-400 text-sm">
                    Paste your OnForm share link to import swing videos
                  </p>
                </div>

                <div className="space-y-4 max-w-lg mx-auto">
                  <div>
                    <label className="block text-white font-medium mb-2">
                      OnForm Share Link <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="url"
                      value={onformUrl}
                      onChange={(e) => setOnformUrl(e.target.value)}
                      placeholder="https://link.getonform.com/view?id=..."
                      className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#F5A623] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20"
                    />
                    <p className="text-gray-400 text-xs mt-2">
                      Get the share link from your OnForm video → Share → Copy Link
                    </p>
                  </div>

                  <button
                    onClick={handleOnFormImport}
                    disabled={!onformUrl.trim() || !videoType}
                    className="w-full bg-[#F5A623] hover:bg-[#E89815] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-colors"
                  >
                    Import Video
                  </button>
                </div>

                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 max-w-lg mx-auto">
                  <h4 className="text-blue-300 font-medium mb-2">How to get an OnForm share link:</h4>
                  <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                    <li>Open your video in OnForm app</li>
                    <li>Tap the Share button</li>
                    <li>Choose "Share via Email/Link"</li>
                    <li>Copy the link and paste it here</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-6 bg-gray-800/30 border border-gray-700 rounded-lg p-4">
          <h3 className="text-white font-medium mb-3">
            {mode === 'record' ? '📱 PWA Camera Tips:' : mode === 'upload' ? '📹 Video Recording Tips:' : '🎥 OnForm Capture Tips:'}
          </h3>
          <ul className="text-gray-400 text-sm space-y-2">
            {mode === 'record' ? (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-[#F5A623] font-bold">•</span>
                  <span><strong className="text-gray-300">60 FPS capture:</strong> Perfect for most swing analysis needs (OnForm offers 120-240 FPS for pro-level detail)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F5A623] font-bold">•</span>
                  <span><strong className="text-gray-300">Side angle:</strong> Position camera perpendicular to your stance for best mechanics visibility</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F5A623] font-bold">•</span>
                  <span><strong className="text-gray-300">Stable setup:</strong> Use a tripod or stable surface to minimize camera shake</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F5A623] font-bold">•</span>
                  <span><strong className="text-gray-300">Good lighting:</strong> Bright, even lighting improves skeleton extraction accuracy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F5A623] font-bold">•</span>
                  <span><strong className="text-gray-300">Keep it short:</strong> 5-10 second clips work best (auto-stops at 30s)</span>
                </li>
              </>
            ) : mode === 'upload' ? (
              <>
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
                  <span><strong className="text-gray-300">Good lighting:</strong> Clear visibility improves AI analysis accuracy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#F5A623] font-bold">•</span>
                  <span><strong className="text-gray-300">Multiple swings:</strong> Upload 3-5 swings for better trend analysis and progress tracking</span>
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
