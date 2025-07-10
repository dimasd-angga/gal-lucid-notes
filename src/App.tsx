import React, { useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotesProvider } from './contexts/NotesContext';
import { TagsProvider } from './contexts/TagsContext';
import { Dashboard } from './components/Dashboard';
import { NotesList } from './components/NotesList';
import { NoteEditor } from './components/NoteEditor';
import { TagFilter } from './components/TagFilter';
import { ThemeToggle } from './components/ThemeToggle';
import { SearchBar } from './components/SearchBar';
import { Menu, X, Home, FileText, Plus } from 'lucide-react';
import { useNotes } from './contexts/NotesContext';

type View = 'dashboard' | 'notes';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTagFilters, setSelectedTagFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Listen for custom event to switch to notes view
  React.useEffect(() => {
    const handleSwitchToNotesView = () => {
      setCurrentView('notes');
      setSidebarOpen(false);
    };

    const handleClearFilters = () => {
      setSearchQuery('');
      setSelectedTagFilters([]);
    };

    const handleCreateNote = () => {
      // This will be handled by the CreateNoteButton component
      document.querySelector('[data-create-note]')?.click();
    };

    window.addEventListener('switchToNotesView', handleSwitchToNotesView);
    window.addEventListener('clearFilters', handleClearFilters);
    window.addEventListener('createNote', handleCreateNote);
    
    return () => {
      window.removeEventListener('switchToNotesView', handleSwitchToNotesView);
      window.removeEventListener('clearFilters', handleClearFilters);
      window.removeEventListener('createNote', handleCreateNote);
    };
  }, []);

  const handleTagToggle = (tag: string) => {
    setSelectedTagFilters(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleClearTagFilters = () => {
    setSelectedTagFilters([]);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <ThemeProvider>
      <TagsProvider>
        <NotesProvider>
          <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-all duration-300">
          {/* Mobile Header */}
          <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-soft dark:shadow-soft-dark border-b border-gray-200/50 dark:border-gray-700/50 lg:hidden">
            <div className="flex items-center justify-between h-14 px-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              
              <div className="flex items-center">
                <div className="w-7 h-7 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 rounded-lg flex items-center justify-center mr-2">
                  <span className="text-white font-bold text-xs">LN</span>
                </div>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                  Lucid-Notes
                </h1>
              </div>
              
              <ThemeToggle />
            </div>
          </header>

          {/* Mobile Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          
          {/* Sidebar */}
          <div className={`
            fixed inset-y-0 left-0 z-30 w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-soft dark:shadow-soft-dark border-r border-gray-200/50 dark:border-gray-700/50 transform transition-transform duration-300 ease-in-out flex flex-col
            lg:relative lg:translate-x-0 lg:z-10
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between h-16 px-6 border-b border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center group">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 rounded-xl flex items-center justify-center mr-3 shadow-glow dark:shadow-glow-dark transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <span className="text-white font-bold text-sm">LN</span>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent transition-all duration-200">
                  Lucid-Notes
                </h1>
              </div>
              
              <ThemeToggle />
            </div>

            {/* Navigation */}
            <div className="p-4 mt-14 lg:mt-0 flex-shrink-0">
              {/* Create Note Button - Always at top */}
              <div className="mb-6">
                <CreateNoteButton />
              </div>
              
              <div className="space-y-2 mb-6">
                <button
                  onClick={() => {
                    setCurrentView('dashboard');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    currentView === 'dashboard'
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Home size={18} className="mr-3" />
                  Dashboard
                </button>
                
                <button
                  onClick={() => {
                    setCurrentView('notes');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    currentView === 'notes'
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <FileText size={18} className="mr-3" />
                  All Notes
                </button>
              </div>
            </div>

            {/* Notes List - only show when in notes view */}
            {currentView === 'notes' && (
              <div className="flex-1 flex flex-col min-h-0">
                <SearchBar 
                  onSearch={handleSearch}
                  placeholder="Search notes..."
                />
                <NotesList 
                  selectedTagFilters={selectedTagFilters} 
                  searchQuery={searchQuery}
                />
                <TagFilter
                  selectedTags={selectedTagFilters}
                  onTagToggle={handleTagToggle}
                  onClearAll={handleClearTagFilters}
                />
              </div>
            )}
          </div>
          
          {/* Main Content */}
          <div className="flex-1 pt-14 lg:pt-0">
            {currentView === 'dashboard' ? <Dashboard /> : <NoteEditor />}
          </div>
          </div>
        </NotesProvider>
      </TagsProvider>
    </ThemeProvider>
  );
}

// Create Note Button Component
const CreateNoteButton: React.FC = () => {
  const { createNote, isLoading } = useNotes();

  const handleCreateNote = async () => {
    try {
      await createNote();
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  return (
    <button
      data-create-note
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
  );
};

export default App;