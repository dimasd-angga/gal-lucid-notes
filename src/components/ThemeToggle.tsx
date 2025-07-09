import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-300 transform hover:scale-110 active:scale-95 shadow-soft dark:shadow-soft-dark hover:shadow-glow dark:hover:shadow-glow-dark"
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      <div className="transition-transform duration-500 ease-in-out hover:rotate-180">
        {theme === 'dark' ? 
          <Sun size={20} className="text-yellow-500 dark:text-yellow-400" /> : 
          <Moon size={20} className="text-indigo-600 dark:text-indigo-400" />
        }
      </div>
    </button>
  );
};