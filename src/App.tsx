import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotesProvider } from './contexts/NotesContext';
import { NotesList } from './components/NotesList';
import { NoteEditor } from './components/NoteEditor';
import { ThemeToggle } from './components/ThemeToggle';

function App() {
  return (
    <ThemeProvider>
      <NotesProvider>
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-all duration-300">
          {/* Header */}
          <header className="fixed top-0 left-0 right-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-soft dark:shadow-soft-dark border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between h-16 px-6">
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
          </header>
          
          {/* Sidebar */}
          <div className="w-80 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-soft dark:shadow-soft-dark border-r border-gray-200/50 dark:border-gray-700/50 mt-16">
            <NotesList />
          </div>
          
          {/* Main Editor */}
          <div className="flex-1 mt-16">
            <NoteEditor />
          </div>
        </div>
      </NotesProvider>
    </ThemeProvider>
  );
}

export default App;