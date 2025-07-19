-- Add a new column for the comic's year to the social_media_accounts table
ALTER TABLE public.social_media_accounts
ADD COLUMN year TEXT;

-- Optional: If you want to set a default value for existing rows, you can do so.
-- For example, setting it to an empty string:
-- UPDATE public.social_media_accounts SET year = '';
