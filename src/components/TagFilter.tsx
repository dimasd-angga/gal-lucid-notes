import React from 'react';
import { Tag, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { TagPill } from './TagPill';
import { useTags } from '../contexts/TagsContext';

interface TagFilterProps {
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
  onClearAll: () => void;
}

export const TagFilter: React.FC<TagFilterProps> = ({
  selectedTags,
  onTagToggle,
  onClearAll
}) => {
  const { tags } = useTags();
  const [isExpanded, setIsExpanded] = React.useState(false);

  // Sort tags by count (most used first)
  const sortedTags = [...tags].sort((a, b) => b.count - a.count);

  return (
    <div className="border-t border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
      >
        <div className="flex items-center">
          <Filter size={14} className="text-gray-500 dark:text-gray-400 mr-2" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Filter by Tags
          </h3>
          {selectedTags.length > 0 && (
            <span className="ml-2 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full">
              {selectedTags.length}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp size={16} className="text-gray-400" />
        ) : (
          <ChevronDown size={16} className="text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="px-3 pb-3">
          {selectedTags.length > 0 && (
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {selectedTags.length} filter{selectedTags.length > 1 ? 's' : ''} active
              </span>
              <button
                onClick={onClearAll}
                className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
              >
                Clear all
              </button>
            </div>
          )}
          
          {sortedTags.length > 0 ? (
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {sortedTags.map((tag) => {
                const isSelected = selectedTags.includes(tag.name);
                return (
                  <button
                    key={tag.id}
                    onClick={() => onTagToggle(tag.name)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-all duration-200 ${
                      isSelected
                        ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center min-w-0 flex-1">
                      <div
                        className="w-2.5 h-2.5 rounded-full mr-2 flex-shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className={`truncate text-xs ${
                        isSelected 
                          ? 'text-primary-700 dark:text-primary-300 font-medium' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {tag.name}
                      </span>
                    </div>
                    <span className={`text-xs ml-2 px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}>
                      {tag.count}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-4">
              <Tag size={20} className="text-gray-400 dark:text-gray-500 mx-auto mb-2" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                No tags yet
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};