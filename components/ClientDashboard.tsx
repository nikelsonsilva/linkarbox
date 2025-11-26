import React from 'react';
import { FolderOpen, File, Download, Clock } from 'lucide-react';

const ClientDashboard: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Bem-vindo ao Linkar<span className="text-indigo-600">box</span>
                    </h1>
                    <p className="text-gray-600">
                        Aqui você pode acessar os arquivos compartilhados com você
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Pastas Compartilhadas</p>
                                <p className="text-3xl font-bold text-indigo-600 mt-1">0</p>
                            </div>
                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <FolderOpen className="w-6 h-6 text-indigo-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Arquivos Disponíveis</p>
                                <p className="text-3xl font-bold text-green-600 mt-1">0</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <File className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Atualizações Recentes</p>
                                <p className="text-3xl font-bold text-blue-600 mt-1">0</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Empty State */}
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        Nenhum arquivo compartilhado ainda
                    </h2>
                    <p className="text-gray-600">
                        Quando o arquiteto compartilhar arquivos com você, eles aparecerão aqui.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ClientDashboard;
