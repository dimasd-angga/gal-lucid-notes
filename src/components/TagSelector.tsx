import React, { useState, useRef, useEffect } from 'react';
import { Hash, Plus } from 'lucide-react';
import { TagPill } from './TagPill';
import { useTags } from '../contexts/TagsContext';

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  required?: boolean;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  selectedTags,
  onTagsChange,
  placeholder = "Add tags...",
  required = false
}) => {
  const { tags, createTag, getTagColor } = useTags();
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter available tags based on input and exclude already selected
  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(inputValue.toLowerCase()) &&
    !selectedTags.includes(tag.name)
  );

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsOpen(value.length > 0 || filteredTags.length > 0);
    setFocusedIndex(-1);
  };

  // Handle tag selection
  const handleTagSelect = (tagName: string) => {
    if (!selectedTags.includes(tagName)) {
      const newTags = [...selectedTags, tagName];
      onTagsChange(newTags);
    }
    setInputValue('');
    setIsOpen(false);
    setFocusedIndex(-1);
    inputRef.current?.focus();
  };

  // Handle tag removal
  const handleTagRemove = (tagToRemove: string) => {
    // Prevent removing the last tag if required
    if (required && selectedTags.length <= 1) {
      return;
    }
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    onTagsChange(newTags);
  };

  // Handle creating new tag
  const handleCreateTag = async (tagName: string) => {
    const trimmedName = tagName.trim();
    if (trimmedName && trimmedName.length <= 20 && !selectedTags.includes(trimmedName)) {
      // Validate tag name (no special characters except hyphens and underscores)
      if (!/^[a-zA-Z0-9\-_\s]+$/.test(trimmedName)) {
        return;
      }
      
      try {
        await createTag(trimmedName);
        handleTagSelect(trimmedName);
      } catch (error) {
        console.error('Failed to create tag:', error);
      }
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && filteredTags[focusedIndex]) {
        handleTagSelect(filteredTags[focusedIndex].name);
      } else if (inputValue.trim()) {
        handleCreateTag(inputValue);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => Math.min(prev + 1, filteredTags.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setFocusedIndex(-1);
    } else if (e.key === 'Backspace' && !inputValue && selectedTags.length > 0) {
      // Remove last tag on backspace if input is empty
      if (!required || selectedTags.length > 1) {
        handleTagRemove(selectedTags[selectedTags.length - 1]);
      }
    }
  };

  // Handle clicks outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedTags.map((tag) => (
            <TagPill
              key={tag}
              tag={tag}
              color={getTagColor(tag)}
              removable={!required || selectedTags.length > 1}
              onRemove={() => handleTagRemove(tag)}
              size="sm"
            />
          ))}
        </div>
      )}

      {/* Input Field */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Hash size={16} className="text-gray-400 dark:text-gray-500" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-300 dark:focus:border-primary-600 transition-all duration-200"
          maxLength={20}
        />
        {required && selectedTags.length === 0 && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <span className="text-red-500 text-xs">*</span>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-glow dark:shadow-glow-dark max-h-48 overflow-y-auto">
          {/* Create new tag option */}
          {inputValue.trim() && 
           !filteredTags.some(tag => tag.name.toLowerCase() === inputValue.toLowerCase()) && 
           /^[a-zA-Z0-9\-_\s]+$/.test(inputValue.trim()) && (
            <button
              onClick={() => handleCreateTag(inputValue)}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 border-b border-gray-100 dark:border-gray-700"
            >
              <Plus size={14} className="mr-2 text-primary-500" />
              Create "{inputValue.trim()}"
            </button>
          )}

          {/* Existing tags */}
          {filteredTags.map((tag, index) => (
            <button
              key={tag.id}
              onClick={() => handleTagSelect(tag.name)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm transition-colors duration-200 ${
                index === focusedIndex
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: tag.color }}
                />
                <span>{tag.name}</span>
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {tag.count}
              </span>
            </button>
          ))}

          {/* No results */}
          {filteredTags.length === 0 && !inputValue.trim() && (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400 text-center">
              No tags available
            </div>
          )}

          {/* Invalid input message */}
          {inputValue.trim() && 
           !/^[a-zA-Z0-9\-_\s]+$/.test(inputValue.trim()) && (
            <div className="px-3 py-2 text-sm text-red-500 dark:text-red-400 text-center">
              Only letters, numbers, hyphens, and underscores allowed
            </div>
          )}
        </div>
      )}
    </div>
  );
};