import React, { useState } from 'react';
import { Plus, FileText, BarChart3, Filter, ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import { useNotes } from '../contexts/NotesContext';
import { useTags } from '../contexts/TagsContext';
import { NoteItem } from './NoteItem';
import { TagPill } from './TagPill';
import { useDebounce } from '../hooks/useDebounce';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateNote: () => void;
  currentView: 'dashboard' | 'editor';
  onViewChange: (view: 'dashboard' | 'editor') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  onCreateNote,
  currentView,
  onViewChange
}) => {
  const { notes, selectedNoteId } = useNotes();
  const { tags, getTagColor } = useTags();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([]);
  const [showTagFilter, setShowTagFilter] = useState(false);
  
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Filter notes based on search and tags
  const filteredNotes = React.useMemo(() => {
    let filtered = notes;

    // Apply search filter
    if (debouncedQuery.trim()) {
      const query = debouncedQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply tag filters
    if (selectedTagFilters.length > 0) {
      filtered = filtered.filter(note => 
        selectedTagFilters.some(tag => note.tags.includes(tag))
      );
    }

    return filtered.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [notes, debouncedQuery, selectedTagFilters]);

  const handleTagToggle = (tagName: string) => {
    setSelectedTagFilters(prev => 
      prev.includes(tagName)
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedTagFilters([]);
  };

  const activeTags = tags.filter(tag => tag.count > 0).sort((a, b) => b.count - a.count);

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-xl border-r border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-300 ease-in-out flex flex-col
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
          <div className="flex items-center group">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 rounded-xl flex items-center justify-center mr-3 shadow-glow dark:shadow-glow-dark transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
              <span className="text-white font-bold text-sm">LN</span>
            </div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
              Lucid-Notes
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Navigation */}
        <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
          {/* Create Note Button */}
          <button 
            onClick={onCreateNote}
            className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 rounded-xl hover:from-primary-700 hover:to-primary-800 dark:hover:from-primary-600 dark:hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-soft dark:shadow-soft-dark transition-all duration-200 transform hover:scale-105 hover:shadow-glow dark:hover:shadow-glow-dark active:scale-95 mb-3"
          >
            <Plus size={18} className="mr-2" />
            New Note
          </button>
          
          {/* View Toggle */}
          <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                currentView === 'dashboard'
                  ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 size={16} className="mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => onViewChange('editor')}
              className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                currentView === 'editor'
                  ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <FileText size={16} className="mr-2" />
              Notes
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-9 pr-8 py-2.5 text-sm bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-primary-300 dark:focus:border-primary-600 transition-all duration-200"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <X size={14} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200" />
              </button>
            )}
          </div>
        </div>

        {/* Tag Filter */}
        <div className="border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
          <button
            onClick={() => setShowTagFilter(!showTagFilter)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200"
          >
            <div className="flex items-center">
              <Filter size={16} className="text-gray-500 dark:text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                Filter by Tags
              </span>
              {selectedTagFilters.length > 0 && (
                <span className="ml-2 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full">
                  {selectedTagFilters.length}
                </span>
              )}
            </div>
            {showTagFilter ? (
              <ChevronUp size={16} className="text-gray-400" />
            ) : (
              <ChevronDown size={16} className="text-gray-400" />
            )}
          </button>

          {showTagFilter && (
            <div className="px-4 pb-4">
              {selectedTagFilters.length > 0 && (
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {selectedTagFilters.length} filter{selectedTagFilters.length > 1 ? 's' : ''} active
                  </span>
                  <button
                    onClick={() => setSelectedTagFilters([])}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
                  >
                    Clear all
                  </button>
                </div>
              )}
              
              {activeTags.length > 0 ? (
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {activeTags.map((tag) => {
                    const isSelected = selectedTagFilters.includes(tag.name);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => handleTagToggle(tag.name)}
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
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    No tags available
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                {(searchQuery || selectedTagFilters.length > 0) ? 'Filtered Notes' : 'All Notes'}
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                {filteredNotes.length}
              </span>
            </div>
            {(searchQuery || selectedTagFilters.length > 0) && (
              <div className="mt-1 flex items-center justify-between">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {searchQuery && `"${searchQuery}"`}
                  {searchQuery && selectedTagFilters.length > 0 && ' • '}
                  {selectedTagFilters.length > 0 && `${selectedTagFilters.length} tag${selectedTagFilters.length > 1 ? 's' : ''}`}
                </div>
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto min-h-0 px-2 py-2">
            {filteredNotes.length > 0 ? (
              <div className="space-y-1">
                {filteredNotes.map((note) => (
                  <NoteItem
                    key={note.id}
                    note={note}
                    isSelected={note.id === selectedNoteId}
                  />
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <FileText size={20} className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {(searchQuery || selectedTagFilters.length > 0) ? 'No matching notes' : 'No notes yet'}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    {(searchQuery || selectedTagFilters.length > 0) 
                      ? 'Try different search terms or filters'
                      : 'Create your first note to get started'
                    }
                  </p>
                  {(searchQuery || selectedTagFilters.length > 0) ? (
                    <button
                      onClick={handleClearFilters}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
                    >
                      Clear filters
                    </button>
                  ) : (
                    <button
                      onClick={onCreateNote}
                      className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
                    >
                      Create your first note
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};