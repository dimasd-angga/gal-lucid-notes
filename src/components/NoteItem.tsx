import React from 'react';
import { MoreVertical, Trash2 } from 'lucide-react';
import { Note } from '../types';
import { useNotes } from '../contexts/NotesContext';
import { formatRelativeTime } from '../utils/date';

interface NoteItemProps {
  note: Note;
  isSelected: boolean;
}

export const NoteItem: React.FC<NoteItemProps> = ({ note, isSelected }) => {
  const { selectNote, deleteNote } = useNotes();
  const [showMenu, setShowMenu] = React.useState(false);

  const handleClick = () => {
    selectNote(note.id);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteNote(note.id);
      } catch (error) {
        console.error('Failed to delete note:', error);
      }
    }
    setShowMenu(false);
  };

  const getPreviewText = (content: string): string => {
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  };

  return (
    <div
      onClick={handleClick}
      className={`relative group p-4 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-[1.02] hover:-translate-y-0.5 ${
        isSelected
          ? 'bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 shadow-soft dark:shadow-soft-dark'
          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-600'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm mb-1 truncate transition-colors duration-200 ${
            isSelected 
              ? 'text-primary-900 dark:text-primary-100' 
              : 'text-gray-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-300'
          }`}>
            {note.title}
          </h3>
          
          {note.content && (
            <p className={`text-xs mb-2 leading-relaxed transition-colors duration-200 ${
              isSelected 
                ? 'text-primary-700 dark:text-primary-300' 
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {getPreviewText(note.content)}
            </p>
          )}
          
          <div className="flex items-center justify-between">
            <span className={`text-xs transition-colors duration-200 ${
              isSelected 
                ? 'text-primary-600 dark:text-primary-400' 
                : 'text-gray-500 dark:text-gray-500'
            }`}>
              {formatRelativeTime(note.updatedAt)}
            </span>
            
            {note.tags.length > 0 && (
              <div className="flex items-center space-x-1">
                {note.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className={`px-2 py-0.5 text-xs rounded-full font-medium transition-colors duration-200 ${
                      isSelected
                        ? 'bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-primary-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
                {note.tags.length > 2 && (
                  <span className={`text-xs transition-colors duration-200 ${
                    isSelected 
                      ? 'text-primary-600 dark:text-primary-400' 
                      : 'text-gray-500 dark:text-gray-500'
                  }`}>
                    +{note.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="relative ml-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110 active:scale-95 ${
              isSelected
                ? 'text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-800'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <MoreVertical size={14} />
          </button>
          
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-glow dark:shadow-glow-dark border border-gray-200 dark:border-gray-700 py-1 min-w-32">
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                >
                  <Trash2 size={14} className="mr-2" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};