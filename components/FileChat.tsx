import React from 'react';
import type { FileItem, User } from '../types';
import { Send } from 'lucide-react';

interface FileChatProps {
  item: FileItem;
  currentUser: User;
}

const FileChat: React.FC<FileChatProps> = ({ item, currentUser }) => {
  const chatMessages = item.chat || [];

  return (
    <div className="flex flex-col h-full -mx-6 -my-6">
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {chatMessages.length === 0 && (
            <div className="text-center text-gray-500 pt-16">
                <p className="font-medium">Start the conversation</p>
                <p className="text-sm">Discuss this file with your team.</p>
            </div>
        )}
        {chatMessages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.userId === currentUser.id ? 'flex-row-reverse' : ''}`}>
            <img src={msg.avatarUrl} alt={msg.userName} className="w-8 h-8 rounded-full" />
            <div className={`p-3 rounded-xl max-w-xs ${msg.userId === currentUser.id ? 'bg-primary text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
              <p className="text-sm">{msg.message}</p>
              <p className={`text-xs mt-1 opacity-70 ${msg.userId === currentUser.id ? 'text-right' : 'text-left'}`}>{msg.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 bg-white border-t border-gray-200/80">
        <div className="relative">
            <input 
                type="text"
                placeholder="Type a message..."
                className="w-full bg-gray-100 border-transparent rounded-lg py-2 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-md hover:bg-primary-hover">
                <Send className="w-4 h-4" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default FileChat;
