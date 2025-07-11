import React, { useState } from 'react';
import { NotesProvider } from './contexts/NotesContext';
import { TagsProvider } from './contexts/TagsContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { NoteEditor } from './components/NoteEditor';
import { Dashboard } from './components/Dashboard';
import { AnalyticsPanel } from './components/AnalyticsPanel';
import { useNotes } from './contexts/NotesContext';
import { useTags } from './contexts/TagsContext';
import { Menu, X, BarChart3 } from 'lucide-react';
import { ThemeToggle } from './components/ThemeToggle';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'editor'>('dashboard');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { createNote } = useNotes();
  const { tags } = useTags();

  const handleCreateNote = async () => {
    try {
      await createNote();
      setCurrentView('editor');
      setSidebarOpen(false);
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  // Listen for custom events
  React.useEffect(() => {
    const handleSwitchToNotesView = () => setCurrentView('editor');
    const handleCreateNoteEvent = () => handleCreateNote();
    
    window.addEventListener('switchToNotesView', handleSwitchToNotesView);
    window.addEventListener('createNote', handleCreateNoteEvent);
    
    return () => {
      window.removeEventListener('switchToNotesView', handleSwitchToNotesView);
      window.removeEventListener('createNote', handleCreateNoteEvent);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onCreateNote={handleCreateNote}
        currentView={currentView}
        onViewChange={setCurrentView}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-soft dark:shadow-soft-dark border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 lg:hidden transition-all duration-200 transform hover:scale-110 active:scale-95"
                >
                  {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
                
                <div className="hidden lg:flex items-center ml-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 rounded-xl flex items-center justify-center mr-3 shadow-glow dark:shadow-glow-dark">
                    <span className="text-white font-bold text-sm">LN</span>
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent">
                    Lucid-Notes
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowAnalytics(true)}
                  className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-300 transform hover:scale-110 active:scale-95"
                  title="View Analytics"
                >
                  <BarChart3 size={20} />
                </button>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-hidden">
          {currentView === 'dashboard' ? (
            <Dashboard />
          ) : (
            <NoteEditor />
          )}
        </main>
      </div>
      
      {/* Analytics Panel */}
      <AnalyticsPanel 
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
      />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <TagsProvider>
        <NotesProvider>
          <AppContent />
        </NotesProvider>
      </TagsProvider>
    </ThemeProvider>
  );
}

export default App;