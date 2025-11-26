import React from 'react';
import { X, Edit, Send } from 'lucide-react';

interface AddClientModalProps {
    onClose: () => void;
    onSelectManual: () => void;
    onSelectInvite: () => void;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ onClose, onSelectManual, onSelectInvite }) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Adicionar Novo Cliente</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-3">
                    <p className="text-gray-600 mb-4">Escolha como deseja adicionar o cliente:</p>

                    {/* Manual Registration */}
                    <button
                        onClick={onSelectManual}
                        className="w-full flex items-start gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                    >
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-200 transition-colors">
                            <Edit className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div className="text-left flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">Cadastro Manual</h3>
                            <p className="text-sm text-gray-600">
                                Preencha os dados do cliente diretamente
                            </p>
                        </div>
                    </button>

                    {/* Send Invite */}
                    <button
                        onClick={onSelectInvite}
                        className="w-full flex items-start gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all group"
                    >
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                            <Send className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="text-left flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">Enviar Link de Convite</h3>
                            <p className="text-sm text-gray-600">
                                Cliente se cadastra sozinho através de um link
                            </p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddClientModal;
