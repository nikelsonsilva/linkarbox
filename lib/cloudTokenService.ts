import { supabase } from './supabase';

export interface CloudConnection {
    id: string;
    user_id: string;
    provider: 'google' | 'dropbox';
    access_token: string;
    refresh_token?: string;
    expires_at?: string;
    created_at: string;
    updated_at: string;
}

/**
 * Save or update cloud storage token in database
 */
export async function saveCloudToken(
    provider: 'google' | 'dropbox',
    accessToken: string,
    refreshToken?: string,
    expiresAt?: Date
): Promise<{ success: boolean; error?: string }> {
    try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            console.error('[CloudTokenService] User not authenticated:', userError);
            return { success: false, error: 'User not authenticated' };
        }

        console.log(`[CloudTokenService] Saving ${provider} token for user:`, user.id);

        // Upsert token (insert or update if exists)
        const { error: upsertError } = await supabase
            .from('cloud_connections')
            .upsert({
                user_id: user.id,
                provider,
                access_token: accessToken,
                refresh_token: refreshToken || null,
                expires_at: expiresAt ? expiresAt.toISOString() : null,
            }, {
                onConflict: 'user_id,provider'
            });

        if (upsertError) {
            console.error(`[CloudTokenService] Error saving ${provider} token:`, upsertError);
            return { success: false, error: upsertError.message };
        }

        console.log(`[CloudTokenService] ${provider} token saved successfully`);
        return { success: true };
    } catch (error: any) {
        console.error('[CloudTokenService] Unexpected error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Get cloud storage token from database
 */
export async function getCloudToken(
    provider: 'google' | 'dropbox'
): Promise<{ token?: string; error?: string }> {
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return { error: 'User not authenticated' };
        }

        const { data, error } = await supabase
            .from('cloud_connections')
            .select('access_token')
            .eq('user_id', user.id)
            .eq('provider', provider)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                // No rows found
                return { error: 'Token not found' };
            }
            return { error: error.message };
        }

        return { token: data.access_token };
    } catch (error: any) {
        return { error: error.message };
    }
}

/**
 * Delete cloud storage token from database
 */
export async function deleteCloudToken(
    provider: 'google' | 'dropbox'
): Promise<{ success: boolean; error?: string }> {
    try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user) {
            return { success: false, error: 'User not authenticated' };
        }

        const { error } = await supabase
            .from('cloud_connections')
            .delete()
            .eq('user_id', user.id)
            .eq('provider', provider);

        if (error) {
            console.error(`[CloudTokenService] Error deleting ${provider} token:`, error);
            return { success: false, error: error.message };
        }

        console.log(`[CloudTokenService] ${provider} token deleted successfully`);
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
