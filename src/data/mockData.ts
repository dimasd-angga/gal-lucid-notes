import { Note, Category, Tag } from '../types';

export const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Welcome to Lucid-Notes',
    content: 'This is your first note! Lucid-Notes is a powerful note-taking application that helps you organize your thoughts and ideas. You can create, edit, and organize your notes with ease.',
    createdAt: new Date(2024, 0, 15),
    updatedAt: new Date(2024, 0, 15),
    tags: ['welcome', 'getting-started'],
    category: 'general',
    isFavorite: true,
  },
  {
    id: '2',
    title: 'Project Ideas',
    content: '1. Build a personal portfolio website\n2. Create a todo app with React\n3. Learn TypeScript fundamentals\n4. Contribute to open source projects\n5. Start a tech blog',
    createdAt: new Date(2024, 0, 12),
    updatedAt: new Date(2024, 0, 14),
    tags: ['projects', 'ideas', 'development'],
    category: 'work',
    isFavorite: false,
  },
  {
    id: '3',
    title: 'Learning Resources',
    content: 'Great resources for learning web development:\n\n- MDN Web Docs\n- React Documentation\n- TypeScript Handbook\n- Tailwind CSS Documentation\n- FreeCodeCamp\n- The Odin Project',
    createdAt: new Date(2024, 0, 10),
    updatedAt: new Date(2024, 0, 11),
    tags: ['learning', 'resources', 'development'],
    category: 'education',
    isFavorite: true,
  },
];

export const mockCategories: Category[] = [
  {
    id: 'general',
    name: 'General',
    color: '#6B7280',
    noteCount: 1,
  },
  {
    id: 'work',
    name: 'Work',
    color: '#3B82F6',
    noteCount: 1,
  },
  {
    id: 'education',
    name: 'Education',
    color: '#10B981',
    noteCount: 1,
  },
  {
    id: 'personal',
    name: 'Personal',
    color: '#F59E0B',
    noteCount: 0,
  },
];

export const mockTags: Tag[] = [
  { id: 'welcome', name: 'welcome', noteCount: 1 },
  { id: 'getting-started', name: 'getting-started', noteCount: 1 },
  { id: 'projects', name: 'projects', noteCount: 1 },
  { id: 'ideas', name: 'ideas', noteCount: 1 },
  { id: 'development', name: 'development', noteCount: 2 },
  { id: 'learning', name: 'learning', noteCount: 1 },
  { id: 'resources', name: 'resources', noteCount: 1 },
];