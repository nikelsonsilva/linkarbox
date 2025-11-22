import React, { useState } from 'react';
import type { FileItem } from '../types';
import { ItemType, MOCK_USERS, getFileIcon } from '../constants';
import { Star, MoreHorizontal, Folder, Trash2, Share2, Edit } from 'lucide-react';

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

  const Icon = item.type === ItemType.FOLDER ? Folder : getFileIcon(item.mimeType);
  const iconColor = item.type === ItemType.FOLDER ? (item.color || 'bg-folder-blue') : 'bg-gray-500';

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

  return (
    <div 
      className="group relative bg-white border border-gray-200/60 rounded-2_5xl p-5 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      onDoubleClick={() => onClick(item)}
      onClick={(e) => {
        if (e.detail === 1 && item.type === ItemType.FILE) {
          onClick(item);
        }
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconColor}`}>
           <Icon className={`w-7 h-7 ${item.type === ItemType.FOLDER ? 'text-white/80' : 'text-white'}`} strokeWidth={1.5} />
        </div>
        <div className="flex items-center gap-2">
            <button 
              onClick={(e) => handleAction(e, () => onToggleStar(item.id))}
              className={`p-1 rounded-full transition-colors ${item.isStarred ? 'text-yellow-500' : 'text-gray-400 opacity-0 group-hover:opacity-100 hover:text-yellow-500'}`}
            >
                <Star className="w-5 h-5" fill={item.isStarred ? 'currentColor' : 'none'}/>
            </button>
            <div className="relative">
                <button 
                  onClick={handleMenuClick}
                  className="p-1 text-gray-400 rounded-full opacity-0 group-hover:opacity-100 hover:text-gray-700"
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
      <h3 className="font-semibold text-gray-800 truncate mb-2">{item.name}</h3>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex -space-x-2">
          {sharedWithUsers.slice(0, 3).map(user => (
            <img key={user.id} src={user.avatarUrl} alt={user.name} title={user.name} className="w-6 h-6 rounded-full border-2 border-white"/>
          ))}
          {sharedWithUsers.length > 3 && (
            <div className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-semibold">
              +{sharedWithUsers.length - 3}
            </div>
          )}
        </div>
        <span>{item.modified}</span>
      </div>
    </div>
  );
};

export default FileCard;