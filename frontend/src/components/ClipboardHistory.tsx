import React from 'react';
import { HistoryItem } from '../services/api';

interface ClipboardHistoryProps {
  history: HistoryItem[];
  onSelectClipboard: (code: string) => Promise<void>;
  loading: boolean;
}

const ClipboardHistory: React.FC<ClipboardHistoryProps> = ({
  history,
  onSelectClipboard,
  loading
}) => {
  if (history.length === 0) {
    return (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center text-gray-500">
        No clipboard history found. Create your first clipboard by sharing some content.
      </div>
    );
  }
  
  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'Unknown date';
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold mb-3">Your Clipboard History</h3>
      <div className="space-y-3">
        {history.map((item) => (
          <div key={item.code} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-medium text-gray-800 break-all line-clamp-1">{item.preview}</div>
                <div className="mt-1 text-xs text-gray-500">
                  <span className="font-mono bg-gray-100 rounded px-1 py-0.5 mr-1">{item.code}</span>
                  <span>Created: {formatDate(item.created)}</span>
                </div>
              </div>
              <div className="ml-4 flex flex-col items-end">
                <span className="text-sm bg-blue-100 text-blue-800 rounded-full px-2 py-0.5">
                  {item.retrievalCount} {item.retrievalCount === 1 ? 'view' : 'views'}
                </span>
                <button
                  onClick={() => onSelectClipboard(item.code)}
                  disabled={loading}
                  className="mt-2 text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Open'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClipboardHistory; 