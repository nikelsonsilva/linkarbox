import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, FolderOpen, Edit, Trash2, MoreVertical, Search, UserPlus, Copy, Send, X, Check, Calendar, Loader2 } from 'lucide-react';
import { getClients, getClientStats, deleteClient, resendInvite, type Client } from '../lib/clientService';
import AddClientModal from './AddClientModal';
import ManualClientForm from './ManualClientForm';
import InviteClientModal from './InviteClientModal';
import EditClientModal from './EditClientModal';

interface ClientsViewProps {
    onNavigate?: (page: string) => void;
    searchQuery?: string; // Search query from parent (Header)
}

const ClientsView: React.FC<ClientsViewProps> = ({ onNavigate, searchQuery = '' }) => {
    const [clients, setClients] = useState<Client[]>([]);
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'inactive'>('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showManualForm, setShowManualForm] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, inactive: 0 });
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    // Loading states for individual actions
    const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
    const [successStates, setSuccessStates] = useState<Record<string, string>>({});

    const loadClients = async () => {
        setIsLoading(true);
        const { data, error } = await getClients();
        if (data && !error) {
            setClients(data);
        }
        setIsLoading(false);
    };

    const loadStats = async () => {
        const statsData = await getClientStats();
        setStats(statsData);
    };

    useEffect(() => {
        loadClients();
        loadStats();
    }, []);

    const handleSuccess = () => {
        loadClients();
        loadStats();
    };

    const setLoading = (clientId: string, loading: boolean) => {
        setLoadingStates(prev => ({ ...prev, [clientId]: loading }));
    };

    const showSuccess = (clientId: string, message: string) => {
        setSuccessStates(prev => ({ ...prev, [clientId]: message }));
        setTimeout(() => {
            setSuccessStates(prev => {
                const newState = { ...prev };
                delete newState[clientId];
                return newState;
            });
        }, 3000);
    };

    const handleDelete = async (clientId: string) => {
        if (!confirm('Tem certeza que deseja excluir este cliente?')) return;

        setLoading(clientId, true);
        const { error } = await deleteClient(clientId);
        setLoading(clientId, false);

        if (!error) {
            showSuccess(clientId, 'Cliente excluído com sucesso!');
            setTimeout(() => {
                handleSuccess();
                setActiveMenu(null);
            }, 1000);
        } else {
            alert('Erro ao excluir cliente');
        }
    };

    const handleCopyInviteLink = async (clientId: string) => {
        setLoading(clientId, true);
        const { data, error, inviteLink } = await resendInvite(clientId);
        setLoading(clientId, false);

        if (error) {
            alert('Erro ao gerar link de convite');
            return;
        }

        if (inviteLink) {
            await navigator.clipboard.writeText(inviteLink);
            showSuccess(clientId, 'Link copiado!');
        }
        setActiveMenu(null);
    };

    const handleResendInvite = async (clientId: string) => {
        setLoading(clientId, true);
        const { data, error, inviteLink } = await resendInvite(clientId);
        setLoading(clientId, false);

        if (error) {
            alert('Erro ao reenviar convite');
            return;
        }

        if (inviteLink) {
            await navigator.clipboard.writeText(inviteLink);
            showSuccess(clientId, 'Convite reenviado! Link copiado.');
            handleSuccess();
        }
    };

    const handleEdit = (client: Client) => {
        setEditingClient(client);
        setActiveMenu(null);
    };

    const filteredClients = clients.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            client.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const getStatusBadge = (status: Client['status']) => {
        const styles = {
            active: 'bg-green-100 text-green-700',
            pending: 'bg-yellow-100 text-yellow-700',
            inactive: 'bg-gray-100 text-gray-700',
        };
        const labels = {
            active: 'Ativo',
            pending: 'Pendente',
            inactive: 'Inativo',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando clientes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                    <UserPlus className="w-5 h-5" />
                    Adicionar Cliente
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total de Clientes</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                            <User className="w-6 h-6 text-indigo-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Clientes Ativos</p>
                            <p className="text-3xl font-bold text-green-600 mt-1">{stats.active}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <User className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Convites Pendentes</p>
                            <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Send className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'all'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    Todos
                </button>
                <button
                    onClick={() => setFilterStatus('active')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'active'
                        ? 'bg-green-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    Ativos
                </button>
                <button
                    onClick={() => setFilterStatus('pending')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'pending'
                        ? 'bg-yellow-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    Pendentes
                </button>
            </div>

            {/* Clients List */}
            <div className="space-y-3">
                {filteredClients.length === 0 ? (
                    <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                        <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600">Nenhum cliente encontrado</p>
                        <p className="text-sm text-gray-500 mt-1">
                            {searchQuery ? 'Tente ajustar sua busca' : 'Adicione seu primeiro cliente'}
                        </p>
                    </div>
                ) : (
                    filteredClients.map((client) => (
                        <div
                            key={client.id}
                            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow relative"
                        >
                            {/* Success Message */}
                            {successStates[client.id] && (
                                <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2 animate-fade-in z-10">
                                    <Check className="w-4 h-4" />
                                    {successStates[client.id]}
                                </div>
                            )}

                            <div className="flex items-start gap-3">
                                {/* Avatar */}
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="w-6 h-6 text-indigo-600" />
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-gray-900">{client.name || 'Sem nome'}</h3>
                                        {getStatusBadge(client.status)}
                                    </div>

                                    <div className="flex flex-col gap-1 text-sm text-gray-600 mb-3">
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-4 h-4" />
                                            <span>{client.email}</span>
                                        </div>
                                        {client.phone && (
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-4 h-4" />
                                                <span>{client.phone}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                {client.status === 'active'
                                                    ? `Cadastrado em ${formatDate(client.registered_at || '')}`
                                                    : `Convite enviado em ${formatDate(client.invite_sent_at || '')}`
                                                }
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        {client.status === 'pending' && (
                                            <button
                                                onClick={() => handleResendInvite(client.id)}
                                                disabled={loadingStates[client.id]}
                                                className="px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {loadingStates[client.id] ? (
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                ) : (
                                                    <Send className="w-3.5 h-3.5" />
                                                )}
                                                {loadingStates[client.id] ? 'Enviando...' : 'Reenviar Convite'}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleEdit(client)}
                                            className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-1"
                                        >
                                            <Edit className="w-3.5 h-3.5" />
                                            Editar
                                        </button>
                                    </div>
                                </div>

                                {/* More Options Menu */}
                                <div className="relative">
                                    <button
                                        onClick={() => setActiveMenu(activeMenu === client.id ? null : client.id)}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <MoreVertical className="w-5 h-5 text-gray-600" />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {activeMenu === client.id && (
                                        <>
                                            {/* Backdrop */}
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setActiveMenu(null)}
                                            />

                                            {/* Menu */}
                                            <div className="absolute right-0 top-10 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                                                {client.status === 'pending' && (
                                                    <button
                                                        onClick={() => handleCopyInviteLink(client.id)}
                                                        disabled={loadingStates[client.id]}
                                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
                                                    >
                                                        {loadingStates[client.id] ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <Copy className="w-4 h-4" />
                                                        )}
                                                        {loadingStates[client.id] ? 'Copiando...' : 'Copiar Link de Convite'}
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleEdit(client)}
                                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Editar Cliente
                                                </button>
                                                <div className="border-t border-gray-200 my-1" />
                                                <button
                                                    onClick={() => handleDelete(client.id)}
                                                    disabled={loadingStates[client.id]}
                                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    {loadingStates[client.id] ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                    {loadingStates[client.id] ? 'Excluindo...' : 'Excluir Cliente'}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modals */}
            {
                showAddModal && (
                    <AddClientModal
                        onClose={() => setShowAddModal(false)}
                        onSelectManual={() => {
                            setShowAddModal(false);
                            setShowManualForm(true);
                        }}
                        onSelectInvite={() => {
                            setShowAddModal(false);
                            setShowInviteModal(true);
                        }}
                    />
                )
            }

            {
                showManualForm && (
                    <ManualClientForm
                        onClose={() => setShowManualForm(false)}
                        onSuccess={handleSuccess}
                    />
                )
            }

            {
                showInviteModal && (
                    <InviteClientModal
                        onClose={() => setShowInviteModal(false)}
                        onSuccess={handleSuccess}
                    />
                )
            }

            {
                editingClient && (
                    <EditClientModal
                        client={editingClient}
                        onClose={() => setEditingClient(null)}
                        onSuccess={() => {
                            handleSuccess();
                            setEditingClient(null);
                        }}
                    />
                )
            }

            <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
        </div >
    );
};

export default ClientsView;
