import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Note as NoteType } from '../types';
import { notesApi, Note as SupabaseNote } from '../lib/supabase';

// Convert Supabase note to app note format
const convertSupabaseNote = (note: SupabaseNote): NoteType => ({
  id: note.id,
  title: note.title,
  content: note.content,
  tags: note.tags,
  createdAt: new Date(note.created_at),
  updatedAt: new Date(note.updated_at),
  isFavorite: note.is_favorite,
  aiGenerated: note.ai_generated
});

// Convert app note to Supabase format
const convertToSupabaseNote = (note: Partial<NoteType>): Partial<SupabaseNote> => ({
  title: note.title,
  content: note.content,
  tags: note.tags,
  is_favorite: note.isFavorite,
  ai_generated: note.aiGenerated
});

interface NotesState {
  notes: NoteType[];
  selectedNoteId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

type NotesAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NOTES'; payload: NoteType[] }
  | { type: 'ADD_NOTE'; payload: NoteType }
  | { type: 'UPDATE_NOTE'; payload: { id: string; updates: Partial<NoteType> } }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'SELECT_NOTE'; payload: string | null };

interface NotesContextType extends NotesState {
  createNote: () => Promise<NoteType>;
  updateNote: (id: string, updates: Partial<NoteType>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  selectNote: (id: string | null) => void;
  toggleFavorite: (id: string) => Promise<void>;
  getSelectedNote: () => NoteType | null;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};

const notesReducer = (state: NotesState, action: NotesAction): NotesState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_NOTES':
      return { ...state, notes: action.payload };
    case 'ADD_NOTE':
      return { 
        ...state, 
        notes: [action.payload, ...state.notes],
        selectedNoteId: action.payload.id
      };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(note =>
          note.id === action.payload.id
            ? { ...note, ...action.payload.updates, updatedAt: new Date() }
            : note
        )
      };
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter(note => note.id !== action.payload),
        selectedNoteId: state.selectedNoteId === action.payload ? null : state.selectedNoteId
      };
    case 'SELECT_NOTE':
      return { ...state, selectedNoteId: action.payload };
    default:
      return state;
  }
};

const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

interface NotesProviderProps {
  children: React.ReactNode;
}

export const NotesProvider: React.FC<NotesProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(notesReducer, {
    notes: [],
    selectedNoteId: null,
    isLoading: false,
    isSaving: false,
    error: null,
  });

  // Load notes from Supabase on mount
  useEffect(() => {
    const loadNotes = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const supabaseNotes = await notesApi.getAll();
        const notes = supabaseNotes.map(convertSupabaseNote);
        dispatch({ type: 'SET_NOTES', payload: notes });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load notes' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadNotes();
  }, []);

  const createNote = async (): Promise<NoteType> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const noteData = {
        title: 'Untitled Note',
        content: '',
        tags: [],
        is_favorite: false,
        ai_generated: false,
      };

      const supabaseNote = await notesApi.create(noteData);
      const newNote = convertSupabaseNote(supabaseNote);
      
      dispatch({ type: 'ADD_NOTE', payload: newNote });
      dispatch({ type: 'SELECT_NOTE', payload: newNote.id });
      
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('switchToNotesView'));
      }, 100);
      
      return newNote;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create note' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateNote = async (id: string, updates: Partial<NoteType>): Promise<void> => {
    dispatch({ type: 'SET_SAVING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const supabaseUpdates = convertToSupabaseNote(updates);
      const updatedSupabaseNote = await notesApi.update(id, supabaseUpdates);
      const updatedNote = convertSupabaseNote(updatedSupabaseNote);
      
      dispatch({ type: 'UPDATE_NOTE', payload: { id, updates } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to save note' });
      throw error;
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  };

  const deleteNote = async (id: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      await notesApi.delete(id);
      dispatch({ type: 'DELETE_NOTE', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete note' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const toggleFavorite = async (id: string): Promise<void> => {
    const note = state.notes.find(n => n.id === id);
    if (!note) return;

    try {
      await updateNote(id, { isFavorite: !note.isFavorite });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update favorite status' });
      throw error;
    }
  };

  const selectNote = (id: string | null): void => {
    dispatch({ type: 'SELECT_NOTE', payload: id });
  };

  const getSelectedNote = (): NoteType | null => {
    return state.notes.find(note => note.id === state.selectedNoteId) || null;
  };

  const value: NotesContextType = {
    ...state,
    createNote,
    updateNote,
    deleteNote,
    toggleFavorite,
    selectNote,
    getSelectedNote,
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
};