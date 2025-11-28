-- Update existing shared_files to use user_id instead of client.id
-- This fixes the issue where files were shared with client.id but dashboard queries by user_id

-- First, let's see what we're working with
DO $$
DECLARE
  total_shares INTEGER;
  shares_with_client_id INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_shares FROM public.shared_files;
  SELECT COUNT(*) INTO shares_with_client_id 
  FROM public.shared_files sf
  WHERE EXISTS (
    SELECT 1 FROM public.clients c 
    WHERE c.id = sf.client_id
  );
  
  RAISE NOTICE 'Total shared files: %', total_shares;
  RAISE NOTICE 'Shares with valid client.id: %', shares_with_client_id;
END $$;

-- Update shared_files: change client_id from clients.id to clients.user_id
UPDATE public.shared_files sf
SET client_id = c.user_id
FROM public.clients c
WHERE sf.client_id = c.id
  AND c.user_id IS NOT NULL
  AND sf.client_id != c.user_id; -- Only update if they're different

-- Log the results
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RAISE NOTICE 'Updated % shared files to use user_id', updated_count;
END $$;
