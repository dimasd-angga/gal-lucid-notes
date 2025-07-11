import React from 'react';
import { FileText, Clock, Star, TrendingUp, Search } from 'lucide-react';
import { useNotes } from '../contexts/NotesContext';
import { useTags } from '../contexts/TagsContext';
import { TagPill } from './TagPill';
import { SearchBar } from './SearchBar';
import { formatRelativeTime } from '../utils/date';

export const Dashboard: React.FC = () => {
  const { notes, selectNote } = useNotes();
  const { getTagColor } = useTags();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleNoteClick = (noteId: string) => {
    selectNote(noteId);
    // Switch to notes view when clicking on a note
    window.dispatchEvent(new CustomEvent('switchToNotesView'));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Filter notes based on search query
  const filteredNotes = React.useMemo(() => {
    if (!searchQuery.trim()) return notes;
    
    const query = searchQuery.toLowerCase();
    return notes.filter(note => 
      note.title.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      note.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [notes, searchQuery]);

  const recentNotes = [...filteredNotes]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 6);

  const favoriteNotes = filteredNotes.filter(note => note.isFavorite).slice(0, 3);

  const stats = {
    totalNotes: filteredNotes.length,
    recentNotes: recentNotes.length,
    favoriteNotes: favoriteNotes.length,
    totalWords: filteredNotes.reduce((acc, note) => acc + (note.content.trim() ? note.content.trim().split(/\s+/).length : 0), 0)
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Welcome back!
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery ? `Search results for "${searchQuery}"` : "Here's what's happening with your notes today."}
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="w-full lg:w-80">
              <SearchBar 
                onSearch={handleSearch}
                placeholder="Search your notes..."
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 lg:p-6 shadow-soft dark:shadow-soft-dark border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3">
                <FileText size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalNotes}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Notes</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 lg:p-6 shadow-soft dark:shadow-soft-dark border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3">
                <Clock size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.recentNotes}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Recent</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 lg:p-6 shadow-soft dark:shadow-soft-dark border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center mr-3">
                <Star size={20} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.favoriteNotes}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Favorites</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 lg:p-6 shadow-soft dark:shadow-soft-dark border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-3">
                <TrendingUp size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalWords}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Words</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Notes */}
        {recentNotes.length > 0 ? (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {searchQuery ? 'Search Results' : 'Recent Notes'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => handleNoteClick(note.id)}
                  className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 lg:p-6 shadow-soft dark:shadow-soft-dark border border-gray-200/50 dark:border-gray-700/50 cursor-pointer hover:shadow-glow dark:hover:shadow-glow-dark hover:border-primary-200 dark:hover:border-primary-700 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 flex-1 mr-2">
                      {note.title}
                    </h3>
                    {note.isFavorite && (
                      <Star size={16} className="text-yellow-500 dark:text-yellow-400 flex-shrink-0" fill="currentColor" />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3 leading-relaxed">
                    {note.content || 'No content yet...'}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatRelativeTime(note.updatedAt)}</span>
                    {note.tags.length > 0 && (
                      <div className="flex items-center space-x-1">
                        {note.tags.slice(0, 2).map((tag) => (
                          <TagPill
                            key={tag}
                            tag={tag}
                            color={getTagColor(tag)}
                            size="sm"
                          />
                        ))}
                        {note.tags.length > 2 && (
                          <span className="text-primary-600 dark:text-primary-400">
                            +{note.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : searchQuery ? (
          <div className="mb-8">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-soft dark:shadow-soft-dark">
                <Search size={24} className="text-orange-500 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                No results found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                No notes found for "{searchQuery}". Try different keywords or check your spelling.
              </p>
            </div>
          </div>
        ) : null}

        {/* Favorite Notes */}
        {favoriteNotes.length > 0 && !searchQuery && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Favorite Notes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => handleNoteClick(note.id)}
                  className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 backdrop-blur-sm rounded-xl p-4 lg:p-6 shadow-soft dark:shadow-soft-dark border border-yellow-200/50 dark:border-yellow-700/50 cursor-pointer hover:shadow-glow dark:hover:shadow-glow-dark transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1 flex-1 mr-2">
                      {note.title}
                    </h3>
                    <Star size={16} className="text-yellow-500 dark:text-yellow-400 flex-shrink-0" fill="currentColor" />
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3 leading-relaxed">
                    {note.content || 'No content yet...'}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>{formatRelativeTime(note.updatedAt)}</span>
                    {note.tags.length > 0 && (
                      <div className="flex items-center space-x-1">
                        {note.tags.slice(0, 2).map((tag) => (
                          <TagPill
                            key={tag}
                            tag={tag}
                            color={getTagColor(tag)}
                            size="sm"
                          />
                        ))}
                        {note.tags.length > 2 && (
                          <span className="text-yellow-600 dark:text-yellow-400">
                            +{note.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {notes.length === 0 && !searchQuery && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-soft dark:shadow-soft-dark">
              <FileText size={32} className="text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
              Welcome to Lucid-Notes!
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed mb-6">
              Start your journey by creating your first note. Organize your thoughts, ideas, and inspirations all in one place.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Use the "New Note" button in the sidebar to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};