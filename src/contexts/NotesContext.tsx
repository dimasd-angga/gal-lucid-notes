import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Note } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface NotesState {
  notes: Note[];
  selectedNoteId: string | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

type NotesAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_NOTES'; payload: Note[] }
  | { type: 'ADD_NOTE'; payload: Note }
  | { type: 'UPDATE_NOTE'; payload: { id: string; updates: Partial<Note> } }
  | { type: 'DELETE_NOTE'; payload: string }
  | { type: 'SELECT_NOTE'; payload: string | null };

interface NotesContextType extends NotesState {
  createNote: () => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  selectNote: (id: string | null) => void;
  getSelectedNote: () => Note | null;
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
  const [storedNotes, setStoredNotes] = useLocalStorage<Note[]>('lucid-notes', []);
  
  const [state, dispatch] = useReducer(notesReducer, {
    notes: storedNotes,
    selectedNoteId: null,
    isLoading: false,
    isSaving: false,
    error: null,
  });

  // Sync with localStorage whenever notes change
  useEffect(() => {
    setStoredNotes(state.notes);
  }, [state.notes, setStoredNotes]);

  const createNote = async (): Promise<Note> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const newNote: Note = {
        id: generateId(),
        title: 'Untitled Note',
        content: '',
        tags: ['general'],
        createdAt: new Date(),
        updatedAt: new Date(),
        aiGenerated: false,
      };

      dispatch({ type: 'ADD_NOTE', payload: newNote });
      return newNote;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create note' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>): Promise<void> => {
    dispatch({ type: 'SET_SAVING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 300));
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
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 200));
      dispatch({ type: 'DELETE_NOTE', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete note' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const selectNote = (id: string | null): void => {
    dispatch({ type: 'SELECT_NOTE', payload: id });
  };

  const getSelectedNote = (): Note | null => {
    return state.notes.find(note => note.id === state.selectedNoteId) || null;
  };

  const value: NotesContextType = {
    ...state,
    createNote,
    updateNote,
    deleteNote,
    selectNote,
    getSelectedNote,
  };

  return (
    <NotesContext.Provider value={value}>
      {children}
    </NotesContext.Provider>
  );
};