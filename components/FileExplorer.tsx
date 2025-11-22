import React from 'react';
import type { ViewMode, FileItem } from '../types';
import GridView from './GridView';
import ListView from './ListView';
import Breadcrumbs from './Breadcrumbs';


interface FileExplorerProps {
  viewMode: ViewMode;
  items: FileItem[];
  path: FileItem[];
  onItemClick: (item: FileItem) => void;
  onNavigate: (folderId: string | null) => void;
  onToggleStar: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onShareItem: (item: FileItem) => void;
  onRenameItem: (itemId: string, newName: string) => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ 
  viewMode, 
  items, 
  path,
  onItemClick, 
  onNavigate,
  onToggleStar,
  onDeleteItem,
  onShareItem,
  onRenameItem
}) => {
  const currentFolderName = path.length > 0 ? path[path.length - 1].name : 'Home';
  
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
      <Breadcrumbs path={path} onNavigate={folderId => onNavigate(folderId)} />
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{currentFolderName}</h2>
      {viewMode === 'grid' ? <GridView {...commonProps} /> : <ListView {...commonProps} />}
    </div>
  );
};

export default FileExplorer;