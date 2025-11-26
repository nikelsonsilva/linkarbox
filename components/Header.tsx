import React, { useState } from 'react';
import { Search, Bell, Grid, List, Upload as UploadIcon, Plus, Menu, HelpCircle } from 'lucide-react';
import type { ViewMode, User } from '../types';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  user: User;
  onLogout: () => void;
  onCreateFolder: () => void;
  onUpload: () => void;
  onToggleSidebar: () => void;
  showViewToggle?: boolean; // Whether to show the grid/list toggle
  showActionButtons?: boolean; // Whether to show Upload and Create buttons
  searchQuery?: string; // Current search query
  setSearchQuery?: (query: string) => void; // Function to update search query
  activePage?: string; // Current active page for dynamic placeholder
}

const Header: React.FC<HeaderProps> = ({ viewMode, setViewMode, user, onLogout, onCreateFolder, onUpload, onToggleSidebar, showViewToggle = true, showActionButtons = true, searchQuery = '', setSearchQuery, activePage = 'home' }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  // Dynamic placeholder based on active page
  const getPlaceholder = () => {
    if (activePage === 'clients') return 'Search clients...';
    return 'Search files...';
  };

  return (
    <header className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-gray-200/60">
      {/* Top Row: Search, Icons, User */}
      <div className="h-20 flex items-center justify-between px-4 md:px-8 gap-4">
        {/* Left: Search */}
        <div className="flex items-center gap-3 flex-1 max-w-2xl">
          <button onClick={onToggleSidebar} className="md:hidden p-2 text-gray-600 rounded-full hover:bg-gray-100">
            <Menu className="w-5 h-5" />
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder={getPlaceholder()}
              value={searchQuery}
              onChange={(e) => setSearchQuery?.(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition"
            />
          </div>
        </div>

        {/* Right: Icons & User */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Help Icon */}
          <button className="hidden md:flex p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-700 transition">
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* Notification Icon */}
          <button className="relative p-2 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-700 transition">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Avatar */}
          <div className="relative">
            <img
              src={user.avatarUrl}
              alt="User Avatar"
              className="w-10 h-10 rounded-full cursor-pointer ring-2 ring-gray-200 hover:ring-primary/50 transition"
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
      </div>

      {/* Bottom Row: Upload/Create Buttons & View Toggle - Only shown if there's content */}
      {(showActionButtons || showViewToggle) && (
        <div className="h-16 flex items-center justify-between px-4 md:px-8 gap-4 border-t border-gray-100">
          {/* Left: Upload & Create Buttons - Only shown if showActionButtons is true */}
          {showActionButtons && (
            <div className="flex items-center gap-3">
              <button
                onClick={onUpload}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-hover transition-all shadow-sm text-sm"
              >
                <UploadIcon className="w-4 h-4" />
                <span>Upload</span>
              </button>
              <button
                onClick={onCreateFolder}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Create</span>
              </button>
            </div>
          )}

          {/* Right: View Mode Toggle - Only shown if showViewToggle is true */}
          {showViewToggle && (
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center bg-white border border-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                  className={`p-2 rounded-md transition ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-500 hover:text-primary hover:bg-gray-50'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                  className={`p-2 rounded-md transition ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-500 hover:text-primary hover:bg-gray-50'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;