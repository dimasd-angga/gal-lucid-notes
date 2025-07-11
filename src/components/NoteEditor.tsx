import React, { useState, useEffect, useRef } from 'react';
import { Save, Clock, Type, Trash2, AlertCircle, Sparkles, Wand2 } from 'lucide-react';
import { useNotes } from '../contexts/NotesContext';
import { useTags } from '../contexts/TagsContext';
import { TagSelector } from './TagSelector';
import { SummarizeButton } from './SummarizeButton';
import { SummaryModal } from './SummaryModal';
import { RichTextEditor } from './RichTextEditor';
import { AIToolbar } from './AIToolbar';
import { AutoTitleButton } from './AutoTitleButton';
import { TitleSuggestions } from './TitleSuggestions';
import { useDebounce } from '../hooks/useDebounce';
import { formatRelativeTime } from '../utils/date';
import { summarizeText, generateTitleSuggestions, expandContent, getWritingHelp } from '../services/geminiService';

export const NoteEditor: React.FC = () => {
  const { getSelectedNote, updateNote, deleteNote, isSaving } = useNotes();
  const { incrementTagCount, decrementTagCount, getOrCreateTag } = useTags();
  const selectedNote = getSelectedNote();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryResult, setSummaryResult] = useState<string>('');
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  
  // AI Title Generation
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);
  
  // AI Content Expansion
  const [isExpanding, setIsExpanding] = useState(false);
  const [expandError, setExpandError] = useState<string | null>(null);
  
  const titleRef = useRef<HTMLInputElement>(null);
  
  const debouncedTitle = useDebounce(title, 1000);
  const debouncedContent = useDebounce(content, 1000);

  // Load selected note data and reset state when note changes
  useEffect(() => {
    if (selectedNote) {
      // Only update state if we're switching to a different note
      if (currentNoteId !== selectedNote.id) {
        setTitle(selectedNote.title);
        setContent(selectedNote.content);
        setTags([...selectedNote.tags]); // Create a copy to avoid reference issues
        setLastSaved(selectedNote.updatedAt);
        setCurrentNoteId(selectedNote.id);
        setSaveError(null);
        setHasUnsavedChanges(false);
        
        // Auto-focus title if it's a new note
        if (selectedNote.title === 'Untitled Note' && titleRef.current) {
          setTimeout(() => {
            titleRef.current?.focus();
            titleRef.current?.select();
          }, 100);
        }
      }
    } else {
      // Clear state when no note is selected
      setTitle('');
      setContent('');
      setTags([]);
      setLastSaved(null);
      setCurrentNoteId(null);
      setSaveError(null);
      setHasUnsavedChanges(false);
    }
  }, [selectedNote, currentNoteId]);

  // Track unsaved changes
  useEffect(() => {
    if (selectedNote && selectedNote.id === currentNoteId) {
      const hasChanges = 
        title !== selectedNote.title || 
        content !== selectedNote.content ||
        JSON.stringify(tags.sort()) !== JSON.stringify([...selectedNote.tags].sort());
      setHasUnsavedChanges(hasChanges);
    }
  }, [title, content, tags, selectedNote, currentNoteId]);

  // Auto-save when debounced values change
  useEffect(() => {
    if (selectedNote && 
        selectedNote.id === currentNoteId && 
        hasUnsavedChanges &&
        (debouncedTitle !== selectedNote.title || debouncedContent !== selectedNote.content)) {
      
      const saveNote = async () => {
        try {
          setSaveError(null);
          await updateNote(selectedNote.id, {
            title: debouncedTitle.trim() || 'Untitled Note',
            content: debouncedContent,
          });
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
        } catch (error) {
          console.error('Failed to save note:', error);
          setSaveError('Failed to save note. Please try again.');
        }
      };
      
      saveNote();
    }
  }, [debouncedTitle, debouncedContent, selectedNote, currentNoteId, updateNote, hasUnsavedChanges]);

  const handleTagsChange = async (newTags: string[]) => {
    if (!selectedNote || selectedNote.id !== currentNoteId) return;

    // Ensure at least one tag is present
    if (newTags.length === 0) {
      newTags = ['general'];
    }

    // Update tag counts
    const oldTags = [...tags];
    const addedTags = newTags.filter(tag => !oldTags.includes(tag));
    const removedTags = oldTags.filter(tag => !newTags.includes(tag));

    try {
      // Create new tags if they don't exist and increment counts
      for (const tagName of addedTags) {
        await getOrCreateTag(tagName);
        incrementTagCount(tagName);
      }

      // Decrement counts for removed tags
      for (const tagName of removedTags) {
        decrementTagCount(tagName);
      }

      setTags([...newTags]); // Create a copy to avoid reference issues
      
      await updateNote(selectedNote.id, { tags: [...newTags] });
      setSaveError(null);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to update tags:', error);
      setSaveError('Failed to update tags. Please try again.');
      // Revert tags on error
      setTags([...oldTags]);
    }
  };

  const handleManualSave = async () => {
    if (!selectedNote || selectedNote.id !== currentNoteId) return;

    try {
      setSaveError(null);
      await updateNote(selectedNote.id, {
        title: title.trim() || 'Untitled Note',
        content: content,
        tags: [...tags],
      });
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save note:', error);
      setSaveError('Failed to save note. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!selectedNote) return;

    try {
      // Decrement tag counts for all tags in this note
      for (const tagName of selectedNote.tags) {
        decrementTagCount(tagName);
      }
      
      await deleteNote(selectedNote.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete note:', error);
      setSaveError('Failed to delete note. Please try again.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleManualSave();
    }
  };

  const getCharacterCount = () => {
    return content.length;
  };

  const getWordCount = () => {
    return content.trim() ? content.trim().split(/\s+/).length : 0;
  };

  const handleSummarize = async () => {
    if (!content.trim() || getWordCount() < 25) return;

    setIsSummarizing(true);
    setSummaryError(null);
    setSummaryResult('');

    try {
      const summary = await summarizeText(content);
      setSummaryResult(summary);
      setShowSummaryModal(true);
    } catch (error: any) {
      console.error('Failed to summarize:', error);
      setSummaryError(error.message || 'Failed to generate summary. Please try again.');
      setShowSummaryModal(true);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleReplaceSummary = async () => {
    if (!selectedNote || !summaryResult) return;

    try {
      setContent(summaryResult);
      await updateNote(selectedNote.id, { content: summaryResult });
      setShowSummaryModal(false);
      setSummaryResult('');
      setSummaryError(null);
    } catch (error) {
      console.error('Failed to replace content:', error);
      setSaveError('Failed to replace content. Please try again.');
    }
  };

  const handleAppendSummary = async () => {
    if (!selectedNote || !summaryResult) return;

    try {
      const newContent = content + '\n\n---\n\n**Summary:**\n' + summaryResult;
      setContent(newContent);
      await updateNote(selectedNote.id, { content: newContent });
      setShowSummaryModal(false);
      setSummaryResult('');
      setSummaryError(null);
    } catch (error) {
      console.error('Failed to append summary:', error);
      setSaveError('Failed to append summary. Please try again.');
    }
  };

  const handleCloseSummaryModal = () => {
    setShowSummaryModal(false);
    setSummaryResult('');
    setSummaryError(null);
  };

  const handleGenerateTitle = async () => {
    if (!content.trim() || content.length < 50) return;

    setIsGeneratingTitle(true);
    setTitleError(null);
    setTitleSuggestions([]);

    try {
      const suggestions = await generateTitleSuggestions(content);
      setTitleSuggestions(suggestions);
      setShowTitleSuggestions(true);
    } catch (error: any) {
      console.error('Failed to generate title suggestions:', error);
      setTitleError(error.message || 'Failed to generate title suggestions. Please try again.');
    } finally {
      setIsGeneratingTitle(false);
    }
  };

  const handleSelectTitle = async (selectedTitle: string) => {
    if (!selectedNote) return;

    try {
      setTitle(selectedTitle);
      await updateNote(selectedNote.id, { title: selectedTitle });
      setShowTitleSuggestions(false);
      setTitleSuggestions([]);
      setTitleError(null);
    } catch (error) {
      console.error('Failed to update title:', error);
      setSaveError('Failed to update title. Please try again.');
    }
  };

  const handleExpandContent = async () => {
    if (!content.trim() || content.length < 20) return;

    setIsExpanding(true);
    setExpandError(null);

    try {
      const expandedContent = await expandContent(content);
      setContent(expandedContent);
      if (selectedNote) {
        await updateNote(selectedNote.id, { content: expandedContent });
      }
    } catch (error: any) {
      console.error('Failed to expand content:', error);
      setExpandError(error.message || 'Failed to expand content. Please try again.');
    } finally {
      setIsExpanding(false);
    }
  };

  const handleWritingHelp = async () => {
    try {
      const help = await getWritingHelp(content);
      // For now, we'll show this in an alert, but you could create a dedicated modal
      alert(`Writing Suggestions:\n\n${help}`);
    } catch (error: any) {
      console.error('Failed to get writing help:', error);
      alert('Failed to get writing help. Please try again.');
    }
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
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950" onKeyDown={handleKeyDown}>
      {/* AI Toolbar */}
      <AIToolbar
        onAutoTitle={handleGenerateTitle}
        onSummarize={handleSummarize}
        onExpand={handleExpandContent}
        onHelp={handleWritingHelp}
        isGeneratingTitle={isGeneratingTitle}
        isSummarizing={isSummarizing}
        isExpanding={isExpanding}
        contentLength={content.length}
      />
      
      {/* Editor Header */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-soft dark:shadow-soft-dark border-b border-gray-200/50 dark:border-gray-700/50 p-4 lg:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              saveError
                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                : isSaving 
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' 
                  : hasUnsavedChanges
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                    : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
            }`}>
              {saveError ? (
                <>
                  <AlertCircle size={12} />
                  Error
                </>
              ) : isSaving ? (
                <>
                  <div className="w-3 h-3 border border-yellow-400 border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : hasUnsavedChanges ? (
                <>
                  <Clock size={12} />
                  Unsaved
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
          
          <div className="flex items-center space-x-2">
            <SummarizeButton
              content={content}
              onSummarize={handleSummarize}
              isLoading={isSummarizing}
            />
            <button
              onClick={handleManualSave}
              disabled={isSaving || !hasUnsavedChanges}
              className="px-3 py-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Save (Ctrl+S)"
            >
              <Save size={14} />
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200"
              title="Delete note"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {saveError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center">
              <AlertCircle size={16} className="text-red-600 dark:text-red-400 mr-2" />
              <span className="text-sm text-red-700 dark:text-red-300">{saveError}</span>
              <button
                onClick={() => setSaveError(null)}
                className="ml-auto text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
              >
                ×
              </button>
            </div>
          </div>
        )}
        

      {/* Summary Modal */}
      <SummaryModal
        isOpen={showSummaryModal}
        onClose={handleCloseSummaryModal}
        originalContent={content}
        summary={summaryResult}
        onReplace={handleReplaceSummary}
        onAppend={handleAppendSummary}
        isLoading={isSummarizing}
        error={summaryError}
      />
      
      {/* Expand Error */}
      {expandError && (
        <div className="fixed top-4 right-4 z-50 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg shadow-glow dark:shadow-glow-dark">
          <div className="flex items-center">
            <AlertCircle size={16} className="text-red-600 dark:text-red-400 mr-2" />
            <span className="text-sm text-red-700 dark:text-red-300">{expandError}</span>
            <button
              onClick={() => setExpandError(null)}
              className="ml-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              ×
            </button>
          </div>
        </div>
      )}
        {/* Title Input */}
        <div className="relative mb-4">
          <div className="flex items-center space-x-2">
            <input
              ref={titleRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="flex-1 text-xl lg:text-2xl font-bold bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border-none outline-none focus:ring-0 p-0 transition-colors duration-200"
              maxLength={100}
            />
            <AutoTitleButton
              onGenerate={handleGenerateTitle}
              isLoading={isGeneratingTitle}
              disabled={content.length < 50}
            />
          </div>
          
          {/* Title Suggestions */}
          {showTitleSuggestions && (
            <TitleSuggestions
              suggestions={titleSuggestions}
              onSelect={handleSelectTitle}
              onRegenerate={handleGenerateTitle}
              onDismiss={() => {
                setShowTitleSuggestions(false);
                setTitleSuggestions([]);
              }}
              isLoading={isGeneratingTitle}
            />
          )}
          
          {/* Title Error */}
          {titleError && (
            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{titleError}</p>
            </div>
          )}
        </div>
        
        {/* Tags Selector - New row below title */}
        <div className="mb-6">
          <TagSelector
            selectedTags={tags}
            onTagsChange={handleTagsChange}
            placeholder="Add tags to organize your note..."
            required={false}
          />
        </div>
      </div>
      
      {/* Content Editor */}
      <div className="flex-1 p-4 lg:p-6 pb-20">
        <RichTextEditor
          value={content}
          onChange={(newContent) => setContent(newContent)}
          placeholder="Start writing your note..."
          className="w-full h-full max-h-[calc(100vh-400px)]"
        />
      </div>

      {/* Footer Stats */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-t border-gray-200/50 dark:border-gray-700/50 px-4 lg:px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span>{getWordCount()} words</span>
            <span>{getCharacterCount()} characters</span>
            <span>{tags.length} tags</span>
          </div>
          <div className="hidden sm:block">
            <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs">Ctrl+S</kbd>
            <span className="ml-1">to save</span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-glow dark:shadow-glow-dark max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-3">
                <Trash2 size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Delete Note
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete "{title || 'Untitled Note'}"? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};