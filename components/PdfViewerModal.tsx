import React from 'react';
import type { FileItem } from '../types';
import { X } from 'lucide-react';

interface PdfViewerModalProps {
  item: FileItem;
  onClose: () => void;
}

const PdfViewerModal: React.FC<PdfViewerModalProps> = ({ item, onClose }) => {
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white w-full h-full md:w-[95vw] md:h-[95vh] md:rounded-2xl shadow-2xl flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-gray-200 bg-white z-10">
          <h2 className="text-lg font-semibold text-gray-800 truncate">{item.name}</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-gray-500 rounded-full hover:bg-gray-100 transition-colors"
              title="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </header>
        <main className="flex-1 bg-gray-100 relative">
          {item.url ? (
            <iframe
              src={item.url}
              className="w-full h-full border-0"
              title={item.name}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <p className="text-lg font-medium">No PDF URL available</p>
              <p className="text-sm mt-2">This is a mock file without a linked PDF document.</p>
            </div>
          )}
        </main>
      </div>
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fade-in 0.2s ease-out forwards;
        }
       `}</style>
    </div>
  );
};

export default PdfViewerModal;