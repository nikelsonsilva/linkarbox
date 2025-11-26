import React from 'react';
import { Cloud, CheckCircle, XCircle } from 'lucide-react';

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
      logo: (
        <svg className="w-8 h-8" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
          <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da" />
          <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47" />
          <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335" />
          <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d" />
          <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc" />
          <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00" />
        </svg>
      ),
      connected: isDriveConnected,
      onToggle: isDriveConnected ? onDisconnectGoogleDrive : onConnectGoogleDrive,
    },
    {
      name: 'Dropbox',
      logo: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="#0061FF">
          <path d="M6 1.807L0 5.629l6 3.822 6.001-3.822L6 1.807zM18 1.807l-6 3.822 6 3.822 6-3.822-6-3.822zM0 13.274l6 3.822 6.001-3.822L6 9.452l-6 3.822zM18 9.452l-6 3.822 6 3.822 6-3.822-6-3.822zM6 18.371l6.001 3.822 6-3.822-6-3.822L6 18.371z" />
        </svg>
      ),
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
                <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg flex-shrink-0">
                  {conn.logo}
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
                className={`w-full sm:w-auto px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${conn.connected
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