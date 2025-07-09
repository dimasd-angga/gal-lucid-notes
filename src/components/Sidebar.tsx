import React from 'react';
import { Plus, FileText, Star, Archive, Tag, Folder } from 'lucide-react';
import { Category, Tag as TagType } from '../types';

interface SidebarProps {
  isOpen: boolean;
  categories: Category[];
  tags: TagType[];
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, categories, tags, onClose }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md shadow-soft dark:shadow-soft-dark border-r border-gray-200/50 dark:border-gray-700/50 transform transition-all duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50 animate-slide-down">
            <div className="flex items-center group">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 dark:from-primary-400 dark:to-primary-500 rounded-xl flex items-center justify-center mr-3 shadow-glow dark:shadow-glow-dark transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <span className="text-white font-bold text-sm">LN</span>
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent transition-all duration-200">
                Lucid-Notes
              </h2>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-6">
            <div className="space-y-1">
              {/* Quick Actions */}
              <div className="mb-6">
                <button className="w-full flex items-center px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 rounded-xl hover:from-primary-700 hover:to-primary-800 dark:hover:from-primary-600 dark:hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-soft dark:shadow-soft-dark transition-all duration-200 transform hover:scale-105 hover:shadow-glow dark:hover:shadow-glow-dark active:scale-95">
                  <Plus size={18} className="mr-3" />
                  New Note
                </button>
              </div>
              
              {/* Main Navigation */}
              <div className="space-y-1">
                <a href="#" className="flex items-center px-4 py-3 text-sm font-semibold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/30 rounded-xl border border-primary-200 dark:border-primary-800 transition-all duration-200 shadow-sm">
                  <FileText size={18} className="mr-3" />
                  All Notes
                </a>
                <a href="#" className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 transform hover:translate-x-1">
                  <Star size={18} className="mr-3" />
                  Favorites
                </a>
                <a href="#" className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 transform hover:translate-x-1">
                  <Archive size={18} className="mr-3" />
                  Archive
                </a>
              </div>
              
              {/* Categories */}
              <div className="mt-6">
                <h3 className="px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Categories
                </h3>
                <div className="mt-2 space-y-1">
                  {categories.map((category) => (
                    <a
                      key={category.id}
                      href="#"
                      className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 transform hover:translate-x-1 group"
                    >
                      <div className="flex items-center">
                        <Folder size={16} className="mr-3 transition-transform duration-200 group-hover:scale-110" style={{ color: category.color }} />
                        {category.name}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full transition-colors duration-200">
                        {category.noteCount}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
              
              {/* Tags */}
              <div className="mt-6">
                <h3 className="px-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  Tags
                </h3>
                <div className="mt-2 space-y-1">
                  {tags.slice(0, 5).map((tag) => (
                    <a
                      key={tag.id}
                      href="#"
                      className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all duration-200 transform hover:translate-x-1 group"
                    >
                      <div className="flex items-center">
                        <Tag size={16} className="mr-3 transition-transform duration-200 group-hover:scale-110" />
                        {tag.name}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full transition-colors duration-200">
                        {tag.noteCount}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};