import React from 'react';
import type { FileItem } from '../types';
import FileCard from './FileCard';

interface GridViewProps {
  items: FileItem[];
  onItemClick: (item: FileItem) => void;
  onToggleStar: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onShareItem: (item: FileItem) => void;
  onRenameItem: (itemId: string, newName: string) => void;
}

const GridView: React.FC<GridViewProps> = ({ items, onItemClick, onToggleStar, onDeleteItem, onShareItem, onRenameItem }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
      {items.map((item) => (
        <FileCard 
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
  );
};

export default GridView;