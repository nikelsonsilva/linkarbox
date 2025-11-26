import React, { useState } from 'react';
import { Cloud, X, Box, XCircle } from 'lucide-react';

interface ConnectCloudModalProps {
  isOpen: boolean;
  onConnect: (cloud: 'google' | 'dropbox', keepConnected: boolean) => void;
  onSkip: () => void;
  isConnecting: boolean;
}

const ConnectCloudModal: React.FC<ConnectCloudModalProps> = ({ isOpen, onConnect, onSkip, isConnecting }) => {
  const [keepConnected, setKeepConnected] = useState(true);

  if (!isOpen) return null;

  const connectionOptions = [
    {
      name: 'Google Drive',
      cloud: 'google',
      icon: Cloud,
      disabled: isConnecting,
      buttonText: isConnecting ? 'Loading...' : 'Connect',
    },
    {
      name: 'Dropbox',
      cloud: 'dropbox',
      icon: Box,
      disabled: isConnecting,
      buttonText: isConnecting ? 'Loading...' : 'Connect',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onSkip}>
      <div className="bg-white rounded-2_5xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <Cloud className="w-6 h-6 text-primary" />
                <h2 className="text-xl font-semibold text-gray-800">Cloud Sync</h2>
            </div>
            <button onClick={onSkip} className="p-2 text-gray-500 rounded-full hover:bg-gray-200/50">
                <X className="w-5 h-5" />
            </button>
        </div>

        <div className="p-6">
            <p className="text-gray-600 mb-6">Connect your cloud storage to begin organizing and sharing your project files.</p>
            <div className="space-y-4">
                {connectionOptions.map((conn) => (
                    <div key={conn.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg flex-shrink-0">
                                <conn.icon className="w-6 h-6 text-gray-500" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold text-gray-800">{conn.name}</p>
                                </div>
                                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                    <XCircle className="w-4 h-4" />
                                    <span>Not Connected</span>
                                </div>
                            </div>
                        </div>
                        <button 
                            onClick={() => onConnect(conn.cloud as 'google' | 'dropbox', keepConnected)}
                            disabled={conn.disabled}
                            className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors bg-primary text-white hover:bg-primary-hover disabled:bg-gray-300 disabled:cursor-not-allowed w-24 text-center"
                        >
                            {conn.buttonText}
                        </button>
                    </div>
                ))}
            </div>
             <div className="mt-6 flex items-center justify-center">
                <input
                type="checkbox"
                id="keepConnectedModal"
                checked={keepConnected}
                onChange={(e) => setKeepConnected(e.target.checked)}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="keepConnectedModal" className="ml-2 text-sm font-medium text-gray-700">
                    Keep me connected automatically
                </label>
            </div>
        </div>
        
        <div className="p-6 bg-gray-50 rounded-b-2_5xl flex items-center justify-end">
          <button onClick={onSkip} className="px-5 py-2 text-sm text-gray-600 hover:text-primary font-medium">
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConnectCloudModal;