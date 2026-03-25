CREATE TABLE public.system_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on system_config" ON public.system_config FOR SELECT TO public USING (true);
CREATE POLICY "Allow public update on system_config" ON public.system_config FOR UPDATE TO public USING (true) WITH CHECK (true);
CREATE POLICY "Allow public insert on system_config" ON public.system_config FOR INSERT TO public WITH CHECK (true);