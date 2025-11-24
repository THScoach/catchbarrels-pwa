// Video Source Types
export type VideoSource = 'pwa-camera' | 'onform' | 'hudl' | 'upload' | 'other';
export type CameraAngle = 'side' | 'face-on' | 'overhead';
export type ThreeDSource = 'onform' | null;

// Video Types
export const VIDEO_TYPES = [
  'Tee Work',
  'Front Toss',
  'Live BP',
  'Game Swings',
  'Cage Work',
  'Other'
] as const;

export type VideoType = typeof VIDEO_TYPES[number];

// Video Interface (matches Prisma schema)
export interface Video {
  id: string;
  userId: string;
  title: string;
  videoType?: string;
  source: string;
  originalUrl?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  
  // Video Processing
  impactFrame?: number;
  trimmedPath?: string;
  fps?: number;
  normalizedFps: number;
  
  // Skeleton Data
  skeletonData?: any;
  skeletonExtracted: boolean;
  
  // Analysis
  analyzed: boolean;
  anchor?: number;
  engine?: number;
  whip?: number;
  overallScore?: number;
  tier?: string;
  
  // Subcategories
  anchorStance?: number;
  anchorWeightShift?: number;
  anchorGroundConnection?: number;
  anchorLowerBodyMechanics?: number;
  engineHipRotation?: number;
  engineSeparation?: number;
  engineCorePower?: number;
  engineTorsoMechanics?: number;
  whipArmPath?: number;
  whipBatSpeed?: number;
  whipBatPath?: number;
  whipConnection?: number;
  
  exitVelocity?: number;
  coachFeedback?: string;
  
  // Community
  isPublic: boolean;
  shareableLink?: string;
  views: number;
  sharedAt?: Date;
  
  // OnForm Integration
  threeDSource?: string;
  threeDData?: any;
  cameraAngle?: string;
  
  uploadDate: Date;
}

// OnForm Import Props
export interface OnFormImportPanelProps {
  athleteId?: string;
  sessionId?: string;
  onImported?: (result: { 
    videoId: string; 
    athleteId: string; 
    sessionId?: string;
    video?: Video;
  }) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// OnForm Import Result
export interface OnFormImportResult {
  success: boolean;
  videoId?: string;
  video?: Video;
  error?: string;
  metadata?: {
    source: VideoSource;
    originalUrl?: string;
    onformVideoId?: string;
  };
}

// Athlete Interface (for future use)
export interface Athlete {
  id: string;
  name: string;
  email?: string;
  dateOfBirth?: Date;
  height?: number; // inches
  weight?: number; // lbs
  bats?: string;
  throws?: string;
  position?: string;
  level?: string;
  profileComplete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Session Interface (for future use)
export interface Session {
  id: string;
  athleteId: string;
  title: string;
  description?: string;
  sessionDate: Date;
  sessionType?: string; // 'practice' | 'game' | 'assessment' | 'other'
  location?: string;
  videos?: Video[];
  createdAt: Date;
  updatedAt: Date;
}

export type DateRange = {
  from: Date | undefined
  to: Date | undefined
}