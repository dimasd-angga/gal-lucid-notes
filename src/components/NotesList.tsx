import React from 'react';
import { Plus, FileText } from 'lucide-react';
import { useNotes } from '../contexts/NotesContext';
import { NoteItem } from './NoteItem';

export const NotesList: React.FC = () => {
  const { notes, selectedNoteId, createNote, isLoading } = useNotes();

  const handleCreateNote = async () => {
    try {
      await createNote();
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  const sortedNotes = [...notes].sort((a, b) => 
    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Notes
          </h2>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {notes.length}
          </span>
        </div>
        
        <button
          onClick={handleCreateNote}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 rounded-xl hover:from-primary-700 hover:to-primary-800 dark:hover:from-primary-600 dark:hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-soft dark:shadow-soft-dark hover:shadow-glow dark:hover:shadow-glow-dark transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
          ) : (
            <Plus size={18} className="mr-2" />
          )}
          New Note
        </button>
      </div>
      
      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {sortedNotes.length > 0 ? (
          <div className="p-2">
            {sortedNotes.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                isSelected={note.id === selectedNoteId}
              />
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft dark:shadow-soft-dark">
                <FileText size={24} className="text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                No notes yet
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-48 mx-auto leading-relaxed">
                Create your first note to get started with Lucid-Notes.
              </p>
              <button
                onClick={handleCreateNote}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors duration-200"
              >
                <Plus size={16} className="mr-1.5" />
                Create Note
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};