import { io, Socket } from 'socket.io-client';

interface ContentUpdateEvent {
  updatedBy?: string;
  timestamp: number;
  fromRedisEvent?: boolean;
}

let socket: Socket | null = null;

export const socketService = {
  /**
   * Connect to the socket server
   * @returns The socket instance
   */
  connect: (): Socket => {
    if (!socket) {
      socket = io('http://localhost:4000');
      console.log('Socket connected');
    }
    return socket;
  },

  /**
   * Disconnect from the socket server
   */
  disconnect: (): void => {
    if (socket) {
      socket.disconnect();
      socket = null;
      console.log('Socket disconnected');
    }
  },

  /**
   * Join a clipboard room to receive updates
   * @param code The clipboard code room to join
   * @param userId The user identifier
   */
  joinRoom: (code: string, userId: string): void => {
    if (socket) {
      socket.emit('join-room', code);
      // Identify user for analytics
      socket.emit('identify', { userId, code });
    }
  },

  /**
   * Leave a clipboard room
   * @param code The clipboard code room to leave
   */
  leaveRoom: (code: string): void => {
    if (socket) {
      socket.emit('leave-room', code);
    }
  },

  /**
   * Register handler for content updates
   * @param callback Function to call when content is updated
   */
  onContentUpdated: (callback: (data: ContentUpdateEvent) => void): void => {
    if (socket) {
      socket.on('content-updated', callback);
    }
  },

  /**
   * Register handler for content retrieval updates
   * @param callback Function to call when content is retrieved
   */
  onContentRetrieved: (callback: (data: { count: number }) => void): void => {
    if (socket) {
      socket.on('content-retrieved', callback);
    }
  },

  /**
   * Register handler for viewers count updates
   * @param callback Function to call when viewers count is updated
   */
  onViewersUpdated: (callback: (data: { count: number }) => void): void => {
    if (socket) {
      socket.on('viewers-updated', callback);
    }
  },

  /**
   * Remove a specific socket listener
   * @param event Event name to stop listening for
   */
  removeListener: (event: string): void => {
    if (socket) {
      socket.off(event);
    }
  }
}; 