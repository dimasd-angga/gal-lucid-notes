import React from 'react';
import { X, Copy, FileText, Sparkles, Check } from 'lucide-react';

interface SummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalContent: string;
  summary: string;
  onReplace: () => void;
  onAppend: () => void;
  isLoading?: boolean;
  error?: string | null;
}

export const SummaryModal: React.FC<SummaryModalProps> = ({
  isOpen,
  onClose,
  originalContent,
  summary,
  onReplace,
  onAppend,
  isLoading = false,
  error = null
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy summary:', error);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={handleBackdropClick}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-glow dark:shadow-glow-dark max-w-6xl w-full max-h-[90vh] overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-3">
              <Sparkles size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              AI Summary
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isLoading ? (
            <div className="space-y-4">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              </div>
              <div className="text-center text-gray-500 dark:text-gray-400">
                <Sparkles size={24} className="mx-auto mb-2 animate-pulse" />
                Generating summary...
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                <X size={24} className="text-red-600 dark:text-red-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Failed to Generate Summary
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {error}
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Original Content */}
              <div>
                <div className="flex items-center mb-3">
                  <FileText size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">Original Content</h4>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {originalContent.trim().split(/\s+/).length} words
                  </span>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  {/* Render HTML content */}
                  <div 
                    className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: originalContent }}
                  />
                </div>
              </div>

              {/* Summary */}
              <div>
                <div className="flex items-center mb-3">
                  <Sparkles size={16} className="text-purple-500 dark:text-purple-400 mr-2" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">AI Summary</h4>
                  <span className="ml-2 text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
                    {summary.trim().split(/\s+/).length} words
                  </span>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 max-h-64 overflow-y-auto border border-purple-200 dark:border-purple-800">
                  {/* Render HTML content */}
                  <div 
                    className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: summary }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {!isLoading && !error && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <button
              onClick={handleCopy}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
            >
              {copied ? (
                <>
                  <Check size={16} className="mr-2 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy size={16} className="mr-2" />
                  Copy Summary
                </>
              )}
            </button>

            <div className="flex items-center space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={onAppend}
                className="px-4 py-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors duration-200"
              >
                Append to Note
              </button>
              <button
                onClick={onReplace}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200"
              >
                Replace Content
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};