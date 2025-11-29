-- Create cloud_connections table to store cloud storage tokens
CREATE TABLE IF NOT EXISTS cloud_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google', 'dropbox')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- Enable RLS
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

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_cloud_connections_user_provider 
ON cloud_connections(user_id, provider);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_cloud_connections_updated_at
BEFORE UPDATE ON cloud_connections
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
