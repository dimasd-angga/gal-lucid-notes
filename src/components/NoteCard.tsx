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
      className="group bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-soft dark:shadow-soft-dark border border-gray-200/50 dark:border-gray-700/50 p-5 cursor-pointer hover:shadow-glow dark:hover:shadow-glow-dark hover:border-primary-200 dark:hover:border-primary-700 transition-all duration-300 animate-scale-in transform hover:scale-105 hover:-translate-y-1"
    >
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 transition-all duration-200 group-hover:text-primary-700 dark:group-hover:text-primary-300">
          {note.title}
        </h3>
        <button
          onClick={handleFavoriteClick}
          className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 transform hover:scale-110 active:scale-95 ${
            note.isFavorite 
              ? 'text-yellow-500 dark:text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-300 animate-bounce-subtle' 
              : 'text-gray-400 dark:text-gray-500 hover:text-yellow-500 dark:hover:text-yellow-400'
          }`}
        >
          <Star size={18} fill={note.isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed transition-colors duration-200">
        {note.content}
      </p>
      
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center bg-gray-50 dark:bg-gray-700/50 px-2 py-1 rounded-full">
          <Calendar size={12} className="mr-1.5" />
          {formatRelativeTime(note.updatedAt)}
        </div>
        
        {note.tags.length > 0 && (
          <div className="flex items-center bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-2 py-1 rounded-full">
            <Tag size={12} className="mr-1.5" />
            <span className="truncate max-w-24 font-medium">
              {note.tags.slice(0, 2).join(', ')}
              {note.tags.length > 2 && '...'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};