import React, { useState, useEffect } from 'react';
import { FolderOpen, File, Clock, Loader2 } from 'lucide-react';
import { getSharedFilesForClient, type SharedFile } from '../lib/shareService';

interface ClientDashboardProps {
    clientId: string;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ clientId }) => {
    const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSharedFiles();
    }, [clientId]);

    const loadSharedFiles = async () => {
        setIsLoading(true);
        try {
            const files = await getSharedFilesForClient(clientId);
            setSharedFiles(files);
        } catch (error) {
            console.error('Error loading shared files:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const folderCount = sharedFiles.filter(f => f.filetype === 'folder').length;
    const fileCount = sharedFiles.filter(f => f.filetype === 'file').length;

    // Get files shared in the last 7 days
    const recentFiles = sharedFiles.filter(f => {
        const sharedDate = new Date(f.sharedat);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return sharedDate >= weekAgo;
    });

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-6 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Bem-vindo ao Linkar<span className="text-indigo-600">box</span>
                    </h1>
                    <p className="text-gray-600">
                        Aqui você pode acessar os arquivos compartilhados com você
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pastas Compartilhadas</p>
                                <p className="text-3xl font-bold text-indigo-600 mt-1">{folderCount}</p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <FolderOpen className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Arquivos Disponíveis</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">{fileCount}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <File className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Atualizações Recentes</p>
                                <p className="text-3xl font-bold text-blue-600 mt-1">{recentFiles.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Files or Empty State */}
                {sharedFiles.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                        <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                            Nenhum arquivo compartilhado ainda
                        </h2>
                        <p className="text-gray-600">
                            Quando o arquiteto compartilhar arquivos com você, eles aparecerão aqui.
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            Arquivos Recentes
                        </h2>
                        <div className="space-y-3">
                            {recentFiles.slice(0, 5).map((file) => (
                                <div
                                    key={file.id}
                                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        {file.filetype === 'folder' ? (
                                            <FolderOpen className="w-5 h-5 text-primary" />
                                        ) : (
                                            <File className="w-5 h-5 text-primary" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{file.filename}</p>
                                        <p className="text-sm text-gray-500">
                                            Compartilhado {new Date(file.sharedat).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {sharedFiles.length > 5 && (
                            <p className="text-sm text-gray-500 mt-4 text-center">
                                E mais {sharedFiles.length - 5} arquivo{sharedFiles.length - 5 !== 1 ? 's' : ''}...
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientDashboard;
