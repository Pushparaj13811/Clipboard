import React from 'react';
import { ClipboardStats as StatsType } from '../services/api';

interface ClipboardStatsProps {
  stats: StatsType | null;
  viewersCount: number;
  lastUpdated?: Date | null;
}

const ClipboardStats: React.FC<ClipboardStatsProps> = ({ stats, viewersCount, lastUpdated }) => {
  if (!stats) return null;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diffMs = now - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) return `${diffSec} seconds ago`;
    
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
    
    const diffDay = Math.floor(diffHour / 24);
    return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  };

  const getLastEditedInfo = () => {
    if (!lastUpdated) return null;
    
    const creationDate = new Date(stats.created);
    const editDate = lastUpdated;
    
    // If the difference is less than 1 minute, it's probably just the initial creation
    const diffMs = editDate.getTime() - creationDate.getTime();
    if (diffMs < 60000) return null;
    
    return (
      <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
        <p className="text-xs text-gray-500">Last Edited</p>
        <p className="text-sm font-medium">{getTimeAgo(editDate.getTime())}</p>
        <p className="text-xs text-gray-400">{formatDate(editDate.getTime())}</p>
      </div>
    );
  };

  return (
    <div className="mt-4 rounded-lg bg-gray-50 border border-gray-200 p-4">
      <h3 className="text-md font-medium text-gray-700 mb-3">Clipboard Statistics</h3>
      
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Created</p>
          <p className="text-sm font-medium">{getTimeAgo(stats.created)}</p>
          <p className="text-xs text-gray-400">{formatDate(stats.created)}</p>
        </div>
        
        {getLastEditedInfo()}
        
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Retrieved</p>
          <p className="text-lg font-bold text-blue-600">{stats.retrievalCount}</p>
          <p className="text-xs text-gray-400">times</p>
        </div>
        
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Active Viewers</p>
          <p className="text-lg font-bold text-green-600">{viewersCount}</p>
          <p className="text-xs text-gray-400">currently online</p>
        </div>
        
        <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
          <p className="text-xs text-gray-500">Expiration</p>
          <p className="text-sm font-medium">24 hours</p>
          <p className="text-xs text-gray-400">after creation</p>
        </div>
      </div>
    </div>
  );
};

export default ClipboardStats; 