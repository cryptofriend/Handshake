import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowUp, Sparkles, Zap, MessageSquare, DollarSign, CheckCircle } from 'lucide-react';

const MODELS = [
  { id: 'google/gemini-3-flash-preview', label: 'Gemini 3 Flash (default)', tier: 'fast' },
  { id: 'google/gemini-2.5-flash', label: 'Gemini 2.5 Flash', tier: 'fast' },
  { id: 'google/gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite', tier: 'cheapest' },
  { id: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro', tier: 'premium' },
  { id: 'google/gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro', tier: 'premium' },
  { id: 'openai/gpt-5-nano', label: 'GPT-5 Nano', tier: 'fast' },
  { id: 'openai/gpt-5-mini', label: 'GPT-5 Mini', tier: 'balanced' },
  { id: 'openai/gpt-5', label: 'GPT-5', tier: 'premium' },
  { id: 'openai/gpt-5.2', label: 'GPT-5.2', tier: 'premium' },
];

const TIER_COLORS: Record<string, string> = {
  cheapest: 'text-green-500',
  fast: 'text-primary',
  balanced: 'text-yellow-500',
  premium: 'text-orange-500',
};

const AdminPage = () => {
  const [unlocked, setUnlocked] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [model, setModel] = useState(MODELS[0].id);
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<{ messages: number; drafts: number } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [promptLoading, setPromptLoading] = useState(false);
  const [promptSaving, setPromptSaving] = useState(false);

  const fetchStats = async () => {
    setStatsLoading(true);
    try {
      const [msgRes, draftRes] = await Promise.all([
        supabase.from('chat_messages').select('id', { count: 'exact', head: true }),
        supabase.from('agreement_drafts').select('id', { count: 'exact', head: true }),
      ]);
      setStats({
        messages: msgRes.count ?? 0,
        drafts: draftRes.count ?? 0,
      });
    } catch {
      toast.error('Failed to fetch stats');
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchPrompt = async () => {
    setPromptLoading(true);
    try {
      const { data } = await supabase.from('system_config').select('value').eq('key', 'handshake_system_prompt').single();
      if (data) setSystemPrompt(data.value);
    } catch {
      toast.error('Failed to load prompt');
    } finally {
      setPromptLoading(false);
    }
  };

  const savePrompt = async () => {
    setPromptSaving(true);
    try {
      const { error } = await supabase.from('system_config').update({ value: systemPrompt, updated_at: new Date().toISOString() }).eq('key', 'handshake_system_prompt');
      if (error) throw error;
      toast.success('System prompt saved!');
    } catch {
      toast.error('Failed to save prompt');
    } finally {
      setPromptSaving(false);
    }
  };

  useEffect(() => { if (unlocked) { fetchStats(); fetchPrompt(); } }, [unlocked]);

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-5">
        <Card className="p-6 w-full max-w-sm space-y-4 text-center">
          <Sparkles className="w-8 h-8 text-primary mx-auto" />
          <h2 className="text-lg font-semibold text-foreground">Admin Access</h2>
          <Input
            type="password"
            placeholder="Enter password"
            value={passInput}
            onChange={e => setPassInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && passInput === 'BOOGA') setUnlocked(true); else if (e.key === 'Enter') toast.error('Wrong password'); }}
          />
          <Button className="w-full" onClick={() => passInput === 'BOOGA' ? setUnlocked(true) : toast.error('Wrong password')}>
            Unlock
          </Button>
        </Card>
      </div>
    );
  }

  const handleTest = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setResponse('');
    try {
      const { data, error } = await supabase.functions.invoke('admin-test-prompt', {
        body: { model, prompt: prompt.trim() },
      });
      if (error) throw error;
      setResponse(data.reply || JSON.stringify(data, null, 2));
    } catch (err: any) {
      if (err?.status === 429) {
        toast.error('Rate limited — wait a moment');
      } else if (err?.status === 402) {
        toast.error('AI credits exhausted');
      } else {
        toast.error('Test failed');
      }
      setResponse('Error: ' + (err?.message || 'Unknown'));
    } finally {
      setLoading(false);
    }
  };

  const selectedModel = MODELS.find(m => m.id === model);

  return (
    <div className="min-h-screen bg-background p-5 pb-20">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="logo-text text-lg text-foreground">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">AI model testing & usage</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                {statsLoading ? '...' : stats?.messages ?? '–'}
              </p>
              <p className="text-xs text-muted-foreground">Chat Messages</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                {statsLoading ? '...' : stats?.drafts ?? '–'}
              </p>
              <p className="text-xs text-muted-foreground">Agreements Created</p>
            </div>
          </Card>
        </div>

        {/* Model Selector */}
        <Card className="p-4 space-y-3">
          <label className="text-sm font-medium text-foreground">AI Model</label>
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MODELS.map(m => (
                <SelectItem key={m.id} value={m.id}>
                  <span className="flex items-center gap-2">
                    {m.label}
                    <span className={`text-[10px] uppercase font-bold ${TIER_COLORS[m.tier]}`}>
                      {m.tier}
                    </span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedModel && (
            <p className="text-xs text-muted-foreground">
              <Zap className="w-3 h-3 inline mr-1" />
              {selectedModel.id}
            </p>
          )}
        </Card>

        {/* Prompt Tester */}
        <Card className="p-4 space-y-3">
          <label className="text-sm font-medium text-foreground">Test Prompt</label>
          <Textarea
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            placeholder="Enter a test prompt..."
            rows={4}
            className="resize-none"
          />
          <Button onClick={handleTest} disabled={!prompt.trim() || loading} className="w-full">
            {loading ? 'Running...' : 'Send Test'}
            <ArrowUp className="w-4 h-4 ml-1" />
          </Button>
        </Card>

        {/* Response */}
        {response && (
          <Card className="p-4 space-y-2">
            <label className="text-sm font-medium text-foreground">Response</label>
            <pre className="text-sm text-foreground bg-muted/50 rounded-lg p-3 whitespace-pre-wrap max-h-80 overflow-y-auto">
              {response}
            </pre>
          </Card>
        )}

        {/* System Prompt Editor */}
        <Card className="p-4 space-y-3">
          <label className="text-sm font-medium text-foreground">Handshake System Prompt</label>
          <p className="text-xs text-muted-foreground">Edit the AI system prompt used by the agent. Changes apply immediately to new conversations.</p>
          {promptLoading ? (
            <div className="h-40 bg-muted/50 rounded-lg animate-pulse" />
          ) : (
            <Textarea
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              rows={16}
              className="resize-y font-mono text-xs"
            />
          )}
          <Button onClick={savePrompt} disabled={promptSaving || promptLoading} className="w-full">
            {promptSaving ? 'Saving...' : 'Save Prompt'}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;
