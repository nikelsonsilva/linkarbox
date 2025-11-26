import React from 'react';
import type { FileItem } from '../types';
import { ChevronRight } from 'lucide-react';

interface BreadcrumbsProps {
  path: FileItem[];
  onNavigate: (folderId: string | null) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ path, onNavigate }) => {
  return (
    <nav className="flex items-center text-sm text-gray-500 mb-4">
      <button onClick={() => onNavigate(null)} className="hover:text-primary transition-colors">
        Home
      </button>
      {path.map((folder, index) => (
        <React.Fragment key={folder.id}>
          <ChevronRight className="w-4 h-4 mx-1" />
          <button
            onClick={() => onNavigate(folder.id)}
            className={`hover:text-primary transition-colors ${index === path.length - 1 ? 'font-semibold text-gray-700' : ''}`}
            disabled={index === path.length - 1}
          >
            {folder.name}
          </button>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
