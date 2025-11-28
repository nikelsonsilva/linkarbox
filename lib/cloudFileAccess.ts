/**
 * Cloud File Access Utilities
 * Functions to get shareable/permanent links from Google Drive and Dropbox
 */

import { Dropbox } from 'dropbox';

export interface FileAccessLinks {
    webViewLink?: string;
    downloadLink?: string;
    thumbnailLink?: string;
    iconLink?: string;
}

/**
 * Get permanent shareable links for a Google Drive file
 * Makes the file publicly accessible via link
 */
export async function getGoogleDriveFileLinks(fileId: string): Promise<FileAccessLinks> {
    try {
        console.log('Getting Google Drive links for file:', fileId);

        // Check if gapi is available
        if (!window.gapi || !window.gapi.client || !window.gapi.client.drive) {
            console.error('Google Drive API (gapi) is not loaded');
            throw new Error('Google Drive API not available');
        }

        console.log('Step 1: Creating public permission for file...');
        // First, make the file accessible to anyone with the link
        try {
            await window.gapi.client.drive.permissions.create({
                fileId: fileId,
                resource: {
                    role: 'reader',
                    type: 'anyone'
                }
            });
            console.log('Successfully created public permission');
        } catch (permError: any) {
            // If permission already exists, that's okay
            if (permError?.result?.error?.message?.includes('already exists')) {
                console.log('Permission already exists, continuing...');
            } else {
                console.error('Error creating permission:', permError);
                throw permError;
            }
        }

        console.log('Step 2: Getting file metadata with links...');
        // Get file metadata with links
        const response = await window.gapi.client.drive.files.get({
            fileId: fileId,
            fields: 'webViewLink,webContentLink,thumbnailLink,iconLink,mimeType'
        });

        const file = response.result;
        console.log('File metadata retrieved:', file);

        const links = {
            webViewLink: file.webViewLink,
            downloadLink: file.webContentLink || file.webViewLink, // Fallback to webViewLink if no direct download
            thumbnailLink: file.thumbnailLink,
            iconLink: file.iconLink
        };

        console.log('Generated links:', links);
        return links;
    } catch (error) {
        console.error('Error getting Google Drive file links:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
    }
}

/**
 * Get permanent shareable links for a Dropbox file
 * Creates a shared link if one doesn't exist
 */
export async function getDropboxFileLinks(dbx: Dropbox, filePath: string): Promise<FileAccessLinks> {
    try {
        // Try to create a new shared link
        try {
            const sharedLink = await dbx.sharingCreateSharedLinkWithSettings({
                path: filePath,
                settings: {
                    requested_visibility: { '.tag': 'public' }
                }
            });

            // Convert Dropbox preview link to direct download link
            const directLink = sharedLink.result.url.replace('?dl=0', '?dl=1');

            return {
                webViewLink: sharedLink.result.url, // Preview link
                downloadLink: directLink, // Direct download link
                thumbnailLink: undefined, // Dropbox doesn't provide thumbnails via API easily
                iconLink: undefined
            };
        } catch (createError: any) {
            // If link already exists, get existing links
            if (createError?.error?.error_summary?.includes('shared_link_already_exists')) {
                const links = await dbx.sharingListSharedLinks({ path: filePath });

                if (links.result.links && links.result.links.length > 0) {
                    const link = links.result.links[0];
                    const directLink = link.url.replace('?dl=0', '?dl=1');

                    return {
                        webViewLink: link.url,
                        downloadLink: directLink,
                        thumbnailLink: undefined,
                        iconLink: undefined
                    };
                }
            }
            throw createError;
        }
    } catch (error) {
        console.error('Error getting Dropbox file links:', error);
        throw error;
    }
}

/**
 * Get file access links based on cloud provider
 */
export async function getFileAccessLinks(
    cloudProvider: 'google' | 'dropbox',
    fileId: string,
    dropboxClient?: Dropbox
): Promise<FileAccessLinks> {
    if (cloudProvider === 'google') {
        return await getGoogleDriveFileLinks(fileId);
    } else if (cloudProvider === 'dropbox') {
        if (!dropboxClient) {
            throw new Error('Dropbox client is required for Dropbox files');
        }
        return await getDropboxFileLinks(dropboxClient, fileId);
    } else {
        throw new Error(`Unsupported cloud provider: ${cloudProvider}`);
    }
}
