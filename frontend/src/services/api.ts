import axios from 'axios';

const API_URL = 'http://localhost:4000/api';

// Generate a pseudo-random user ID if not already in localStorage
const getUserId = (): string => {
  let userId = localStorage.getItem('clipboard_user_id');
  if (!userId) {
    userId = 'user_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('clipboard_user_id', userId);
  }
  return userId;
};

export interface ClipboardStats {
  retrievalCount: number;
  created: number;
  ownerId: string | null;
}

export interface HistoryItem {
  code: string;
  preview: string;
  retrievalCount: number;
  created: number | null;
}

// Helper to check Redis connection
const checkRedisConnection = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_URL}/health`);
    return response.data.status === 'ok' && response.data.redis === 'connected';
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
};

// Helper to format error messages
const formatErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error) && error.response) {
    // Server responded with an error status
    if (error.response.status === 503) {
      return 'Redis database not connected. Please make sure Redis is running.';
    }
    return error.response.data?.error || 'Server error occurred';
  } else if (axios.isAxiosError(error) && error.request) {
    // Request was made but no response
    return 'No response from server. Is the server running?';
  } else {
    // Something else happened
    const err = error as Error;
    return err.message || 'An unknown error occurred';
  }
};

export const clipboardService = {
  /**
   * Save content to clipboard and get a unique code
   * @param content Text content to save
   * @returns Promise with the generated unique code
   */
  saveToClipboard: async (content: string): Promise<string> => {
    try {
      // Check if Redis is connected first
      const isRedisConnected = await checkRedisConnection();
      if (!isRedisConnected) {
        throw new Error('Redis database not connected. Please make sure Redis is running.');
      }
      
      const userId = getUserId();
      const response = await axios.post(`${API_URL}/clipboard`, { 
        content,
        userId 
      });
      return response.data.code;
    } catch (error) {
      console.error('Error saving to clipboard:', error);
      throw new Error(formatErrorMessage(error));
    }
  },

  /**
   * Retrieve content from clipboard using a code
   * @param code Unique code to retrieve content
   * @returns Promise with the clipboard content and stats
   */
  getFromClipboard: async (code: string): Promise<{ content: string; stats: ClipboardStats }> => {
    try {
      const response = await axios.get(`${API_URL}/clipboard/${code}`);
      return {
        content: response.data.content,
        stats: response.data.stats
      };
    } catch (error) {
      console.error('Error retrieving from clipboard:', error);
      throw new Error(formatErrorMessage(error));
    }
  },

  /**
   * Get user's clipboard history
   * @returns Promise with the user's clipboard history
   */
  getHistory: async (): Promise<HistoryItem[]> => {
    try {
      const userId = getUserId();
      const response = await axios.get(`${API_URL}/history/${userId}`);
      return response.data.history;
    } catch (error) {
      console.error('Error retrieving history:', error);
      return [];
    }
  },

  /**
   * Check if the backend services are available
   * @returns Promise with connection status
   */
  checkConnection: checkRedisConnection,

  /**
   * Get the current user ID
   * @returns The user ID
   */
  getUserId: getUserId,

  /**
   * Update clipboard content (only works for original creator)
   * @param code Unique code for the clipboard to update
   * @param content New content to save
   * @returns Promise with success status
   */
  updateClipboard: async (code: string, content: string): Promise<boolean> => {
    try {
      const userId = getUserId();
      
      const response = await axios.put(`${API_URL}/clipboard/${code}`, {
        content,
        userId
      });
      
      return response.data.success;
    } catch (error) {
      console.error('Error updating clipboard:', error);
      throw new Error(formatErrorMessage(error));
    }
  }
}; 