import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { NoteCard } from './components/NoteCard';
import { SearchBar } from './components/SearchBar';
import { Note, Category, Tag } from './types';
import { mockNotes, mockCategories, mockTags } from './data/mockData';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Grid, List, Plus } from 'lucide-react';

function App() {
  const [notes, setNotes] = useLocalStorage<Note[]>('notes', mockNotes);
  const [categories] = useLocalStorage<Category[]>('categories', mockCategories);
  const [tags] = useLocalStorage<Tag[]>('tags', mockTags);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredNotes, setFilteredNotes] = useState<Note[]>(notes);

  // Filter notes based on search query
  useEffect(() => {
    if (searchQuery) {
      const filtered = notes.filter(note => 
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredNotes(filtered);
    } else {
      setFilteredNotes(notes);
    }
  }, [notes, searchQuery]);

  const handleToggleFavorite = (noteId: string) => {
    setNotes(notes.map(note => 
      note.id === noteId 
        ? { ...note, isFavorite: !note.isFavorite }
        : note
    ));
  };

  const handleNoteClick = (note: Note) => {
    console.log('Note clicked:', note.title);
    // TODO: Open note editor
  };

  const handleCreateNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: 'Start writing your note here...',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      category: 'general',
      isFavorite: false,
    };
    setNotes([newNote, ...notes]);
  };

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Sidebar 
          isOpen={sidebarOpen}
          categories={categories}
          tags={tags}
          onClose={() => setSidebarOpen(false)}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">
                    All Notes
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 transition-colors duration-200">
                    {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1 transition-colors duration-200">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-all duration-200 transform hover:scale-105 ${
                        viewMode === 'grid' 
                          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <Grid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-all duration-200 transform hover:scale-105 ${
                        viewMode === 'list' 
                          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <List size={16} />
                    </button>
                  </div>
                  
                  <button
                    onClick={handleCreateNote}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 transform hover:scale-105"
                  >
                    <Plus size={16} className="mr-2" />
                    New Note
                  </button>
                </div>
              </div>
              
              {/* Search */}
              <SearchBar 
                onSearch={setSearchQuery}
                onFilterToggle={() => console.log('Filter toggled')}
              />
              
              {/* Notes Grid/List */}
              <div className={`
                ${viewMode === 'grid' 
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' 
                  : 'space-y-4'
                }
              `}>
                {filteredNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onClick={handleNoteClick}
                    onToggleFavorite={handleToggleFavorite}
                  />
                ))}
              </div>
              
              {/* Empty State */}
              {filteredNotes.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 transition-colors duration-200">
                    <Plus size={24} className="text-gray-400 dark:text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 transition-colors duration-200">
                    {searchQuery ? 'No notes found' : 'No notes yet'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-200">
                    {searchQuery 
                      ? 'Try adjusting your search terms or create a new note.' 
                      : 'Get started by creating your first note.'
                    }
                  </p>
                  <button
                    onClick={handleCreateNote}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 dark:bg-primary-500 text-white text-sm font-medium rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-200 transform hover:scale-105"
                  >
                    <Plus size={16} className="mr-2" />
                    Create Note
                  </button>
                </div>
              )}
            </div>
          </Layout>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;