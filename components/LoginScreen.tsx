import React from 'react';
import type { Role } from '../types';
import { Building, User } from 'lucide-react';

interface LoginScreenProps {
    onLogin: (role: Role) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 font-sans">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-2xl shadow-lg">
        <div className="text-center">
            <h1 className="text-4xl font-bold text-white">Linkar<span className="text-primary">box</span></h1>
            <p className="mt-2 text-gray-400">Your multi-cloud hub for architectural projects.</p>
        </div>
        
        <div className="space-y-4 pt-4">
             <button
                onClick={() => onLogin('architect')}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg transition-colors"
            >
                <Building className="w-5 h-5" />
                <span>Login as Architect</span>
            </button>
            <button
                onClick={() => onLogin('client')}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
                <User className="w-5 h-5" />
                <span>Login as Client</span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;