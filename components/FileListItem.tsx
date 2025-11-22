import React, { useState } from 'react';
import type { FileItem } from '../types';
import { ItemType, MOCK_USERS, getFileIcon } from '../constants';
import { Star, MoreHorizontal, Folder, Trash2, Share2, Edit } from 'lucide-react';

interface FileListItemProps {
  item: FileItem;
  onClick: (item: FileItem) => void;
  onToggleStar: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onShareItem: (item: FileItem) => void;
  onRenameItem: (itemId: string, newName: string) => void;
}

const FileListItem: React.FC<FileListItemProps> = ({ item, onClick, onToggleStar, onDeleteItem, onShareItem, onRenameItem }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const sharedWithUsers = item.sharedWith.map(id => MOCK_USERS[id]).filter(Boolean);

  const Icon = item.type === ItemType.FOLDER ? Folder : getFileIcon(item.mimeType);
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
      className="group grid grid-cols-12 gap-4 items-center px-4 py-3 hover:bg-primary/5 rounded-lg transition-colors duration-200 relative cursor-pointer"
      onDoubleClick={() => onClick(item)}
      onClick={(e) => {
        if (e.detail === 1 && item.type === ItemType.FILE) {
          onClick(item);
        }
      }}
    >
      <div className="absolute left-0 top-0 h-full w-1 bg-primary rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div className="col-span-10 md:col-span-5 flex items-center">
        <input type="checkbox" onClick={(e) => e.stopPropagation()} className="mr-4 rounded border-gray-300 text-primary focus:ring-primary opacity-0 group-hover:opacity-100 checked:opacity-100 transition-opacity" />
        <Icon className={`w-6 h-6 mr-3 flex-shrink-0 ${iconColor}`} />
        <span className="font-medium text-gray-800 truncate">{item.name}</span>
      </div>

      <div className="col-span-2 md:col-span-1 flex justify-center">
        <button 
          onClick={(e) => handleAction(e, () => onToggleStar(item.id))}
          className={`p-1 rounded-full ${item.isStarred ? 'text-yellow-400' : 'text-gray-300 opacity-0 group-hover:opacity-100 hover:text-yellow-400'}`}
        >
            <Star className="w-5 h-5" fill={item.isStarred ? 'currentColor' : 'none'} />
        </button>
      </div>
      
      <div className="hidden md:flex col-span-3">
        <div className="flex -space-x-2">
            {sharedWithUsers.slice(0, 4).map(user => (
                <img key={user.id} src={user.avatarUrl} alt={user.name} title={user.name} className="w-7 h-7 rounded-full border-2 border-white group-hover:border-primary/5"/>
            ))}
            {sharedWithUsers.length > 4 && (
                <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-semibold">
                +{sharedWithUsers.length - 4}
                </div>
            )}
        </div>
      </div>
      
      <div className="hidden md:block col-span-2 text-sm text-gray-500">
        {item.modified}
      </div>

      <div className="col-span-12 md:col-span-1 flex justify-end md:opacity-0 group-hover:opacity-100">
        <div className="relative">
             <button 
                onClick={handleMenuClick}
                className="p-2 text-gray-500 rounded-full hover:bg-gray-200/50 hover:text-gray-700"
            >
                <MoreHorizontal className="w-5 h-5"/>
            </button>
            {isMenuOpen && (
              <div className="absolute top-8 right-0 bg-white rounded-lg shadow-lg border border-gray-200/80 z-10 w-36" onMouseLeave={() => setMenuOpen(false)}>
                <button onClick={(e) => handleAction(e, () => onShareItem(item))} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Share2 className="w-4 h-4"/> Share
                </button>
                 <button onClick={handleRename} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Edit className="w-4 h-4"/> Rename
                </button>
                <button onClick={(e) => handleAction(e, () => onDeleteItem(item.id))} className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                  <Trash2 className="w-4 h-4"/> Delete
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default FileListItem;