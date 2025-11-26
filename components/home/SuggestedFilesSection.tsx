import React from 'react';
import { FileItem } from '../../types';
import { FileText, Star, MoreVertical } from 'lucide-react';

interface SuggestedFilesSectionProps {
    files: FileItem[];
    onItemClick: (item: FileItem) => void;
    onToggleStar: (itemId: string) => void;
    onShareItem: (item: FileItem) => void;
}

const SuggestedFilesSection: React.FC<SuggestedFilesSectionProps> = ({
    files,
    onItemClick,
    onToggleStar,
    onShareItem,
}) => {
    if (files.length === 0) {
        return (
            <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="text-gray-400 mb-2">
                    <FileText className="w-12 h-12 mx-auto opacity-30" />
                </div>
                <p className="text-gray-500 text-sm">
                    Seus arquivos recentes aparecerão aqui
                </p>
            </div>
        );
    }

    const getFileIcon = (item: FileItem) => {
        if (item.mimeType?.includes('pdf')) {
            return (
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 18h12V6h-4V2H4v16zm-2 1V0h12l4 4v16H2v-1z" />
                    </svg>
                </div>
            );
        }
        if (item.mimeType?.includes('image')) {
            return (
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                    </svg>
                </div>
            );
        }
        return (
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className="w-4 h-4 text-gray-600" />
            </div>
        );
    };

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.slice(0, 6).map(file => (
                <div
                    key={file.id}
                    onClick={() => onItemClick(file)}
                    className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-pointer group"
                >
                    <div className="flex items-start justify-between mb-2">
                        {getFileIcon(file)}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleStar(file.id);
                                }}
                                className="p-1 hover:bg-gray-100 rounded transition-colors"
                            >
                                <Star
                                    className={`w-3 h-3 ${file.isStarred
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-400'
                                        }`}
                                />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                                className="p-1 hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <MoreVertical className="w-3 h-3 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    <h4 className="font-semibold text-gray-900 text-sm mb-0.5 truncate">
                        {file.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                        <span className="flex items-center gap-0.5">
                            <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                            </svg>
                            Com você
                        </span>
                        <span>•</span>
                        <span>{file.modified}</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SuggestedFilesSection;
