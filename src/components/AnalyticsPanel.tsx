import React from 'react';
import { X, FileText, Tag, Sparkles, TrendingUp } from 'lucide-react';
import { NotesTimelineChart } from './NotesTimelineChart';
import { TagPieChart } from './TagPieChart';
import { AIUsageChart } from './AIUsageChart';
import { analyticsApi, AnalyticsData } from '../lib/supabase';

interface AnalyticsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ isOpen, onClose }) => {
  const [analyticsData, setAnalyticsData] = React.useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Load analytics data when panel opens
  React.useEffect(() => {
    if (isOpen && !analyticsData) {
      loadAnalyticsData();
    }
  }, [isOpen]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await analyticsApi.getAnalyticsData();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setAnalyticsData(null);
    loadAnalyticsData();
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${
      isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Panel */}
      <div className={`absolute right-0 top-0 h-full w-full max-w-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-xl border-l border-gray-200/50 dark:border-gray-700/50 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3 shadow-glow">
              <TrendingUp size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Real-time insights from your notes</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto h-full pb-20 bg-gradient-to-br from-gray-50/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-950/50">
          {isLoading ? (
            <div className="space-y-6">
              {/* Loading Skeleton */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white/80 dark:bg-gray-700/50 rounded-xl p-4 animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white/80 dark:bg-gray-700/50 rounded-xl p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-1/3 mb-4"></div>
                    <div className="h-64 bg-gray-200 dark:bg-gray-600 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <X size={24} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Failed to Load Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          ) : analyticsData ? (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800 shadow-soft hover:shadow-glow transition-all duration-200">
                  <div className="flex items-center">
                    <FileText size={20} className="text-blue-600 dark:text-blue-400 mr-2" />
                    <div>
                      <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{analyticsData.totalNotes}</p>
                      <p className="text-sm text-blue-600 dark:text-blue-400">Total Notes</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800 shadow-soft hover:shadow-glow transition-all duration-200">
                  <div className="flex items-center">
                    <TrendingUp size={20} className="text-green-600 dark:text-green-400 mr-2" />
                    <div>
                      <p className="text-2xl font-bold text-green-900 dark:text-green-100">{analyticsData.notesThisWeek}</p>
                      <p className="text-sm text-green-600 dark:text-green-400">This Week</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800 shadow-soft hover:shadow-glow transition-all duration-200">
                  <div className="flex items-center">
                    <Tag size={20} className="text-purple-600 dark:text-purple-400 mr-2" />
                    <div>
                      <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{analyticsData.totalTags}</p>
                      <p className="text-sm text-purple-600 dark:text-purple-400">Tags</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800 shadow-soft hover:shadow-glow transition-all duration-200">
                  <div className="flex items-center">
                    <Sparkles size={20} className="text-orange-600 dark:text-orange-400 mr-2" />
                    <div>
                      <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{analyticsData.aiUsage.total}</p>
                      <p className="text-sm text-orange-600 dark:text-orange-400">AI Uses</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="space-y-8">
                {/* Notes Timeline */}
                <div className="bg-white/80 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200/50 dark:border-gray-600/50 shadow-soft">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes Creation Timeline</h3>
                  <NotesTimelineChart data={analyticsData.notesTimeline} />
                </div>

                {/* Tag Distribution */}
                <div className="bg-white/80 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200/50 dark:border-gray-600/50 shadow-soft">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tag Usage Distribution</h3>
                  <TagPieChart data={analyticsData.tagDistribution} />
                </div>

                {/* AI Usage */}
                <div className="bg-white/80 dark:bg-gray-700/50 rounded-xl p-6 border border-gray-200/50 dark:border-gray-600/50 shadow-soft">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">AI Features Usage</h3>
                  <AIUsageChart usageData={analyticsData.aiUsage} />
                </div>

                {/* Insights */}
                <div className="bg-gradient-to-br from-gray-50/80 to-gray-100/80 dark:from-gray-700/50 dark:to-gray-600/50 rounded-xl p-6 border border-gray-200/50 dark:border-gray-600/50 shadow-soft">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Insights</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span>Average {analyticsData.avgWordsPerNote} words per note</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span>{analyticsData.favoriteNotes} notes marked as favorites</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                      <span>Most used tags: {analyticsData.topTags.slice(0, 3).join(', ')}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                      <span>AI features saved approximately {Math.round(analyticsData.aiUsage.total * 2.5)} minutes</span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};