import React from 'react';

interface CloudStorageWidgetProps {
    cloudProvider: 'google' | 'dropbox' | null;
    usedStorage: number; // in MB
    totalStorage: number; // in GB
}

const CloudStorageWidget: React.FC<CloudStorageWidgetProps> = ({ cloudProvider, usedStorage, totalStorage }) => {
    if (!cloudProvider) return null;

    const usedPercentage = (usedStorage / (totalStorage * 1024)) * 100;

    const providerConfig = {
        google: {
            name: 'Google Drive',
            logo: (
                <svg className="w-4 h-4" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
                    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47" />
                    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335" />
                    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
                    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
                    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
                </svg>
            ),
        },
        dropbox: {
            name: 'Dropbox',
            logo: (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#0061FF">
                    <path d="M6 1.807L0 5.629l6 3.822 6.001-3.822L6 1.807zM18 1.807l-6 3.822 6 3.822 6-3.822-6-3.822zM0 13.274l6 3.822 6.001-3.822L6 9.452l-6 3.822zM18 9.452l-6 3.822 6 3.822 6-3.822-6-3.822zM6 18.371l6.001 3.822 6-3.822-6-3.822L6 18.371z" />
                </svg>
            ),
        },
    };

    const config = providerConfig[cloudProvider];

    return (
        <div className="px-4 pb-4">
            <div className="border border-gray-200 rounded-lg p-2.5">
                {/* Cloud Provider Header */}
                <div className="flex items-center gap-2 mb-2">
                    <div>
                        {config.logo}
                    </div>
                    <h3 className="font-semibold text-xs text-gray-800">{config.name}</h3>
                </div>

                {/* Storage Progress Bar */}
                <div className="mb-2">
                    <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                        <div
                            className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(usedPercentage, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Status with green dot */}
                <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <p className="text-[11px] text-gray-600 font-medium">Conectado</p>
                </div>

                {/* Storage Info */}
                <p className="text-[11px] text-gray-500">
                    {usedStorage} MB de {totalStorage} GB
                </p>
            </div>
        </div>
    );
};

export default CloudStorageWidget;
