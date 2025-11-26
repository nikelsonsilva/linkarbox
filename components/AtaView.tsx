import React from 'react';
import type { FileItem, ViewMode } from '../types';
import ListView from './ListView';
import { HardDrive } from 'lucide-react';

interface AtaViewProps {
  items: FileItem[];
  viewMode: ViewMode;
  onItemClick: (item: FileItem) => void;
  onToggleStar: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onShareItem: (item: FileItem) => void;
  onRenameItem: (itemId: string, newName: string) => void;
}

const AtaView: React.FC<AtaViewProps> = ({ items, onItemClick, onToggleStar, onDeleteItem, onShareItem, onRenameItem }) => {

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <HardDrive className="w-6 h-6 text-primary" />
        ATAs (Meeting Minutes)
      </h2>
      {items.length > 0 ? (
        <ListView
          items={items}
          onItemClick={onItemClick}
          onToggleStar={onToggleStar}
          onDeleteItem={onDeleteItem}
          onShareItem={onShareItem}
          onRenameItem={onRenameItem}
          showHeader={false}
        />
      ) : (
        <div className="text-center text-gray-500 mt-16 bg-white border border-gray-200/60 rounded-2_5xl p-12">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <HardDrive className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">No ATAs found</h3>
          <p className="text-sm">Meeting minutes shared with you will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default AtaView;