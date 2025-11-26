/// &lt;reference types="vite/client" /&gt;

import { supabase } from './supabase';

const DROPBOX_TOKEN_ENDPOINT = 'https://api.dropboxapi.com/oauth2/token';

// Note: In production, DROPBOX_APP_SECRET should be stored securely on the backend
// For now, we'll need to add it to environment variables
const DROPBOX_APP_KEY = '526sxx6ouop0kwl';
const DROPBOX_APP_SECRET = import.meta.env.VITE_DROPBOX_APP_SECRET || '';

export interface CloudTokens {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
}

/**
 * Store cloud provider tokens in Supabase
 */
export async function storeTokens(
    userId: string,
    provider: 'google' | 'dropbox',
    tokens: CloudTokens
): Promise<void> {
    const { error } = await supabase
        .from('cloud_connections')
        .upsert({
            user_id: userId,
            provider,
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
            // Note: expires_at removed due to type mismatch in database
            updated_at: new Date().toISOString(),
        }, {
            onConflict: 'user_id,provider'
        });

    if (error) {
        console.error('Error storing tokens:', error);
        throw error;
    }
}

/**
 * Get stored tokens for a user and provider
 */
export async function getStoredTokens(
    userId: string,
    provider: 'google' | 'dropbox'
): Promise<CloudTokens | null> {
    const { data, error } = await supabase
        .from('cloud_connections')
        .select('*')
        .eq('user_id', userId)
        .eq('provider', provider)
        .single();

    if (error || !data) {
        return null;
    }

    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_at ? new Date(data.expires_at) : undefined,
    };
}

/**
 * Refresh Dropbox access token using refresh token
 */
export async function refreshDropboxToken(refreshToken: string): Promise<CloudTokens> {
    const params = new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: DROPBOX_APP_KEY,
        client_secret: DROPBOX_APP_SECRET,
    });

    const response = await fetch(DROPBOX_TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    });

    if (!response.ok) {
        const error = await response.json();
        console.error('Error refreshing Dropbox token:', error);
        throw new Error('Failed to refresh Dropbox token');
    }

    const data = await response.json();

    // Calculate expiration time (Dropbox tokens expire in 4 hours)
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (data.expires_in || 14400));

    return {
        accessToken: data.access_token,
        refreshToken: refreshToken, // Refresh token stays the same
        expiresAt,
    };
}

/**
 * Exchange Dropbox authorization code for tokens
 */
export async function exchangeDropboxCode(
    code: string,
    redirectUri: string
): Promise<CloudTokens> {
    const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: DROPBOX_APP_KEY,
        client_secret: DROPBOX_APP_SECRET,
    });

    const response = await fetch(DROPBOX_TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    });

    if (!response.ok) {
        const error = await response.json();
        console.error('Error exchanging Dropbox code:', error);
        throw new Error('Failed to exchange authorization code');
    }

    const data = await response.json();

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (data.expires_in || 14400));

    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt,
    };
}

/**
 * Get a valid access token, refreshing if necessary
 */
export async function getValidAccessToken(
    userId: string,
    provider: 'dropbox'
): Promise<string | null> {
    const tokens = await getStoredTokens(userId, provider);

    if (!tokens) {
        return null;
    }

    // Check if token is expired or will expire in the next 5 minutes
    const now = new Date();
    const expiryBuffer = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes buffer

    if (tokens.expiresAt && tokens.expiresAt > expiryBuffer) {
        // Token is still valid
        return tokens.accessToken;
    }

    // Token is expired or about to expire, refresh it
    if (!tokens.refreshToken) {
        console.error('No refresh token available');
        return null;
    }

    try {
        const newTokens = await refreshDropboxToken(tokens.refreshToken);
        await storeTokens(userId, provider, newTokens);
        return newTokens.accessToken;
    } catch (error) {
        console.error('Failed to refresh token:', error);
        return null;
    }
}

/**
 * Revoke and delete stored tokens
 */
export async function revokeTokens(
    userId: string,
    provider: 'google' | 'dropbox'
): Promise<void> {
    const { error } = await supabase
        .from('cloud_connections')
        .delete()
        .eq('user_id', userId)
        .eq('provider', provider);

    if (error) {
        console.error('Error revoking tokens:', error);
        throw error;
    }
}
