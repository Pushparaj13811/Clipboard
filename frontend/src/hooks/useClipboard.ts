import { useState, useEffect, useCallback } from 'react';
import { clipboardService, ClipboardStats, HistoryItem } from '../services/api';
import { socketService } from '../services/socket';

interface UseClipboardResult {
  content: string;
  code: string;
  loading: boolean;
  error: string | null;
  stats: ClipboardStats | null;
  history: HistoryItem[];
  viewersCount: number;
  isOwner: boolean;
  lastUpdated: Date | null;
  saveContent: (content: string) => Promise<void>;
  getContent: (code: string) => Promise<void>;
  updateContent: (content: string) => Promise<void>;
  clearContent: () => void;
  loadHistory: () => Promise<void>;
}

export const useClipboard = (): UseClipboardResult => {
  const [content, setContent] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ClipboardStats | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [viewersCount, setViewersCount] = useState<number>(0);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const userId = clipboardService.getUserId();

  // Setup socket connection
  useEffect(() => {
    socketService.connect();
    return () => {
      socketService.disconnect();
    };
  }, []);

  // Listen for content updates if we have a code
  useEffect(() => {
    if (code) {
      socketService.joinRoom(code, userId);
      
      // Listen for content updates
      socketService.onContentUpdated((data) => {
        // Refresh content when updated
        getContent(code);
        // Update last updated timestamp
        setLastUpdated(new Date(data.timestamp));
      });
      
      // Listen for retrieval count updates
      socketService.onContentRetrieved((data) => {
        if (stats) {
          setStats({
            ...stats,
            retrievalCount: data.count
          });
        }
      });
      
      // Listen for viewers count updates
      socketService.onViewersUpdated((data) => {
        setViewersCount(data.count);
      });
    }

    return () => {
      if (code) {
        socketService.leaveRoom(code);
        socketService.removeListener('content-updated');
        socketService.removeListener('content-retrieved');
        socketService.removeListener('viewers-updated');
      }
    };
  }, [code, userId, stats]);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, []);

  // Save content to the clipboard and get a code
  const saveContent = useCallback(async (text: string) => {
    setLoading(true);
    setError(null);
    try {
      const newCode = await clipboardService.saveToClipboard(text);
      setContent(text);
      setCode(newCode);
      
      // Set initial stats and owner status
      setStats({
        retrievalCount: 0,
        created: Date.now(),
        ownerId: userId
      });
      setIsOwner(true);
      setLastUpdated(new Date());
      
      // Refresh history after creating new clipboard
      await loadHistory();
    } catch (err) {
      setError('Failed to save content. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Update existing clipboard content (only works if user is the creator)
  const updateContent = useCallback(async (newContent: string) => {
    if (!code || !isOwner) {
      setError('You do not have permission to edit this clipboard.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await clipboardService.updateClipboard(code, newContent);
      setContent(newContent);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'Failed to update content. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [code, isOwner]);

  // Get content using a code
  const getContent = useCallback(async (codeToFetch: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await clipboardService.getFromClipboard(codeToFetch);
      setContent(result.content);
      setCode(codeToFetch);
      setStats(result.stats);
      setViewersCount(1); // Initialize with at least the current user
      
      // Check if current user is the owner
      setIsOwner(result.stats.ownerId === userId);
      
      // Set last updated to now (just retrieved)
      setLastUpdated(new Date());
    } catch (err: unknown) {
      const error = err as { response?: { status: number } };
      if (error.response && error.response.status === 404) {
        setError('Clipboard not found or expired.');
      } else {
        setError('Failed to retrieve content. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load user's clipboard history
  const loadHistory = useCallback(async () => {
    try {
      const historyItems = await clipboardService.getHistory();
      setHistory(historyItems);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  }, []);

  // Clear the content and code
  const clearContent = useCallback(() => {
    setContent('');
    setCode('');
    setError(null);
    setStats(null);
    setViewersCount(0);
    setIsOwner(false);
    setLastUpdated(null);
  }, []);

  return {
    content,
    code,
    loading,
    error,
    stats,
    history,
    viewersCount,
    isOwner,
    lastUpdated,
    saveContent,
    getContent,
    updateContent,
    clearContent,
    loadHistory
  };
}; 