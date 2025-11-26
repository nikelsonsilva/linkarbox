import { supabase } from './supabase';

export interface NoteData {
    file_registry_id: string;
    author_id: string;
    content: string;
}

export interface Note {
    id: string;
    file_registry_id: string;
    author_id: string;
    content: string;
    is_read: boolean;
    created_at: string;
    updated_at: string;
    // Dados do autor (via join)
    author_name?: string;
    author_avatar?: string;
}

/**
 * Cria uma nova nota em um arquivo
 */
export async function createNote(noteData: NoteData): Promise<Note | null> {
    try {
        const { data, error } = await supabase
            .from('file_notes')
            .insert([noteData])
            .select()
            .single();

        if (error) {
            console.error('Error creating note:', error);
            return null;
        }

        return data;
    } catch (err) {
        console.error('Exception creating note:', err);
        return null;
    }
}

/**
 * Busca todas as notas de um arquivo com informações do autor
 */
export async function getNotesByFile(fileRegistryId: string): Promise<Note[]> {
    try {
        const { data, error } = await supabase
            .from('file_notes')
            .select(`
        *,
        author:profiles!file_notes_author_id_fkey (
          name,
          avatar_url
        )
      `)
            .eq('file_registry_id', fileRegistryId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error getting notes:', error);
            return [];
        }

        // Mapear os dados do autor para o formato esperado
        return (data || []).map((note: any) => ({
            ...note,
            author_name: note.author?.name || 'Unknown',
            author_avatar: note.author?.avatar_url || '',
        }));
    } catch (err) {
        console.error('Exception getting notes:', err);
        return [];
    }
}

/**
 * Marca uma nota como lida
 */
export async function markNoteAsRead(noteId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('file_notes')
            .update({ is_read: true })
            .eq('id', noteId);

        if (error) {
            console.error('Error marking note as read:', error);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Exception marking note as read:', err);
        return false;
    }
}

/**
 * Marca todas as notas de um arquivo como lidas
 */
export async function markAllNotesAsRead(fileRegistryId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('file_notes')
            .update({ is_read: true })
            .eq('file_registry_id', fileRegistryId)
            .eq('is_read', false);

        if (error) {
            console.error('Error marking all notes as read:', error);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Exception marking all notes as read:', err);
        return false;
    }
}

/**
 * Conta notas não lidas de um arquivo
 */
export async function getUnreadNotesCount(fileRegistryId: string): Promise<number> {
    try {
        const { count, error } = await supabase
            .from('file_notes')
            .select('*', { count: 'exact', head: true })
            .eq('file_registry_id', fileRegistryId)
            .eq('is_read', false);

        if (error) {
            console.error('Error counting unread notes:', error);
            return 0;
        }

        return count || 0;
    } catch (err) {
        console.error('Exception counting unread notes:', err);
        return 0;
    }
}

/**
 * Atualiza o conteúdo de uma nota
 */
export async function updateNote(noteId: string, content: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('file_notes')
            .update({ content })
            .eq('id', noteId);

        if (error) {
            console.error('Error updating note:', error);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Exception updating note:', err);
        return false;
    }
}

/**
 * Deleta uma nota
 */
export async function deleteNote(noteId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('file_notes')
            .delete()
            .eq('id', noteId);

        if (error) {
            console.error('Error deleting note:', error);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Exception deleting note:', err);
        return false;
    }
}

/**
 * Busca mapa de contadores de notas não lidas para múltiplos arquivos
 * Retorna um objeto { cloud_file_id: unread_count }
 */
export async function getUnreadNotesCountMap(
    architectId: string
): Promise<Record<string, number>> {
    try {
        // Primeiro busca todos os arquivos registrados do arquiteto
        const { data: files, error: filesError } = await supabase
            .from('file_registry')
            .select('id, cloud_file_id')
            .eq('architect_id', architectId);

        if (filesError || !files) {
            console.error('Error getting files for unread count:', filesError);
            return {};
        }

        // Para cada arquivo, conta as notas não lidas
        const countMap: Record<string, number> = {};

        for (const file of files) {
            const { count, error } = await supabase
                .from('file_notes')
                .select('*', { count: 'exact', head: true })
                .eq('file_registry_id', file.id)
                .eq('is_read', false);

            if (!error && count !== null) {
                countMap[file.cloud_file_id] = count;
            }
        }

        return countMap;
    } catch (err) {
        console.error('Exception getting unread notes count map:', err);
        return {};
    }
}
