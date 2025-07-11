import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface SummarizeButtonProps {
  content: string;
  onSummarize: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const SummarizeButton: React.FC<SummarizeButtonProps> = ({
  content,
  onSummarize,
  isLoading,
  disabled = false
}) => {
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const isContentTooShort = wordCount < 25; // Minimum words for summarization
  const isDisabled = disabled || isContentTooShort || isLoading;

  const getTooltipText = () => {
    if (isContentTooShort) {
      return `Need at least 25 words to summarize (currently ${wordCount} words)`;
    }
    if (isLoading) {
      return 'Generating summary...';
    }
    return 'Summarize this note using AI';
  };

  return (
    <button
      onClick={onSummarize}
      disabled={isDisabled}
      title={getTooltipText()}
      className={`
        flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95
        ${isDisabled
          ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
          : 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30'
        }
      `}
    >
      {isLoading ? (
        <Loader2 size={16} className="mr-2 animate-spin" />
      ) : (
        <Sparkles size={16} className="mr-2" />
      )}
      {isLoading ? 'Summarizing...' : 'Summarize'}
    </button>
  );
};