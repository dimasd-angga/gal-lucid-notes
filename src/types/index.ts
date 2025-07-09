export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isFavorite?: boolean;
  aiGenerated?: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  noteCount: number;
}

export interface Tag {
  id: string;
  name: string;
  noteCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AppState {
  notes: Note[];
  categories: Category[];
  tags: Tag[];
  user: User | null;
  darkMode: boolean;
  sidebarOpen: boolean;
}

export interface SearchFilters {
  query: string;
  category: string;
  tags: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}