import React, { useState, useEffect, useCallback } from 'react';
import { clipboardService } from '../services/api';

interface ConnectionStatusProps {
  onRetry?: () => void;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ onRetry }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = useCallback(async () => {
    setIsChecking(true);
    try {
      const connected = await clipboardService.checkConnection();
      setIsConnected(connected);
    } catch (error) {
      setIsConnected(false);
      console.error('Connection check failed:', error);
    } finally {
      setIsChecking(false);
    }
  }, []);

  // Check connection on mount
  useEffect(() => {
    checkConnection();
  }, [checkConnection]);

  const handleRetry = () => {
    checkConnection();
    if (onRetry) onRetry();
  };

  if (isConnected === null) {
    return (
      <div className="p-3 text-center text-gray-600">
        <span className="inline-block animate-pulse mr-2">⟳</span>
        Checking connection...
      </div>
    );
  }

  if (isConnected === true) {
    return null; // Don't show anything if connected
  }

  return (
    <div className="p-4 mb-4 rounded-lg border bg-red-50 text-red-800 border-red-200">
      <div className="flex flex-col space-y-3">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span className="font-medium">Connection Error</span>
        </div>
        
        <p className="text-sm">
          Unable to connect to the clipboard service. This could be due to:
        </p>
        
        <ul className="text-sm list-disc list-inside ml-2 space-y-1">
          <li>Redis server is not running</li>
          <li>Backend server is not running or is unreachable</li>
          <li>Network connectivity issues</li>
        </ul>
        
        <div className="mt-2 flex justify-end">
          <button 
            onClick={handleRetry}
            disabled={isChecking}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors disabled:opacity-50"
          >
            {isChecking ? 'Checking...' : 'Retry Connection'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus; 