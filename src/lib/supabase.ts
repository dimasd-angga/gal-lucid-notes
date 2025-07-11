import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qflfmxvpqbafylvwitom.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFmbGZteHZwcWJhZnlsdndpdG9tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyMDA5MTIsImV4cCI6MjA2Nzc3NjkxMn0.nOAUxUqIfq5CZT3HjcXS3PtKu1xQ9t1an012Yp1uQKs';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
  ai_generated: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  count: number;
}

export interface AIUsage {
  id: string;
  feature: string;
  success: boolean;
  created_at: string;
  response_time?: number;
  user_id?: string;
}

export interface AnalyticsData {
  totalNotes: number;
  notesThisWeek: number;
  totalWords: number;
  avgWordsPerNote: number;
  favoriteNotes: number;
  totalTags: number;
  aiUsage: {
    autoTitle: number;
    summarize: number;
    expand: number;
    help: number;
    total: number;
  };
  topTags: string[];
  notesTimeline: Array<{ date: string; count: number }>;
  tagDistribution: Array<{ name: string; count: number; color: string }>;
}
// Notes API
export const notesApi = {
  async getAll(): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(note: Omit<Note, 'id' | 'created_at' | 'updated_at'>): Promise<Note> {
    const { data, error } = await supabase
      .from('notes')
      .insert([{
        ...note,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;

    // Handle tags after note creation
    if (note.tags && note.tags.length > 0) {
      await tagsApi.handleNoteTags([], note.tags);
    }

    return data;
  },

  async update(id: string, updates: Partial<Note>): Promise<Note> {
    // Get current note to compare tags
    let currentNote: Note | null = null;
    if (updates.tags) {
      const { data: current } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single();
      currentNote = current;
    }

    const { data, error } = await supabase
      .from('notes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;

    // Handle tag changes
    if (updates.tags && currentNote) {
      await tagsApi.handleNoteTags(currentNote.tags || [], updates.tags);
    }

    return data;
  },

  async delete(id: string): Promise<void> {
    // Get note to handle tag cleanup
    const { data: note } = await supabase
      .from('notes')
      .select('tags')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Clean up tag counts
    if (note?.tags) {
      await tagsApi.handleNoteTags(note.tags, []);
    }
  },

  // Get all notes that use a specific tag
  async getNotesWithTag(tagName: string): Promise<Note[]> {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .contains('tags', [tagName]);

    if (error) throw error;
    return data || [];
  },

  // Remove a tag from all notes
  async removeTagFromAllNotes(tagName: string): Promise<void> {
    const notesWithTag = await this.getNotesWithTag(tagName);
    
    for (const note of notesWithTag) {
      const updatedTags = note.tags.filter(tag => tag !== tagName);
      await this.update(note.id, { tags: updatedTags });
    }
  }
};

// Tags API with comprehensive deletion functionality
export const tagsApi = {
  async getAll(): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('count', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(tag: Omit<Tag, 'id'>): Promise<Tag> {
    const { data, error } = await supabase
      .from('tags')
      .insert([tag])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: string, updates: Partial<Tag>): Promise<Tag> {
    const { data, error } = await supabase
      .from('tags')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete tag by ID
  async delete(id: string): Promise<void> {
    console.log('Attempting to delete tag with ID:', id);
    
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }
    
    console.log('Tag successfully deleted from database');
  },

  // Delete tag by name
  async deleteByName(name: string): Promise<void> {
    console.log('Attempting to delete tag with name:', name);
    
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('name', name);

    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }
    
    console.log('Tag successfully deleted from database');
  },

  // Safe delete: Remove tag from all notes first, then delete tag
  async safeDelete(id: string): Promise<void> {
    console.log('Performing safe delete for tag ID:', id);
    
    // First, get the tag to find its name
    const { data: tag, error: fetchError } = await supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching tag:', fetchError);
      throw fetchError;
    }

    if (!tag) {
      throw new Error('Tag not found');
    }

    // Remove tag from all notes
    await notesApi.removeTagFromAllNotes(tag.name);
    
    // Now delete the tag
    await this.delete(id);
    
    console.log(`Tag "${tag.name}" safely deleted`);
  },

  // Force delete: Delete tag even if it's being used (dangerous!)
  async forceDelete(id: string): Promise<void> {
    console.log('Performing force delete for tag ID:', id);
    
    // Just delete the tag directly
    await this.delete(id);
    
    console.log('Tag force deleted');
  },

  // Check if tag is being used by any notes
  async getTagUsage(tagName: string): Promise<number> {
    const { data, error } = await supabase
      .from('notes')
      .select('id')
      .contains('tags', [tagName]);

    if (error) {
      console.error('Error checking tag usage:', error);
      return 0;
    }

    return data?.length || 0;
  },

  // Get detailed tag usage info
  async getTagUsageDetails(tagName: string): Promise<{ count: number; notes: Note[] }> {
    const notes = await notesApi.getNotesWithTag(tagName);
    return {
      count: notes.length,
      notes: notes
    };
  },

  // Delete multiple tags at once
  async deleteMultiple(ids: string[]): Promise<void> {
    console.log('Deleting multiple tags:', ids);
    
    const { error } = await supabase
      .from('tags')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('Error deleting multiple tags:', error);
      throw error;
    }
    
    console.log('Multiple tags deleted successfully');
  },

  // Safe delete multiple tags
  async safeDeleteMultiple(ids: string[]): Promise<void> {
    console.log('Performing safe delete for multiple tags:', ids);
    
    // Process each tag individually to ensure proper cleanup
    for (const id of ids) {
      await this.safeDelete(id);
    }
    
    console.log('Multiple tags safely deleted');
  },

  async createOrGet(tagData: Omit<Tag, 'id'> | string, color: string = '#3B82F6'): Promise<Tag> {
    // Handle both string and object inputs
    const name = typeof tagData === 'string' ? tagData : tagData.name;
    const tagColor = typeof tagData === 'string' ? color : tagData.color;
    const count = typeof tagData === 'string' ? 0 : tagData.count || 0;

    // First try to get existing tag
    const { data: existingTag } = await supabase
      .from('tags')
      .select('*')
      .eq('name', name)
      .single();

    if (existingTag) {
      return existingTag;
    }

    // If doesn't exist, create new one
    const { data, error } = await supabase
      .from('tags')
      .insert([{ name, color: tagColor, count }])
      .select()
      .single();
    
    if (error) {
      // If there's a conflict (race condition), try to get the existing tag
      if (error.code === '23505') {
        const { data: existingTag } = await supabase
          .from('tags')
          .select('*')
          .eq('name', name)
          .single();
        if (existingTag) return existingTag;
      }
      throw error;
    }
    
    return data;
  },

  async incrementCount(name: string): Promise<void> {
    const { error } = await supabase.rpc('increment_tag_count', { tag_name: name });
    if (error) throw error;
  },

  async decrementCount(name: string): Promise<void> {
    const { error } = await supabase.rpc('decrement_tag_count', { tag_name: name });
    if (error) throw error;
  },

  async handleNoteTags(oldTags: string[] = [], newTags: string[] = []): Promise<void> {
    try {
      // Find removed tags
      const removedTags = oldTags.filter(tag => !newTags.includes(tag));
      
      // Find added tags
      const addedTags = newTags.filter(tag => !oldTags.includes(tag));

      // Process removed tags
      for (const tagName of removedTags) {
        await this.decrementCount(tagName);
      }

      // Process added tags
      for (const tagName of addedTags) {
        // Ensure tag exists
        await this.createOrGet(tagName);
        // Increment count
        await this.incrementCount(tagName);
      }
    } catch (error) {
      console.error('Error handling note tags:', error);
      throw error;
    }
  },

  // Clean up unused tags (count = 0)
  async cleanupUnusedTags(): Promise<void> {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('count', 0);
    
    if (error) throw error;
  },

  // Get all unused tags
  async getUnusedTags(): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .eq('count', 0);
    
    if (error) throw error;
    return data || [];
  }
};

// AI Usage API
export const aiUsageApi = {
  async track(feature: string, success: boolean, responseTime?: number): Promise<void> {
    const { error } = await supabase
      .from('ai_usage')
      .insert([{
        feature,
        success,
        response_time: responseTime,
        created_at: new Date().toISOString()
      }]);
    
    if (error) {
      console.error('Failed to track AI usage:', error);
      // Don't throw error to avoid disrupting user experience
    }
  },

  async getUsageStats(): Promise<{
    autoTitle: number;
    summarize: number;
    expand: number;
    help: number;
    total: number;
  }> {
    const { data, error } = await supabase
      .from('ai_usage')
      .select('feature')
      .eq('success', true);
    
    if (error) {
      console.error('Failed to get AI usage stats:', error);
      return { autoTitle: 0, summarize: 0, expand: 0, help: 0, total: 0 };
    }

    const stats = {
      autoTitle: 0,
      summarize: 0,
      expand: 0,
      help: 0,
      total: data?.length || 0
    };

    console.log({data})

    data?.forEach(record => {
      switch (record.feature) {
        case 'auto-title':
          stats.autoTitle++;
          break;
        case 'summarize':
          stats.summarize++;
          break;
        case 'expand':
          stats.expand++;
          break;
        case 'help':
          stats.help++;
          break;
      }
    });

    return stats;
  }
};

// Analytics API
export const analyticsApi = {
  async getAnalyticsData(): Promise<AnalyticsData> {
    try {
      // Get all notes
      const notes = await notesApi.getAll();
      
      // Get all tags
      const tags = await tagsApi.getAll();
      
      // Get AI usage stats
      const aiUsage = await aiUsageApi.getUsageStats();
      
      // Calculate analytics
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const notesThisWeek = notes.filter(note => 
        new Date(note.created_at) >= weekAgo
      ).length;
      
      const totalWords = notes.reduce((acc, note) => {
        const wordCount = note.content.trim() ? 
          note.content.trim().split(/\s+/).length : 0;
        return acc + wordCount;
      }, 0);
      
      const avgWordsPerNote = notes.length > 0 ? 
        Math.round(totalWords / notes.length) : 0;
      
      const favoriteNotes = notes.filter(note => note.is_favorite).length;
      
      const topTags = tags
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(tag => tag.name);
      
      // Generate timeline data (last 30 days)
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const notesTimeline: Array<{ date: string; count: number }> = [];
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const count = notes.filter(note => 
          note.created_at.split('T')[0] === dateStr
        ).length;
        
        notesTimeline.push({
          date: dateStr,
          count
        });
      }
      
      // Tag distribution for pie chart
      const tagDistribution = tags
        .filter(tag => tag.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 8)
        .map(tag => ({
          name: tag.name,
          count: tag.count,
          color: tag.color
        }));
      
      return {
        totalNotes: notes.length,
        notesThisWeek,
        totalWords,
        avgWordsPerNote,
        favoriteNotes,
        totalTags: tags.length,
        aiUsage,
        topTags,
        notesTimeline,
        tagDistribution
      };
    } catch (error) {
      console.error('Failed to get analytics data:', error);
      // Return default data structure
      return {
        totalNotes: 0,
        notesThisWeek: 0,
        totalWords: 0,
        avgWordsPerNote: 0,
        favoriteNotes: 0,
        totalTags: 0,
        aiUsage: { autoTitle: 0, summarize: 0, expand: 0, help: 0, total: 0 },
        topTags: [],
        notesTimeline: [],
        tagDistribution: []
      };
    }
  }
}