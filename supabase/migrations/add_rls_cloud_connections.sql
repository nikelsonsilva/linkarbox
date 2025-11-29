-- Add Row Level Security to cloud_connections table
-- This ensures each architect can only access their own cloud tokens

-- Enable RLS on the table
ALTER TABLE cloud_connections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own cloud connections
CREATE POLICY "Users can only view their own cloud connections"
ON cloud_connections
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can only insert their own cloud connections
CREATE POLICY "Users can only insert their own cloud connections"
ON cloud_connections
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own cloud connections
CREATE POLICY "Users can only update their own cloud connections"
ON cloud_connections
FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can only delete their own cloud connections
CREATE POLICY "Users can only delete their own cloud connections"
ON cloud_connections
FOR DELETE
USING (auth.uid() = user_id);

-- IMPORTANT: Service role (used by Edge Functions) bypasses RLS
-- This allows the Edge Function to read tokens on behalf of clients
-- while still protecting tokens from direct client access
