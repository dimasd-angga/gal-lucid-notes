import React from 'react';
import { FileText } from 'lucide-react';
import { useNotes } from '../contexts/NotesContext';
import { NoteItem } from './NoteItem';
import { EmptyNotesState } from './EmptyNotesState';

interface NotesListProps {
  selectedTagFilters: string[];
  searchQuery?: string;
}

export const NotesList: React.FC<NotesListProps> = ({ selectedTagFilters, searchQuery = '' }) => {
  const { notes, selectedNoteId } = useNotes();

  // Filter notes based on search query and selected tags
  const filteredNotes = React.useMemo(() => {
    let filtered = notes;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply tag filters (OR logic - show notes with ANY selected tag)
    if (selectedTagFilters.length > 0) {
      filtered = filtered.filter(note => 
        selectedTagFilters.some(tag => note.tags.includes(tag))
      );
    }

    return filtered;
  }, [notes, searchQuery, selectedTagFilters]);

  const sortedNotes = [...filteredNotes].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Notes Header */}
      <div className="px-3 py-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {searchQuery || selectedTagFilters.length > 0 ? 'Filtered Notes' : 'All Notes'}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            {sortedNotes.length}
          </span>
        </div>
        {(searchQuery || selectedTagFilters.length > 0) && (
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {searchQuery && `Search: "${searchQuery}"`}
            {searchQuery && selectedTagFilters.length > 0 && ' • '}
            {selectedTagFilters.length > 0 && `Tags: ${selectedTagFilters.join(', ')}`}
          </div>
        )}
      </div>
      
      {/* Notes List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {sortedNotes.length > 0 ? (
          <div className="px-2 pb-2">
            {sortedNotes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                isSelected={note.id === selectedNoteId}
              />
            ))}
          </div>
        ) : (
          <EmptyNotesState 
            hasFilters={searchQuery.length > 0 || selectedTagFilters.length > 0}
            searchQuery={searchQuery}
            selectedTags={selectedTagFilters}
          />
        )}
      </div>
    </div>
  );
};