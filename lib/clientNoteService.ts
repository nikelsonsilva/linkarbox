import { supabase } from './supabase';
import { getRegisteredFile, registerFile, type FileRegistry, type FileRegistryData } from './fileRegistryService';
import { createNote, getNotesByFile, type Note, type NoteData } from './noteService';

/**
 * Busca ou cria file_registry para arquivo compartilhado
 * Usado quando cliente quer adicionar nota em arquivo compartilhado
 */
export async function getOrCreateSharedFileRegistry(
    cloudFileId: string,
    architectId: string,
    fileName: string,
    cloudProvider: 'google' | 'dropbox'
): Promise<FileRegistry | null> {
    try {
        // Primeiro tenta buscar usando o architectId (não o cliente)
        // Isso funciona porque a política RLS permite clientes verem file_registry de arquivos compartilhados
        const { data: existingFile, error: fetchError } = await supabase
            .from('file_registry')
            .select('*')
            .eq('cloud_file_id', cloudFileId)
            .eq('architect_id', architectId)
            .maybeSingle();

        if (existingFile) {
            return existingFile as FileRegistry;
        }

        // Se não existir, cria (a política RLS permite isso)
        const fileData: FileRegistryData = {
            architect_id: architectId,
            file_name: fileName,
            cloud_provider: cloudProvider,
            cloud_file_id: cloudFileId,
        };

        const fileRegistry = await registerFile(fileData);
        return fileRegistry;
    } catch (err) {
        console.error('[ClientNoteService] Error getting/creating file registry:', err);
        return null;
    }
}

/**
 * Cria nota em arquivo compartilhado (valida acesso via RLS)
 */
export async function createNoteOnSharedFile(
    cloudFileId: string,
    architectId: string,
    fileName: string,
    cloudProvider: 'google' | 'dropbox',
    content: string
): Promise<Note | null> {
    try {
        // Buscar usuário atual
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
            console.error('[ClientNoteService] User not authenticated');
            return null;
        }

        // Buscar ou criar file_registry
        const fileRegistry = await getOrCreateSharedFileRegistry(
            cloudFileId,
            architectId,
            fileName,
            cloudProvider
        );

        if (!fileRegistry) {
            console.error('[ClientNoteService] Failed to get/create file registry');
            return null;
        }

        // Criar nota
        const noteData: NoteData = {
            file_registry_id: fileRegistry.id,
            author_id: user.id,
            content,
        };

        const note = await createNote(noteData);
        return note;
    } catch (err) {
        console.error('[ClientNoteService] Error creating note on shared file:', err);
        return null;
    }
}

/**
 * Busca notas de arquivo compartilhado
 */
export async function getNotesForSharedFile(
    cloudFileId: string,
    architectId: string
): Promise<Note[]> {
    try {
        // Buscar file_registry diretamente
        const { data: fileRegistry, error: registryError } = await supabase
            .from('file_registry')
            .select('id')
            .eq('cloud_file_id', cloudFileId)
            .eq('architect_id', architectId)
            .maybeSingle();

        if (registryError) {
            console.error('[ClientNoteService] Error fetching file registry:', registryError);
            return [];
        }

        if (!fileRegistry) {
            // Arquivo ainda não tem notas
            return [];
        }

        // Buscar notas usando o serviço principal (que já busca de profiles e clients)
        const notes = await getNotesByFile(fileRegistry.id);
        return notes;
    } catch (err) {
        console.error('[ClientNoteService] Error getting notes for shared file:', err);
        return [];
    }
}

/**
 * Busca mapa de contadores de notas não lidas para arquivos compartilhados com o cliente
 * Retorna um objeto { cloud_file_id: unread_count }
 */
export async function getUnreadNotesMapForClient(
    clientId: string
): Promise<Record<string, number>> {
    try {
        // Buscar todos os arquivos compartilhados com o cliente
        const { data: sharedFiles, error: sharedError } = await supabase
            .from('shared_files')
            .select('cloudfileid, architect_id')
            .eq('client_id', clientId);

        if (sharedError || !sharedFiles) {
            console.error('[ClientNoteService] Error getting shared files:', sharedError);
            return {};
        }

        const countMap: Record<string, number> = {};

        // Para cada arquivo compartilhado, buscar notas não lidas
        for (const sharedFile of sharedFiles) {
            // Buscar file_registry diretamente
            const { data: fileRegistry, error: registryError } = await supabase
                .from('file_registry')
                .select('id')
                .eq('cloud_file_id', sharedFile.cloudfileid)
                .eq('architect_id', sharedFile.architect_id)
                .maybeSingle();

            if (registryError || !fileRegistry) {
                // Arquivo não tem notas ainda
                continue;
            }

            // Contar notas não lidas que NÃO foram criadas pelo cliente
            const { count, error } = await supabase
                .from('file_notes')
                .select('*', { count: 'exact', head: true })
                .eq('file_registry_id', fileRegistry.id)
                .eq('is_read', false)
                .neq('author_id', clientId); // Não contar notas do próprio cliente

            if (!error && count !== null && count > 0) {
                countMap[sharedFile.cloudfileid] = count;
            }
        }

        return countMap;
    } catch (err) {
        console.error('[ClientNoteService] Error getting unread notes map:', err);
        return {};
    }
}
