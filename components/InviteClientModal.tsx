import React, { useState } from 'react';
import { X, Mail, User, Copy, Check, MessageCircle } from 'lucide-react';
import { inviteClient, type InviteClientData } from '../lib/clientService';

interface InviteClientModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const InviteClientModal: React.FC<InviteClientModalProps> = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState<InviteClientData>({
        email: '',
        name: '',
    });
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            const { data, error, inviteLink: link } = await inviteClient(formData);

            if (error) {
                setError(error.message || 'Erro ao enviar convite');
                setIsSubmitting(false);
                return;
            }

            if (link) {
                setInviteLink(link);
            }

            setIsSubmitting(false);
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar convite');
            setIsSubmitting(false);
        }
    };

    const handleCopyLink = async () => {
        if (inviteLink) {
            try {
                await navigator.clipboard.writeText(inviteLink);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy:', err);
            }
        }
    };

    const handleSendEmail = () => {
        if (inviteLink) {
            const subject = encodeURIComponent('Convite para LinkarBox');
            const body = encodeURIComponent(
                `Olá${formData.name ? ` ${formData.name}` : ''},\n\n` +
                `Você foi convidado para se cadastrar no LinkarBox.\n\n` +
                `Clique no link abaixo para completar seu cadastro:\n${inviteLink}\n\n` +
                `Atenciosamente,\nEquipe LinkarBox`
            );
            window.open(`mailto:${formData.email}?subject=${subject}&body=${body}`, '_blank');
        }
    };

    const handleSendWhatsApp = () => {
        if (inviteLink) {
            const message = encodeURIComponent(
                `Olá${formData.name ? ` ${formData.name}` : ''}! Você foi convidado para se cadastrar no LinkarBox. ` +
                `Clique no link para completar seu cadastro: ${inviteLink}`
            );
            window.open(`https://wa.me/?text=${message}`, '_blank');
        }
    };

    const handleFinish = () => {
        onSuccess();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Enviar Link de Convite</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {!inviteLink ? (
                        // Form to create invite
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email do Cliente <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="cliente@email.com"
                                    />
                                </div>
                            </div>

                            {/* Name (optional) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nome (opcional)
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        placeholder="João Silva"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Gerando...' : 'Gerar Convite'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        // Show invite link and sharing options
                        <div className="space-y-4">
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                                ✓ Convite criado com sucesso!
                            </div>

                            {/* Invite Link */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Link de Convite
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        readOnly
                                        value={inviteLink}
                                        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
                                    />
                                    <button
                                        onClick={handleCopyLink}
                                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                        title="Copiar link"
                                    >
                                        {copied ? (
                                            <Check className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <Copy className="w-5 h-5 text-gray-600" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Sharing Options */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Enviar por:
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={handleSendEmail}
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium"
                                    >
                                        <Mail className="w-5 h-5" />
                                        Email
                                    </button>
                                    <button
                                        onClick={handleSendWhatsApp}
                                        className="flex items-center justify-center gap-2 px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                        WhatsApp
                                    </button>
                                </div>
                            </div>

                            {/* Finish Button */}
                            <button
                                onClick={handleFinish}
                                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium mt-4"
                            >
                                Concluir
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InviteClientModal;
