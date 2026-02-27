import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { api } from '../services/api';
import type { Story, StoryConfig } from '../types';

interface StoryContextType {
  currentStory: Story | null;
  stories: Story[];
  loading: boolean;
  error: string | null;
  createStory: (config: StoryConfig) => Promise<Story>;
  updateStory: (id: string, updates: Partial<Story>) => Promise<void>;
  deleteStory: (id: string) => Promise<void>;
  fetchStories: () => Promise<void>;
  fetchStory: (id: string) => Promise<Story | null>;
  startGeneration: (id: string) => Promise<void>;
  checkProgress: (id: string) => Promise<any>;
  regenerateSection: (id: string, chapterNum: number, blockNum: number, instructions: string) => Promise<void>;
  autoSave: (id: string, content: any) => Promise<void>;
  loadAutoSave: (id: string) => Promise<any>;
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

export function StoryProvider({ children }: { children: ReactNode }) {
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStory = useCallback(async (config: StoryConfig) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post('/stories', config);
      const story = response.data.story;
      setCurrentStory(story);
      setStories(prev => [story, ...prev]);
      return story;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create story');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStory = useCallback(async (id: string, updates: Partial<Story>) => {
    setLoading(true);
    try {
      const response = await api.patch(`/stories/${id}`, updates);
      const updatedStory = response.data.story;
      setCurrentStory(updatedStory);
      setStories(prev => prev.map(s => s.id === id ? updatedStory : s));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update story');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteStory = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await api.delete(`/stories/${id}`);
      setStories(prev => prev.filter(s => s.id !== id));
      if (currentStory?.id === id) {
        setCurrentStory(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete story');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [currentStory]);

  const fetchStories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/stories');
      setStories(response.data.stories);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch stories');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStory = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/stories/${id}`);
      const story = response.data.story;
      setCurrentStory(story);
      return story;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch story');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const startGeneration = useCallback(async (id: string) => {
    setLoading(true);
    try {
      await api.post(`/generate/start/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to start generation');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkProgress = useCallback(async (id: string) => {
    try {
      const response = await api.get(`/generate/progress/${id}`);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to check progress');
      return null;
    }
  }, []);

  const regenerateSection = useCallback(async (id: string, chapterNum: number, blockNum: number, instructions: string) => {
    setLoading(true);
    try {
      await api.post(`/generate/regenerate/${id}`, { chapterNum, blockNum, instructions });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to regenerate section');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const autoSave = useCallback(async (id: string, content: any) => {
    try {
      await api.post(`/users/autosave/${id}`, { content });
    } catch (err) {
      console.error('Auto-save failed:', err);
    }
  }, []);

  const loadAutoSave = useCallback(async (id: string) => {
    try {
      const response = await api.get(`/users/autosave/${id}`);
      return response.data;
    } catch (err) {
      return null;
    }
  }, []);

  return (
    <StoryContext.Provider value={{
      currentStory,
      stories,
      loading,
      error,
      createStory,
      updateStory,
      deleteStory,
      fetchStories,
      fetchStory,
      startGeneration,
      checkProgress,
      regenerateSection,
      autoSave,
      loadAutoSave
    }}>
      {children}
    </StoryContext.Provider>
  );
}

export function useStory() {
  const context = useContext(StoryContext);
  if (context === undefined) {
    throw new Error('useStory must be used within a StoryProvider');
  }
  return context;
}
