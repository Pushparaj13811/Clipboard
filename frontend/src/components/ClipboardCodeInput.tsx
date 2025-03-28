import React, { useState, ChangeEvent, FormEvent } from 'react';

interface ClipboardCodeInputProps {
  code: string;
  onFetch: (code: string) => Promise<void>;
  loading: boolean;
}

const ClipboardCodeInput: React.FC<ClipboardCodeInputProps> = ({
  code,
  onFetch,
  loading
}) => {
  const [inputCode, setInputCode] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputCode(e.target.value);
  };

  const handleFetchSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      await onFetch(inputCode.trim());
    }
  };

  const handleCopyCode = async () => {
    if (!code) return;
    
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  // Display generated code
  if (code) {
    return (
      <div className="mt-6">
        <div className="flex flex-col sm:flex-row items-center sm:space-x-3 space-y-3 sm:space-y-0">
          <div className="p-4 bg-indigo-50 rounded-lg flex-grow w-full border border-indigo-100 shadow-sm">
            <p className="text-sm text-indigo-600 font-medium mb-1 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              Share this code:
            </p>
            <p className="font-mono font-bold text-xl text-gray-800 tracking-wide">{code}</p>
          </div>
          <button
            onClick={handleCopyCode}
            className={`${isCopied ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-5 py-3 rounded-lg transition-all duration-200 shadow-md w-full sm:w-auto flex items-center justify-center`}
            disabled={loading}
          >
            {isCopied ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 2a1 1 0 000 2h2a1 1 0 100-2H8z" />
                  <path d="M3 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v6h-4.586l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L10.414 13H15v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM15 11h2a1 1 0 110 2h-2v-2z" />
                </svg>
                Copy Code
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Display code input form
  return (
    <form onSubmit={handleFetchSubmit} className="flex-grow">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
          <input
            type="text"
            value={inputCode}
            onChange={handleInputChange}
            placeholder="Enter code to retrieve content"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-all duration-200"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          disabled={!inputCode.trim() || loading}
        >
          {loading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading...
            </span>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Retrieve
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ClipboardCodeInput; 