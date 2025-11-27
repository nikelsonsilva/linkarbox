-- Add user_id column to clients table to link with auth.users
-- This is needed so we can share files using the correct auth user ID

-- Step 1: Add the column (nullable first)
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Update existing clients to populate user_id based on email match
-- This finds the auth.users.id that matches the client's email
UPDATE public.clients
SET user_id = (
    SELECT id 
    FROM auth.users 
    WHERE email = clients.email
    LIMIT 1
)
WHERE user_id IS NULL;

-- Step 3: Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);

-- Step 4: Add comment explaining the column
COMMENT ON COLUMN public.clients.user_id IS 'Links to auth.users.id - the actual user ID used for authentication and file sharing';
