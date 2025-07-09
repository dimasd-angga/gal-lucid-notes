import React from 'react';
import { X } from 'lucide-react';

interface TagPillProps {
  tag: string;
  color: string;
  onRemove?: () => void;
  size?: 'sm' | 'md';
  removable?: boolean;
  onClick?: () => void;
}

export const TagPill: React.FC<TagPillProps> = ({ 
  tag, 
  color, 
  onRemove, 
  size = 'md',
  removable = false,
  onClick 
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  return (
    <span
      onClick={handleClick}
      className={`
        inline-flex items-center font-medium rounded-full transition-all duration-200 transform hover:scale-105 active:scale-95
        ${sizeClasses[size]}
        ${onClick ? 'cursor-pointer hover:shadow-sm' : ''}
        ${removable ? 'pr-1' : ''}
      `}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        border: `1px solid ${color}40`
      }}
    >
      <span className="truncate max-w-24">{tag}</span>
      {removable && onRemove && (
        <button
          onClick={handleRemove}
          className="ml-1 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200"
          aria-label={`Remove ${tag} tag`}
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
};