import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Quote, Code, Undo, Redo } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start writing your note...",
  className = ""
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isUpdatingRef = useRef(false);

  // Update editor content when value prop changes
  useEffect(() => {
    if (editorRef.current && !isUpdatingRef.current) {
      const editor = editorRef.current;
      if (editor.innerHTML !== value) {
        const selection = window.getSelection();
        const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
        const startOffset = range?.startOffset || 0;
        const endOffset = range?.endOffset || 0;
        
        editor.innerHTML = value;
        
        // Restore cursor position
        try {
          if (range && editor.firstChild) {
            const newRange = document.createRange();
            const textNode = editor.firstChild;
            newRange.setStart(textNode, Math.min(startOffset, textNode.textContent?.length || 0));
            newRange.setEnd(textNode, Math.min(endOffset, textNode.textContent?.length || 0));
            selection?.removeAllRanges();
            selection?.addRange(newRange);
          }
        } catch (error) {
          // Ignore cursor restoration errors
        }
      }
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isUpdatingRef.current = true;
      onChange(editorRef.current.innerHTML);
      setTimeout(() => {
        isUpdatingRef.current = false;
      }, 0);
    }
  };

  const executeCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          executeCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          executeCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          executeCommand('underline');
          break;
        case 'z':
          if (e.shiftKey) {
            e.preventDefault();
            executeCommand('redo');
          } else {
            e.preventDefault();
            executeCommand('undo');
          }
          break;
      }
    }
  };

  const isCommandActive = (command: string): boolean => {
    return document.queryCommandState(command);
  };

  const ToolbarButton: React.FC<{
    command: string;
    icon: React.ReactNode;
    title: string;
    value?: string;
  }> = ({ command, icon, title, value }) => {
    const isActive = isCommandActive(command);
    
    return (
      <button
        type="button"
        onClick={() => executeCommand(command, value)}
        title={title}
        className={`p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${
          isActive 
            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
            : 'text-gray-600 dark:text-gray-400'
        }`}
      >
        {icon}
      </button>
    );
  };

  return (
    <div className={`border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
        <ToolbarButton
          command="bold"
          icon={<Bold size={16} />}
          title="Bold (Ctrl+B)"
        />
        <ToolbarButton
          command="italic"
          icon={<Italic size={16} />}
          title="Italic (Ctrl+I)"
        />
        <ToolbarButton
          command="underline"
          icon={<Underline size={16} />}
          title="Underline (Ctrl+U)"
        />
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        
        <ToolbarButton
          command="insertUnorderedList"
          icon={<List size={16} />}
          title="Bullet List"
        />
        <ToolbarButton
          command="insertOrderedList"
          icon={<ListOrdered size={16} />}
          title="Numbered List"
        />
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        
        <ToolbarButton
          command="formatBlock"
          icon={<Quote size={16} />}
          title="Quote"
          value="blockquote"
        />
        <ToolbarButton
          command="formatBlock"
          icon={<Code size={16} />}
          title="Code Block"
          value="pre"
        />
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        
        <ToolbarButton
          command="undo"
          icon={<Undo size={16} />}
          title="Undo (Ctrl+Z)"
        />
        <ToolbarButton
          command="redo"
          icon={<Redo size={16} />}
          title="Redo (Ctrl+Shift+Z)"
        />
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        className="w-full min-h-32 overflow-y-auto p-3 bg-transparent text-gray-900 dark:text-white focus:outline-none resize-none text-sm leading-relaxed"
        style={{ 
          maxHeight: '50vh',
          fontFamily: 'Inter, sans-serif',
          wordBreak: 'break-word',
          overflowWrap: 'break-word',
          whiteSpace: 'pre-wrap'
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />
      
      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        
        [contenteditable] blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 0.75rem;
          margin: 0.5rem 0;
          font-style: italic;
          color: #6b7280;
        }
        
        .dark [contenteditable] blockquote {
          border-left-color: #4b5563;
          color: #9ca3af;
        }
        
        [contenteditable] pre {
          background-color: #f3f4f6;
          border-radius: 0.5rem;
          padding: 0.5rem;
          margin: 0.5rem 0;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.875rem;
          overflow-x: auto;
        }
        
        .dark [contenteditable] pre {
          background-color: #374151;
        }
        
        [contenteditable] ul, [contenteditable] ol {
          padding-left: 1.25rem;
          margin: 0.5rem 0;
          list-style-position: outside;
        }
        
        [contenteditable] ul {
          list-style-type: disc;
        }
        
        [contenteditable] ol {
          list-style-type: decimal;
        }
        
        [contenteditable] li {
          margin: 0.25rem 0;
          display: list-item;
        }
        
        [contenteditable] strong {
          font-weight: 600;
        }
        
        [contenteditable] em {
          font-style: italic;
        }
        
        [contenteditable] u {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};