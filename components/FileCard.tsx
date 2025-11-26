import React, { useState } from 'react';
import type { FileItem } from '../types';
import { ItemType, MOCK_USERS } from '../constants';
import { Star, MoreHorizontal, Folder, Trash2, Share2, Edit } from 'lucide-react';
import FileIcon from './FileIcon';

interface FileCardProps {
  item: FileItem;
  onClick: (item: FileItem) => void;
  onToggleStar: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onShareItem: (item: FileItem) => void;
  onRenameItem: (itemId: string, newName: string) => void;
}

const FileCard: React.FC<FileCardProps> = ({ item, onClick, onToggleStar, onDeleteItem, onShareItem, onRenameItem }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);

  const sharedWithUsers = item.sharedWith.map(id => MOCK_USERS[id]).filter(Boolean);

  // Softer, cleaner folder colors
  const getFolderColor = () => {
    const colorMap: Record<string, string> = {
      'bg-folder-blue': 'bg-blue-100',
      'bg-folder-green': 'bg-green-100',
      'bg-folder-purple': 'bg-purple-100',
      'bg-folder-orange': 'bg-orange-100',
      'bg-folder-pink': 'bg-pink-100',
      'bg-folder-yellow': 'bg-yellow-100',
    };
    return colorMap[item.color || 'bg-folder-blue'] || 'bg-blue-100';
  };

  const getFolderIconColor = () => {
    const colorMap: Record<string, string> = {
      'bg-folder-blue': 'text-blue-600',
      'bg-folder-green': 'text-green-600',
      'bg-folder-purple': 'text-purple-600',
      'bg-folder-orange': 'text-orange-600',
      'bg-folder-pink': 'text-pink-600',
      'bg-folder-yellow': 'text-yellow-600',
    };
    return colorMap[item.color || 'bg-folder-blue'] || 'text-blue-600';
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!isMenuOpen);
  };

  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
    setMenuOpen(false);
  }

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newName = window.prompt('Enter new name:', item.name);
    if (newName && newName !== item.name) {
      onRenameItem(item.id, newName);
    }
    setMenuOpen(false);
  };

  // Smart truncation: keep extension visible for files
  const getTruncatedName = (name: string, maxLength: number = 20) => {
    if (name.length <= maxLength) return name;

    // For files, preserve extension
    if (item.type === ItemType.FILE) {
      const lastDotIndex = name.lastIndexOf('.');
      if (lastDotIndex > 0) {
        const extension = name.substring(lastDotIndex);
        const nameWithoutExt = name.substring(0, lastDotIndex);
        const availableLength = maxLength - extension.length - 3; // 3 for "..."

        if (availableLength > 0) {
          return nameWithoutExt.substring(0, availableLength) + '...' + extension;
        }
      }
    }

    // For folders, just truncate
    return name.substring(0, maxLength - 3) + '...';
  };

  return (
    <div
      className="group relative bg-white border border-gray-200/60 rounded-xl p-3 hover:shadow-md hover:border-gray-300/80 transition-all duration-200 cursor-pointer overflow-hidden"
      onDoubleClick={() => onClick(item)}
      onClick={(e) => {
        if (e.detail === 1 && item.type === ItemType.FILE) {
          onClick(item);
        }
      }}
    >
      {/* Star Button - Top Right */}
      <button
        onClick={(e) => handleAction(e, () => onToggleStar(item.id))}
        className={`absolute top-2 right-2 p-1 rounded-full transition-colors z-10 ${item.isStarred ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'}`}
      >
        <Star className="w-4 h-4" fill={item.isStarred ? 'currentColor' : 'none'} />
      </button>

      {/* Unread Notes Badge - Top Left */}
      {item.unreadNotesCount !== undefined && item.unreadNotesCount > 0 && (
        <div className="absolute top-2 left-2 z-10">
          <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-md">
            {item.unreadNotesCount > 9 ? '9+' : item.unreadNotesCount}
          </div>
        </div>
      )}

      {/* File/Folder Icon and Name - Left Aligned */}
      <div className="flex items-start gap-2.5 mb-3">
        {item.type === ItemType.FOLDER ? (
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getFolderColor()}`}>
            <Folder className={`w-7 h-7 ${getFolderIconColor()}`} strokeWidth={1.5} />
          </div>
        ) : (
          <div className="flex-shrink-0 w-12">
            <FileIcon fileName={item.name} mimeType={item.mimeType} size={48} />
          </div>
        )}

        {/* File Name */}
        <div className="flex-1 min-w-0 pt-0.5 pr-6">
          <h3 className="font-semibold text-gray-800 text-sm leading-snug break-words" title={item.name}>
            {getTruncatedName(item.name)}
          </h3>
        </div>
      </div>

      {/* Bottom Section: Avatars and Date */}
      <div className="flex items-center justify-between pt-2.5 border-t border-gray-100">
        {/* Shared With Avatars */}
        <div className="flex items-center gap-1.5">
          <div className="flex -space-x-1.5">
            {sharedWithUsers.slice(0, 3).map(user => (
              <img
                key={user.id}
                src={user.avatarUrl}
                alt={user.name}
                title={user.name}
                className="w-5 h-5 rounded-full border-2 border-white"
              />
            ))}
            {sharedWithUsers.length > 3 && (
              <div className="w-5 h-5 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-semibold text-gray-600">
                +{sharedWithUsers.length - 3}
              </div>
            )}
          </div>
          {sharedWithUsers.length > 0 && (
            <span className="text-[11px] text-gray-400">you and {sharedWithUsers.length}+</span>
          )}
        </div>

        {/* Modified Date */}
        <span className="text-[11px] text-gray-400">{item.modified}</span>
      </div>

      {/* Context Menu (Hidden by default) */}
      <div className="absolute top-2 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleMenuClick}
          className="p-1 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-700"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
        {isMenuOpen && (
          <div className="absolute top-8 right-0 bg-white rounded-lg shadow-lg border border-gray-200/80 z-20 w-36" onMouseLeave={() => setMenuOpen(false)}>
            <button onClick={(e) => handleAction(e, () => onShareItem(item))} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button onClick={handleRename} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
              <Edit className="w-4 h-4" /> Rename
            </button>
            <button onClick={(e) => handleAction(e, () => onDeleteItem(item.id))} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileCard;