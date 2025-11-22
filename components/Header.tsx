import React, { useState } from 'react';
import { Search, Bell, Grid, List, UploadCloud, FolderPlus, Menu } from 'lucide-react';
import type { ViewMode, User } from '../types';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  user: User;
  onLogout: () => void;
  onCreateFolder: () => void;
  onUpload: () => void;
  onToggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ viewMode, setViewMode, user, onLogout, onCreateFolder, onUpload, onToggleSidebar }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-24 flex-shrink-0 flex items-center justify-between px-4 md:px-8 bg-transparent gap-4">
      <div className="flex items-center gap-2">
        <button onClick={onToggleSidebar} className="md:hidden p-2 text-gray-600 rounded-full hover:bg-gray-200/50">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex-1 flex items-center gap-4">
          <div className="relative w-full max-w-xs md:max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
              type="text"
              placeholder="Search files..."
              className="w-full bg-white border border-gray-200/60 rounded-full py-2.5 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
              />
          </div>
          <button onClick={onCreateFolder} className="hidden md:flex items-center gap-2 px-4 py-2 bg-white border border-gray-200/80 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm">
              <FolderPlus className="w-5 h-5"/>
              <span>Criar Pasta</span>
          </button>
          <button onClick={onUpload} className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-colors shadow-lg shadow-primary/30 text-sm">
              <UploadCloud className="w-5 h-5" />
              <span>Upload</span>
          </button>
        </div>
      </div>
      

      <div className="flex items-center gap-2 md:gap-4">
        <div className="hidden sm:flex items-center bg-white border border-gray-200/60 rounded-full p-1">
          <button
            onClick={() => setViewMode('grid')}
            aria-label="Grid view"
            className={`p-1.5 rounded-full ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-500 hover:text-primary'}`}
          >
            <Grid className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            aria-label="List view"
            className={`p-1.5 rounded-full ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-500 hover:text-primary'}`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
        <button className="p-2 text-gray-500 rounded-full hover:bg-gray-200/50 hover:text-gray-700">
          <Bell className="w-6 h-6" />
        </button>
        <div className="relative">
            <img
              src={user.avatarUrl}
              alt="User Avatar"
              className="w-10 h-10 rounded-full cursor-pointer"
              onClick={() => setDropdownOpen(!isDropdownOpen)}
            />
            {isDropdownOpen && (
                 <div className="absolute top-12 right-0 bg-white rounded-lg shadow-lg border border-gray-200/80 z-20 w-48" onMouseLeave={() => setDropdownOpen(false)}>
                    <div className="p-3 border-b border-gray-200">
                        <p className="font-semibold text-sm text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>
                    <button onClick={onLogout} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                        Logout
                    </button>
                 </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;