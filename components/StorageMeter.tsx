
import React from 'react';
import { HardDrive } from 'lucide-react';

const StorageMeter: React.FC = () => {
    const usedSpace = 12.5;
    const totalSpace = 15;
    const percentage = (usedSpace / totalSpace) * 100;

    return (
        <div className="flex-shrink-0 p-4 md:px-8 md:py-4 bg-transparent">
            <div className="bg-white/80 backdrop-blur-sm border border-gray-200/80 rounded-2xl p-4 flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <HardDrive className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-sm text-gray-800">Storage</span>
                        <span className="text-xs text-gray-500">{usedSpace} GB of {totalSpace} GB used</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StorageMeter;
