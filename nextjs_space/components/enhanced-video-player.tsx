
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Play, Pause, RotateCcw, ChevronLeft, ChevronRight,
  Minus, Circle, Slash, Type, Undo2, Trash2, Palette
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';

interface Point {
  x: number;
  y: number;
}

interface Drawing {
  id: string;
  type: 'line' | 'circle' | 'angle' | 'freehand' | 'text';
  points: Point[];
  color: string;
  label?: string;
}

interface EnhancedVideoPlayerProps {
  videoUrl: string;
  onError?: () => void;
}

export function EnhancedVideoPlayer({ videoUrl, onError }: EnhancedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  
  // Drawing state
  const [activeTool, setActiveTool] = useState<Drawing['type'] | null>(null);
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#F5A623');
  
  const colors = ['#F5A623', '#EF4444', '#3B82F6', '#10B981', '#FFFFFF', '#F59E0B'];

  // Initialize canvas size to match video
  useEffect(() => {
    const resizeCanvas = () => {
      if (canvasRef.current && videoRef.current) {
        const video = videoRef.current;
        canvasRef.current.width = video.videoWidth;
        canvasRef.current.height = video.videoHeight;
        redrawCanvas();
      }
    };

    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadedmetadata', resizeCanvas);
      return () => video.removeEventListener('loadedmetadata', resizeCanvas);
    }
  }, []);

  // Redraw all drawings on canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawings.forEach(drawing => {
      ctx.strokeStyle = drawing.color;
      ctx.fillStyle = drawing.color;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      if (drawing.type === 'line' && drawing.points.length === 2) {
        ctx.beginPath();
        ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
        ctx.lineTo(drawing.points[1].x, drawing.points[1].y);
        ctx.stroke();
      } else if (drawing.type === 'circle' && drawing.points.length === 2) {
        const radius = Math.sqrt(
          Math.pow(drawing.points[1].x - drawing.points[0].x, 2) +
          Math.pow(drawing.points[1].y - drawing.points[0].y, 2)
        );
        ctx.beginPath();
        ctx.arc(drawing.points[0].x, drawing.points[0].y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (drawing.type === 'angle' && drawing.points.length === 3) {
        // Draw angle between 3 points
        ctx.beginPath();
        ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
        ctx.lineTo(drawing.points[1].x, drawing.points[1].y);
        ctx.lineTo(drawing.points[2].x, drawing.points[2].y);
        ctx.stroke();
        
        // Calculate and display angle
        const angle = calculateAngle(drawing.points[0], drawing.points[1], drawing.points[2]);
        ctx.font = '16px Arial';
        ctx.fillText(`${angle.toFixed(1)}°`, drawing.points[1].x + 10, drawing.points[1].y - 10);
      } else if (drawing.type === 'freehand' && drawing.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(drawing.points[0].x, drawing.points[0].y);
        drawing.points.forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      } else if (drawing.type === 'text' && drawing.points.length === 1 && drawing.label) {
        ctx.font = '20px Arial';
        ctx.fillText(drawing.label, drawing.points[0].x, drawing.points[0].y);
      }
    });
    
    // Draw current drawing in progress
    if (currentDrawing.length > 0 && activeTool) {
      ctx.strokeStyle = selectedColor;
      ctx.fillStyle = selectedColor;
      ctx.lineWidth = 3;
      
      if (activeTool === 'line' && currentDrawing.length === 2) {
        ctx.beginPath();
        ctx.moveTo(currentDrawing[0].x, currentDrawing[0].y);
        ctx.lineTo(currentDrawing[1].x, currentDrawing[1].y);
        ctx.stroke();
      } else if (activeTool === 'circle' && currentDrawing.length === 2) {
        const radius = Math.sqrt(
          Math.pow(currentDrawing[1].x - currentDrawing[0].x, 2) +
          Math.pow(currentDrawing[1].y - currentDrawing[0].y, 2)
        );
        ctx.beginPath();
        ctx.arc(currentDrawing[0].x, currentDrawing[0].y, radius, 0, 2 * Math.PI);
        ctx.stroke();
      } else if (activeTool === 'angle') {
        ctx.beginPath();
        ctx.moveTo(currentDrawing[0].x, currentDrawing[0].y);
        currentDrawing.slice(1).forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      } else if (activeTool === 'freehand' && currentDrawing.length > 1) {
        ctx.beginPath();
        ctx.moveTo(currentDrawing[0].x, currentDrawing[0].y);
        currentDrawing.forEach(point => {
          ctx.lineTo(point.x, point.y);
        });
        ctx.stroke();
      }
    }
  }, [drawings, currentDrawing, activeTool, selectedColor]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const calculateAngle = (p1: Point, vertex: Point, p2: Point): number => {
    const angle1 = Math.atan2(p1.y - vertex.y, p1.x - vertex.x);
    const angle2 = Math.atan2(p2.y - vertex.y, p2.x - vertex.x);
    let angle = Math.abs((angle1 - angle2) * (180 / Math.PI));
    if (angle > 180) angle = 360 - angle;
    return angle;
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeTool) return;
    
    const point = getCanvasCoordinates(e);
    
    if (activeTool === 'line' || activeTool === 'circle') {
      if (currentDrawing.length === 0) {
        setCurrentDrawing([point]);
      } else if (currentDrawing.length === 1) {
        const newDrawing: Drawing = {
          id: Date.now().toString(),
          type: activeTool,
          points: [...currentDrawing, point],
          color: selectedColor,
        };
        setDrawings([...drawings, newDrawing]);
        setCurrentDrawing([]);
      }
    } else if (activeTool === 'angle') {
      if (currentDrawing.length < 2) {
        setCurrentDrawing([...currentDrawing, point]);
      } else {
        const newDrawing: Drawing = {
          id: Date.now().toString(),
          type: 'angle',
          points: [...currentDrawing, point],
          color: selectedColor,
        };
        setDrawings([...drawings, newDrawing]);
        setCurrentDrawing([]);
      }
    } else if (activeTool === 'text') {
      const label = prompt('Enter label:');
      if (label) {
        const newDrawing: Drawing = {
          id: Date.now().toString(),
          type: 'text',
          points: [point],
          color: selectedColor,
          label,
        };
        setDrawings([...drawings, newDrawing]);
      }
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (activeTool === 'freehand') {
      setIsDrawing(true);
      const point = getCanvasCoordinates(e);
      setCurrentDrawing([point]);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!activeTool) return;
    
    const point = getCanvasCoordinates(e);
    
    if (activeTool === 'freehand' && isDrawing) {
      setCurrentDrawing([...currentDrawing, point]);
    } else if ((activeTool === 'line' || activeTool === 'circle') && currentDrawing.length === 1) {
      // Show preview
      redrawCanvas();
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = selectedColor;
        ctx.lineWidth = 3;
        if (activeTool === 'line') {
          ctx.beginPath();
          ctx.moveTo(currentDrawing[0].x, currentDrawing[0].y);
          ctx.lineTo(point.x, point.y);
          ctx.stroke();
        } else if (activeTool === 'circle') {
          const radius = Math.sqrt(
            Math.pow(point.x - currentDrawing[0].x, 2) +
            Math.pow(point.y - currentDrawing[0].y, 2)
          );
          ctx.beginPath();
          ctx.arc(currentDrawing[0].x, currentDrawing[0].y, radius, 0, 2 * Math.PI);
          ctx.stroke();
        }
      }
    }
  };

  const handleCanvasMouseUp = () => {
    if (activeTool === 'freehand' && isDrawing) {
      const newDrawing: Drawing = {
        id: Date.now().toString(),
        type: 'freehand',
        points: currentDrawing,
        color: selectedColor,
      };
      setDrawings([...drawings, newDrawing]);
      setCurrentDrawing([]);
      setIsDrawing(false);
    }
  };

  // Video controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const changeSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      toast.success(`Playback speed: ${speed}x`);
    }
  };

  const frameStep = (direction: 'forward' | 'backward') => {
    if (videoRef.current) {
      const frameTime = 1 / 30; // Assume 30fps
      videoRef.current.currentTime += direction === 'forward' ? frameTime : -frameTime;
      toast.info(direction === 'forward' ? 'Next frame' : 'Previous frame');
    }
  };

  const undoLastDrawing = () => {
    if (drawings.length > 0) {
      setDrawings(drawings.slice(0, -1));
      toast.success('Undo drawing');
    }
  };

  const clearAllDrawings = () => {
    setDrawings([]);
    setCurrentDrawing([]);
    toast.success('Cleared all drawings');
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div ref={containerRef} className="relative bg-black rounded-lg overflow-hidden">
      <div className="relative aspect-video">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full h-full"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onError={onError}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair"
          onClick={handleCanvasClick}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          onMouseLeave={handleCanvasMouseUp}
        />
      </div>

      {/* Drawing Toolbar */}
      <div className="absolute top-4 left-4 bg-gray-900/90 backdrop-blur-sm rounded-lg p-2 flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <Button
            variant={activeTool === 'line' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTool(activeTool === 'line' ? null : 'line')}
            className={activeTool === 'line' ? 'bg-[#F5A623] hover:bg-[#E89815]' : ''}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Button
            variant={activeTool === 'circle' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTool(activeTool === 'circle' ? null : 'circle')}
            className={activeTool === 'circle' ? 'bg-[#F5A623] hover:bg-[#E89815]' : ''}
          >
            <Circle className="w-4 h-4" />
          </Button>
          <Button
            variant={activeTool === 'angle' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTool(activeTool === 'angle' ? null : 'angle')}
            className={activeTool === 'angle' ? 'bg-[#F5A623] hover:bg-[#E89815]' : ''}
            title="Angle (3 points)"
          >
            <Slash className="w-4 h-4" />
          </Button>
          <Button
            variant={activeTool === 'freehand' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTool(activeTool === 'freehand' ? null : 'freehand')}
            className={activeTool === 'freehand' ? 'bg-[#F5A623] hover:bg-[#E89815]' : ''}
          >
            <span className="text-lg">✏️</span>
          </Button>
          <Button
            variant={activeTool === 'text' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTool(activeTool === 'text' ? null : 'text')}
            className={activeTool === 'text' ? 'bg-[#F5A623] hover:bg-[#E89815]' : ''}
          >
            <Type className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="border-t border-gray-700 pt-2 flex flex-col gap-1">
          <div className="flex gap-1">
            {colors.slice(0, 3).map(color => (
              <button
                key={color}
                className={`w-6 h-6 rounded border-2 ${
                  selectedColor === color ? 'border-white' : 'border-gray-600'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
          <div className="flex gap-1">
            {colors.slice(3).map(color => (
              <button
                key={color}
                className={`w-6 h-6 rounded border-2 ${
                  selectedColor === color ? 'border-white' : 'border-gray-600'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setSelectedColor(color)}
              />
            ))}
          </div>
        </div>
        
        <div className="border-t border-gray-700 pt-2 flex flex-col gap-1">
          <Button variant="ghost" size="sm" onClick={undoLastDrawing} disabled={drawings.length === 0}>
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={clearAllDrawings} disabled={drawings.length === 0}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur-sm p-4">
        <div className="flex items-center gap-4 mb-3">
          <Button variant="ghost" size="sm" onClick={togglePlay}>
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          
          <Button variant="ghost" size="sm" onClick={() => frameStep('backward')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          
          <Button variant="ghost" size="sm" onClick={() => frameStep('forward')}>
            <ChevronRight className="w-5 h-5" />
          </Button>
          
          <div className="text-sm text-gray-300">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          
          <div className="flex-1" />
          
          <div className="flex gap-2">
            {[0.25, 0.5, 0.75, 1, 1.5, 2].map(speed => (
              <Button
                key={speed}
                variant={playbackSpeed === speed ? 'default' : 'ghost'}
                size="sm"
                onClick={() => changeSpeed(speed)}
                className={playbackSpeed === speed ? 'bg-[#F5A623] hover:bg-[#E89815]' : ''}
              >
                {speed}x
              </Button>
            ))}
          </div>
        </div>
        
        <Slider
          value={[currentTime]}
          max={duration || 100}
          step={0.1}
          onValueChange={handleSeek}
          className="w-full"
        />
      </div>
    </div>
  );
}
