import React, { useState, useEffect } from 'react';
import type { FileItem, User } from '../types';
import { X, Star, Clock, Users, StickyNote, Info, Expand, ChevronDown } from 'lucide-react';
import AIAnalysis from './AIAnalysis';
import FileNotes from './FileNotes';
import { getUnreadNotesCount, markAllNotesAsRead } from '../lib/noteService';
import { getRegisteredFile } from '../lib/fileRegistryService';
import { supabase } from '../lib/supabase';
import { MOCK_USERS } from '../constants';

interface FileDetailPanelProps {
  item: FileItem;
  onClose: () => void;
  currentUser: User;
  onPreviewClick: (item: FileItem) => void;
  onFetchContent?: (item: FileItem) => Promise<string | null>;
  architectId?: string; // ID do arquiteto (para clientes)
}

type Tab = 'details' | 'notes';

const FileDetailPanel: React.FC<FileDetailPanelProps> = ({ item, onClose, currentUser, onPreviewClick, onFetchContent, architectId }) => {
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [showSharedUsers, setShowSharedUsers] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Buscar usuário atual
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    fetchUser();
  }, []);

  // Carregar contador de notas não lidas
  useEffect(() => {
    loadUnreadCount();
  }, [item.cloudId, currentUserId]);


  // Marcar notas como lidas quando abrir a aba Notes
  useEffect(() => {
    if (activeTab === 'notes') {
      markNotesAsReadForFile();
    }
  }, [activeTab]);

  const markNotesAsReadForFile = async () => {
    if (!item.cloudId || !currentUserId) return;

    const fileRegistry = await getRegisteredFile(item.cloudId, currentUserId);
    if (fileRegistry) {
      // Marcar todas as notas como lidas no banco de dados
      await markAllNotesAsRead(fileRegistry.id);
      // Atualizar o contador local
      setUnreadCount(0);
    }
  };

  const loadUnreadCount = async () => {
    if (!item.cloudId || !currentUserId) return;

    const fileRegistry = await getRegisteredFile(item.cloudId, currentUserId);
    if (fileRegistry) {
      const count = await getUnreadNotesCount(fileRegistry.id);
      setUnreadCount(count);
    }
  };

  const handleNotesChange = () => {
    loadUnreadCount();
  };

  const sharedWithUsers = (item.sharedWith || []).map(id => MOCK_USERS[id]).filter(Boolean);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notes':
        return <FileNotes item={item} onNotesChange={handleNotesChange} architectId={architectId} />;
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
                      {item.content?.substring(0, 300) || 'Preview Document'}
                    </p>
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-[1px] transition-opacity duration-300">
                    <div className="flex items-center gap-2 text-white font-semibold bg-primary px-4 py-2 rounded-full shadow-lg hover:bg-primary-hover transform hover:scale-105 transition-all">
                      <Expand className="w-4 h-4" />
                      <span>Preview Document</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <AIAnalysis item={item} onFetchContent={onFetchContent} />

            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 pt-4">Properties</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span className="flex items-center gap-2 text-gray-500"><Clock className="w-4 h-4" /> Last modified</span>
                  <span>{item.modified}</span>
                </div>
                <div
                  className="flex justify-between items-center cursor-pointer"
                  onClick={() => setShowSharedUsers(!showSharedUsers)}
                >
                  <span className="flex items-center gap-2 text-gray-500"><Users className="w-4 h-4" /> Shared with</span>
                  <span className="flex items-center gap-1">{item.sharedWith.length} people <ChevronDown className={`w-4 h-4 transition-transform ${showSharedUsers ? 'rotate-180' : ''}`} /></span>
                </div>
                {showSharedUsers && (
                  <div className="pt-2 pl-6 space-y-3">
                    {sharedWithUsers.map(user => (
                      <div key={user.id} className="flex items-center gap-3">
                        {user.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-sm text-gray-700">{user.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="flex items-center gap-2 text-gray-500"><Star className="w-4 h-4" /> Starred</span>
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
            <TabButton
              icon={StickyNote}
              label="Notes"
              isActive={activeTab === 'notes'}
              onClick={() => setActiveTab('notes')}
              badge={unreadCount > 0 ? unreadCount : undefined}
            />
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

const TabButton: React.FC<{
  icon: React.ElementType,
  label: string,
  isActive: boolean,
  onClick: () => void,
  badge?: number
}> = ({ icon: Icon, label, isActive, onClick, badge }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-1 py-3 border-b-2 text-sm font-medium transition-colors relative ${isActive
      ? 'border-primary text-primary'
      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
  >
    <Icon className="w-4 h-4" />
    {label}
    {badge !== undefined && badge > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
        {badge > 9 ? '9+' : badge}
      </span>
    )}
  </button>
);


export default FileDetailPanel;