import React from 'react';
import type { FileItem, ViewMode } from '../types';
import GridView from './GridView';
import ListView from './ListView';
import { Star } from 'lucide-react';

interface StarredViewProps {
  items: FileItem[];
  viewMode: ViewMode;
  onItemClick: (item: FileItem) => void;
  onToggleStar: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onShareItem: (item: FileItem) => void;
  onRenameItem: (itemId: string, newName: string) => void;
}

const StarredView: React.FC<StarredViewProps> = ({ items, viewMode, onItemClick, onToggleStar, onDeleteItem, onShareItem, onRenameItem }) => {
  const commonProps = {
    items,
    onItemClick,
    onToggleStar,
    onDeleteItem,
    onShareItem,
    onRenameItem,
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Star className="w-6 h-6 text-yellow-500 fill-current" />
        Starred
      </h2>
      {items.length > 0 ? (
        viewMode === 'grid' ? <GridView {...commonProps} /> : <ListView {...commonProps} />
      ) : (
        <div className="text-center text-gray-500 mt-16 bg-white border border-gray-200/60 rounded-2_5xl p-12">
           <div className="mx-auto bg-yellow-100/50 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Star className="w-8 h-8 text-yellow-500" />
           </div>
          <h3 className="text-lg font-semibold text-gray-800">No starred items yet</h3>
          <p className="text-sm">Star files and folders to quickly access them here.</p>
        </div>
      )}
    </div>
  );
};

export default StarredView;