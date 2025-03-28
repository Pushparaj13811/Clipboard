import React, { useEffect, useState } from 'react';

type AlertType = 'error' | 'success' | 'info';

interface AlertMessageProps {
  type: AlertType;
  message: string;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  dismissDuration?: number;
}

const AlertMessage: React.FC<AlertMessageProps> = ({
  type,
  message,
  onDismiss,
  autoDismiss = true,
  dismissDuration = 5000
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoDismiss && onDismiss) {
      const timeout = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onDismiss(), 300); // Wait for fade out animation
      }, dismissDuration);
      
      return () => clearTimeout(timeout);
    }
  }, [autoDismiss, dismissDuration, onDismiss]);

  const getTypeStyles = (): string => {
    switch (type) {
      case 'error':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'success':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'info':
      default:
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return (
          <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'success':
        return (
          <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  if (!message) return null;

  return (
    <div 
      className={`p-4 mb-6 rounded-lg border shadow-sm ${getTypeStyles()} transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
      role="alert"
    >
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-3">
            {getIcon()}
          </div>
          <div className="flex-1 text-sm md:text-base font-medium">{message}</div>
        </div>
        {onDismiss && (
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onDismiss(), 300); // Wait for fade out animation
            }}
            className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
            aria-label="Dismiss"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default AlertMessage; 