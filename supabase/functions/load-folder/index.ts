import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log('=== LOAD FOLDER REQUEST ===');

        // Get request body
        const { folderPath, architectId } = await req.json()
        console.log('Folder path:', folderPath);
        console.log('Architect ID:', architectId);

        if (!folderPath || !architectId) {
            console.error('Missing required parameters');
            return new Response(
                JSON.stringify({ error: 'Missing folderPath or architectId' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Get authorization header
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            console.error('Missing authorization header');
            return new Response(
                JSON.stringify({ error: 'Missing authorization header' }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Create Supabase client with user auth
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: authHeader } } }
        )

        // Get current user
        console.log('Validating user authentication...');
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) {
            console.error('User authentication failed:', userError);
            return new Response(
                JSON.stringify({ error: 'Unauthorized', details: userError?.message }),
                { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }
        console.log('User authenticated:', user.id);

        // Verify user has access to this folder or any parent folder
        console.log('Checking folder access...');

        // First, try exact match (for root shared folders)
        let { data: sharedFolder, error: shareError } = await supabaseClient
            .from('shared_files')
            .select('*')
            .eq('client_id', user.id)
            .eq('architect_id', architectId)
            .eq('cloudfileid', folderPath)
            .eq('filetype', 'folder')
            .maybeSingle()

        // If not found, check if user has access to a parent folder
        if (!sharedFolder) {
            console.log('Exact match not found, checking parent folders...');

            // Get all shared folders for this user and architect
            const { data: allSharedFolders, error: allError } = await supabaseClient
                .from('shared_files')
                .select('*')
                .eq('client_id', user.id)
                .eq('architect_id', architectId)
                .eq('filetype', 'folder')

            if (allError) {
                console.error('Error fetching shared folders:', allError);
                return new Response(
                    JSON.stringify({ error: 'Access denied', details: allError.message }),
                    { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            // Check if folderPath is a subfolder of any shared folder
            const hasAccess = allSharedFolders?.some(folder => {
                // Check if folderPath starts with the shared folder path
                const isSubfolder = folderPath.startsWith(folder.cloudfileid + '/') ||
                    folderPath === folder.cloudfileid;
                console.log(`Checking if ${folderPath} is subfolder of ${folder.cloudfileid}: ${isSubfolder}`);
                return isSubfolder;
            });

            if (!hasAccess) {
                console.error('No access to folder or any parent folder');
                return new Response(
                    JSON.stringify({ error: 'Access denied - folder not shared with you' }),
                    { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                )
            }

            console.log('Access granted via parent folder');
        } else {
            console.log('Access verified for folder:', folderPath);
        }

        // Create service role client to bypass RLS for token access
        console.log('Creating service role client...');
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        )

        // Get architect's Dropbox token using service role
        console.log('Fetching architect Dropbox token...');
        const { data: connection, error: connError } = await supabaseAdmin
            .from('cloud_connections')
            .select('access_token, provider')
            .eq('user_id', architectId)
            .eq('provider', 'dropbox')
            .single()

        if (connError) {
            console.error('Token fetch error:', connError);
            return new Response(
                JSON.stringify({ error: 'Architect Dropbox connection not found', details: connError.message }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        if (!connection) {
            console.error('No Dropbox connection found for architect');
            return new Response(
                JSON.stringify({ error: 'Architect has no Dropbox connection' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }
        console.log('Token retrieved successfully');

        // Call Dropbox API to list folder contents
        console.log('Calling Dropbox API...');
        const dropboxResponse = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${connection.access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                path: folderPath,
                recursive: false,
                include_media_info: false,
                include_deleted: false,
            }),
        })

        if (!dropboxResponse.ok) {
            const errorText = await dropboxResponse.text()
            console.error('Dropbox API error:', errorText);
            return new Response(
                JSON.stringify({ error: 'Failed to load folder contents from Dropbox', details: errorText }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        const dropboxData = await dropboxResponse.json()
        console.log('Dropbox API success, entries:', dropboxData.entries?.length || 0);

        // Transform Dropbox entries to our format
        const files = dropboxData.entries.map((entry: any) => ({
            cloudfileid: entry.path_lower,
            filename: entry.name,
            filetype: entry['.tag'] === 'folder' ? 'folder' : 'file',
            filepath: folderPath,
            mimetype: entry['.tag'] === 'file' ? getMimeType(entry.name) : null,
            filesize: entry['.tag'] === 'file' ? entry.size : null,
            modified: entry.client_modified || entry.server_modified,
        }))

        console.log('=== SUCCESS ===');
        console.log('Returning', files.length, 'files');

        return new Response(
            JSON.stringify({ files }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        console.error('=== UNHANDLED ERROR ===');
        console.error('Error in load-folder function:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error', details: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})

// Helper function to guess MIME type from filename
function getMimeType(filename: string): string | null {
    const ext = filename.split('.').pop()?.toLowerCase()
    const mimeTypes: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'txt': 'text/plain',
        'json': 'application/json',
        'zip': 'application/zip',
        'psd': 'image/vnd.adobe.photoshop',
    }
    return ext ? mimeTypes[ext] || null : null
}
