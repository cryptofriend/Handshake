
CREATE TABLE public.agreement_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id uuid NOT NULL REFERENCES public.agreement_drafts(id) ON DELETE CASCADE,
  wallet_address text NOT NULL,
  party_name text,
  signed_at timestamp with time zone DEFAULT now(),
  tx_hash text,
  blockchain_status text NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(agreement_id, wallet_address)
);

ALTER TABLE public.agreement_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to agreement_signatures"
  ON public.agreement_signatures
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);
