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
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `} style={{ transition: 'transform 0.3s ease-in-out, background-color 0.2s ease-in-out' }}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-primary-500 dark:bg-primary-400 rounded-md flex items-center justify-center mr-2 transition-colors duration-200">
                <span className="text-white font-bold text-xs">LN</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-200">Lucid-Notes</h2>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 transition-colors duration-200">
            <div className="space-y-1">
              {/* Quick Actions */}
              <div className="mb-6">
                <button className="w-full flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 dark:bg-primary-500 rounded-lg hover:bg-primary-700 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 transform hover:scale-105">
                  <Plus size={16} className="mr-2" />
                  New Note
                </button>
              </div>
              
              {/* Main Navigation */}
              <div className="space-y-1">
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 rounded-lg transition-colors duration-200">
                  <FileText size={16} className="mr-3" />
                  All Notes
                </a>
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200">
                  <Star size={16} className="mr-3" />
                  Favorites
                </a>
                <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200">
                  <Archive size={16} className="mr-3" />
                  Archive
                </a>
              </div>
              
              {/* Categories */}
              <div className="mt-6">
                <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-200">
                  Categories
                </h3>
                <div className="mt-2 space-y-1">
                  {categories.map((category) => (
                    <a
                      key={category.id}
                      href="#"
                      className="flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                    >
                      <div className="flex items-center">
                        <Folder size={16} className="mr-3" style={{ color: category.color }} />
                        {category.name}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
                        {category.noteCount}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
              
              {/* Tags */}
              <div className="mt-6">
                <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider transition-colors duration-200">
                  Tags
                </h3>
                <div className="mt-2 space-y-1">
                  {tags.slice(0, 5).map((tag) => (
                    <a
                      key={tag.id}
                      href="#"
                      className="flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
                    >
                      <div className="flex items-center">
                        <Tag size={16} className="mr-3" />
                        {tag.name}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
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