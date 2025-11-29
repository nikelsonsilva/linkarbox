import { Dropbox } from 'dropbox';

export interface DropboxFileEntry {
    cloudfileid: string;
    filename: string;
    filetype: 'file' | 'folder';
    filepath: string;
    mimetype?: string;
    filesize?: number;
}

/**
 * Lists all files and folders within a Dropbox folder recursively
 * @param dropboxClient - Authenticated Dropbox client instance
 * @param folderPath - Path to the folder to list (e.g., "/pasta 202o")
 * @returns Array of all files and folders with their metadata
 */
export async function listFolderContentsRecursive(
    dropboxClient: Dropbox,
    folderPath: string
): Promise<DropboxFileEntry[]> {
    const allEntries: DropboxFileEntry[] = [];

    try {
        console.log(`[Dropbox] Listing contents of folder: ${folderPath}`);

        // List folder contents
        const response = await dropboxClient.filesListFolder({
            path: folderPath,
            recursive: false, // We'll handle recursion manually for better control
            include_media_info: false,
            include_deleted: false,
            include_has_explicit_shared_members: false,
        });

        console.log('[Dropbox] API Response:', response);

        // Dropbox SDK returns response with .result property
        const result = (response as any).result || response;

        // Process first batch of entries
        if (result.entries && Array.isArray(result.entries)) {
            await processEntries(result.entries, allEntries, dropboxClient);
        }

        // Handle pagination if there are more entries
        let cursor = result.cursor;
        let hasMore = result.has_more;

        while (hasMore) {
            const continueResponse = await dropboxClient.filesListFolderContinue({
                cursor: cursor,
            });

            const continueResult = (continueResponse as any).result || continueResponse;

            if (continueResult.entries && Array.isArray(continueResult.entries)) {
                await processEntries(continueResult.entries, allEntries, dropboxClient);
            }

            cursor = continueResult.cursor;
            hasMore = continueResult.has_more;
        }

        console.log(`[Dropbox] Found ${allEntries.length} total items in ${folderPath}`);
        return allEntries;
    } catch (error: any) {
        console.error(`[Dropbox] Error listing folder ${folderPath}:`, error);

        // Handle specific Dropbox errors
        if (error.status === 409) {
            console.error('[Dropbox] Folder not found or access denied');
        } else if (error.status === 429) {
            console.error('[Dropbox] Rate limit exceeded');
        }

        throw new Error(`Failed to list folder contents: ${error.message}`);
    }
}

/**
 * Process entries from Dropbox API response
 */
async function processEntries(
    entries: any[],
    allEntries: DropboxFileEntry[],
    dropboxClient: Dropbox
): Promise<void> {
    for (const entry of entries) {
        const fileEntry: DropboxFileEntry = {
            cloudfileid: entry.path_lower,
            filename: entry.name,
            filetype: entry['.tag'] === 'folder' ? 'folder' : 'file',
            filepath: getParentPath(entry.path_lower),
            mimetype: entry['.tag'] === 'file' ? getMimeType(entry.name) : undefined,
            filesize: entry['.tag'] === 'file' ? entry.size : undefined,
        };

        allEntries.push(fileEntry);

        // If it's a folder, recursively list its contents
        if (entry['.tag'] === 'folder') {
            try {
                const subEntries = await listFolderContentsRecursive(
                    dropboxClient,
                    entry.path_lower
                );
                allEntries.push(...subEntries);
            } catch (error) {
                console.error(`[Dropbox] Error listing subfolder ${entry.path_lower}:`, error);
                // Continue with other folders even if one fails
            }
        }
    }
}

/**
 * Get parent folder path from a full path
 * Example: "/folder/subfolder/file.txt" -> "/folder/subfolder"
 */
function getParentPath(fullPath: string): string {
    const parts = fullPath.split('/').filter(p => p);
    if (parts.length <= 1) {
        return 'root';
    }
    parts.pop(); // Remove last part (filename)
    return '/' + parts.join('/');
}

/**
 * Guess MIME type from file extension
 */
function getMimeType(filename: string): string | undefined {
    const ext = filename.split('.').pop()?.toLowerCase();

    const mimeTypes: Record<string, string> = {
        // Images
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'svg': 'image/svg+xml',

        // Documents
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

        // Text
        'txt': 'text/plain',
        'json': 'application/json',
        'xml': 'application/xml',
        'html': 'text/html',
        'css': 'text/css',
        'js': 'text/javascript',

        // Archives
        'zip': 'application/zip',
        'rar': 'application/x-rar-compressed',
        '7z': 'application/x-7z-compressed',

        // Design
        'psd': 'image/vnd.adobe.photoshop',
        'ai': 'application/postscript',
        'sketch': 'application/x-sketch',
    };

    return ext ? mimeTypes[ext] : undefined;
}
