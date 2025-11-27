import React, { useState, useEffect } from 'react';
import { FileText, FolderOpen, Users, Trash2, Loader2, Search } from 'lucide-react';
import { getSharedFilesByArchitect, unshareFile, type SharedFile } from '../lib/shareService';
import { getClients, type Client } from '../lib/clientService';

interface SharedFilesViewProps {
    architectId: string;
    viewMode: 'grid' | 'list';
    onItemClick?: (file: SharedFile) => void;
}

const SharedFilesView: React.FC<SharedFilesViewProps> = ({
    architectId,
    viewMode,
    onItemClick,
}) => {
    const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedClient, setSelectedClient] = useState<string>('all');

    useEffect(() => {
        loadData();
    }, [architectId]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [filesData, clientsData] = await Promise.all([
                getSharedFilesByArchitect(architectId),
                getClients(),
            ]);

            setSharedFiles(filesData);
            if (clientsData.data) {
                setClients(clientsData.data);
            }
        } catch (error) {
            console.error('Error loading shared files:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnshare = async (shareId: string) => {
        if (!window.confirm('Tem certeza que deseja remover este compartilhamento?')) {
            return;
        }

        const success = await unshareFile(shareId);
        if (success) {
            setSharedFiles(sharedFiles.filter(f => f.id !== shareId));
        } else {
            alert('Erro ao remover compartilhamento. Tente novamente.');
        }
    };

    const getClientName = (clientId: string) => {
        const client = clients.find(c => c.id === clientId);
        return client?.name || 'Cliente desconhecido';
    };

    const filteredFiles = sharedFiles.filter(file => {
        const matchesSearch = file.filename.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesClient = selectedClient === 'all' || file.client_id === selectedClient;
        return matchesSearch && matchesClient;
    });

    // Group files by cloudfileid to show all clients a file is shared with
    const groupedFiles = filteredFiles.reduce((acc, file) => {
        const existing = acc.find(f => f.cloudfileid === file.cloudfileid);
        if (existing) {
            existing.shares.push(file);
        } else {
            acc.push({
                cloudfileid: file.cloudfileid,
                filename: file.filename,
                filetype: file.filetype,
                mimetype: file.mimetype,
                cloud_provider: file.cloud_provider,
                shares: [file],
            });
        }
        return acc;
    }, [] as Array<{
        cloudfileid: string;
        filename: string;
        filetype: 'file' | 'folder';
        mimetype?: string;
        cloud_provider: string;
        shares: SharedFile[];
    }>);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header with filters */}
            <div className="mb-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar arquivos compartilhados..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <select
                        value={selectedClient}
                        onChange={(e) => setSelectedClient(e.target.value)}
                        className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                        <option value="all">Todos os clientes</option>
                        {clients.map(client => (
                            <option key={client.id} value={client.id}>
                                {client.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                        {groupedFiles.length} arquivo{groupedFiles.length !== 1 ? 's' : ''} compartilhado{groupedFiles.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            {/* Files list */}
            {groupedFiles.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                    <FolderOpen className="w-16 h-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Nenhum arquivo compartilhado
                    </h3>
                    <p className="text-gray-600 max-w-md">
                        {searchQuery || selectedClient !== 'all'
                            ? 'Nenhum arquivo encontrado com os filtros aplicados.'
                            : 'Compartilhe arquivos com seus clientes para que apareçam aqui.'}
                    </p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto">
                    <div className="space-y-3">
                        {groupedFiles.map((fileGroup) => (
                            <div
                                key={fileGroup.cloudfileid}
                                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            {fileGroup.filetype === 'folder' ? (
                                                <FolderOpen className="w-5 h-5 text-primary" />
                                            ) : (
                                                <FileText className="w-5 h-5 text-primary" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-gray-900 truncate">
                                                {fileGroup.filename}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                <p className="text-sm text-gray-600">
                                                    Compartilhado com {fileGroup.shares.length} cliente{fileGroup.shares.length !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {fileGroup.shares.map((share) => (
                                                    <div
                                                        key={share.id}
                                                        className="inline-flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1"
                                                    >
                                                        <span className="text-sm text-gray-700">
                                                            {getClientName(share.client_id)}
                                                        </span>
                                                        <button
                                                            onClick={() => handleUnshare(share.id)}
                                                            className="text-gray-500 hover:text-red-600 transition-colors"
                                                            title="Remover compartilhamento"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SharedFilesView;
