import { supabase } from './supabase';

export interface FolderFile {
    cloudfileid: string;
    filename: string;
    filetype: 'file' | 'folder';
    filepath: string;
    mimetype?: string;
    filesize?: number;
    modified?: string;
    architect_id?: string; // ID do arquiteto que compartilhou
}

/**
 * Load folder contents securely via Supabase Edge Function
 * This function validates access and uses the architect's token server-side
 */
export async function loadFolderContents(
    folderPath: string,
    architectId: string
): Promise<FolderFile[]> {
    try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            throw new Error('Not authenticated');
        }

        // Call Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('load-folder', {
            body: {
                folderPath,
                architectId,
            },
        });

        if (error) {
            console.error('[FolderLoader] Error loading folder:', error);
            throw new Error(`Failed to load folder: ${error.message}`);
        }

        if (!data || !data.files) {
            throw new Error('Invalid response from server');
        }

        console.log(`[FolderLoader] Loaded ${data.files.length} items from ${folderPath}`);
        return data.files;
    } catch (error: any) {
        console.error('[FolderLoader] Error:', error);
        throw error;
    }
}
