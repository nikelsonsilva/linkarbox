import React from 'react';
import type { FileItem } from '../types';
import { X, Link, Search } from 'lucide-react';
import { MOCK_USERS } from '../constants';

interface ShareModalProps {
  item: FileItem;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ item, onClose }) => {
  const sharedUsers = item.sharedWith.map(id => MOCK_USERS[id]).filter(Boolean);
  const otherUsers = Object.values(MOCK_USERS).filter(
    (user) => !item.sharedWith.some((sharedUserId) => sharedUserId === user.id)
  );

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2_5xl shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Share "{item.name}"</h2>
          <button onClick={onClose} className="p-2 text-gray-500 rounded-full hover:bg-gray-200/50">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Email or name"
              className="w-full border border-gray-300 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
            <h3 className="font-semibold text-gray-600 text-sm">Shared with</h3>
            {sharedUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full" />
                  <div>
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
                <select className="text-sm border-gray-300 rounded-md shadow-sm focus:border-primary focus:ring-primary">
                  <option>Can Edit</option>
                  <option>Can View</option>
                </select>
              </div>
            ))}
             <h3 className="font-semibold text-gray-600 text-sm pt-2">Invite others</h3>
            {otherUsers.map(user => (
               <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full" />
                  <div>
                    <p className="font-medium text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
                <button className="text-sm font-semibold text-primary hover:text-primary-hover">Invite</button>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 bg-gray-50 rounded-b-2_5xl flex items-center justify-between">
          <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary">
            <Link className="w-4 h-4" />
            <span>Copy link</span>
          </button>
          <button onClick={onClose} className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-hover transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;