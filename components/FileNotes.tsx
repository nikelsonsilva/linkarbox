import React, { useState, useEffect } from 'react';
import type { FileItem, Note } from '../types';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import { createNote, getNotesByFile, deleteNote } from '../lib/noteService';
import { getOrCreateRegisteredFile, getRegisteredFile } from '../lib/fileRegistryService';
import { createNoteOnSharedFile, getNotesForSharedFile } from '../lib/clientNoteService';
import { supabase } from '../lib/supabase';

interface FileNotesProps {
    item: FileItem;
    onNotesChange?: () => void; // Callback para atualizar contador de notas
    architectId?: string; // ID do arquiteto (para clientes)
}

const FileNotes: React.FC<FileNotesProps> = ({ item, onNotesChange, architectId }) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNoteContent, setNewNoteContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingNotes, setLoadingNotes] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<'architect' | 'client' | null>(null);

    // Buscar usuário atual e role
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setCurrentUserId(user.id);

                // Buscar role do usuário
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                setUserRole(profile?.role || null);
            }
        };
        fetchUser();
    }, []);

    // Carregar notas do arquivo
    useEffect(() => {
        loadNotes();
    }, [item.cloudId, currentUserId, userRole, architectId]);

    const loadNotes = async () => {
        console.log('[FileNotes] loadNotes called', {
            cloudId: item.cloudId,
            currentUserId,
            userRole,
            architectId
        });

        if (!item.cloudId || !currentUserId || !userRole) {
            console.log('[FileNotes] Missing required data, skipping load');
            setLoadingNotes(false);
            return;
        }

        setLoadingNotes(true);

        try {
            if (userRole === 'client' && architectId) {
                // Cliente: buscar notas de arquivo compartilhado
                console.log('[FileNotes] Loading as CLIENT', { cloudId: item.cloudId, architectId });
                const fetchedNotes = await getNotesForSharedFile(item.cloudId, architectId);
                console.log('[FileNotes] Client notes fetched:', fetchedNotes.length, fetchedNotes);
                setNotes(fetchedNotes);
            } else if (userRole === 'architect') {
                // Arquiteto: buscar notas normalmente
                console.log('[FileNotes] Loading as ARCHITECT', { cloudId: item.cloudId, currentUserId });
                const fileRegistry = await getOrCreateRegisteredFile({
                    architect_id: currentUserId,
                    file_name: item.name,
                    file_path: item.url,
                    cloud_provider: 'dropbox', // TODO: detectar dinamicamente
                    cloud_file_id: item.cloudId,
                    mime_type: item.mimeType,
                });

                console.log('[FileNotes] File registry:', fileRegistry);

                if (fileRegistry) {
                    const fetchedNotes = await getNotesByFile(fileRegistry.id);
                    console.log('[FileNotes] Architect notes fetched:', fetchedNotes.length, fetchedNotes);
                    setNotes(fetchedNotes);
                }
            }
        } catch (error) {
            console.error('[FileNotes] Error loading notes:', error);
        }

        setLoadingNotes(false);
    };

    const handleAddNote = async () => {
        if (!newNoteContent.trim() || !currentUserId || !item.cloudId || !userRole) return;

        setLoading(true);

        try {
            if (userRole === 'client' && architectId) {
                // Cliente: criar nota em arquivo compartilhado
                const newNote = await createNoteOnSharedFile(
                    item.cloudId,
                    architectId,
                    item.name,
                    'dropbox', // TODO: detectar dinamicamente
                    newNoteContent.trim()
                );

                if (newNote) {
                    await loadNotes();
                    setNewNoteContent('');

                    if (onNotesChange) {
                        onNotesChange();
                    }
                }
            } else if (userRole === 'architect') {
                // Arquiteto: criar nota normalmente
                const fileRegistry = await getOrCreateRegisteredFile({
                    architect_id: currentUserId,
                    file_name: item.name,
                    file_path: item.url,
                    cloud_provider: 'dropbox',
                    cloud_file_id: item.cloudId,
                    mime_type: item.mimeType,
                });

                if (!fileRegistry) {
                    console.error('Failed to register file');
                    setLoading(false);
                    return;
                }

                const newNote = await createNote({
                    file_registry_id: fileRegistry.id,
                    author_id: currentUserId,
                    content: newNoteContent.trim(),
                });

                if (newNote) {
                    await loadNotes();
                    setNewNoteContent('');

                    if (onNotesChange) {
                        onNotesChange();
                    }
                }
            }
        } catch (error) {
            console.error('Error adding note:', error);
        }

        setLoading(false);
    };

    const handleDeleteNote = async (noteId: string) => {
        const success = await deleteNote(noteId);
        if (success) {
            setNotes(notes.filter(note => note.id !== noteId));

            // Notificar mudança
            if (onNotesChange) {
                onNotesChange();
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleAddNote();
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Agora';
        if (diffMins < 60) return `${diffMins}m atrás`;
        if (diffHours < 24) return `${diffHours}h atrás`;
        if (diffDays < 7) return `${diffDays}d atrás`;

        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    };

    if (loadingNotes) {
        return (
            <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {notes.length === 0 && (
                <div className="text-center text-gray-500 pt-16">
                    <p className="font-medium">No notes yet</p>
                    <p className="text-sm">Add notes, reminders, or feedback.</p>
                </div>
            )}
            {notes.map(note => {
                // Determinar se a nota é do usuário atual
                const isCurrentUser = note.author_id === currentUserId;

                // Determinar se é nota de arquiteto ou cliente
                // Se o userRole é 'architect' e o author_id é o currentUserId, é nota do arquiteto
                // Se o userRole é 'client' e o author_id é o currentUserId, é nota do cliente
                // Se o author_id é diferente do currentUserId:
                //   - No painel do arquiteto: se author_id != currentUserId, é cliente
                //   - No painel do cliente: se author_id != currentUserId, é arquiteto
                const isArchitectNote = userRole === 'architect'
                    ? isCurrentUser  // No painel do arquiteto: suas notas são azuis, do cliente são amarelas
                    : !isCurrentUser; // No painel do cliente: suas notas são amarelas, do arquiteto são azuis

                // Cores diferentes para arquiteto e cliente
                const bgColor = isArchitectNote ? 'bg-blue-50' : 'bg-yellow-50';
                const borderColor = isArchitectNote ? 'border-blue-200' : 'border-yellow-200';
                const textColor = isArchitectNote ? 'text-blue-900' : 'text-yellow-900';
                const timeColor = isArchitectNote ? 'text-blue-600' : 'text-yellow-600';
                const contentColor = isArchitectNote ? 'text-blue-800' : 'text-yellow-800';
                const hoverBg = isArchitectNote ? 'hover:bg-blue-200' : 'hover:bg-yellow-200';
                const deleteColor = isArchitectNote ? 'text-blue-700' : 'text-yellow-700';

                return (
                    <div key={note.id} className={`${bgColor} border ${borderColor} p-4 rounded-lg group relative`}>
                        <div className="flex items-start gap-3 mb-2">
                            {note.author_avatar && (
                                <img
                                    src={note.author_avatar}
                                    alt={note.author_name}
                                    className="w-8 h-8 rounded-full"
                                />
                            )}
                            {!note.author_avatar && (
                                <div className={`w-8 h-8 rounded-full ${isArchitectNote ? 'bg-blue-200' : 'bg-yellow-200'} flex items-center justify-center`}>
                                    <span className={`text-sm font-semibold ${textColor}`}>
                                        {note.author_name?.charAt(0)?.toUpperCase() || '?'}
                                    </span>
                                </div>
                            )}
                            <div className="flex-1">
                                <p className={`text-sm font-medium ${textColor}`}>
                                    {note.author_name || 'Unknown'}
                                </p>
                                <p className={`text-xs ${timeColor}`}>
                                    {formatDate(note.created_at)}
                                </p>
                            </div>
                            {isCurrentUser && (
                                <button
                                    onClick={() => handleDeleteNote(note.id)}
                                    className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 ${hoverBg} rounded`}
                                    title="Delete note"
                                >
                                    <Trash2 className={`w-4 h-4 ${deleteColor}`} />
                                </button>
                            )}
                        </div>
                        <p className={`text-sm ${contentColor} whitespace-pre-wrap break-words`}>{note.content}</p>
                    </div>
                );
            })}
            <div className="relative mt-4">
                <textarea
                    placeholder="Add a new note... (Ctrl+Enter to send)"
                    className="w-full bg-gray-100 border-transparent rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    rows={3}
                    value={newNoteContent}
                    onChange={(e) => setNewNoteContent(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={loading}
                />
                <button
                    className="absolute bottom-3 right-3 p-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleAddNote}
                    disabled={loading || !newNoteContent.trim()}
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Plus className="w-4 h-4" />
                    )}
                </button>
            </div>
        </div>
    );
};

export default FileNotes;
