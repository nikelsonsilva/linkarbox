import React, { useState, useEffect } from 'react';
import type { FileItem, Note } from '../types';
import { Plus, Loader2, Trash2 } from 'lucide-react';
import { createNote, getNotesByFile, deleteNote } from '../lib/noteService';
import { getOrCreateRegisteredFile } from '../lib/fileRegistryService';
import { supabase } from '../lib/supabase';

interface FileNotesProps {
    item: FileItem;
    onNotesChange?: () => void; // Callback para atualizar contador de notas
}

const FileNotes: React.FC<FileNotesProps> = ({ item, onNotesChange }) => {
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNoteContent, setNewNoteContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingNotes, setLoadingNotes] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Buscar usuário atual
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUserId(user?.id || null);
        };
        fetchUser();
    }, []);

    // Carregar notas do arquivo
    useEffect(() => {
        loadNotes();
    }, [item.cloudId, currentUserId]); // Added currentUserId dependency

    const loadNotes = async () => {
        if (!item.cloudId || !currentUserId) {
            setLoadingNotes(false);
            return;
        }

        setLoadingNotes(true);

        // Primeiro, buscar ou criar o registro do arquivo
        const fileRegistry = await getOrCreateRegisteredFile({
            architect_id: currentUserId,
            file_name: item.name,
            file_path: item.url,
            cloud_provider: 'dropbox', // TODO: detectar dinamicamente
            cloud_file_id: item.cloudId,
            mime_type: item.mimeType,
        });

        if (fileRegistry) {
            // Buscar notas do arquivo
            const fetchedNotes = await getNotesByFile(fileRegistry.id);
            setNotes(fetchedNotes);
        }

        setLoadingNotes(false);
    };

    const handleAddNote = async () => {
        if (!newNoteContent.trim() || !currentUserId || !item.cloudId) return;

        setLoading(true);

        try {
            // Garantir que o arquivo está registrado
            const fileRegistry = await getOrCreateRegisteredFile({
                architect_id: currentUserId,
                file_name: item.name,
                file_path: item.url,
                cloud_provider: 'dropbox', // TODO: detectar dinamicamente
                cloud_file_id: item.cloudId,
                mime_type: item.mimeType,
            });

            if (!fileRegistry) {
                console.error('Failed to register file');
                setLoading(false);
                return;
            }

            // Criar a nota
            const newNote = await createNote({
                file_registry_id: fileRegistry.id,
                author_id: currentUserId,
                content: newNoteContent.trim(),
            });

            if (newNote) {
                // Recarregar notas para pegar informações do autor
                await loadNotes();
                setNewNoteContent('');

                // Notificar mudança
                if (onNotesChange) {
                    onNotesChange();
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
            {notes.map(note => (
                <div key={note.id} className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg group relative">
                    <div className="flex items-start gap-3 mb-2">
                        {note.author_avatar && (
                            <img
                                src={note.author_avatar}
                                alt={note.author_name}
                                className="w-8 h-8 rounded-full"
                            />
                        )}
                        <div className="flex-1">
                            <p className="text-sm font-medium text-yellow-900">
                                {note.author_name || 'Unknown'}
                            </p>
                            <p className="text-xs text-yellow-600">
                                {formatDate(note.created_at)}
                            </p>
                        </div>
                        {note.author_id === currentUserId && (
                            <button
                                onClick={() => handleDeleteNote(note.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-yellow-200 rounded"
                                title="Delete note"
                            >
                                <Trash2 className="w-4 h-4 text-yellow-700" />
                            </button>
                        )}
                    </div>
                    <p className="text-sm text-yellow-800 whitespace-pre-wrap">{note.content}</p>
                </div>
            ))}
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
