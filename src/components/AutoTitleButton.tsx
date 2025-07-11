import React from 'react';
import { Sparkles, Loader2, RefreshCw } from 'lucide-react';

interface AutoTitleButtonProps {
  onGenerate: () => void;
  isLoading: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export const AutoTitleButton: React.FC<AutoTitleButtonProps> = ({
  onGenerate,
  isLoading,
  disabled = false,
  variant = 'secondary'
}) => {
  const isPrimary = variant === 'primary';
  
  return (
    <button
      onClick={onGenerate}
      disabled={disabled || isLoading}
      title={isLoading ? 'Generating title...' : 'Generate title with AI'}
      className={`
        flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95
        ${disabled || isLoading
          ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
          : isPrimary
            ? 'text-white bg-purple-600 hover:bg-purple-700 shadow-sm hover:shadow-md'
            : 'text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/30'
        }
      `}
    >
      {isLoading ? (
        <Loader2 size={16} className="mr-2 animate-spin" />
      ) : (
        <Sparkles size={16} className="mr-2" />
      )}
      {isLoading ? 'Generating...' : 'Auto-Title'}
    </button>
  );
};