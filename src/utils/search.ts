import { Note, SearchFilters } from '../types';

export const searchNotes = (notes: Note[], filters: SearchFilters): Note[] => {
  return notes.filter(note => {
    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase();
      const titleMatch = note.title.toLowerCase().includes(query);
      const contentMatch = note.content.toLowerCase().includes(query);
      const tagsMatch = note.tags.some(tag => 
        tag.toLowerCase().includes(query)
      );
      
      if (!titleMatch && !contentMatch && !tagsMatch) {
        return false;
      }
    }

    // Category filter
    if (filters.category && note.category !== filters.category) {
      return false;
    }

    // Tags filter
    if (filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag => 
        note.tags.includes(tag)
      );
      if (!hasMatchingTag) {
        return false;
      }
    }

    // Date range filter
    if (filters.dateRange.start && note.createdAt < filters.dateRange.start) {
      return false;
    }
    if (filters.dateRange.end && note.createdAt > filters.dateRange.end) {
      return false;
    }

    return true;
  });
};

export const highlightSearchTerm = (text: string, query: string): string => {
  if (!query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 dark:bg-yellow-800">$1</mark>');
};