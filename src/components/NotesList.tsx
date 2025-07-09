import React from 'react';
import { FileText } from 'lucide-react';
import { useNotes } from '../contexts/NotesContext';
import { NoteItem } from './NoteItem';

interface NotesListProps {
  selectedTagFilters: string[];
}

export const NotesList: React.FC<NotesListProps> = ({ selectedTagFilters }) => {
  const { notes, selectedNoteId } = useNotes();

  // Filter notes based on selected tags
  const filteredNotes = selectedTagFilters.length > 0
    ? notes.filter(note => 
        selectedTagFilters.some(tag => note.tags.includes(tag))
      )
    : notes;

  const sortedNotes = [...filteredNotes].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="flex-1 flex flex-col border-t border-gray-200/50 dark:border-gray-700/50">
      {/* Notes Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {selectedTagFilters.length > 0 ? 'Filtered Notes' : 'All Notes'}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            {sortedNotes.length}
          </span>
        </div>
        {selectedTagFilters.length > 0 && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Showing notes with: {selectedTagFilters.join(', ')}
          </div>
        )}
      </div>
      
      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {sortedNotes.length > 0 ? (
          <div className="px-2 pb-4">
            {sortedNotes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                isSelected={note.id === selectedNoteId}
              />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft dark:shadow-soft-dark">
                <FileText size={24} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                {selectedTagFilters.length > 0 ? 'No matching notes' : 'No notes yet'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-48 mx-auto leading-relaxed">
                {selectedTagFilters.length > 0 
                  ? 'Try adjusting your tag filters or create a new note.'
                  : 'Go to Dashboard to create your first note.'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};