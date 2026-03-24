ALTER TABLE public.agreement_drafts 
ADD COLUMN IF NOT EXISTS full_text text DEFAULT '',
ADD COLUMN IF NOT EXISTS allocations jsonb DEFAULT '[]'::jsonb;