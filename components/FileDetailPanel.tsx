import React, { useState } from 'react';
import type { FileItem, User } from '../types';
import { X, Star, Clock, Users, MessageSquare, StickyNote, Info, Expand, ChevronDown } from 'lucide-react';
import AIAnalysis from './AIAnalysis';
import FileChat from './FileChat';
import FileNotes from './FileNotes';
import { MOCK_USERS } from '../constants';

interface FileDetailPanelProps {
  item: FileItem;
  onClose: () => void;
  currentUser: User;
  onPreviewClick: (item: FileItem) => void;
}

type Tab = 'details' | 'chat' | 'notes';

const FileDetailPanel: React.FC<FileDetailPanelProps> = ({ item, onClose, currentUser, onPreviewClick }) => {
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [showSharedUsers, setShowSharedUsers] = useState(false);

  const sharedWithUsers = item.sharedWith.map(id => MOCK_USERS[id]).filter(Boolean);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return <FileChat item={item} currentUser={currentUser} />;
      case 'notes':
        return <FileNotes item={item} />;
      case 'details':
      default:
        return (
          <div className="space-y-6">
            {(item.mimeType === 'application/pdf' || item.mimeType?.startsWith('image/')) && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Preview</h3>
                <div 
                  className="group relative border border-gray-200/80 rounded-xl overflow-hidden cursor-pointer hover:border-primary transition-colors"
                  onClick={() => onPreviewClick(item)}
                >
                    <div className="bg-gray-50 p-3 border-b border-gray-200/80">
                        <p className="text-sm font-medium text-gray-700 truncate">{item.name}</p>
                    </div>
                    <div className="p-4 h-56 overflow-hidden relative bg-white">
                        <p className="text-sm text-gray-600 whitespace-pre-wrap font-sans">
                            {item.content?.substring(0, 300) || 'No content preview available.'}
                        </p>
                        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                    </div>
                     <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex items-center gap-2 text-white font-semibold bg-black/40 px-4 py-2 rounded-full">
                            <Expand className="w-4 h-4" />
                            <span>Click to expand</span>
                        </div>
                    </div>
                </div>
              </div>
            )}
            
            <AIAnalysis item={item} />
            
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 pt-4">Properties</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="flex items-center gap-2 text-gray-500"><Clock className="w-4 h-4"/> Last modified</span>
                  <span>{item.modified}</span>
                </div>
                 <div 
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setShowSharedUsers(!showSharedUsers)}
                  >
                  <span className="flex items-center gap-2 text-gray-500"><Users className="w-4 h-4"/> Shared with</span>
                  <span className="flex items-center gap-1">{item.sharedWith.length} people <ChevronDown className={`w-4 h-4 transition-transform ${showSharedUsers ? 'rotate-180' : ''}`} /></span>
                </div>
                {showSharedUsers && (
                    <div className="pt-2 pl-6 space-y-3">
                        {sharedWithUsers.map(user => (
                            <div key={user.id} className="flex items-center gap-3">
                                <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                                <div>
                                    <p className="font-medium text-sm text-gray-700">{user.name}</p>
                                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                 <div className="flex justify-between">
                  <span className="flex items-center gap-2 text-gray-500"><Star className="w-4 h-4"/> Starred</span>
                  <span>{item.isStarred ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/10 z-30 md:hidden" onClick={onClose}></div>
      <aside className="fixed inset-0 w-full h-full md:relative md:w-96 md:h-auto md:inset-auto flex-shrink-0 bg-white border-l border-gray-200/80 flex flex-col z-40 md:animate-slide-in">
        <div className="h-24 flex items-center justify-between px-6 border-b border-gray-200/80">
          <h2 className="text-lg font-semibold text-gray-800 truncate max-w-[250px]">{item.name}</h2>
          <button onClick={onClose} className="p-2 text-gray-500 rounded-full hover:bg-gray-200/50">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="border-b border-gray-200/80 px-4">
            <nav className="flex gap-4 -mb-px">
                 <TabButton icon={Info} label="Details" isActive={activeTab === 'details'} onClick={() => setActiveTab('details')} />
                 <TabButton icon={MessageSquare} label="Chat" isActive={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
                 <TabButton icon={StickyNote} label="Notes" isActive={activeTab === 'notes'} onClick={() => setActiveTab('notes')} />
            </nav>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {renderTabContent()}
        </div>
      </aside>
       <style>{`
        @keyframes slide-in {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
        .md\\:animate-slide-in {
            animation: slide-in 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
       `}</style>
    </>
  );
};

const TabButton: React.FC<{icon: React.ElementType, label: string, isActive: boolean, onClick: () => void}> = ({ icon: Icon, label, isActive, onClick }) => (
    <button 
        onClick={onClick}
        className={`flex items-center gap-2 px-1 py-3 border-b-2 text-sm font-medium transition-colors ${
            isActive 
            ? 'border-primary text-primary' 
            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }`}
    >
        <Icon className="w-4 h-4" />
        {label}
    </button>
);


export default FileDetailPanel;