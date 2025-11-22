import React from 'react';
import { Cloud, CheckCircle, XCircle, Box } from 'lucide-react';

interface CloudConnectionsViewProps {
  isDriveConnected: boolean;
  isDropboxConnected: boolean;
  onConnectGoogleDrive: () => void;
  onDisconnectGoogleDrive: () => void;
  onConnectDropbox: () => void;
  onDisconnectDropbox: () => void;
}

const CloudConnectionsView: React.FC<CloudConnectionsViewProps> = ({ 
  isDriveConnected, 
  isDropboxConnected,
  onConnectGoogleDrive, 
  onDisconnectGoogleDrive,
  onConnectDropbox,
  onDisconnectDropbox
}) => {
  const connections = [
    {
      name: 'Google Drive',
      icon: Cloud,
      connected: isDriveConnected,
      onToggle: isDriveConnected ? onDisconnectGoogleDrive : onConnectGoogleDrive,
    },
    {
      name: 'Dropbox',
      icon: Box,
      connected: isDropboxConnected,
      onToggle: isDropboxConnected ? onDisconnectDropbox : onConnectDropbox,
    }
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Cloud className="w-6 h-6 text-primary" />
        Cloud Sync
      </h2>
      <div className="bg-white border border-gray-200/60 rounded-2_5xl p-6">
        <p className="text-gray-600 mb-6">Manage your connected cloud storage accounts. Linkarbox brings them all together in one place.</p>
        <div className="space-y-4">
          {connections.map(conn => (
            <div key={conn.name} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-gray-200 rounded-xl gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg flex-shrink-0">
                    <conn.icon className="w-6 h-6 text-gray-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-800">{conn.name}</p>
                  </div>
                  {conn.connected ? (
                      <div className="flex items-center gap-1.5 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Connected</span>
                      </div>
                  ) : (
                     <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <XCircle className="w-4 h-4" />
                        <span>Not Connected</span>
                      </div>
                  )}
                </div>
              </div>
              <button 
                onClick={conn.onToggle}
                className={`w-full sm:w-auto px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  conn.connected 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'bg-primary text-white hover:bg-primary-hover'
                }`}
              >
                {conn.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CloudConnectionsView;