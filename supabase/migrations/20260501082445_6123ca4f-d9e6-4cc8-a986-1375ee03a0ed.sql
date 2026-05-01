ALTER TABLE public.agreement_signatures
ADD COLUMN IF NOT EXISTS signature_method text NOT NULL DEFAULT 'ton';

CREATE INDEX IF NOT EXISTS idx_agreement_signatures_method
ON public.agreement_signatures(signature_method);