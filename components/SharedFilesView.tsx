import React, { useState, useEffect } from 'react';
import { Search, FolderOpen, FileText, Loader2, Trash2, Grid, List, Info, X } from 'lucide-react';
import { getSharedFilesByArchitect, unshareFile, type SharedFile } from '../lib/shareService';
import { getClients, type Client } from '../lib/clientService';
import type { FileItem } from '../types';

interface SharedFilesViewProps {
    architectId: string;
    viewMode: 'grid' | 'list';
    onItemClick?: (item: FileItem) => void;
}

const SharedFilesView: React.FC<SharedFilesViewProps> = ({
    architectId,
    viewMode: initialViewMode,
    onItemClick,
}) => {
    const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(initialViewMode);
    const [selectedFileForDetails, setSelectedFileForDetails] = useState<string | null>(null);
    const [fileToDelete, setFileToDelete] = useState<string | null>(null);

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

    const handleUnshareAll = async (cloudFileId: string) => {
        const filesToUnshare = sharedFiles.filter(f => f.cloudfileid === cloudFileId);

        try {
            await Promise.all(filesToUnshare.map(f => unshareFile(f.id)));
            await loadData();
            setFileToDelete(null);
        } catch (error) {
            console.error('Error unsharing file:', error);
            alert('Erro ao remover compartilhamento. Tente novamente.');
        }
    };

    const handleUnshareClient = async (shareId: string) => {
        const success = await unshareFile(shareId);
        if (success) {
            await loadData();
        } else {
            alert('Erro ao remover compartilhamento. Tente novamente.');
        }
    };

    const getClientName = (clientId: string) => {
        const client = clients.find(c => c.user_id === clientId || c.id === clientId);
        return client?.name || 'Cliente desconhecido';
    };

    const getClientInitials = (clientId: string) => {
        const name = getClientName(clientId);
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const filteredFiles = sharedFiles.filter(file =>
        file.filename.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Group files by cloudfileid
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

    const selectedFileGroup = groupedFiles.find(f => f.cloudfileid === selectedFileForDetails);
    const fileGroupToDelete = groupedFiles.find(f => f.cloudfileid === fileToDelete);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Search bar with view toggle */}
            <div className="mb-6 flex items-center gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                </div>

                {/* View mode toggle */}
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                        title="Visualização em grade"
                    >
                        <Grid className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
                        title="Visualização em lista"
                    >
                        <List className="w-4 h-4" />
                    </button>
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
                        {searchQuery
                            ? 'Nenhum arquivo encontrado com os filtros aplicados.'
                            : 'Compartilhe arquivos com seus clientes para que apareçam aqui.'}
                    </p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto space-y-3">
                    {groupedFiles.map((fileGroup) => (
                        <div
                            key={fileGroup.cloudfileid}
                            onDoubleClick={() => {
                                if (onItemClick) {
                                    onItemClick({
                                        id: fileGroup.cloudfileid,
                                        name: fileGroup.filename,
                                        type: fileGroup.filetype === 'folder' ? 'FOLDER' : 'FILE',
                                        mimeType: fileGroup.mimetype,
                                        size: '0',
                                        modifiedTime: new Date().toISOString(),
                                        parentId: null,
                                        sharedWith: [],
                                        isStarred: false,
                                    });
                                }
                            }}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-primary transition-all cursor-pointer"
                        >
                            {/* Top row: Icon + Name on left, Buttons on right */}
                            <div className="flex items-center justify-between mb-3">
                                {/* Left: Icon and name */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        {fileGroup.filetype === 'folder' ? (
                                            <FolderOpen className="w-5 h-5 text-primary" />
                                        ) : (
                                            <FileText className="w-5 h-5 text-primary" />
                                        )}
                                    </div>
                                    <h4 className="font-medium text-gray-900 truncate">
                                        {fileGroup.filename}
                                    </h4>
                                </div>

                                {/* Right: Buttons and date in single container */}
                                <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                                    {/* Buttons */}
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedFileForDetails(fileGroup.cloudfileid);
                                            }}
                                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                        >
                                            <Info className="w-4 h-4" />
                                            Detalhes
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setFileToDelete(fileGroup.cloudfileid);
                                            }}
                                            className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Remover
                                        </button>
                                    </div>

                                    {/* Date */}
                                    <span className="text-xs text-gray-500">
                                        Compartilhado em {new Date(fileGroup.shares[0].sharedat).toLocaleDateString('pt-BR', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        })}, {new Date(fileGroup.shares[0].sharedat).toLocaleTimeString('pt-BR', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>

                            {/* Second row: Client avatars aligned left */}
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-1.5">
                                    {fileGroup.shares.slice(0, 3).map((share) => (
                                        <div
                                            key={share.id}
                                            className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-[10px] font-semibold border-2 border-white"
                                            title={getClientName(share.client_id)}
                                        >
                                            {getClientInitials(share.client_id)}
                                        </div>
                                    ))}
                                </div>
                                {fileGroup.shares.length > 1 && (
                                    <span className="text-[11px] text-gray-500">
                                        Você +{fileGroup.shares.length - 1}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Details Modal */}
            {selectedFileGroup && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900">Detalhes do Compartilhamento</h3>
                            <button
                                onClick={() => setSelectedFileForDetails(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="mb-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                        {selectedFileGroup.filetype === 'folder' ? (
                                            <FolderOpen className="w-6 h-6 text-primary" />
                                        ) : (
                                            <FileText className="w-6 h-6 text-primary" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-medium text-gray-900">{selectedFileGroup.filename}</h4>
                                        <p className="text-sm text-gray-500">
                                            {selectedFileGroup.filetype === 'folder' ? 'Pasta' : 'Arquivo'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h5 className="text-sm font-semibold text-gray-700 mb-3">
                                    Compartilhado com ({selectedFileGroup.shares.length})
                                </h5>
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                    {selectedFileGroup.shares.map((share) => (
                                        <div
                                            key={share.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-sm font-semibold">
                                                    {getClientInitials(share.client_id)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">
                                                        {getClientName(share.client_id)}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(share.sharedat).toLocaleDateString('pt-BR', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleUnshareClient(share.id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Remover acesso"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-gray-200">
                            <button
                                onClick={() => setSelectedFileForDetails(null)}
                                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {fileGroupToDelete && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                                Remover Compartilhamento
                            </h3>
                            <p className="text-gray-600 text-center mb-6">
                                Tem certeza que deseja remover o compartilhamento de <strong>{fileGroupToDelete.filename}</strong>?
                                <br />
                                <span className="text-red-600 font-medium">
                                    Todos os {fileGroupToDelete.shares.length} cliente(s) perderão o acesso.
                                </span>
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setFileToDelete(null)}
                                    className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => handleUnshareAll(fileGroupToDelete.cloudfileid)}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                >
                                    Remover
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SharedFilesView;
