-- Add columns for file access URLs to shared_files table
-- This allows clients to access shared files via permanent links

ALTER TABLE public.shared_files 
ADD COLUMN IF NOT EXISTS web_view_link text,
ADD COLUMN IF NOT EXISTS file_url text,
ADD COLUMN IF NOT EXISTS thumbnail_url text,
ADD COLUMN IF NOT EXISTS icon_link text;

-- Add comment to explain the new columns
COMMENT ON COLUMN public.shared_files.web_view_link IS 'Permanent link to view the file (Google Drive webViewLink or Dropbox shared link)';
COMMENT ON COLUMN public.shared_files.file_url IS 'Direct download link for the file';
COMMENT ON COLUMN public.shared_files.thumbnail_url IS 'Thumbnail image URL for preview';
COMMENT ON COLUMN public.shared_files.icon_link IS 'Icon URL for file type';
