-- Add a new column for download URL to the social_media_accounts table
ALTER TABLE public.social_media_accounts
ADD COLUMN download_url TEXT;

-- Optional: If you want to set a default value for existing rows, you can do so.
-- For example, setting it to an empty string:
-- UPDATE public.social_media_accounts SET download_url = '';

-- Optional: If you want to add a policy for this new column (e.g., allow public read)
-- This is usually covered by existing "public read" policies if they apply to all columns.
-- If you have specific RLS policies, you might need to adjust them.
