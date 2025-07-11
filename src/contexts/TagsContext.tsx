import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Tag as TagType } from '../types';
import { tagsApi, Tag as SupabaseTag } from '../lib/supabase';

// Convert Supabase tag to app tag format
const convertSupabaseTag = (tag: SupabaseTag): TagType => ({
  id: tag.id,
  name: tag.name,
  color: tag.color,
  count: tag.count
});

interface TagsState {
  tags: TagType[];
  isLoading: boolean;
  error: string | null;
}

type TagsAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TAGS'; payload: TagType[] }
  | { type: 'ADD_TAG'; payload: TagType }
  | { type: 'UPDATE_TAG'; payload: { id: string; updates: Partial<TagType> } }
  | { type: 'DELETE_TAG'; payload: string }
  | { type: 'INCREMENT_TAG_COUNT'; payload: string }
  | { type: 'DECREMENT_TAG_COUNT'; payload: string };

interface TagsContextType extends TagsState {
  createTag: (name: string) => Promise<TagType>;
  updateTag: (id: string, updates: Partial<TagType>) => Promise<void>;
  deleteTag: (id: string) => Promise<void>;
  getTagColor: (tagName: string) => string;
  incrementTagCount: (tagName: string) => void;
  decrementTagCount: (tagName: string) => void;
  getOrCreateTag: (name: string) => Promise<TagType>;
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
  const [state, dispatch] = useReducer(tagsReducer, {
    tags: [],
    isLoading: false,
    error: null,
  });

  // Load tags from Supabase on mount
  useEffect(() => {
    const loadTags = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const supabaseTags = await tagsApi.getAll();
        const tags = supabaseTags.map(convertSupabaseTag);
        dispatch({ type: 'SET_TAGS', payload: tags });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load tags' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadTags();
  }, []);

  const createTag = async (name: string): Promise<TagType> => {
  const trimmedName = name.trim();
  
  // Check if tag already exists in local state (case insensitive)
  const existingTag = state.tags.find(tag => 
    tag.name.toLowerCase() === trimmedName.toLowerCase()
  );
  
  if (existingTag) {
    return existingTag;
  }

  dispatch({ type: 'SET_LOADING', payload: true });
  dispatch({ type: 'SET_ERROR', payload: null });

  try {
    const tagData = {
      name: trimmedName,
      color: getColorForTagName(trimmedName),
      count: 0,
    };

    // Use the new createOrGet method instead of create
    const supabaseTag = await tagsApi.createOrGet(tagData);
    const newTag = convertSupabaseTag(supabaseTag);
    
    dispatch({ type: 'ADD_TAG', payload: newTag });
    return newTag;
  } catch (error) {
    dispatch({ type: 'SET_ERROR', payload: 'Failed to create tag' });
    throw error;
  } finally {
    dispatch({ type: 'SET_LOADING', payload: false });
  }
};

// Simplified getOrCreateTag since createTag now handles duplicates
const getOrCreateTag = async (name: string): Promise<TagType> => {
  const trimmedName = name.trim();
  const existingTag = state.tags.find(tag => 
    tag.name.toLowerCase() === trimmedName.toLowerCase()
  );
  
  if (existingTag) {
    return existingTag;
  }
  
  return await createTag(trimmedName);
};

  const updateTag = async (id: string, updates: Partial<TagType>): Promise<void> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      await tagsApi.update(id, updates);
      dispatch({ type: 'UPDATE_TAG', payload: { id, updates } });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update tag' });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteTag = async (id: string, options: { safe?: boolean; force?: boolean } = {}): Promise<void> => {
  dispatch({ type: 'SET_LOADING', payload: true });
  dispatch({ type: 'SET_ERROR', payload: null });

  try {
    // Find the tag to get its name
    const tagToDelete = state.tags.find(tag => tag.id === id);
    
    if (!tagToDelete) {
      throw new Error('Tag not found in local state');
    }

    console.log('Deleting tag:', tagToDelete);

    // Check if tag is being used by any notes
    const usageDetails = await tagsApi.getTagUsageDetails(tagToDelete.name);
    console.log(`Tag "${tagToDelete.name}" is used by ${usageDetails.count} notes`);

    if (usageDetails.count > 0) {
      if (options.force) {
        // Force delete: just delete the tag
        console.log('Force deleting tag...');
        await tagsApi.forceDelete(id);
      } else if (options.safe) {
        // Safe delete: remove from all notes first
        console.log('Safe deleting tag...');
        await tagsApi.safeDelete(id);
      } else {
        // Default: prevent deletion and show which notes are using it
        const notesList = usageDetails.notes
          .map(note => `"${note.title}"`)
          .slice(0, 5)
          .join(', ');
        
        const moreNotesText = usageDetails.count > 5 ? ` and ${usageDetails.count - 5} more` : '';
        
        throw new Error(
          `Cannot delete tag "${tagToDelete.name}" because it's used by ${usageDetails.count} note(s): ${notesList}${moreNotesText}. ` +
          'Remove the tag from all notes first, or use safe delete to remove it automatically.'
        );
      }
    } else {
      // Tag is not being used, safe to delete
      await tagsApi.delete(id);
    }
    
    // Remove from local state only after successful database deletion
    dispatch({ type: 'DELETE_TAG', payload: id });
    
    console.log('Tag deleted successfully');
  } catch (error: any) {
    console.error('Failed to delete tag:', error);
    dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to delete tag' });
    throw error;
  } finally {
    dispatch({ type: 'SET_LOADING', payload: false });
  }
};

// Additional helper functions for your TagsContext
const safeDeleteTag = async (id: string): Promise<void> => {
  return deleteTag(id, { safe: true });
};

const forceDeleteTag = async (id: string): Promise<void> => {
  return deleteTag(id, { force: true });
};

const deleteMultipleTags = async (ids: string[], safe: boolean = false): Promise<void> => {
  dispatch({ type: 'SET_LOADING', payload: true });
  dispatch({ type: 'SET_ERROR', payload: null });

  try {
    if (safe) {
      await tagsApi.safeDeleteMultiple(ids);
    } else {
      await tagsApi.deleteMultiple(ids);
    }
    
    // Remove from local state
    ids.forEach(id => {
      dispatch({ type: 'DELETE_TAG', payload: id });
    });
    
    console.log('Multiple tags deleted successfully');
  } catch (error: any) {
    console.error('Failed to delete multiple tags:', error);
    dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to delete tags' });
    throw error;
  } finally {
    dispatch({ type: 'SET_LOADING', payload: false });
  }
};

const cleanupUnusedTags = async (): Promise<void> => {
  dispatch({ type: 'SET_LOADING', payload: true });
  dispatch({ type: 'SET_ERROR', payload: null });

  try {
    // Get unused tags first
    const unusedTags = await tagsApi.getUnusedTags();
    
    // Delete them
    await tagsApi.cleanupUnusedTags();
    
    // Remove from local state
    unusedTags.forEach(tag => {
      dispatch({ type: 'DELETE_TAG', payload: tag.id });
    });
    
    console.log(`Cleaned up ${unusedTags.length} unused tags`);
  } catch (error: any) {
    console.error('Failed to cleanup unused tags:', error);
    dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to cleanup tags' });
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
    tagsApi.incrementCount(tagName).catch(console.error);
    dispatch({ type: 'INCREMENT_TAG_COUNT', payload: tagName });
  };

  const decrementTagCount = (tagName: string): void => {
    tagsApi.decrementCount(tagName).catch(console.error);
    dispatch({ type: 'DECREMENT_TAG_COUNT', payload: tagName });
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