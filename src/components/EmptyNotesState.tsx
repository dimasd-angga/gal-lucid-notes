import React from 'react';
import { FileText, Search, Filter, Plus } from 'lucide-react';

interface EmptyNotesStateProps {
  hasFilters: boolean;
  searchQuery?: string;
  selectedTags?: string[];
}

export const EmptyNotesState: React.FC<EmptyNotesStateProps> = ({ 
  hasFilters, 
  searchQuery = '', 
  selectedTags = [] 
}) => {
  const handleClearFilters = () => {
    // Clear search and filters
    window.dispatchEvent(new CustomEvent('clearFilters'));
  };

  const handleCreateNote = () => {
    // Create new note
    window.dispatchEvent(new CustomEvent('createNote'));
  };

  if (hasFilters) {
    // No results for current filters/search
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center animate-fade-in max-w-sm">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft dark:shadow-soft-dark">
            {searchQuery ? (
              <Search size={24} className="text-orange-500 dark:text-orange-400" />
            ) : (
              <Filter size={24} className="text-orange-500 dark:text-orange-400" />
            )}
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            No matching notes
          </h3>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
            {searchQuery && selectedTags.length > 0 
              ? `No notes found for "${searchQuery}" with the selected tags.`
              : searchQuery 
                ? `No notes found for "${searchQuery}". Try different keywords.`
                : 'No notes match the selected tags. Try different filters.'
            }
          </p>
          
          <div className="space-y-2">
            <button
              onClick={handleClearFilters}
              className="w-full px-4 py-2 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-all duration-200"
            >
              Clear {searchQuery && selectedTags.length > 0 ? 'search and filters' : searchQuery ? 'search' : 'filters'}
            </button>
            
            {searchQuery && (
              <button
                onClick={handleCreateNote}
                className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-all duration-200"
              >
                <Plus size={16} className="mr-2" />
                Create note from search
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // No notes at all
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center animate-fade-in max-w-sm">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft dark:shadow-soft-dark">
          <FileText size={32} className="text-primary-500 dark:text-primary-400" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
          No notes yet
        </h3>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
          Create your first note to get started with Lucid-Notes. Organize your thoughts, ideas, and inspirations all in one place.
        </p>
        
        <button
          onClick={handleCreateNote}
          className="flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-xl shadow-soft hover:shadow-glow transition-all duration-200 transform hover:scale-105 active:scale-95 mx-auto"
        >
          <Plus size={18} className="mr-2" />
          Create your first note
        </button>
        
        <div className="mt-6 text-xs text-gray-400 dark:text-gray-500">
          💡 Tip: Use tags to organize your notes effectively
        </div>
      </div>
    </div>
  );
};