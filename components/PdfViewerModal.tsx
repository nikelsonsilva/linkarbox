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
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="h-16 flex-shrink-0 flex items-center justify-between px-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 truncate">{item.name}</h2>
          <button onClick={onClose} className="p-2 text-gray-500 rounded-full hover:bg-gray-200/50">
            <X className="w-5 h-5" />
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
            <div className="bg-white p-12 shadow-lg max-w-3xl mx-auto">
                <pre className="text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {item.content || 'No content available for this PDF.'}
                </pre>
            </div>
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