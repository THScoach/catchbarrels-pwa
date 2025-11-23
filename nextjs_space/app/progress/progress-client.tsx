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
    'Anchor (Lower Body)': entry?.avgAnchor,
    'Engine (Trunk/Core)': entry?.avgEngine,
    'Whip (Arms & Bat)': entry?.avgWhip,
    'Overall': entry?.avgOverall,
  }));

  return (
    <div className="min-h-screen bg-[#1a2332] pb-20">
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">Progress Tracking</h1>

        {chartData?.length > 0 ? (
          <div className="space-y-6">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
              <h2 className="text-white font-semibold mb-4">Body Metrics Score Trends</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
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
                      dataKey="Anchor (Lower Body)"
                      stroke="#2196F3"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#2196F3' }}
                      activeDot={{ r: 7 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Engine (Trunk/Core)"
                      stroke="#4CAF50"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#4CAF50' }}
                      activeDot={{ r: 7 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Whip (Arms & Bat)"
                      stroke="#9C27B0"
                      strokeWidth={3}
                      dot={{ r: 5, fill: '#9C27B0' }}
                      activeDot={{ r: 7 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Overall"
                      stroke="#FF9800"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      dot={{ r: 5, fill: '#FF9800' }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Anchor', subtitle: 'Lower Body', value: chartData[chartData.length - 1]?.['Anchor (Lower Body)'], color: '#2196F3', icon: '⚓' },
                { label: 'Engine', subtitle: 'Trunk/Core', value: chartData[chartData.length - 1]?.['Engine (Trunk/Core)'], color: '#4CAF50', icon: '🔄' },
                { label: 'Whip', subtitle: 'Arms & Bat', value: chartData[chartData.length - 1]?.['Whip (Arms & Bat)'], color: '#9C27B0', icon: '⚡' },
                { label: 'Overall', subtitle: 'Average', value: chartData[chartData.length - 1]?.['Overall'], color: '#FF9800', icon: '📊' },
              ].map((stat) => (
                <div key={stat?.label} className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stat?.color }}
                      />
                      <div>
                        <span className="text-white text-sm font-semibold">{stat?.label}</span>
                        <p className="text-gray-500 text-xs">{stat?.subtitle}</p>
                      </div>
                    </div>
                    <span className="text-xl">{stat?.icon}</span>
                  </div>
                  <div className="text-3xl font-bold text-white">{stat?.value}</div>
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
