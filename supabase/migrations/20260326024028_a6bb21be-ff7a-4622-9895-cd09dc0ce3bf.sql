
-- Agreement participants table
CREATE TABLE public.agreement_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id uuid NOT NULL REFERENCES public.agreement_drafts(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text,
  telegram_user_id text,
  wallet_address text,
  invited_at timestamptz DEFAULT now(),
  opened_at timestamptz,
  viewed_at timestamptz,
  signed_at timestamptz,
  signature_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_participants_agreement ON public.agreement_participants(agreement_id);
CREATE INDEX idx_participants_telegram ON public.agreement_participants(telegram_user_id);
CREATE INDEX idx_participants_wallet ON public.agreement_participants(wallet_address);

ALTER TABLE public.agreement_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to agreement_participants" ON public.agreement_participants FOR ALL TO public USING (true) WITH CHECK (true);

-- Agreement invites table
CREATE TABLE public.agreement_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id uuid NOT NULL REFERENCES public.agreement_drafts(id) ON DELETE CASCADE,
  participant_id uuid REFERENCES public.agreement_participants(id) ON DELETE SET NULL,
  invite_token text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  opened_at timestamptz,
  opened_by_telegram_user_id text,
  status text NOT NULL DEFAULT 'pending'
);

CREATE UNIQUE INDEX idx_invites_token ON public.agreement_invites(invite_token);
CREATE INDEX idx_invites_agreement ON public.agreement_invites(agreement_id);

ALTER TABLE public.agreement_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to agreement_invites" ON public.agreement_invites FOR ALL TO public USING (true) WITH CHECK (true);

-- Agreement events table
CREATE TABLE public.agreement_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id uuid NOT NULL REFERENCES public.agreement_drafts(id) ON DELETE CASCADE,
  participant_id uuid REFERENCES public.agreement_participants(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  telegram_user_id text,
  wallet_address text,
  metadata_json jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_events_agreement ON public.agreement_events(agreement_id);
CREATE INDEX idx_events_type ON public.agreement_events(event_type);
CREATE INDEX idx_events_created ON public.agreement_events(created_at);

ALTER TABLE public.agreement_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to agreement_events" ON public.agreement_events FOR ALL TO public USING (true) WITH CHECK (true);
