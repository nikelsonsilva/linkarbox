import React from 'react';
import type { ViewMode, FileItem } from '../types';
import GridView from './GridView';
import ListView from './ListView';
import Breadcrumbs from './Breadcrumbs';
import { Cloud, Link } from 'lucide-react';

interface AllFilesViewProps {
  viewMode: ViewMode;
  items: FileItem[];
  path: FileItem[];
  onItemClick: (item: FileItem) => void;
  onNavigate: (folderId: string | null) => void;
  onToggleStar: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  onShareItem: (item: FileItem) => void;
  onRenameItem: (itemId: string, newName: string) => void;
  isCloudConnected: boolean;
  onConnectDrive: () => void;
}

const AllFilesView: React.FC<AllFilesViewProps> = ({
  viewMode,
  items,
  path,
  onItemClick,
  onNavigate,
  onToggleStar,
  onDeleteItem,
  onShareItem,
  onRenameItem,
  isCloudConnected,
  onConnectDrive
}) => {
  const currentFolderName = path.length > 0 ? path[path.length - 1].name : 'All Files';

  const commonProps = {
    items,
    onItemClick,
    onToggleStar,
    onDeleteItem,
    onShareItem,
    onRenameItem,
  };

  if (!isCloudConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-8">
        <div className="bg-primary/10 p-6 rounded-full mb-6">
          <Cloud className="w-12 h-12 text-primary" strokeWidth={1.5} />
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Connect to Cloud Storage</h2>
        <p className="max-w-md mb-6">
          To see all your files, please connect your Google Drive or Dropbox account first.
        </p>
        <button
          onClick={onConnectDrive}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-lg shadow-primary/30"
        >
          <Link className="w-5 h-5" />
          <span>Go to Cloud Sync</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Breadcrumbs path={path} onNavigate={onNavigate} />
      <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-bold text-gray-800">{currentFolderName}</h2>
      </div>
     
      {items.length > 0 ? (
        viewMode === 'grid' ? <GridView {...commonProps} /> : <ListView {...commonProps} />
      ) : (
        <div className="text-center text-gray-500 mt-16 bg-white border border-gray-200/60 rounded-2_5xl p-12">
           <div className="mx-auto bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                <Cloud className="w-8 h-8 text-gray-500" />
           </div>
          <h3 className="text-lg font-semibold text-gray-800">This folder is empty</h3>
          <p className="text-sm">Upload files or create a new folder to get started.</p>
        </div>
      )}
    </div>
  );
};

export default AllFilesView;