import { supabase } from './supabase';

export interface SharedFile {
    id: string;
    architect_id: string;
    client_id: string;
    cloud_provider: 'google' | 'dropbox';
    cloudfileid: string;  // Updated column name
    filename: string;     // Updated column name
    filetype: 'file' | 'folder';  // Updated column name
    mimetype?: string;    // Updated column name
    filepath?: string;    // Updated column name
    filesize?: number;    // Updated column name
    sharedat: string;     // Updated column name
    permission: 'view' | 'edit';
    // File access URLs
    web_view_link?: string;
    file_url?: string;
    thumbnail_url?: string;
    icon_link?: string;
}

export interface ShareFileParams {
    architectId: string;
    clientId: string;
    cloudProvider: 'google' | 'dropbox';
    cloudFileId: string;
    fileName: string;
    fileType: 'file' | 'folder';
    mimeType?: string;
    filePath?: string;
    fileSize?: number;
    permission?: 'view' | 'edit';
    // File access URLs
    webViewLink?: string;
    fileUrl?: string;
    thumbnailUrl?: string;
    iconLink?: string;
}

/**
 * Share a file or folder with a client
 */
export async function shareFileWithClient(params: ShareFileParams): Promise<SharedFile | null> {
    try {
        const { data, error } = await supabase
            .from('shared_files')
            .insert({
                architect_id: params.architectId,
                client_id: params.clientId,
                cloud_provider: params.cloudProvider,
                cloudfileid: params.cloudFileId,  // Updated column name
                filename: params.fileName,         // Updated column name
                filetype: params.fileType,         // Updated column name
                mimetype: params.mimeType,         // Updated column name
                filepath: params.filePath,         // Updated column name
                filesize: params.fileSize,         // Updated column name
                permission: params.permission || 'view',
                // File access URLs
                web_view_link: params.webViewLink,
                file_url: params.fileUrl,
                thumbnail_url: params.thumbnailUrl,
                icon_link: params.iconLink,
            })
            .select()
            .single();

        if (error) {
            console.error('Error sharing file:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error in shareFileWithClient:', error);
        return null;
    }
}

/**
 * Unshare a file (remove share)
 */
export async function unshareFile(shareId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('shared_files')
            .delete()
            .eq('id', shareId);

        if (error) {
            console.error('Error unsharing file:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error in unshareFile:', error);
        return false;
    }
}

/**
 * Unshare a file with a specific client
 */
export async function unshareFileWithClient(
    architectId: string,
    clientId: string,
    cloudFileId: string
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('shared_files')
            .delete()
            .eq('architect_id', architectId)
            .eq('client_id', clientId)
            .eq('cloudfileid', cloudFileId);  // Updated column name

        if (error) {
            console.error('Error unsharing file with client:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error in unshareFileWithClient:', error);
        return false;
    }
}

/**
 * Get all files shared by an architect
 */
export async function getSharedFilesByArchitect(architectId: string): Promise<SharedFile[]> {
    try {
        const { data, error } = await supabase
            .from('shared_files')
            .select('*')
            .eq('architect_id', architectId)
            .order('sharedat', { ascending: false });  // Updated column name

        if (error) {
            console.error('Error fetching shared files by architect:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in getSharedFilesByArchitect:', error);
        return [];
    }
}

/**
 * Get all files shared with a client
 */
export async function getSharedFilesForClient(clientId: string): Promise<SharedFile[]> {
    try {
        console.log('=== getSharedFilesForClient DEBUG ===');
        console.log('Querying for client_id:', clientId);

        const { data, error } = await supabase
            .from('shared_files')
            .select('*')
            .eq('client_id', clientId)
            .order('sharedat', { ascending: false });  // Updated column name

        console.log('Supabase query result:');
        console.log('  - Data:', data);
        console.log('  - Error:', error);
        console.log('  - Data length:', data?.length || 0);

        if (error) {
            console.error('Error fetching shared files for client:', error);
            return [];
        }

        // Also try to fetch ALL shared files to see what's in the database
        const { data: allFiles } = await supabase
            .from('shared_files')
            .select('client_id, filename');

        console.log('All shared files in database (first 5):');
        console.log(allFiles?.slice(0, 5));
        console.log('Looking for client_id:', clientId);
        console.log('Matching files:', allFiles?.filter(f => f.client_id === clientId));

        return data || [];
    } catch (error) {
        console.error('Error in getSharedFilesForClient:', error);
        return [];
    }
}

/**
 * Get list of clients a specific file is shared with
 */
export async function getClientsForFile(
    architectId: string,
    cloudFileId: string
): Promise<string[]> {
    try {
        const { data, error } = await supabase
            .from('shared_files')
            .select('client_id')
            .eq('architect_id', architectId)
            .eq('cloudfileid', cloudFileId);  // Updated column name

        if (error) {
            console.error('Error fetching clients for file:', error);
            return [];
        }

        return data?.map(row => row.client_id) || [];
    } catch (error) {
        console.error('Error in getClientsForFile:', error);
        return [];
    }
}

/**
 * Check if a file is shared with a specific client
 */
export async function isFileSharedWithClient(
    architectId: string,
    clientId: string,
    cloudFileId: string
): Promise<boolean> {
    try {
        const { data, error } = await supabase
            .from('shared_files')
            .select('id')
            .eq('architect_id', architectId)
            .eq('client_id', clientId)
            .eq('cloudfileid', cloudFileId)  // Updated column name
            .single();

        if (error && error.code !== 'PGRST116') {
            // PGRST116 is "not found" error
            console.error('Error checking if file is shared:', error);
            return false;
        }

        return !!data;
    } catch (error) {
        console.error('Error in isFileSharedWithClient:', error);
        return false;
    }
}

/**
 * Update share permission
 */
export async function updateSharePermission(
    shareId: string,
    permission: 'view' | 'edit'
): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('shared_files')
            .update({ permission })
            .eq('id', shareId);

        if (error) {
            console.error('Error updating share permission:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error in updateSharePermission:', error);
        return false;
    }
}
