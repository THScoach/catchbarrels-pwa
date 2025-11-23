'use client';

import dynamic from 'next/dynamic';
import { BottomNav } from '@/components/bottom-nav';
import { format } from 'date-fns';

const LineChart = dynamic(
  () => import('recharts').then((mod) => mod.LineChart),
  { ssr: false }
);
const Line = dynamic(
  () => import('recharts').then((mod) => mod.Line),
  { ssr: false }
);
const XAxis = dynamic(
  () => import('recharts').then((mod) => mod.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import('recharts').then((mod) => mod.YAxis),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => mod.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip),
  { ssr: false }
);
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
const Legend = dynamic(
  () => import('recharts').then((mod) => mod.Legend),
  { ssr: false }
);

export function ProgressClient({ progress }: any) {
  const chartData = progress?.map((entry: any) => ({
    date: format(new Date(entry?.date), 'MMM d'),
    Balance: entry?.avgBalance,
    Anchor: entry?.avgAnchor,
    Rotation: entry?.avgRotation,
    'Rear Elbow': entry?.avgRearElbow,
    Launch: entry?.avgLaunch,
    Sequence: entry?.avgSequence,
  }));

  return (
    <div className="min-h-screen bg-[#1a2332] pb-20">
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Progress Tracking</h1>

        {chartData?.length > 0 ? (
          <div className="space-y-6">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <h2 className="text-white font-semibold mb-4">BARRELS Score Trends</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <XAxis
                      dataKey="date"
                      stroke="#9ca3af"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis
                      stroke="#9ca3af"
                      style={{ fontSize: '12px' }}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line
                      type="monotone"
                      dataKey="Balance"
                      stroke="#60B5FF"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Anchor"
                      stroke="#FF9149"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Rotation"
                      stroke="#FF9898"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Rear Elbow"
                      stroke="#FF90BB"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Launch"
                      stroke="#80D8C3"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Sequence"
                      stroke="#A19AD3"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Balance', value: chartData[chartData.length - 1]?.Balance, color: '#60B5FF' },
                { label: 'Anchor', value: chartData[chartData.length - 1]?.Anchor, color: '#FF9149' },
                { label: 'Rotation', value: chartData[chartData.length - 1]?.Rotation, color: '#FF9898' },
                { label: 'Rear Elbow', value: chartData[chartData.length - 1]?.['Rear Elbow'], color: '#FF90BB' },
                { label: 'Launch', value: chartData[chartData.length - 1]?.Launch, color: '#80D8C3' },
                { label: 'Sequence', value: chartData[chartData.length - 1]?.Sequence, color: '#A19AD3' },
              ].map((stat) => (
                <div key={stat?.label} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: stat?.color }}
                    />
                    <span className="text-gray-400 text-sm">{stat?.label}</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{stat?.value}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-12 text-center">
            <p className="text-gray-400 mb-4">No progress data yet</p>
            <p className="text-gray-500 text-sm">
              Upload more swings to see your progress over time
            </p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
