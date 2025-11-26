import React from 'react';
import { X } from 'lucide-react';
import type { Page, Role } from '../types';
import { SIDEBAR_ITEMS } from '../constants';
import CloudStorageWidget from './CloudStorageWidget';

interface SidebarProps {
  activePage: Page;
  onPageChange: (page: Page) => void;
  userRole: Role;
  isOpen: boolean;
  onClose: () => void;
  isCloudConnected: boolean;
  cloudProvider?: 'google' | 'dropbox' | null;
  storageUsed?: number;
  storageTotal?: number;
}

const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onPageChange,
  userRole,
  isOpen,
  onClose,
  isCloudConnected,
  cloudProvider = null,
  storageUsed = 114,
  storageTotal = 15
}) => {
  const navItems = SIDEBAR_ITEMS[userRole] ?? SIDEBAR_ITEMS['client'];

  return (
    <aside className={`fixed inset-y-0 left-0 w-64 bg-white flex flex-col flex-shrink-0 h-full border-r border-gray-200/60 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Header */}
      <div className="h-24 flex items-center justify-between px-8">
        <h1 className="text-2xl font-bold text-gray-800">Linkar<span className="text-primary">box</span></h1>
        <button onClick={onClose} className="md:hidden p-2 text-gray-500 rounded-full hover:bg-gray-200/50">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 mt-4">
        {(navItems || []).map((item, index) => {
          const IconComponent = item.icon;
          const isSection = item.isSection;

          // Section header (ARMAZENAMENTOS)
          if (isSection) {
            return (
              <div key={item.id}>
                <div className="px-4 pt-6 pb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    ARMAZENAMENTOS
                  </h3>
                </div>
                <button
                  onClick={() => onPageChange(item.id as Page)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activePage === item.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <IconComponent className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </div>
            );
          }

          // Regular menu item
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id as Page)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activePage === item.id
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
            >
              <IconComponent className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Cloud Storage Widget */}
      <CloudStorageWidget
        cloudProvider={cloudProvider}
        usedStorage={storageUsed}
        totalStorage={storageTotal}
      />
    </aside>
  );
};

export default Sidebar;
