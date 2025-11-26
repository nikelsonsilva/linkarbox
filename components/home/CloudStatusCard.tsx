import React, { useState } from 'react';
import { MoreVertical } from 'lucide-react';

interface CloudStatusCardProps {
    provider: 'google' | 'dropbox' | 'onedrive';
    isConnected: boolean;
    isComingSoon?: boolean;
    storageUsed?: number; // in MB
    storageTotal?: number; // in GB
    onConnect?: () => void;
    onDisconnect?: () => void;
}

const CloudStatusCard: React.FC<CloudStatusCardProps> = ({
    provider,
    isConnected,
    isComingSoon = false,
    storageUsed,
    storageTotal,
    onConnect,
    onDisconnect,
}) => {
    const [showMenu, setShowMenu] = useState(false);

    const providerConfig = {
        google: {
            name: 'Google Drive',
            logo: (
                <svg className="w-6 h-6" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
                    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47" />
                    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335" />
                    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
                    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
                    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
                </svg>
            ),
            logoWhite: (
                <svg className="w-6 h-6" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#FFFFFF" />
                    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#FFFFFF" />
                    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#FFFFFF" opacity="0.9" />
                    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#FFFFFF" opacity="0.8" />
                    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#FFFFFF" />
                    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#FFFFFF" opacity="0.9" />
                </svg>
            ),
            gradient: 'from-blue-500 to-blue-600',
            bgColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
        },
        dropbox: {
            name: 'Dropbox',
            logo: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#0061FF">
                    <path d="M6 1.807L0 5.629l6 3.822 6.001-3.822L6 1.807zM18 1.807l-6 3.822 6 3.822 6-3.822-6-3.822zM0 13.274l6 3.822 6.001-3.822L6 9.452l-6 3.822zM18 9.452l-6 3.822 6 3.822 6-3.822-6-3.822zM6 18.371l6.001 3.822 6-3.822-6-3.822L6 18.371z" />
                </svg>
            ),
            logoWhite: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#FFFFFF">
                    <path d="M6 1.807L0 5.629l6 3.822 6.001-3.822L6 1.807zM18 1.807l-6 3.822 6 3.822 6-3.822-6-3.822zM0 13.274l6 3.822 6.001-3.822L6 9.452l-6 3.822zM18 9.452l-6 3.822 6 3.822 6-3.822-6-3.822zM6 18.371l6.001 3.822 6-3.822-6-3.822L6 18.371z" />
                </svg>
            ),
            gradient: 'from-blue-600 to-indigo-700',
            bgColor: 'bg-gradient-to-br from-blue-500 to-indigo-600',
        },
        onedrive: {
            name: 'One Drive',
            logo: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#0078D4">
                    <path d="M13.5 7.5c-1.5-2.5-4.5-3.5-7-2.5-1.5.5-2.5 1.5-3.5 3C1 8.5 0 10.5 0 13c0 2.5 2 4.5 4.5 4.5h13c2.5 0 4.5-2 4.5-4.5 0-2-1.5-3.5-3.5-4-.5-3-3-5.5-6-5.5-.5 0-1 .5-1.5.5z" />
                </svg>
            ),
            logoWhite: (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#FFFFFF">
                    <path d="M13.5 7.5c-1.5-2.5-4.5-3.5-7-2.5-1.5.5-2.5 1.5-3.5 3C1 8.5 0 10.5 0 13c0 2.5 2 4.5 4.5 4.5h13c2.5 0 4.5-2 4.5-4.5 0-2-1.5-3.5-3.5-4-.5-3-3-5.5-6-5.5-.5 0-1 .5-1.5.5z" />
                </svg>
            ),
            gradient: 'from-blue-400 to-sky-500',
            bgColor: 'bg-gradient-to-br from-blue-400 to-sky-500',
        },
    };

    const config = providerConfig[provider];
    const usagePercentage = storageUsed && storageTotal ? (storageUsed / (storageTotal * 1024)) * 100 : 0;

    const handleCardClick = () => {
        if (isComingSoon || isConnected) return;
        onConnect?.();
    };

    return (
        <div
            className={`relative rounded-lg overflow-hidden transition-all duration-200 ${!isComingSoon && !isConnected ? 'hover:shadow-md hover:scale-[1.01] cursor-pointer' : ''
                } ${isConnected ? 'shadow-sm' : 'shadow-sm'}`}
            onClick={handleCardClick}
        >
            {/* Card Content */}
            <div className={`${isConnected ? config.bgColor : 'bg-white border border-gray-200'} p-3 h-full relative`}>
                {/* Coming Soon Badge */}
                {isComingSoon && (
                    <div className="absolute top-2 right-2">
                        <span className="px-2 py-0.5 bg-indigo-600 text-white text-xs font-semibold rounded-full">
                            Em breve
                        </span>
                    </div>
                )}

                {/* Menu Button - Only show when connected */}
                {isConnected && !isComingSoon && (
                    <div className="absolute top-2 right-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(!showMenu);
                            }}
                            className="p-1 hover:bg-white/20 rounded-md transition-colors"
                        >
                            <MoreVertical className="w-3.5 h-3.5 text-white" />
                        </button>

                        {showMenu && (
                            <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDisconnect?.();
                                        setShowMenu(false);
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 transition-colors font-medium"
                                >
                                    Desconectar
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Logo - Always visible */}
                <div className="mb-2">
                    {isConnected ? config.logoWhite : config.logo}
                </div>

                {/* Provider Name */}
                <h3 className={`text-sm font-semibold mb-1 ${isConnected ? 'text-white' : 'text-gray-800'}`}>
                    {config.name}
                </h3>

                {/* Connection Status */}
                {!isComingSoon && (
                    <div className="mb-1.5">
                        {isConnected ? (
                            <div className="flex items-center gap-1 text-xs text-white/90">
                                <div className="w-1 h-1 bg-green-300 rounded-full"></div>
                                <span className="font-medium text-[11px]">Conectado</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                <span className="text-[11px]">Não conectado</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Storage Info - Only show when connected */}
                {isConnected && storageUsed !== undefined && storageTotal !== undefined && (
                    <div className="space-y-1">
                        {/* Progress Bar */}
                        <div className="w-full bg-white/25 rounded-full h-1 overflow-hidden">
                            <div
                                className="bg-white h-full rounded-full transition-all duration-300"
                                style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                            />
                        </div>

                        {/* Storage Text */}
                        <p className="text-[11px] text-white/85 font-medium">
                            {storageUsed} MB de {storageTotal} GB
                        </p>
                    </div>
                )}

                {/* Coming Soon State */}
                {isComingSoon && (
                    <p className="text-xs text-gray-500 mt-1">
                        Em breve
                    </p>
                )}
            </div>
        </div>
    );
};

export default CloudStatusCard;
