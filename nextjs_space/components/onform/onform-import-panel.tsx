
'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { 
  Upload, 
  Link2, 
  ExternalLink, 
  Camera, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Video as VideoIcon,
  Info,
  Zap
} from 'lucide-react';
import type { OnFormImportPanelProps, Video } from '@/lib/types';
import { VIDEO_TYPES } from '@/lib/types';

export function OnFormImportPanel({
  athleteId,
  sessionId,
  onImported,
  open,
  onOpenChange
}: OnFormImportPanelProps) {
  const [importing, setImporting] = useState(false);
  const [importMethod, setImportMethod] = useState<'file' | 'link'>('file');
  const [onformUrl, setOnformUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoType, setVideoType] = useState<string>('');
  const [cameraAngle, setCameraAngle] = useState<string>('side');
  const [showInstructions, setShowInstructions] = useState(true);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      toast.success('File selected', {
        description: `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`
      });
    }
  };

  const handleFileImport = async () => {
    if (!videoFile) {
      toast.error('Please select a video file');
      return;
    }

    if (!videoType) {
      toast.error('Please select a video type');
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', videoFile);
      formData.append('videoType', videoType);
      formData.append('source', 'onform');
      formData.append('cameraAngle', cameraAngle);
      if (athleteId) formData.append('athleteId', athleteId);
      if (sessionId) formData.append('sessionId', sessionId);

      const response = await fetch('/api/videos/onform/import', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || 'Failed to import video');
      }

      const result = await response.json();
      
      toast.success('🎉 OnForm video imported!', {
        description: 'Video uploaded successfully. Analysis will begin automatically.',
        duration: 4000
      });

      if (onImported && result.video) {
        onImported({
          videoId: result.video.id,
          athleteId: result.video.userId,
          sessionId: sessionId,
          video: result.video
        });
      }

      // Reset and close
      setVideoFile(null);
      setOnformUrl('');
      setVideoType('');
      setCameraAngle('side');
      onOpenChange(false);

    } catch (error) {
      console.error('Error importing OnForm video:', error);
      toast.error('Failed to import video', {
        description: error instanceof Error ? error.message : 'Please try again or contact support'
      });
    } finally {
      setImporting(false);
    }
  };

  const handleLinkImport = async () => {
    if (!onformUrl.trim()) {
      toast.error('Please paste an OnForm link');
      return;
    }

    if (!videoType) {
      toast.error('Please select a video type');
      return;
    }

    setImporting(true);
    try {
      const response = await fetch('/api/videos/onform/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareUrl: onformUrl.trim(),
          videoType,
          cameraAngle,
          source: 'onform',
          athleteId,
          sessionId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Import failed' }));
        throw new Error(errorData.error || 'Failed to import video');
      }

      const result = await response.json();
      
      toast.success('🎉 OnForm video linked!', {
        description: 'Video imported from share link. Ready to analyze.',
        duration: 4000
      });

      if (onImported && result.video) {
        onImported({
          videoId: result.video.id,
          athleteId: result.video.userId,
          sessionId: sessionId,
          video: result.video
        });
      }

      // Reset and close
      setVideoFile(null);
      setOnformUrl('');
      setVideoType('');
      setCameraAngle('side');
      onOpenChange(false);

    } catch (error) {
      console.error('Error importing OnForm link:', error);
      toast.error('Failed to import video link', {
        description: error instanceof Error ? error.message : 'Please verify the link and try again'
      });
    } finally {
      setImporting(false);
    }
  };

  const handleOpenOnForm = () => {
    // Attempt deep link
    const onformScheme = 'onform://';
    const universalLink = 'https://onform.com/app';
    
    // Try custom scheme first
    window.location.href = onformScheme;
    
    // Fallback to universal link after a short delay
    setTimeout(() => {
      window.location.href = universalLink;
    }, 1500);
    
    toast.info('Opening OnForm...', {
      description: 'If OnForm didn\'t open, please open it manually from your home screen'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#F5A623]">
            <Camera className="w-6 h-6" />
            Import from OnForm
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            High-quality video capture with OnForm's professional camera system
          </DialogDescription>
        </DialogHeader>

        {showInstructions ? (
          <Card className="bg-gray-800/50 border-gray-700 p-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-400" />
                How to Record with OnForm
              </h3>
              
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F5A623] flex items-center justify-center text-white font-bold text-xs">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Open OnForm App</p>
                    <p className="text-gray-400">Launch OnForm on your iPhone or iPad</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F5A623] flex items-center justify-center text-white font-bold text-xs">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Record the Swing</p>
                    <p className="text-gray-400">Use OnForm's high-FPS camera (120-240 FPS recommended)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F5A623] flex items-center justify-center text-white font-bold text-xs">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Export the Video</p>
                    <p className="text-gray-400">Tap Share → Save to Photos OR Copy Share Link</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#F5A623] flex items-center justify-center text-white font-bold text-xs">
                    4
                  </div>
                  <div>
                    <p className="font-medium text-white mb-1">Import to BARRELS</p>
                    <p className="text-gray-400">Upload the file or paste the link below</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={handleOpenOnForm}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open OnForm App
                </Button>
                <Button
                  onClick={() => setShowInstructions(false)}
                  className="flex-1 bg-[#F5A623] hover:bg-[#E89815]"
                >
                  Next: Import Video
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            <Button
              variant="ghost"
              onClick={() => setShowInstructions(true)}
              className="text-sm text-gray-400 hover:text-white"
            >
              ← Back to Instructions
            </Button>

            <Tabs value={importMethod} onValueChange={(v) => setImportMethod(v as 'file' | 'link')}>
              <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                <TabsTrigger value="file">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </TabsTrigger>
                <TabsTrigger value="link">
                  <Link2 className="w-4 h-4 mr-2" />
                  Paste Link
                </TabsTrigger>
              </TabsList>

              <TabsContent value="file" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="video-file" className="text-sm font-medium text-gray-300 mb-2 block">
                    OnForm Video File
                  </Label>
                  <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-[#F5A623] transition-colors">
                    <Input
                      id="video-file"
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label htmlFor="video-file" className="cursor-pointer">
                      <Upload className="w-12 h-12 mx-auto mb-3 text-gray-500" />
                      {videoFile ? (
                        <div>
                          <p className="text-white font-medium">{videoFile.name}</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-white mb-1">Click to select video</p>
                          <p className="text-sm text-gray-400">From Photos or Files app</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="link" className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="onform-url" className="text-sm font-medium text-gray-300 mb-2 block">
                    OnForm Share Link
                  </Label>
                  <Input
                    id="onform-url"
                    type="url"
                    value={onformUrl}
                    onChange={(e) => setOnformUrl(e.target.value)}
                    placeholder="https://onform.com/share/..."
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Paste the share link from OnForm's export menu
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Common Fields */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="video-type" className="text-sm font-medium text-gray-300 mb-2 block">
                  Video Type *
                </Label>
                <Select value={videoType} onValueChange={setVideoType}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select video type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {VIDEO_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="camera-angle" className="text-sm font-medium text-gray-300 mb-2 block">
                  Camera Angle
                </Label>
                <Select value={cameraAngle} onValueChange={setCameraAngle}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="side">Side View</SelectItem>
                    <SelectItem value="face-on">Face-On View</SelectItem>
                    <SelectItem value="overhead">Overhead View</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Side view recommended for optimal 4Bs analysis
                </p>
              </div>
            </div>

            <Button
              onClick={importMethod === 'file' ? handleFileImport : handleLinkImport}
              disabled={importing || (importMethod === 'file' ? !videoFile : !onformUrl.trim()) || !videoType}
              className="w-full bg-[#F5A623] hover:bg-[#E89815] text-white"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Import to BARRELS
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
