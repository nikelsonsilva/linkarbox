import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, FileText, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { getClientByInviteToken, completeClientRegistration } from '../lib/clientService';

interface ClientRegistrationProps {
    inviteToken: string;
    onComplete: () => void;
}

const ClientRegistration: React.FC<ClientRegistrationProps> = ({ inviteToken, onComplete }) => {
    const [isValidating, setIsValidating] = useState(true);
    const [isValid, setIsValid] = useState(false);
    const [clientEmail, setClientEmail] = useState('');
    const [architectName, setArchitectName] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        cpf_cnpj: '',
        password: '',
    });
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        validateToken();
    }, [inviteToken]);

    const validateToken = async () => {
        setIsValidating(true);
        const { data, error } = await getClientByInviteToken(inviteToken);

        if (error || !data) {
            setIsValid(false);
            setError('Link de convite inválido ou expirado');
        } else {
            setIsValid(true);
            setClientEmail(data.email);
            setArchitectName(data.architect_name || 'Arquiteto');
            if (data.name) {
                setFormData(prev => ({ ...prev, name: data.name }));
            }
        }
        setIsValidating(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!acceptedTerms) {
            setError('Você precisa aceitar os termos de uso para continuar');
            return;
        }

        if (formData.password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres');
            return;
        }

        setError(null);
        setIsSubmitting(true);

        try {
            const { data, error } = await completeClientRegistration(inviteToken, formData);

            if (error) {
                setError(error.message || 'Erro ao completar cadastro');
                setIsSubmitting(false);
                return;
            }

            setSuccess(true);
            setTimeout(() => {
                // Redirect to client dashboard
                window.location.href = '/client-dashboard';
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Erro ao completar cadastro');
            setIsSubmitting(false);
        }
    };

    if (isValidating) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Validando convite...</p>
                </div>
            </div>
        );
    }

    if (!isValid) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Inválido</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <p className="text-sm text-gray-500">
                        Entre em contato com o arquiteto que enviou o convite.
                    </p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Cadastro Concluído!</h2>
                    <p className="text-gray-600 mb-6">
                        Seu cadastro foi realizado com sucesso. Redirecionando para sua área de trabalho...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Bem-vindo ao Linkar<span className="text-indigo-600">box</span>
                    </h1>
                    <p className="text-gray-600">
                        <span className="font-semibold text-indigo-600">{architectName}</span> gostaria de compartilhar a área de trabalho com você.
                    </p>
                    <p className="text-gray-600 mt-1">
                        Complete seu cadastro:
                    </p>
                </div>

                {/* Email Info */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 text-indigo-700">
                        <Mail className="w-5 h-5" />
                        <span className="font-medium">{clientEmail}</span>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome Completo <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Seu nome completo"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Senha <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="Mínimo 6 caracteres"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Crie uma senha para acessar sua conta</p>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Telefone
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="(11) 98765-4321"
                            />
                        </div>
                    </div>

                    {/* CPF/CNPJ */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            CPF/CNPJ
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={formData.cpf_cnpj}
                                onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="000.000.000-00"
                            />
                        </div>
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <input
                            type="checkbox"
                            id="terms"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                            Eu li e aceito os{' '}
                            <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">
                                termos de uso
                            </a>{' '}
                            e a{' '}
                            <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">
                                política de privacidade
                            </a>{' '}
                            do Linkarbox
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting || !acceptedTerms}
                        className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed mt-6"
                    >
                        {isSubmitting ? 'Finalizando cadastro...' : 'Finalizar Cadastro'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ClientRegistration;
