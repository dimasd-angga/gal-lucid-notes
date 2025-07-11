import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface NotesTimelineChartProps {
  data: Array<{ date: string; count: number }>;
}

export const NotesTimelineChart: React.FC<NotesTimelineChartProps> = ({ data }) => {
  const chartData = React.useMemo(() => {
    return data.map(item => ({
      ...item,
      formatted: new Date(item.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm p-3 rounded-lg shadow-glow border border-gray-200 dark:border-gray-600">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            {payload[0].value} note{payload[0].value !== 1 ? 's' : ''} created
          </p>
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">📈</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400">No timeline data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
          <XAxis 
            dataKey="formatted" 
            stroke="#9ca3af"
            fontSize={12}
            interval="preserveStart"
          />
          <YAxis stroke="#9ca3af" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="#3b82f6" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2, fill: '#ffffff' }}
            filter="drop-shadow(0 2px 4px rgba(59, 130, 246, 0.2))"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};