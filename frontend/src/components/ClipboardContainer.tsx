import React, { useState } from 'react';
import ClipboardTextArea from './ClipboardTextArea';
import ClipboardCodeInput from './ClipboardCodeInput';
import AlertMessage from './AlertMessage';
import ClipboardStats from './ClipboardStats';
import ClipboardHistory from './ClipboardHistory';
import ConnectionStatus from './ConnectionStatus';
import { useClipboard } from '../hooks/useClipboard';

const ClipboardContainer: React.FC = () => {
  const {
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
    clearContent
  } = useClipboard();
  
  const [inputContent, setInputContent] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const handleContentChange = (newContent: string) => {
    setInputContent(newContent);
    // Clear success message when user starts typing
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleShareClick = async () => {
    if (!inputContent.trim()) return;
    
    // Clear any previous messages
    setSuccessMessage('');
    
    try {
      await saveContent(inputContent.trim());
      // Only set success message if no error was thrown
      setSuccessMessage('Content saved and ready to share!');
    } catch (err) {
      // Error will be set by the useClipboard hook
      // Don't set success message
      console.error('Error in handleShareClick:', err);
    }
  };

  const handleSaveEdit = async (newContent: string) => {
    try {
      await updateContent(newContent);
      setSuccessMessage('Content updated successfully!');
    } catch (err) {
      // Error will be set by the useClipboard hook
      console.error('Error in handleSaveEdit:', err);
    }
  };

  const handleResetClick = () => {
    clearContent();
    setInputContent('');
    setSuccessMessage('');
    setShowHistory(false);
  };

  const toggleHistory = () => {
    setShowHistory(prev => !prev);
  };

  const handleDismissError = () => {
    // Clear error state in parent component
    clearContent();
    // Also clear success message to avoid confusion
    setSuccessMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl md:text-4xl font-bold text-indigo-600 mb-1">Online Clipboard</h1>
          <p className="text-gray-600 text-sm md:text-base">
            Securely share text with anyone using a unique code
          </p>
        </div>
        
        {!code && (
          <button
            onClick={toggleHistory}
            className="self-start flex items-center px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-all duration-200 shadow-sm border border-indigo-100"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
        )}
      </div>

      <ConnectionStatus onRetry={clearContent} />

      {error && (
        <AlertMessage 
          type="error" 
          message={error} 
          onDismiss={handleDismissError} 
        />
      )}

      {!error && successMessage && (
        <AlertMessage 
          type="success" 
          message={successMessage} 
          onDismiss={() => setSuccessMessage('')} 
        />
      )}

      {code ? (
        // View mode - display content and code
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-indigo-100">
          {isOwner && (
            <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-6 text-indigo-700 rounded-r-md">
              <div className="flex items-center mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">You created this clipboard</span>
              </div>
              <p className="text-sm">You can edit the content and all viewers will see the updates in real-time.</p>
            </div>
          )}
          
          <ClipboardTextArea 
            content={content} 
            onChange={() => {}} 
            readOnly={true}
            isOwner={isOwner}
            onSaveEdit={handleSaveEdit}
            placeholder="Retrieved content will appear here..."
            lastUpdated={lastUpdated}
          />
          
          <ClipboardStats 
            stats={stats} 
            viewersCount={viewersCount} 
            lastUpdated={lastUpdated}
          />
          
          <ClipboardCodeInput 
            code={code} 
            onFetch={getContent}
            loading={loading} 
          />
          
          <div className="mt-8 text-center">
            <button
              onClick={handleResetClick}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors shadow-sm border border-gray-200"
            >
              Create New Clipboard
            </button>
          </div>
        </div>
      ) : (
        // Create mode - input content and share
        <>
          <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-indigo-100">
            <ClipboardTextArea 
              content={inputContent} 
              onChange={handleContentChange} 
            />
            
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleShareClick}
                className="flex-grow px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!inputContent.trim() || loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                    Share
                  </span>
                )}
              </button>
              
              <ClipboardCodeInput 
                code="" 
                onFetch={getContent} 
                loading={loading}
              />
            </div>
          </div>
          
          {showHistory && (
            <div className="mt-8 bg-white p-6 md:p-8 rounded-xl shadow-lg border border-indigo-100">
              <ClipboardHistory 
                history={history}
                onSelectClipboard={getContent}
                loading={loading}
              />
            </div>
          )}
        </>
      )}

      <div className="mt-10 mb-4 text-center text-gray-500 text-sm">
        <p className="flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Data automatically expires after 24 hours for your privacy
        </p>
      </div>
    </div>
  );
};

export default ClipboardContainer; 