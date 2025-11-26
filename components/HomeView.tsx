import React from 'react';
import { User, FileItem } from '../types';
import PersonalizedGreeting from './home/PersonalizedGreeting';
import CloudStatusCard from './home/CloudStatusCard';
import SuggestedFilesSection from './home/SuggestedFilesSection';

interface HomeViewProps {
    user: User;
    isDriveConnected: boolean;
    isDropboxConnected: boolean;
    onConnectGoogleDrive: () => void;
    onDisconnectGoogleDrive: () => void;
    onConnectDropbox: () => void;
    onDisconnectDropbox: () => void;
    onNavigateToCloud: () => void;
    storageInfo: {
        provider: 'google' | 'dropbox' | null;
        used: number;
        total: number;
    };
    recentFiles: FileItem[];
    onItemClick: (item: FileItem) => void;
    onToggleStar: (itemId: string) => void;
    onShareItem: (item: FileItem) => void;
}

const HomeView: React.FC<HomeViewProps> = ({
    user,
    isDriveConnected,
    isDropboxConnected,
    onConnectGoogleDrive,
    onDisconnectGoogleDrive,
    onConnectDropbox,
    onDisconnectDropbox,
    onNavigateToCloud,
    storageInfo = { provider: null, used: 0, total: 0 },
    recentFiles,
    onItemClick,
    onToggleStar,
    onShareItem,
}) => {
    const isAnyCloudConnected = isDriveConnected || isDropboxConnected;

    // Sort clouds: connected first, then alphabetically
    const cloudCards = [
        {
            provider: 'dropbox' as const,
            isConnected: isDropboxConnected,
            onConnect: onConnectDropbox,
            onDisconnect: onDisconnectDropbox,
            order: isDropboxConnected ? 0 : 2,
        },
        {
            provider: 'google' as const,
            isConnected: isDriveConnected,
            onConnect: onConnectGoogleDrive,
            onDisconnect: onDisconnectGoogleDrive,
            order: isDriveConnected ? 0 : 1,
        },
        {
            provider: 'onedrive' as const,
            isConnected: false,
            isComingSoon: true,
            order: 3,
        },
    ].sort((a, b) => a.order - b.order);

    return (
        <div className="h-full overflow-y-auto px-1">
            {/* Header Section */}
            <div className="mb-5">
                <PersonalizedGreeting userName={user?.name || 'Visitante'} />
            </div>

            {/* Cloud Status Cards Section */}
            <div className="mb-6">
                <h2 className="text-base font-bold text-gray-800 mb-3">Minhas Conexões</h2>

                <div className="grid grid-cols-3 gap-3">
                    {cloudCards.map((cloud) => (
                        <CloudStatusCard
                            key={cloud.provider}
                            provider={cloud.provider}
                            isConnected={cloud.isConnected}
                            isComingSoon={cloud.isComingSoon}
                            storageUsed={storageInfo?.provider === cloud.provider ? storageInfo.used : undefined}
                            storageTotal={storageInfo?.provider === cloud.provider ? storageInfo.total : undefined}
                            onConnect={cloud.onConnect}
                            onDisconnect={cloud.onDisconnect}
                        />
                    ))}
                </div>
            </div>

            {/* Suggested Files Section */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-bold text-gray-800">Sugerido para você</h2>
                    {isAnyCloudConnected && recentFiles.length > 0 && (
                        <button className="text-indigo-600 hover:text-indigo-700 font-medium text-xs transition-colors">
                            Ver mais
                        </button>
                    )}
                </div>

                {isAnyCloudConnected ? (
                    <SuggestedFilesSection
                        files={recentFiles}
                        onItemClick={onItemClick}
                        onToggleStar={onToggleStar}
                        onShareItem={onShareItem}
                    />
                ) : (
                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <p className="text-gray-500 text-sm">
                            Conecte-se a uma nuvem para ver seus arquivos recentes
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeView;
