import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AIUsageChartProps {
  usageData: {
    autoTitle: number;
    summarize: number;
    expand: number;
    help: number;
  };
}

export const AIUsageChart: React.FC<AIUsageChartProps> = ({ usageData }) => {
  const chartData = [
    { feature: 'Auto-Title', count: usageData.autoTitle, color: '#8b5cf6' },
    { feature: 'Summarize', count: usageData.summarize, color: '#3b82f6' },
    { feature: 'Expand', count: usageData.expand, color: '#10b981' },
    { feature: 'Help', count: usageData.help, color: '#f59e0b' }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Used {payload[0].value} time{payload[0].value !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="feature" 
            stroke="#6b7280"
            fontSize={12}
          />
          <YAxis stroke="#6b7280" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="count" 
            fill="#10b981"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};