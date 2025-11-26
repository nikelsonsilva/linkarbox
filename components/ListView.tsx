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
  selectedItemId?: string | null; // ID of the currently selected item
  showHeader?: boolean; // Whether to show the header row
}

const ListView: React.FC<ListViewProps> = ({ items, onItemClick, onToggleStar, onDeleteItem, onShareItem, onRenameItem, selectedItemId, showHeader = true }) => {
  return (
    <div className="w-full">
      {/* Header - Hidden on mobile, visible on desktop - Only shown if showHeader is true */}
      {showHeader && (
        <div className="hidden md:flex items-center gap-3 px-4 py-2 text-sm font-semibold text-gray-500 border-b border-gray-200">
          {/* Checkbox column */}
          <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary flex-shrink-0 invisible" />

          {/* Icon spacer */}
          <div className="w-6 flex-shrink-0"></div>

          {/* Name - Takes remaining space */}
          <div className="flex items-center gap-1 min-w-0 flex-1">
            <span>Name</span>
            <ArrowDown className="w-4 h-4" />
          </div>

          {/* Star */}
          <div className="w-7 flex-shrink-0 text-center">Star</div>

          {/* Shared Users - Hidden until lg */}
          <div className="hidden lg:block flex-shrink-0" style={{ width: '120px' }}>Who has access</div>

          {/* Last Modified - Hidden until lg */}
          <div className="hidden lg:block flex-shrink-0 w-32">Last modified</div>

          {/* Actions spacer - Hidden until xl */}
          <div className="hidden xl:block flex-shrink-0" style={{ width: '180px' }}></div>

          {/* Menu spacer - Visible until xl */}
          <div className="xl:hidden flex-shrink-0 w-9"></div>
        </div>
      )}
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
            isSelected={selectedItemId === item.id}
          />
        ))}
      </div>
    </div>
  );
};

export default ListView;