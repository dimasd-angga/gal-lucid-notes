import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Tag } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface TagsState {
  tags: Tag[];
  isLoading: boolean;
  error: string | null;
}

type TagsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TAGS'; payload: Tag[] }
  | { type: 'ADD_TAG'; payload: Tag }
  | { type: 'UPDATE_TAG'; payload: { id: string; updates: Partial<Tag> } }
  | { type: 'DELETE_TAG'; payload: string }
  | { type: 'INCREMENT_TAG_COUNT'; payload: string }
  | { type: 'DECREMENT_TAG_COUNT'; payload: string };

interface TagsContextType extends TagsState {
  createTag: (name: string) => Promise<Tag>;
  updateTag: (id: string, updates: Partial<Tag>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  getTagColor: (tagName: string) => string;
  incrementTagCount: (tagName: string) => void;
  decrementTagCount: (tagName: string) => void;
  getOrCreateTag: (name: string) => Promise<Tag>;
}

const TagsContext = createContext<TagsContextType | undefined>(undefined);

export const useTags = () => {
  const context = useContext(TagsContext);
  if (context === undefined) {
    throw new Error('useTags must be used within a TagsProvider');
  }
  return context;
};

const tagsReducer = (state: TagsState, action: TagsAction): TagsState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_TAGS':
      return { ...state, tags: action.payload };
    case 'ADD_TAG':
      // Prevent duplicate tags
      if (state.tags.some(tag => tag.name.toLowerCase() === action.payload.name.toLowerCase())) {
        return state;
      }
      return { ...state, tags: [...state.tags, action.payload] };
    case 'UPDATE_TAG':
      return {
        ...state,
        tags: state.tags.map(tag =>
          tag.id === action.payload.id
            ? { ...tag, ...action.payload.updates }
            : tag
        )
      };
    case 'DELETE_TAG':
      return {
        ...state,
        tags: state.tags.filter(tag => tag.id !== action.payload)
      };
    case 'INCREMENT_TAG_COUNT':
      return {
        ...state,
        tags: state.tags.map(tag =>
          tag.name === action.payload
            ? { ...tag, count: tag.count + 1 }
            : tag
        )
      };
    case 'DECREMENT_TAG_COUNT':
      return {
        ...state,
        tags: state.tags.map(tag =>
          tag.name === action.payload
            ? { ...tag, count: Math.max(0, tag.count - 1) }
            : tag
        )
      };
    default:
      return state;
  }
};

// Predefined color palette for tags - consistent colors
const TAG_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#A855F7', // Purple
];

const generateId = (): string => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
};

// Generate consistent color based on tag name hash
const getColorForTagName = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    const char = name.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  const index = Math.abs(hash) % TAG_COLORS.length;
  return TAG_COLORS[index];
};

interface TagsProviderProps {
  children: React.ReactNode;
}

export const TagsProvider: React.FC<TagsProviderProps> = ({ children }) => {
  const [storedTags, setStoredTags] = useLocalStorage<Tag[]>('lucid-tags', []);
  
  const [state, dispatch] = useReducer(tagsReducer, {
    tags: storedTags,
    isLoading: false,
    error: null,
  });

  // Sync with localStorage whenever tags change
  useEffect(() => {
    setStoredTags(state.tags);
  }, [state.tags, setStoredTags]);

  const createTag = async (name: string): Promise<Tag> => {
    const trimmedName = name.trim();
    
    // Check if tag already exists (case insensitive)
    const existingTag = state.tags.find(tag => 
      tag.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (existingTag) {
      return existingTag;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const newTag: Tag = {
        id: generateId(),
        name: trimmedName,
        color: getColorForTagName(trimmedName), // Consistent color based on name
        count: 0,
      };

      dispatch({ type: 'ADD_TAG', payload: newTag });
      return newTag;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create tag' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateTag = async (id: string, updates: Partial<Tag>): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      dispatch({ type: 'UPDATE_TAG', payload: { id, updates } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update tag' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteTag = async (id: string): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      dispatch({ type: 'DELETE_TAG', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to delete tag' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const getTagColor = (tagName: string): string => {
    const tag = state.tags.find(t => t.name === tagName);
    if (tag) {
      return tag.color;
    }
    // Return consistent color even if tag doesn't exist yet
    return getColorForTagName(tagName);
  };

  const incrementTagCount = (tagName: string): void => {
    dispatch({ type: 'INCREMENT_TAG_COUNT', payload: tagName });
  };

  const decrementTagCount = (tagName: string): void => {
    dispatch({ type: 'DECREMENT_TAG_COUNT', payload: tagName });
  };

  const getOrCreateTag = async (name: string): Promise<Tag> => {
    const trimmedName = name.trim();
    const existingTag = state.tags.find(tag => 
      tag.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (existingTag) {
      return existingTag;
    }
    
    return await createTag(trimmedName);
  };

  const value: TagsContextType = {
    ...state,
    createTag,
    updateTag,
    deleteTag,
    getTagColor,
    incrementTagCount,
    decrementTagCount,
    getOrCreateTag,
  };

  return (
    <TagsContext.Provider value={value}>
      {children}
    </TagsContext.Provider>
  );
};