import React from 'react';
import type { FileItem } from '../types';
import FileListItem from './FileListItem';
import { ArrowDown } from 'lucide-react';

interface ListViewProps {
  items: FileItem[];
  onItemClick: (item: FileItem) => void;
  onToggleStar: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onShareItem: (item: FileItem) => void;
  onRenameItem: (itemId: string, newName: string) => void;
}

const ListView: React.FC<ListViewProps> = ({ items, onItemClick, onToggleStar, onDeleteItem, onShareItem, onRenameItem }) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-12 gap-4 px-4 py-2 text-sm font-semibold text-gray-500 border-b border-gray-200">
        <div className="col-span-10 md:col-span-5 flex items-center">
            <input type="checkbox" className="mr-4 rounded border-gray-300 text-primary focus:ring-primary" />
            <span>Name</span>
            <ArrowDown className="w-4 h-4 ml-1" />
        </div>
        <div className="col-span-2 md:col-span-1 text-center">Star</div>
        <div className="hidden md:block col-span-3">Who has access</div>
        <div className="hidden md:block col-span-2">Last modified</div>
        <div className="hidden md:block col-span-1"></div>
      </div>
      <div className="divide-y divide-gray-200/80">
        {items.map((item) => (
          <FileListItem 
            key={item.id} 
            item={item} 
            onClick={onItemClick}
            onToggleStar={onToggleStar}
            onDeleteItem={onDeleteItem}
            onShareItem={onShareItem}
            onRenameItem={onRenameItem}
          />
        ))}
      </div>
    </div>
  );
};

export default ListView;