import React, { useState, useEffect, useRef } from 'react';
import { Save, Clock, Type, Hash } from 'lucide-react';
import { useNotes } from '../contexts/NotesContext';
import { useDebounce } from '../hooks/useDebounce';
import { formatRelativeTime } from '../utils/date';

export const NoteEditor: React.FC = () => {
  const { getSelectedNote, updateNote, isSaving } = useNotes();
  const selectedNote = getSelectedNote();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  
  const debouncedTitle = useDebounce(title, 1000);
  const debouncedContent = useDebounce(content, 1000);

  // Load selected note data
  useEffect(() => {
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      setTags(selectedNote.tags);
      setLastSaved(selectedNote.updatedAt);
      
      // Auto-focus title if it's a new note
      if (selectedNote.title === 'Untitled Note' && titleRef.current) {
        titleRef.current.focus();
        titleRef.current.select();
      }
    } else {
      setTitle('');
      setContent('');
      setTags([]);
      setLastSaved(null);
    }
  }, [selectedNote]);

  // Auto-save when debounced values change
  useEffect(() => {
    if (selectedNote && selectedNote.title && selectedNote.content !== undefined && 
        (debouncedTitle !== selectedNote.title || debouncedContent !== selectedNote.content) &&
        (debouncedTitle.trim() !== '' || debouncedContent.trim() !== '')) {
      const saveNote = async () => {
        try {
          await updateNote(selectedNote.id, {
            title: debouncedTitle,
            content: debouncedContent,
          });
          setLastSaved(new Date());
        } catch (error) {
          console.error('Failed to save note:', error);
        }
      };
      
      saveNote();
    }
  }, [debouncedTitle, debouncedContent, selectedNote, updateNote]);

  // Auto-resize textarea
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto';
      contentRef.current.style.height = contentRef.current.scrollHeight + 'px';
    }
  }, [content]);

  const handleTagsChange = (newTags: string) => {
    const tagArray = newTags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setTags(tagArray);
    
    if (selectedNote) {
      updateNote(selectedNote.id, { tags: tagArray });
    }
  };

  const getCharacterCount = () => {
    return content.length;
  };

  const getWordCount = () => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  };

  if (!selectedNote) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-4">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft dark:shadow-soft-dark">
            <Type size={32} className="text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            Select a note to start editing
          </h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
            Choose a note from the sidebar or create a new one to begin writing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      {/* Editor Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-soft dark:shadow-soft-dark border-b border-gray-200/50 dark:border-gray-700/50 p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              isSaving 
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' 
                : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            }`}>
              {isSaving ? (
                <>
                  <div className="w-3 h-3 border border-yellow-400 border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={12} />
                  Saved
                </>
              )}
            </div>
            {lastSaved && (
              <div className="flex items-center space-x-1.5 text-xs text-gray-500 dark:text-gray-400">
                <Clock size={12} />
                <span>Last saved {formatRelativeTime(lastSaved)}</span>
              </div>
            )}
          </div>
          
          <div className="hidden sm:flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <span>{getWordCount()} words</span>
            <span>{getCharacterCount()} characters</span>
          </div>
        </div>
        
        {/* Title Input */}
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title..."
          className="w-full text-xl lg:text-2xl font-bold bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border-none outline-none focus:ring-0 p-0 transition-colors duration-200"
        />
        
        {/* Tags Input */}
        <div className="mt-4 flex items-center space-x-2">
          <Hash size={16} className="text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={tags.join(', ')}
            onChange={(e) => handleTagsChange(e.target.value)}
            placeholder="Add tags (comma separated)..."
            className="flex-1 text-sm bg-transparent text-gray-700 dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500 border-none outline-none focus:ring-0 p-0 transition-colors duration-200"
          />
        </div>
      </div>
      
      {/* Content Editor */}
      <div className="flex-1 p-4 lg:p-6">
        <textarea
          ref={contentRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing your note..."
          className="w-full h-full min-h-64 lg:min-h-96 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border-none outline-none resize-none focus:ring-0 p-0 text-sm lg:text-base leading-relaxed transition-colors duration-200"
          style={{ fontFamily: 'Inter, sans-serif' }}
        />
      </div>
    </div>
  );
};