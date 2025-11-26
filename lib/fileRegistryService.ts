import { supabase } from './supabase';

export interface FileRegistryData {
    architect_id: string;
    file_name: string;
    file_path?: string;
    cloud_provider: 'google' | 'dropbox';
    cloud_file_id: string;
    mime_type?: string;
}

export interface FileRegistry extends FileRegistryData {
    id: string;
    created_at: string;
    updated_at: string;
}

/**
 * Registra um novo arquivo no sistema quando a primeira nota for criada
 */
export async function registerFile(fileData: FileRegistryData): Promise<FileRegistry | null> {
    try {
        const { data, error } = await supabase
            .from('file_registry')
            .insert([fileData])
            .select()
            .single();

        if (error) {
            console.error('Error registering file:', error);
            return null;
        }

        return data;
    } catch (err) {
        console.error('Exception registering file:', err);
        return null;
    }
}

/**
 * Busca um arquivo registrado pelo cloud_file_id e architect_id
 */
export async function getRegisteredFile(
    cloudFileId: string,
    architectId: string
): Promise<FileRegistry | null> {
    try {
        const { data, error } = await supabase
            .from('file_registry')
            .select('*')
            .eq('cloud_file_id', cloudFileId)
            .eq('architect_id', architectId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // Nenhum registro encontrado
                return null;
            }
            console.error('Error getting registered file:', error);
            return null;
        }

        return data;
    } catch (err) {
        console.error('Exception getting registered file:', err);
        return null;
    }
}

/**
 * Busca ou cria um arquivo registrado
 */
export async function getOrCreateRegisteredFile(
    fileData: FileRegistryData
): Promise<FileRegistry | null> {
    // Primeiro tenta buscar
    let file = await getRegisteredFile(fileData.cloud_file_id, fileData.architect_id);

    // Se não existir, cria
    if (!file) {
        file = await registerFile(fileData);
    }

    return file;
}

/**
 * Lista todos os arquivos registrados de um arquiteto
 */
export async function getFilesByArchitect(architectId: string): Promise<FileRegistry[]> {
    try {
        const { data, error } = await supabase
            .from('file_registry')
            .select('*')
            .eq('architect_id', architectId)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error getting files by architect:', error);
            return [];
        }

        return data || [];
    } catch (err) {
        console.error('Exception getting files by architect:', err);
        return [];
    }
}

/**
 * Atualiza metadados de um arquivo registrado
 */
export async function updateFileMetadata(
    fileRegistryId: string,
    metadata: Partial<Pick<FileRegistryData, 'file_name' | 'file_path' | 'mime_type'>>
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('file_registry')
            .update(metadata)
            .eq('id', fileRegistryId);

        if (error) {
            console.error('Error updating file metadata:', error);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Exception updating file metadata:', err);
        return false;
    }
}

/**
 * Deleta um arquivo registrado e todas as suas notas
 */
export async function deleteRegisteredFile(fileRegistryId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('file_registry')
            .delete()
            .eq('id', fileRegistryId);

        if (error) {
            console.error('Error deleting registered file:', error);
            return false;
        }

        return true;
    } catch (err) {
        console.error('Exception deleting registered file:', err);
        return false;
    }
}
