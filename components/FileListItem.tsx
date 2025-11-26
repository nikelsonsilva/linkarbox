import React, { useState } from 'react';
import type { FileItem } from '../types';
import { ItemType, MOCK_USERS } from '../constants';
import { Star, MoreHorizontal, Folder, Trash2, Share2, Edit, Info } from 'lucide-react';
import FileIcon from './FileIcon';

interface FileListItemProps {
  item: FileItem;
  onClick: (item: FileItem) => void;
  onToggleStar: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onShareItem: (item: FileItem) => void;
  onRenameItem: (itemId: string, newName: string) => void;
  isSelected?: boolean; // New prop to indicate if this item is selected
}

const FileListItem: React.FC<FileListItemProps> = ({ item, onClick, onToggleStar, onDeleteItem, onShareItem, onRenameItem, isSelected = false }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const sharedWithUsers = item.sharedWith.map(id => MOCK_USERS[id]).filter(Boolean);

  const iconColor = item.type === ItemType.FOLDER ? (item.color?.replace('bg-', 'text-') || 'text-folder-blue') : 'text-gray-500';

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

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!isMenuOpen);
  };

  return (
    <div
      className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 relative cursor-pointer ${isSelected ? 'bg-primary/10 border-l-4 border-primary' : 'hover:bg-primary/5'
        }`}
      onDoubleClick={() => onClick(item)}
      onClick={(e) => {
        if (e.detail === 1 && item.type === ItemType.FILE) {
          onClick(item);
        }
      }}
    >
      <div className="absolute left-0 top-0 h-full w-1 bg-primary rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"></div>

      {/* Checkbox - Hidden on mobile, visible on hover on desktop */}
      <input
        type="checkbox"
        onClick={(e) => e.stopPropagation()}
        className="hidden md:block rounded border-gray-300 text-primary focus:ring-primary opacity-0 group-hover:opacity-100 checked:opacity-100 transition-opacity flex-shrink-0"
      />

      {/* File Icon */}
      <div className="flex-shrink-0">
        {item.type === ItemType.FOLDER ? (
          <Folder className={`w-6 h-6 ${iconColor}`} />
        ) : (
          <FileIcon fileName={item.name} mimeType={item.mimeType} size={24} />
        )}
      </div>

      {/* File Name + Badge - Takes remaining space */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className="font-medium text-gray-800 truncate">{item.name}</span>
        {/* Unread Notes Badge */}
        {item.unreadNotesCount !== undefined && item.unreadNotesCount > 0 && (
          <div className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold flex-shrink-0">
            {item.unreadNotesCount > 9 ? '9+' : item.unreadNotesCount}
          </div>
        )}
      </div>

      {/* Star Button - Always visible on mobile, hover on desktop */}
      <button
        onClick={(e) => handleAction(e, () => onToggleStar(item.id))}
        className={`p-1 rounded-full flex-shrink-0 ${item.isStarred ? 'text-yellow-400' : 'text-gray-300 md:opacity-0 md:group-hover:opacity-100 hover:text-yellow-400'
          }`}
      >
        <Star className="w-5 h-5" fill={item.isStarred ? 'currentColor' : 'none'} />
      </button>

      {/* Shared Users - Hidden on mobile */}
      <div className="hidden lg:flex -space-x-2 flex-shrink-0">
        {sharedWithUsers.slice(0, 4).map(user => (
          <img key={user.id} src={user.avatarUrl} alt={user.name} title={user.name} className="w-7 h-7 rounded-full border-2 border-white group-hover:border-primary/5" />
        ))}
        {sharedWithUsers.length > 4 && (
          <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-semibold">
            +{sharedWithUsers.length - 4}
          </div>
        )}
      </div>

      {/* Last Modified - Hidden on mobile */}
      <div className="hidden lg:block text-sm text-gray-500 flex-shrink-0 w-32">
        {item.modified}
      </div>

      {/* Action Icons - Large Screens: Always visible */}
      <div className="hidden xl:flex items-center gap-1 flex-shrink-0">
        <button
          onClick={handleRename}
          className="p-2 text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
          title="Rename"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => handleAction(e, () => onClick(item))}
          className="p-2 text-yellow-500 rounded-full hover:bg-yellow-50 transition-colors"
          title="Details"
        >
          <Info className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => handleAction(e, () => onDeleteItem(item.id))}
          className="p-2 text-red-500 rounded-full hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => handleAction(e, () => onShareItem(item))}
          className="p-2 text-green-500 rounded-full hover:bg-green-50 transition-colors"
          title="Share"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Three-dot Menu - Mobile to Large screens */}
      <div className="xl:hidden flex justify-end flex-shrink-0">
        <div className="relative">
          <button
            onClick={handleMenuClick}
            className="p-2 text-gray-500 rounded-full hover:bg-gray-200/50 hover:text-gray-700"
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          {isMenuOpen && (
            <div className="absolute top-8 right-0 bg-white rounded-lg shadow-lg border border-gray-200/80 z-10 w-36" onMouseLeave={() => setMenuOpen(false)}>
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
    </div>
  );
};

export default FileListItem;