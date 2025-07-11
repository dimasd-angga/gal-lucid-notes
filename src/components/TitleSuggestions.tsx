import React from 'react';
import { Check, RefreshCw, X } from 'lucide-react';

interface TitleSuggestionsProps {
  suggestions: string[];
  onSelect: (title: string) => void;
  onRegenerate: () => void;
  onDismiss: () => void;
  isLoading: boolean;
}

export const TitleSuggestions: React.FC<TitleSuggestionsProps> = ({
  suggestions,
  onSelect,
  onRegenerate,
  onDismiss,
  isLoading
}) => {
  if (suggestions.length === 0 && !isLoading) return null;

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-glow dark:shadow-glow-dark max-h-64 overflow-y-auto">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            AI Title Suggestions
          </h4>
          <div className="flex items-center space-x-1">
            <button
              onClick={onRegenerate}
              disabled={isLoading}
              className="p-1.5 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors duration-200"
              title="Generate more suggestions"
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onDismiss}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              title="Close suggestions"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-2">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => onSelect(suggestion)}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors duration-200 group"
              >
                <span className="text-sm text-gray-900 dark:text-white font-medium flex-1 mr-2">
                  {suggestion}
                </span>
                <Check size={14} className="text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </button>
            ))}
          </div>
        )}
      </div>

      {!isLoading && suggestions.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Click a suggestion to use it, or generate more options
          </p>
        </div>
      )}
    </div>
  );
};