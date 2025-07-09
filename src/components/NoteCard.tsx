import React from 'react';
import { Star, Calendar, Tag } from 'lucide-react';
import { Note } from '../types';
import { formatRelativeTime } from '../utils/date';

interface NoteCardProps {
  note: Note;
  onClick: (note: Note) => void;
  onToggleFavorite: (noteId: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onClick, onToggleFavorite }) => {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(note.id);
  };

  return (
    <div
      onClick={() => onClick(note)}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:shadow-md hover:shadow-gray-200 dark:hover:shadow-gray-900/50 transition-all duration-200 animate-fade-in transform hover:scale-105"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1 transition-colors duration-200">
          {note.title}
        </h3>
        <button
          onClick={handleFavoriteClick}
          className={`p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
            note.isFavorite 
              ? 'text-yellow-500 dark:text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-300' 
              : 'text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400'
          }`}
        >
          <Star size={16} fill={note.isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2 transition-colors duration-200">
        {note.content}
      </p>
      
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
        <div className="flex items-center">
          <Calendar size={12} className="mr-1" />
          {formatRelativeTime(note.updatedAt)}
        </div>
        
        {note.tags.length > 0 && (
          <div className="flex items-center">
            <Tag size={12} className="mr-1" />
            <span className="truncate max-w-20">
              {note.tags.slice(0, 2).join(', ')}
              {note.tags.length > 2 && '...'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};