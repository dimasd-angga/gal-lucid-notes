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
import { stripHtml } from '../utils/html'

export const NoteEditor: React.FC = () => {
  const { getSelectedNote, updateNote, deleteNote, isSaving } = useNotes();
  const { incrementTagCount, decrementTagCount, getOrCreateTag } = useTags();
  const selectedNote = getSelectedNote();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [lastSaved, setLastSaved] = useState(null);
  const [currentNoteId, setCurrentNoteId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryResult, setSummaryResult] = useState('');
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  
  // AI Title Generation
  const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);
  const [titleSuggestions, setTitleSuggestions] = useState([]);
  const [showTitleSuggestions, setShowTitleSuggestions] = useState(false);
  const [titleError, setTitleError] = useState(null);
  
  // AI Content Expansion
  const [isExpanding, setIsExpanding] = useState(false);
  const [expandError, setExpandError] = useState(null);
  
  const titleRef = useRef(null);
  
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

  const getPlainTextLength = () => {
    return stripHtml(content).trim().length;
  };

  const getCharacterCount = () => {
    return stripHtml(content).length;
  };

  const getWordCount = () => {
    return stripHtml(content).trim() ? content.trim().split(/\s+/).length : 0;
  };

  console.log({getPlainTextLength: getPlainTextLength()})

  const handleSummarize = async () => {
     const plainText = stripHtml(content);
    if (!plainText.trim() || getWordCount() < 25) return;

    setIsSummarizing(true);
    setSummaryError(null);
    setSummaryResult('');

    try {
      const summary = await summarizeText(plainText);
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
    const plainText = stripHtml(content);
    
    if (!plainText.trim() || plainText.length < 50) return;

    setIsGeneratingTitle(true);
    setTitleError(null);
    setTitleSuggestions([]);

    try {
      const suggestions = await generateTitleSuggestions(plainText);
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
    const plainText = stripHtml(content);
    if (!plainText.trim() || plainText.length < 20) return;

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
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600">
            <Type className="w-full h-full" />
          </div>
          <div className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Select a note to start editing
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            Choose a note from the sidebar or create a new one to begin writing.
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 flex h-full flex-col bg-white dark:bg-gray-900 relative max-h-screen" onKeyDown={handleKeyDown}>
        {/* AI Toolbar */}
        <AIToolbar
          onSummarize={handleSummarize}
          onGenerateTitle={handleGenerateTitle}
          onExpandContent={handleExpandContent}
          onWritingHelp={handleWritingHelp}
          isSummarizing={isSummarizing}
          isGeneratingTitle={isGeneratingTitle}
          isExpanding={isExpanding}
          canSummarize={getWordCount() >= 25}
          canGenerateTitle={getPlainTextLength() >= 50}
          canExpandContent={getPlainTextLength() >= 20}
        />
        
        {/* Editor Header */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                {saveError ? (
                  <>
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    Error
                  </>
                ) : isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </>
                ) : hasUnsavedChanges ? (
                  <>
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    Unsaved
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Saved
                  </>
                )}
              </div>
              <div className="flex items-center gap-4">
                {lastSaved && (
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Last saved {formatRelativeTime(lastSaved)}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleManualSave}
                    disabled={!hasUnsavedChanges || isSaving}
                    className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 disabled:text-gray-400 dark:disabled:text-gray-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
                    title="Save note (Ctrl+S)"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all duration-200"
                    title="Delete note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {saveError && (
            <div className="px-6 py-3 bg-red-50 dark:bg-red-900/30 border-t border-red-200 dark:border-red-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                  <AlertCircle className="w-4 h-4" />
                  {saveError}
                </div>
                <button
                  onClick={() => setSaveError(null)}
                  className="ml-auto text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Expand Error */}
        {expandError && (
          <div className="px-6 py-3 bg-red-50 dark:bg-red-900/30 border-b border-red-200 dark:border-red-800">
            <div className="flex items-center text-sm text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 mr-2" />
              {expandError}
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
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <div className="flex items-center gap-2">
              <input
                ref={titleRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title..."
                className="flex-1 text-lg font-bold bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 border-none outline-none focus:ring-0 p-0 transition-colors duration-200"
                maxLength={100}
              />
              <AutoTitleButton
                onClick={handleGenerateTitle}
                isLoading={isGeneratingTitle}
                disabled={getPlainTextLength() < 50}
              />
            </div>
            
            {/* Title Suggestions */}
            {showTitleSuggestions && (
              <TitleSuggestions
                suggestions={titleSuggestions}
                onSelect={handleSelectTitle}
                onClose={() => {
                  setShowTitleSuggestions(false);
                  setTitleSuggestions([]);
                }}
                isLoading={isGeneratingTitle}
              />
            )}
            
            {/* Title Error */}
            {titleError && (
              <div className="mt-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                {titleError}
              </div>
            )}
          </div>
          
          {/* Compact Tags Selector */}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">Tags:</span>
            <div className="flex-1 max-w-md">
              <TagSelector selectedTags={tags} onTagsChange={handleTagsChange} />
            </div>
          </div>
        </div>
        
        {/* Content Editor - Dynamic height */}
        <div className="flex-1 px-6 py-4 overflow-hidden min-h-0">
          <RichTextEditor
            value={content}
            onChange={(newContent) => setContent(newContent)}
            placeholder="Start writing your note..."
            className="w-full h-full"
          />
        </div>

        {/* Footer Stats - Always at bottom */}
        <div className="flex-shrink-0 px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 mt-auto">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <span>{getWordCount()} words</span>
              <span>{getCharacterCount()} characters</span>
              <span>{tags.length} tags</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-xs font-mono bg-gray-200 dark:bg-gray-700 rounded">Ctrl+S</kbd>
              <span>to save</span>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Delete Note
                    </h3>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Are you sure you want to delete "{title || 'Untitled Note'}"? This action cannot be undone.
                </p>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex gap-3 justify-end">
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

      {/* Summary Modal - Rendered outside the main container */}
      <SummaryModal
        isOpen={showSummaryModal}
        onClose={handleCloseSummaryModal}
        originalContent={content}
        summary={summaryResult}
        error={summaryError}
        onReplace={handleReplaceSummary}
        onAppend={handleAppendSummary}
      />
    </>
  );
};