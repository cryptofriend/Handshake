-- Chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT,
  role TEXT NOT NULL CHECK (role IN ('user', 'agent')),
  content TEXT NOT NULL,
  handshake_status TEXT CHECK (handshake_status IN ('needs_clarification', 'draft_ready', 'sign_ready')),
  agreement_id UUID,
  raw_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_chat_messages_session ON public.chat_messages(session_id);
CREATE INDEX idx_chat_messages_created ON public.chat_messages(created_at);

-- Agreement drafts table
CREATE TABLE public.agreement_drafts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT,
  title TEXT NOT NULL,
  summary TEXT,
  parties JSONB NOT NULL DEFAULT '[]',
  terms JSONB NOT NULL DEFAULT '[]',
  missing_fields JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'needs_clarification' CHECK (status IN ('needs_clarification', 'draft_ready', 'sign_ready')),
  full_response JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_agreement_drafts_session ON public.agreement_drafts(session_id);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreement_drafts ENABLE ROW LEVEL SECURITY;

-- Allow public access for now (no auth system active yet)
CREATE POLICY "Allow all access to chat_messages" ON public.chat_messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all access to agreement_drafts" ON public.agreement_drafts FOR ALL USING (true) WITH CHECK (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_agreement_drafts_updated_at
  BEFORE UPDATE ON public.agreement_drafts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();