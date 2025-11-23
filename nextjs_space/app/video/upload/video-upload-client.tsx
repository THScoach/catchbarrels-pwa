'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BottomNav } from '@/components/bottom-nav';
import { Upload, Loader2, CheckCircle } from 'lucide-react';

export function VideoUploadClient() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpload = async () => {
    setUploading(true);
    
    // Simulate upload and processing
    const response = await fetch('/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Swing' }),
    });

    if (response.ok) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/video');
        router.refresh();
      }, 2000);
    } else {
      setUploading(false);
      alert('Upload failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#1a2332] pb-20">
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Upload Swing Video</h1>

        <div className="bg-gray-800/50 border-2 border-dashed border-gray-600 rounded-lg p-12 text-center">
          {success ? (
            <div className="space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
              <p className="text-white text-lg">Upload successful!</p>
              <p className="text-gray-400">Analyzing your swing...</p>
            </div>
          ) : uploading ? (
            <div className="space-y-4">
              <Loader2 className="w-16 h-16 text-[#2196F3] mx-auto animate-spin" />
              <p className="text-white text-lg">Uploading...</p>
              <p className="text-gray-400">This may take a moment</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-16 h-16 text-gray-600 mx-auto" />
              <p className="text-white text-lg">Click to upload or drag and drop</p>
              <p className="text-gray-400 text-sm">MP4, MOV up to 100MB</p>
              <button
                onClick={handleUpload}
                className="mt-4 bg-[#2196F3] hover:bg-[#1976D2] text-white px-8 py-3 rounded-lg transition-colors"
              >
                Select Video
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 bg-gray-800/30 border border-gray-700 rounded-lg p-4">
          <h3 className="text-white font-medium mb-2">Tips for best results:</h3>
          <ul className="text-gray-400 text-sm space-y-1">
            <li>• Record from the side (perpendicular to your stance)</li>
            <li>• Keep camera steady or use a tripod</li>
            <li>• Make sure full body is visible</li>
            <li>• Good lighting helps improve analysis</li>
            <li>• Take 3-5 swings for best comparison</li>
          </ul>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
