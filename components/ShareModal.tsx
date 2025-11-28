import React, { useState, useEffect } from 'react';
import type { FileItem } from '../types';
import { X, Search, Loader2 } from 'lucide-react';
import { getClients, type Client } from '../lib/clientService';
import {
  shareFileWithClient,
  unshareFileWithClient,
  getClientsForFile,
} from '../lib/shareService';

interface ShareModalProps {
  item: FileItem;
  onClose: () => void;
  architectId: string;
  cloudProvider: 'google' | 'dropbox';
  dropboxClient?: any;
  onShareComplete?: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({
  item,
  onClose,
  architectId,
  cloudProvider,
  dropboxClient,
  onShareComplete,
}) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [sharedClientIds, setSharedClientIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [item.id]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch all clients
      const { data: clientsData } = await getClients();
      if (clientsData) {
        setClients(clientsData.filter(c => c.status === 'active'));
      }

      // Fetch clients this file is already shared with
      const sharedIds = await getClientsForFile(architectId, item.id);
      setSharedClientIds(sharedIds);
    } catch (error) {
      console.error('Error loading share data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async (clientId: string) => {
    setIsSaving(true);
    try {
      // Find the client to get their user_id
      const client = clients.find(c => c.id === clientId);

      console.log('=== SHARE DEBUG ===');
      console.log('Attempting to share with client ID:', clientId);
      console.log('Client found:', client);
      console.log('Client user_id:', client?.user_id);

      if (!client) {
        alert('Cliente não encontrado.');
        return;
      }

      // Check if client has a user_id (auth.users ID)
      if (!client.user_id) {
        console.warn('Client does not have user_id, but will attempt to share anyway');
        console.log('Using client.id as fallback:', client.id);
        // Don't block - we'll use client.id as fallback
      }

      // Import the file access function
      const { getFileAccessLinks } = await import('../lib/cloudFileAccess');

      // Get file access links based on cloud provider
      let fileLinks;
      try {
        console.log('Attempting to generate file access links for:', item.name);
        console.log('Cloud provider:', cloudProvider);
        console.log('File ID:', item.id);

        // For Google Drive, we can get links directly
        if (cloudProvider === 'google') {
          fileLinks = await getFileAccessLinks('google', item.id);
          console.log('Successfully generated Google Drive links:', fileLinks);
        } else if (cloudProvider === 'dropbox') {
          // For Dropbox, use the dropbox client if available
          if (dropboxClient) {
            console.log('Generating Dropbox links with client...');
            fileLinks = await getFileAccessLinks('dropbox', item.id, dropboxClient);
            console.log('Successfully generated Dropbox links:', fileLinks);
          } else {
            console.warn('Dropbox client not available, sharing without links');
            fileLinks = {
              webViewLink: undefined,
              downloadLink: undefined,
              thumbnailLink: undefined,
              iconLink: undefined
            };
          }
        }
      } catch (linkError) {
        console.error('Error getting file access links:', linkError);
        console.error('Link error details:', JSON.stringify(linkError, null, 2));

        // Continue without links - better to share without links than fail completely
        fileLinks = {
          webViewLink: undefined,
          downloadLink: undefined,
          thumbnailLink: undefined,
          iconLink: undefined
        };

        // Show warning to user but don't block sharing
        console.warn('Compartilhando sem links de acesso. O cliente pode não conseguir visualizar o arquivo.');
      }

      // Use client.user_id instead of client.id, with fallback
      const clientIdToUse = client.user_id || client.id;
      console.log('Client ID to use for sharing:', clientIdToUse);
      console.log('Using user_id?', !!client.user_id);

      const result = await shareFileWithClient({
        architectId,
        clientId: clientIdToUse,
        cloudProvider,
        cloudFileId: item.id,
        fileName: item.name,
        fileType: item.type === 'FOLDER' ? 'folder' : 'file',
        mimeType: item.mimeType,
        filePath: item.parentId || undefined,
        fileSize: item.size ? parseInt(item.size) : undefined,
        // Pass the file access links
        webViewLink: fileLinks?.webViewLink,
        fileUrl: fileLinks?.downloadLink,
        thumbnailUrl: fileLinks?.thumbnailLink,
        iconLink: fileLinks?.iconLink,
      });

      if (result) {
        setSharedClientIds([...sharedClientIds, client.id]); // Still use client.id for UI tracking
        onShareComplete?.();
      } else {
        alert('Erro ao compartilhar arquivo. Tente novamente.');
      }
    } catch (error) {
      console.error('Error sharing file:', error);
      alert('Erro ao compartilhar arquivo.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnshare = async (clientId: string) => {
    setIsSaving(true);
    try {
      const success = await unshareFileWithClient(architectId, clientId, item.id);
      if (success) {
        setSharedClientIds(sharedClientIds.filter(id => id !== clientId));
        onShareComplete?.();
      } else {
        alert('Erro ao remover compartilhamento. Tente novamente.');
      }
    } catch (error) {
      console.error('Error unsharing file:', error);
      alert('Erro ao remover compartilhamento.');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sharedClients = filteredClients.filter(c => sharedClientIds.includes(c.id));
  const unsharedClients = filteredClients.filter(c => !sharedClientIds.includes(c.id));

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Compartilhar "{item.name}"
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 rounded-full hover:bg-gray-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar cliente por nome ou email"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {sharedClients.length > 0 && (
                <>
                  <h3 className="font-semibold text-gray-600 text-sm">
                    Compartilhado com
                  </h3>
                  {sharedClients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-primary font-semibold text-sm">
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{client.name}</p>
                          <p className="text-xs text-gray-500">{client.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnshare(client.id)}
                        disabled={isSaving}
                        className="text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        Remover
                      </button>
                    </div>
                  ))}
                </>
              )}

              {unsharedClients.length > 0 && (
                <>
                  <h3 className="font-semibold text-gray-600 text-sm pt-2">
                    Compartilhar com
                  </h3>
                  {unsharedClients.map((client) => (
                    <div
                      key={client.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 font-semibold text-sm">
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{client.name}</p>
                          <p className="text-xs text-gray-500">{client.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleShare(client.id)}
                        disabled={isSaving}
                        className="text-sm font-semibold text-primary hover:text-primary-hover disabled:opacity-50"
                      >
                        Compartilhar
                      </button>
                    </div>
                  ))}
                </>
              )}

              {filteredClients.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  {searchQuery
                    ? 'Nenhum cliente encontrado'
                    : 'Você ainda não tem clientes cadastrados'}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="p-6 bg-gray-50 rounded-b-2xl flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-hover transition-colors"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;