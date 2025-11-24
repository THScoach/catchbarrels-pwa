'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, TrendingUp, Activity, Zap, Award, Target } from 'lucide-react';

interface AssessmentReport {
  id: string;
  overallScore: number | null;
  summary: string | null;
  strengths: any; // JsonValue from Prisma
  weaknesses: any; // JsonValue from Prisma
  metrics: any | null; // Simplified to avoid type mismatches
}

interface AssessmentSession {
  id: string;
  sessionName: string;
  location: string | null;
  assessorName: string | null;
  status: string;
  totalSwings: number;
  successfulSwings: number;
  createdAt: Date;
}

interface Props {
  session: AssessmentSession;
  report: AssessmentReport;
}

export default function ReportClient({ session, report }: Props) {
  const router = useRouter();
  const metrics = report.metrics;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-blue-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreGrade = (score: number) => {
    if (score >= 90) return 'Elite';
    if (score >= 80) return 'Advanced';
    if (score >= 70) return 'Proficient';
    if (score >= 60) return 'Developing';
    return 'Needs Work';
  };

  const MetricCard = ({ title, value, unit, description }: { title: string; value: number | null; unit?: string; description?: string }) => (
    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
      <div className="text-sm text-gray-400 mb-1">{title}</div>
      <div className="text-2xl font-bold text-white">
        {value !== null ? `${value.toFixed(1)}${unit || ''}` : 'N/A'}
      </div>
      {description && <div className="text-xs text-gray-500 mt-1">{description}</div>}
    </div>
  );

  const ScoreCard = ({ title, score, icon: Icon }: { title: string; score: number | null; icon: any }) => (
    <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <Icon className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="text-sm text-gray-400">{score !== null ? getScoreGrade(score) : 'N/A'}</p>
            </div>
          </div>
          <div className={`text-4xl font-bold ${score !== null ? getScoreColor(score) : 'text-gray-500'}`}>
            {score !== null ? score.toFixed(0) : '--'}
          </div>
        </div>
        {score !== null && (
          <Progress value={score} className="h-2" />
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto pt-8 pb-24">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push(`/assessments/${session.id}`)}
            className="mb-4 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Session
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Assessment Report</h1>
              <div className="flex flex-wrap gap-3 text-sm text-gray-400">
                <span>{session.sessionName}</span>
                <span>•</span>
                <span>{session.location}</span>
                <span>•</span>
                <span>{session.successfulSwings} swings analyzed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <Card className="mb-8 bg-gradient-to-r from-orange-900/30 to-orange-800/30 border-orange-700/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Overall Score</h2>
                <p className="text-orange-200/80 text-lg">
                  {report.overallScore !== null ? getScoreGrade(report.overallScore) : 'N/A'}
                </p>
              </div>
              <div className="text-center">
                <div className={`text-6xl font-bold ${report.overallScore !== null ? getScoreColor(report.overallScore) : 'text-gray-500'}`}>
                  {report.overallScore !== null ? report.overallScore.toFixed(0) : '--'}
                </div>
                <div className="text-sm text-orange-200/60 mt-1">/ 100</div>
              </div>
            </div>
            {report.overallScore !== null && (
              <div className="mt-6">
                <Progress value={report.overallScore} className="h-3" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Anchor/Engine/Whip Scores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <ScoreCard title="Anchor" score={metrics?.anchorScore ?? null} icon={Target} />
          <ScoreCard title="Engine" score={metrics?.engineScore ?? null} icon={Zap} />
          <ScoreCard title="Whip" score={metrics?.whipScore ?? null} icon={Activity} />
        </div>

        {/* Summary */}
        <Card className="mb-8 bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 leading-relaxed">
              {report.summary || 'No summary available'}
            </p>
          </CardContent>
        </Card>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-green-900/20 border-green-800/50">
            <CardHeader>
              <CardTitle className="text-green-400 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {Array.isArray(report.strengths) && report.strengths.length > 0 ? (
                  report.strengths.map((strength: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-green-200">
                      <span className="text-green-500 mt-1">•</span>
                      <span>{strength}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-green-200/60">No strengths identified yet</li>
                )}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-orange-900/20 border-orange-800/50">
            <CardHeader>
              <CardTitle className="text-orange-400 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {Array.isArray(report.weaknesses) && report.weaknesses.length > 0 ? (
                  report.weaknesses.map((weakness: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-orange-200">
                      <span className="text-orange-500 mt-1">•</span>
                      <span>{weakness}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-orange-200/60">No areas for improvement identified yet</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics */}
        <Tabs defaultValue="motion" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="motion" className="data-[state=active]:bg-orange-500/20">
              Motion
            </TabsTrigger>
            <TabsTrigger value="stability" className="data-[state=active]:bg-orange-500/20">
              Stability
            </TabsTrigger>
            <TabsTrigger value="sequencing" className="data-[state=active]:bg-orange-500/20">
              Sequencing
            </TabsTrigger>
          </TabsList>

          {/* Motion Metrics Tab */}
          <TabsContent value="motion" className="mt-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Motion Metrics</CardTitle>
                <CardDescription className="text-gray-400">
                  Velocities and angular accelerations of body segments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <MetricCard title="Avg Bat Speed" value={metrics?.avgBatSpeed ?? null} unit=" mph" />
                  <MetricCard title="Max Bat Speed" value={metrics?.maxBatSpeed ?? null} unit=" mph" />
                  <MetricCard title="Avg Hand Speed" value={metrics?.avgHandSpeed ?? null} unit=" mph" />
                  <MetricCard title="Max Hand Speed" value={metrics?.maxHandSpeed ?? null} unit=" mph" />
                  <MetricCard title="Avg Pelvis Ang Vel" value={metrics?.avgPelvisAngVel ?? null} unit="°/s" />
                  <MetricCard title="Max Pelvis Ang Vel" value={metrics?.maxPelvisAngVel ?? null} unit="°/s" />
                  <MetricCard title="Avg Torso Ang Vel" value={metrics?.avgTorsoAngVel ?? null} unit="°/s" />
                  <MetricCard title="Max Torso Ang Vel" value={metrics?.maxTorsoAngVel ?? null} unit="°/s" />
                  <MetricCard title="Avg Arm Ang Vel" value={metrics?.avgArmAngVel ?? null} unit="°/s" />
                  <MetricCard title="Max Arm Ang Vel" value={metrics?.maxArmAngVel ?? null} unit="°/s" />
                  <MetricCard title="Avg Bat Ang Vel" value={metrics?.avgBatAngVel ?? null} unit="°/s" />
                  <MetricCard title="Max Bat Ang Vel" value={metrics?.maxBatAngVel ?? null} unit="°/s" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stability Metrics Tab */}
          <TabsContent value="stability" className="mt-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Stability Metrics</CardTitle>
                <CardDescription className="text-gray-400">
                  Joint angles, posture consistency, and head movement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <MetricCard title="Avg Hip-Shoulder Sep" value={metrics?.avgHipShoulderSep ?? null} unit="°" />
                  <MetricCard title="Avg Front Knee Angle" value={metrics?.avgFrontKneeAngle ?? null} unit="°" />
                  <MetricCard title="Avg Lead Elbow Angle" value={metrics?.avgLeadElbowAngle ?? null} unit="°" />
                  <MetricCard title="Avg Rear Elbow Angle" value={metrics?.avgRearElbowAngle ?? null} unit="°" />
                  <MetricCard title="Avg Head Disp X" value={metrics?.avgHeadDisplacementX ?? null} unit=" px" />
                  <MetricCard title="Avg Head Disp Y" value={metrics?.avgHeadDisplacementY ?? null} unit=" px" />
                  <MetricCard title="Motion Stability Score" value={metrics?.motionStabilityScore ?? null} unit="/100" />
                  <MetricCard title="Joint Angle Consistency" value={metrics?.jointAngleConsistency ?? null} unit="/100" />
                  <MetricCard title="Head Stability Score" value={metrics?.headStabilityScore ?? null} unit="/100" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sequencing Metrics Tab */}
          <TabsContent value="sequencing" className="mt-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Sequencing Metrics</CardTitle>
                <CardDescription className="text-gray-400">
                  Kinematic chain timing and proximal-to-distal efficiency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <MetricCard title="Avg Sequence Score" value={metrics?.avgSequenceScore ?? null} unit="/100" />
                  <MetricCard title="Sequence Order Correct" value={metrics?.sequenceOrderCorrect ?? null} unit="%" />
                  <MetricCard title="Avg Pelvis-Torso Gap" value={metrics?.avgPelvisToTorsoGap ?? null} unit=" ms" description="Target: 30-50ms" />
                  <MetricCard title="Avg Torso-Arm Gap" value={metrics?.avgTorsoToArmGap ?? null} unit=" ms" description="Target: 30-50ms" />
                  <MetricCard title="Avg Arm-Bat Gap" value={metrics?.avgArmToBatGap ?? null} unit=" ms" description="Target: 30-50ms" />
                  <MetricCard title="Avg Gap Variability" value={metrics?.avgGapVariability ?? null} unit=" ms" description="Lower is better" />
                  <MetricCard title="Sequencing Consistency" value={metrics?.sequencingConsistency ?? null} unit="/100" />
                  <MetricCard title="Overall Sequencing Score" value={metrics?.sequencingScore ?? null} unit="/100" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
