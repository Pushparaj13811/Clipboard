import React, { ChangeEvent, useState, useEffect } from 'react';

interface ClipboardTextAreaProps {
  content: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
  isOwner?: boolean;
  onSaveEdit?: (content: string) => Promise<void>;
  placeholder?: string;
  lastUpdated?: Date | null;
}

const ClipboardTextArea: React.FC<ClipboardTextAreaProps> = ({
  content,
  onChange,
  readOnly = false,
  isOwner = false,
  onSaveEdit,
  placeholder = 'Paste your content here...',
  lastUpdated = null
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(content);
  const [isSaving, setIsSaving] = useState(false);

  // Update edit content when main content changes
  useEffect(() => {
    setEditContent(content);
  }, [content]);

  // Reset copy state after 2 seconds
  useEffect(() => {
    if (isCopied) {
      const timeout = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [isCopied]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    if (isEditing) {
      setEditContent(e.target.value);
    } else {
      onChange(e.target.value);
    }
  };

  const handleCopy = async () => {
    if (!content) return;
    
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setEditContent(content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(content); // Reset to original
  };

  const handleSaveEdit = async () => {
    if (!onSaveEdit) return;
    
    setIsSaving(true);
    try {
      await onSaveEdit(editContent);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save edit:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const formatUpdateTime = () => {
    if (!lastUpdated) return '';
    
    // Show date if more than 24 hours ago
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours > 24) {
      return `Updated on ${lastUpdated.toLocaleDateString()}`;
    }
    
    // Show time if within 24 hours
    return `Updated at ${lastUpdated.toLocaleTimeString()}`;
  };

  return (
    <div className="relative">
      {isEditing ? (
        <>
          <textarea
            className="w-full h-64 p-5 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none shadow-inner bg-white text-gray-800 placeholder-gray-400 transition-all duration-200"
            value={editContent}
            onChange={handleChange}
            placeholder={placeholder}
            readOnly={isSaving}
          />
          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-all duration-200 border border-gray-200 shadow-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              disabled={isSaving || editContent === content || !editContent.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </>
      ) : (
        <>
          <textarea
            className="w-full h-64 p-5 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none shadow-inner bg-white text-gray-800 placeholder-gray-400 transition-all duration-200"
            value={content}
            onChange={handleChange}
            placeholder={placeholder}
            readOnly={readOnly}
          />
          
          {lastUpdated && (
            <div className="absolute top-3 left-3 text-xs text-gray-500 bg-white bg-opacity-90 rounded-full px-3 py-1 shadow-sm border border-gray-100 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              {formatUpdateTime()}
            </div>
          )}
          
          <div className="absolute bottom-5 right-5 flex space-x-3">
            {readOnly && isOwner && (
              <button
                onClick={handleEditClick}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 shadow-md flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                Edit
              </button>
            )}
            
            {readOnly && content && (
              <button
                onClick={handleCopy}
                className={`${isCopied ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 shadow-md flex items-center`}
              >
                {isCopied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                      <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ClipboardTextArea; 