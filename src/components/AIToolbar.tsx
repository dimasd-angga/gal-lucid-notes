import React from 'react';
import { Sparkles, FileText, Expand, HelpCircle, Loader2 } from 'lucide-react';

interface AIToolbarProps {
  onGenerateTitle: () => void;
  onSummarize: () => void;
  onExpandContent: () => void;
  onWritingHelp: () => void;
  isGeneratingTitle: boolean;
  isSummarizing: boolean;
  isExpanding: boolean;
  canGenerateTitle: boolean;
  canSummarize: boolean;
  canExpandContent: boolean;
  className?: string;
}

export const AIToolbar: React.FC<AIToolbarProps> = ({
  onGenerateTitle,
  onSummarize,
  onExpandContent,
  onWritingHelp,
  isGeneratingTitle,
  isSummarizing,
  isExpanding,
  canGenerateTitle,
  canSummarize,
  canExpandContent,
  className = ""
}) => {
  const AIButton: React.FC<{
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
    tooltip: string;
    isLoading: boolean;
    disabled: boolean;
    color: string;
  }> = ({ onClick, icon, label, tooltip, isLoading, disabled, color }) => (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      title={tooltip}
      className={`
        flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95
        ${disabled 
          ? 'text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
          : `text-${color}-600 dark:text-${color}-400 hover:text-${color}-700 dark:hover:text-${color}-300 hover:bg-${color}-50 dark:hover:bg-${color}-900/30`
        }
      `}
    >
      {isLoading ? (
        <Loader2 size={16} className="mr-2 animate-spin" />
      ) : (
        <span className="mr-2">{icon}</span>
      )}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className={`flex items-center space-x-2 p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-b border-purple-200/50 dark:border-purple-700/50 ${className}`}>
      <div className="flex items-center mr-3">
        <Sparkles size={18} className="text-purple-600 dark:text-purple-400 mr-2" />
        <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">AI Tools</span>
      </div>
      
      <div className="flex items-center space-x-1">
        <AIButton
          onClick={onGenerateTitle}
          icon={<Sparkles size={16} />}
          label="Auto-Title"
          tooltip={canGenerateTitle ? "Generate title from content" : "Need at least 50 characters to generate title"}
          isLoading={isGeneratingTitle}
          disabled={!canGenerateTitle}
          color="purple"
        />
        
        <AIButton
          onClick={onSummarize}
          icon={<FileText size={16} />}
          label="Summarize"
          tooltip={canSummarize ? "Summarize this note" : "Need at least 25 words to summarize"}
          isLoading={isSummarizing}
          disabled={!canSummarize}
          color="blue"
        />
        
        <AIButton
          onClick={onExpandContent}
          icon={<Expand size={16} />}
          label="Expand"
          tooltip={canExpandContent ? "Expand and improve content" : "Need at least 20 characters to expand"}
          isLoading={isExpanding}
          disabled={!canExpandContent}
          color="green"
        />
        
        <AIButton
          onClick={onWritingHelp}
          icon={<HelpCircle size={16} />}
          label="Help"
          tooltip="Get AI writing assistance"
          isLoading={false}
          disabled={false}
          color="orange"
        />
      </div>
    </div>
  );
};