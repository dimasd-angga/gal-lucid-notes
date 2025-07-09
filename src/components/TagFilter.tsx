import React from 'react';
import { Tag, Filter } from 'lucide-react';
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

  // Sort tags by count (most used first)
  const sortedTags = [...tags].sort((a, b) => b.count - a.count);

  return (
    <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Filter size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Filter by Tags
          </h3>
        </div>
        {selectedTags.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
          >
            Clear all
          </button>
        )}
      </div>

      {sortedTags.length > 0 ? (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {sortedTags.map((tag) => {
            const isSelected = selectedTags.includes(tag.name);
            return (
              <button
                key={tag.id}
                onClick={() => onTagToggle(tag.name)}
                className={`w-full flex items-center justify-between p-2 rounded-lg text-sm transition-all duration-200 transform hover:scale-[1.02] ${
                  isSelected
                    ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent'
                }`}
              >
                <div className="flex items-center min-w-0 flex-1">
                  <div
                    className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className={`truncate ${
                    isSelected 
                      ? 'text-primary-700 dark:text-primary-300 font-medium' 
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {tag.name}
                  </span>
                </div>
                <span className={`text-xs ml-2 px-2 py-1 rounded-full ${
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
          <Tag size={24} className="text-gray-400 dark:text-gray-500 mx-auto mb-2" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No tags yet
          </p>
        </div>
      )}
    </div>
  );
};