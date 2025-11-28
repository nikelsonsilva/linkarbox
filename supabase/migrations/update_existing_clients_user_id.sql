-- Update existing clients to link their user_id from auth.users
-- This fixes the issue where old clients don't have user_id set

-- Update clients table: set user_id based on email match with auth.users
UPDATE public.clients
SET user_id = auth.users.id
FROM auth.users
WHERE clients.email = auth.users.email
  AND clients.user_id IS NULL;

-- Log the results
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % clients with user_id', updated_count;
END $$;
