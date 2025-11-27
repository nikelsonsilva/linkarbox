-- Drop the existing table and recreate with SIMPLIFIED RLS policies
DROP TABLE IF EXISTS public.shared_files CASCADE;

-- Create shared_files table
CREATE TABLE public.shared_files (
  id uuid default gen_random_uuid() primary key,
  architect_id uuid references auth.users not null,
  client_id uuid not null,  -- Just stores the client ID from clients table
  
  -- Cloud file identification
  cloud_provider text not null check (cloud_provider in ('google', 'dropbox')),
  cloudfileid text not null,
  filename text not null,
  filetype text not null check (filetype in ('file', 'folder')),
  mimetype text,
  filepath text,
  filesize bigint,
  
  -- Metadata
  sharedat timestamp with time zone default now(),
  permission text default 'view' check (permission in ('view', 'edit')),
  
  -- Ensure no duplicate shares
  unique(architect_id, client_id, cloudfileid)
);

-- Create indexes for faster queries
CREATE INDEX idx_shared_files_architect ON public.shared_files(architect_id);
CREATE INDEX idx_shared_files_client ON public.shared_files(client_id);
CREATE INDEX idx_shared_files_cloudfile ON public.shared_files(cloudfileid);

-- Set up Row Level Security (RLS)
ALTER TABLE public.shared_files ENABLE ROW LEVEL SECURITY;

-- SIMPLIFIED POLICIES - No complex joins

-- 1. Architects can do everything with their own shares
CREATE POLICY "Architects full access to their shares"
  ON shared_files
  FOR ALL
  USING ( auth.uid() = architect_id )
  WITH CHECK ( auth.uid() = architect_id );

-- 2. Clients can ONLY view shares (we'll handle client matching in the app)
-- For now, allow all authenticated users to read
-- (we filter by client_id in the application layer)
CREATE POLICY "Authenticated users can view shares"
  ON shared_files
  FOR SELECT
  USING ( auth.role() = 'authenticated' );

-- Grant necessary permissions
GRANT ALL ON public.shared_files TO authenticated;
GRANT ALL ON public.shared_files TO service_role;
