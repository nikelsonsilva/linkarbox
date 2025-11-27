import React, { useState, useEffect } from 'react';
import { Home, Share2, FolderOpen, File, Clock, Loader2, LogOut, User, Grid, List, Search, Download, ExternalLink } from 'lucide-react';
import { getSharedFilesForClient, type SharedFile } from '../lib/shareService';
import { supabase } from '../lib/supabase';

interface ClientDashboardProps {
    clientId: string;
}

type Page = 'home' | 'shared';

const ClientDashboard: React.FC<ClientDashboardProps> = ({ clientId }) => {
    const [sharedFiles, setSharedFiles] = useState<SharedFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [activePage, setActivePage] = useState<Page>('home');
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadUserData();
        loadSharedFiles();
    }, [clientId]);

    const loadUserData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            setCurrentUser(profile);
        }
    };

    const loadSharedFiles = async () => {
        setIsLoading(true);
        try {
            console.log('=== CLIENT DASHBOARD DEBUG ===');
            console.log('Loading shared files for client ID:', clientId);

            const files = await getSharedFilesForClient(clientId);

            console.log('Total files loaded:', files.length);
            console.log('Files data:', JSON.stringify(files, null, 2));

            if (files.length > 0) {
                console.log('First file sample:', files[0]);
                console.log('Has web_view_link?', !!files[0].web_view_link);
                console.log('Has file_url?', !!files[0].file_url);
            }

            setSharedFiles(files);
        } catch (error) {
            console.error('Error loading shared files:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.href = '/';
    };

    const handleFileClick = (file: SharedFile) => {
        // Open file in new tab if we have a view link
        if (file.web_view_link) {
            window.open(file.web_view_link, '_blank');
        } else {
            alert('Link de visualização não disponível para este arquivo.');
        }
    };

    const handleDownload = (file: SharedFile, e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering file click
        // Open download link if available
        if (file.file_url) {
            window.open(file.file_url, '_blank');
        } else if (file.web_view_link) {
            // Fallback to view link
            window.open(file.web_view_link, '_blank');
        } else {
            alert('Link de download não disponível para este arquivo.');
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

    // Filter files based on search query
    const filteredFiles = sharedFiles.filter(file =>
        file.filename.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F7F9FC] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#F7F9FC] font-sans overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
                {/* Logo */}
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Linkar<span className="text-primary">box</span>
                    </h1>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4">
                    <div className="space-y-1">
                        <button
                            onClick={() => setActivePage('home')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activePage === 'home'
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <Home className="w-5 h-5" />
                            <span>Home</span>
                        </button>

                        <button
                            onClick={() => setActivePage('shared')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activePage === 'shared'
                                ? 'bg-primary/10 text-primary font-medium'
                                : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <Share2 className="w-5 h-5" />
                            <span>Compartilhados</span>
                        </button>
                    </div>
                </nav>

                {/* User Profile at Bottom */}
                <div className="p-4 border-t border-gray-200">
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 text-left">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {currentUser?.name || 'Cliente'}
                                </p>
                                <p className="text-xs text-gray-500">Cliente</p>
                            </div>
                        </button>

                        {showProfileMenu && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-900">{currentUser?.name}</p>
                                    <p className="text-xs text-gray-500">{currentUser?.email}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sair
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {activePage === 'home' ? 'Bem-vindo!' : 'Arquivos Compartilhados'}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {activePage === 'home'
                                    ? `Olá, ${currentUser?.name?.split(' ')[0] || 'Cliente'}! Aqui estão seus arquivos compartilhados.`
                                    : 'Todos os arquivos e pastas compartilhados com você'}
                            </p>
                        </div>

                        {activePage === 'shared' && sharedFiles.length > 0 && (
                            <div className="flex items-center gap-3">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar arquivos..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent w-64"
                                    />
                                </div>

                                {/* View Mode Toggle */}
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
                        )}
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-6">
                    {activePage === 'home' ? (
                        <div className="max-w-7xl mx-auto">
                            {/* Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-600">Pastas Compartilhadas</p>
                                            <p className="text-3xl font-bold text-primary mt-1">{folderCount}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                                            <FolderOpen className="w-6 h-6 text-primary" />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
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

                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
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

                            {/* Recent Files */}
                            {sharedFiles.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                                    <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        Nenhum arquivo compartilhado ainda
                                    </h3>
                                    <p className="text-gray-600">
                                        Quando o arquiteto compartilhar arquivos com você, eles aparecerão aqui.
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                                    <div className="p-6 border-b border-gray-100">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Arquivos Recentes
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Últimos arquivos compartilhados nos últimos 7 dias
                                        </p>
                                    </div>
                                    <div className="p-6">
                                        {recentFiles.length === 0 ? (
                                            <p className="text-center text-gray-500 py-8">
                                                Nenhuma atualização recente
                                            </p>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {recentFiles.slice(0, 6).map((file) => (
                                                    <div
                                                        key={file.id}
                                                        onClick={() => handleFileClick(file)}
                                                        className="group p-4 rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all cursor-pointer relative"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                                {file.filetype === 'folder' ? (
                                                                    <FolderOpen className="w-6 h-6 text-primary" />
                                                                ) : (
                                                                    <File className="w-6 h-6 text-primary" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-gray-900 truncate mb-1">
                                                                    {file.filename}
                                                                </p>
                                                                <p className="text-xs text-gray-500">
                                                                    {new Date(file.sharedat).toLocaleDateString('pt-BR')}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {/* Download button */}
                                                        {(file.file_url || file.web_view_link) && (
                                                            <button
                                                                onClick={(e) => handleDownload(file, e)}
                                                                className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white"
                                                                title="Baixar arquivo"
                                                            >
                                                                <Download className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {recentFiles.length > 6 && (
                                            <div className="mt-4 text-center">
                                                <button
                                                    onClick={() => setActivePage('shared')}
                                                    className="text-primary hover:text-primary/80 font-medium text-sm"
                                                >
                                                    Ver todos os arquivos →
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="max-w-7xl mx-auto">
                            {/* Shared Files View */}
                            {filteredFiles.length === 0 ? (
                                <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                                    <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        {searchQuery ? 'Nenhum arquivo encontrado' : 'Nenhum arquivo compartilhado ainda'}
                                    </h3>
                                    <p className="text-gray-600">
                                        {searchQuery
                                            ? 'Tente buscar com outros termos'
                                            : 'Quando o arquiteto compartilhar arquivos com você, eles aparecerão aqui.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                                    <div className="p-6 border-b border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Todos os Arquivos
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {filteredFiles.length} {filteredFiles.length === 1 ? 'item' : 'itens'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {viewMode === 'grid' ? (
                                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                            {filteredFiles.map((file) => (
                                                <div
                                                    key={file.id}
                                                    onClick={() => handleFileClick(file)}
                                                    className="group p-4 rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all cursor-pointer relative"
                                                >
                                                    <div className="flex flex-col items-center text-center">
                                                        <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                                                            {file.filetype === 'folder' ? (
                                                                <FolderOpen className="w-8 h-8 text-primary" />
                                                            ) : (
                                                                <File className="w-8 h-8 text-primary" />
                                                            )}
                                                        </div>
                                                        <p className="font-medium text-gray-900 truncate w-full mb-1">
                                                            {file.filename}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(file.sharedat).toLocaleDateString('pt-BR')}
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {file.cloud_provider === 'google' ? 'Google Drive' : 'Dropbox'}
                                                        </p>
                                                    </div>
                                                    {/* Download button */}
                                                    {(file.file_url || file.web_view_link) && (
                                                        <button
                                                            onClick={(e) => handleDownload(file, e)}
                                                            className="absolute top-2 right-2 p-2 bg-white rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white"
                                                            title="Baixar arquivo"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-gray-100">
                                            {filteredFiles.map((file) => (
                                                <div
                                                    key={file.id}
                                                    onClick={() => handleFileClick(file)}
                                                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer group"
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
                                                            {file.filetype === 'folder' ? 'Pasta' : 'Arquivo'} • Compartilhado em {new Date(file.sharedat).toLocaleDateString('pt-BR')}
                                                        </p>
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {file.cloud_provider === 'google' ? 'Google Drive' : 'Dropbox'}
                                                    </div>
                                                    {/* Download button for list view */}
                                                    {(file.file_url || file.web_view_link) && (
                                                        <button
                                                            onClick={(e) => handleDownload(file, e)}
                                                            className="p-2 rounded-lg hover:bg-primary hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                                                            title="Baixar arquivo"
                                                        >
                                                            <Download className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default ClientDashboard;
