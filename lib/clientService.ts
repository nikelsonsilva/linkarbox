import { supabase } from './supabase';

export interface Client {
    id: string;
    architect_id: string;
    name: string;
    email: string;
    phone?: string;
    cpf_cnpj?: string;
    address?: string;
    notes?: string;
    status: 'active' | 'pending' | 'inactive';
    invite_token?: string;
    invite_sent_at?: string;
    registered_at?: string;
    created_at: string;
    updated_at: string;
    user_id?: string; // Links to auth.users.id
}

export interface CreateClientData {
    name: string;
    email: string;
    phone?: string;
    cpf_cnpj?: string;
    address?: string;
    notes?: string;
}

export interface InviteClientData {
    email: string;
    name?: string;
}

// Generate a unique invite token
function generateInviteToken(): string {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}

// Create client manually (already registered)
export async function createClient(data: CreateClientData): Promise<{ data: Client | null; error: any }> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: { message: 'User not authenticated' } };
        }

        const { data: client, error } = await supabase
            .from('clients')
            .insert({
                architect_id: user.id,
                name: data.name,
                email: data.email,
                phone: data.phone,
                cpf_cnpj: data.cpf_cnpj,
                address: data.address,
                notes: data.notes,
                status: 'active',
                registered_at: new Date().toISOString(),
            })
            .select()
            .single();

        return { data: client, error };
    } catch (error) {
        return { data: null, error };
    }
}

// Send invite to client
export async function inviteClient(data: InviteClientData): Promise<{ data: Client | null; error: any; inviteLink?: string }> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: { message: 'User not authenticated' } };
        }

        const inviteToken = generateInviteToken();
        const inviteLink = `${window.location.origin}/invite/${inviteToken}`;

        const { data: client, error } = await supabase
            .from('clients')
            .insert({
                architect_id: user.id,
                name: data.name || '',
                email: data.email,
                status: 'pending',
                invite_token: inviteToken,
                invite_sent_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            return { data: null, error };
        }

        return { data: client, error: null, inviteLink };
    } catch (error) {
        return { data: null, error };
    }
}

// Get all clients for current architect
export async function getClients(): Promise<{ data: Client[] | null; error: any }> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { data: null, error: { message: 'User not authenticated' } };
        }

        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('architect_id', user.id)
            .order('created_at', { ascending: false });

        return { data, error };
    } catch (error) {
        return { data: null, error };
    }
}

// Get client by ID
export async function getClientById(id: string): Promise<{ data: Client | null; error: any }> {
    try {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', id)
            .single();

        return { data, error };
    } catch (error) {
        return { data: null, error };
    }
}

// Get client by invite token (public access for registration)
export async function getClientByInviteToken(token: string): Promise<{
    data: (Client & { architect_name?: string }) | null;
    error: any
}> {
    try {
        // First, get the client data
        const { data: clientData, error: clientError } = await supabase
            .from('clients')
            .select('*')
            .eq('invite_token', token)
            .eq('status', 'pending')
            .maybeSingle();

        if (clientError || !clientData) {
            console.error('Error fetching client:', clientError);
            return { data: null, error: clientError };
        }

        // Then, get the architect's name from profiles
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('name, display_name')
            .eq('id', clientData.architect_id)
            .maybeSingle();

        if (profileError) {
            console.warn('Error fetching architect profile:', profileError);
        }

        const architectName = profileData?.name || profileData?.display_name || 'Arquiteto';

        return {
            data: {
                ...clientData,
                architect_name: architectName
            },
            error: null
        };
    } catch (error) {
        console.error('Error in getClientByInviteToken:', error);
        return { data: null, error };
    }
}

// Update client
export async function updateClient(id: string, updates: Partial<CreateClientData>): Promise<{ data: Client | null; error: any }> {
    try {
        const { data, error } = await supabase
            .from('clients')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        return { data, error };
    } catch (error) {
        return { data: null, error };
    }
}

// Delete client
export async function deleteClient(id: string): Promise<{ error: any }> {
    try {
        const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id);

        return { error };
    } catch (error) {
        return { error };
    }
}

// Resend invite
export async function resendInvite(clientId: string): Promise<{ data: Client | null; error: any; inviteLink?: string }> {
    try {
        const newToken = generateInviteToken();
        const inviteLink = `${window.location.origin}/invite/${newToken}`;

        const { data, error } = await supabase
            .from('clients')
            .update({
                invite_token: newToken,
                invite_sent_at: new Date().toISOString(),
            })
            .eq('id', clientId)
            .select()
            .single();

        if (error) {
            return { data: null, error };
        }

        return { data, error: null, inviteLink };
    } catch (error) {
        return { data: null, error };
    }
}

// Complete client registration (called when client accepts invite)
export async function completeClientRegistration(
    token: string,
    userData: {
        name: string;
        phone?: string;
        cpf_cnpj?: string;
        password: string;
    }
): Promise<{ data: Client | null; error: any }> {
    try {
        // First, get the client data to get the email
        const { data: clientData, error: clientError } = await supabase
            .from('clients')
            .select('*')
            .eq('invite_token', token)
            .eq('status', 'pending')
            .maybeSingle();

        if (clientError || !clientData) {
            console.error('Error fetching client for registration:', clientError);
            return { data: null, error: clientError || { message: 'Cliente não encontrado' } };
        }

        // Create Supabase auth user with the client's email and password
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: clientData.email,
            password: userData.password,
            options: {
                data: {
                    name: userData.name,
                    display_name: userData.name,
                    role: 'client',
                },
            },
        });

        if (authError) {
            console.error('Error creating auth user:', authError);
            return { data: null, error: authError };
        }

        // Update the client record
        const { data: updatedClient, error: updateError } = await supabase
            .from('clients')
            .update({
                name: userData.name,
                phone: userData.phone,
                cpf_cnpj: userData.cpf_cnpj,
                status: 'active',
                registered_at: new Date().toISOString(),
                invite_token: null, // Clear token after registration
            })
            .eq('id', clientData.id)
            .select()
            .maybeSingle();

        if (updateError) {
            console.error('Error updating client:', updateError);
            return { data: null, error: updateError };
        }

        return { data: updatedClient, error: null };
    } catch (error) {
        console.error('Error in completeClientRegistration:', error);
        return { data: null, error };
    }
}

// Get client statistics
export async function getClientStats(): Promise<{
    total: number;
    active: number;
    pending: number;
    inactive: number;
}> {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { total: 0, active: 0, pending: 0, inactive: 0 };
        }

        const { data, error } = await supabase
            .from('clients')
            .select('status')
            .eq('architect_id', user.id);

        if (error || !data) {
            return { total: 0, active: 0, pending: 0, inactive: 0 };
        }

        return {
            total: data.length,
            active: data.filter(c => c.status === 'active').length,
            pending: data.filter(c => c.status === 'pending').length,
            inactive: data.filter(c => c.status === 'inactive').length,
        };
    } catch (error) {
        return { total: 0, active: 0, pending: 0, inactive: 0 };
    }
}
