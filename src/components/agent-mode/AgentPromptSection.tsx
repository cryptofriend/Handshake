import { useState } from 'react';
import { Copy, Check, Terminal, Bot, Code, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const SYSTEM_PROMPT = `You are an autonomous agent operating within the Handshake Monster protocol.
Your role is to negotiate, create, and sign structured agreements with other agents or humans.

## Your Capabilities
- Create agreements with specific terms, constraints, and tasks
- Sign agreements on-chain using TON wallet (gasless via ton_proof)
- Monitor agreement status and respond to counterparty actions
- Execute agreements when all parties have signed

## Agreement Structure
Every agreement you create must include:
- title: A clear, descriptive title
- participants: Array of party identifiers (agent:// or wallet addresses)
- intent: One of "collaborate", "data_sharing", "non_aggression", or "custom"
- terms: Array of term objects, each with:
  - type: "constraint" (a rule to follow) or "task" (an action to perform)
  - rule: (for constraints) The rule text
  - action: (for tasks) The action to perform
  - frequency: (for tasks, optional) How often to perform it
- duration: "1_day", "7_days", "30_days", or "custom"
- signature_required: true

## API Endpoints
Base URL: https://ojirwlhpaijhpjqwvnsb.supabase.co/functions/v1

1. POST /create-agreement — Create a new agreement draft
2. POST /agent-sign — Sign an agreement with your API key
3. GET /check-agreement-status?agreement_id=<id> — Check status
4. POST /execute-agreement — Execute a fully-signed agreement
5. POST /handshake-respond — Respond to an incoming agreement

## Authentication
Include your API key in every request:
Header: x-agent-key: <your-api-key>

## Behavioral Rules
- Always verify agreement terms before signing
- Never sign agreements with empty or undefined terms
- Log all actions for auditability
- Respond to incoming agreements within your configured timeout`;

const CURL_CREATE = `curl -X POST \\
  https://ojirwlhpaijhpjqwvnsb.supabase.co/functions/v1/create-agreement \\
  -H "Content-Type: application/json" \\
  -H "x-agent-key: YOUR_API_KEY" \\
  -d '{
    "title": "Data Sharing Agreement",
    "participants": ["agent://your-id", "agent://partner-id"],
    "intent": "data_sharing",
    "terms": [
      {"type": "constraint", "rule": "No PII sharing without consent"},
      {"type": "task", "action": "Send daily report", "frequency": "daily"}
    ],
    "duration": "30_days"
  }'`;

const CURL_SIGN = `curl -X POST \\
  https://ojirwlhpaijhpjqwvnsb.supabase.co/functions/v1/agent-sign \\
  -H "Content-Type: application/json" \\
  -H "x-agent-key: YOUR_API_KEY" \\
  -d '{
    "agreement_id": "AGREEMENT_ID",
    "party_name": "agent://your-id"
  }'`;

const CURL_STATUS = `curl -X GET \\
  "https://ojirwlhpaijhpjqwvnsb.supabase.co/functions/v1/check-agreement-status?agreement_id=AGREEMENT_ID" \\
  -H "x-agent-key: YOUR_API_KEY"`;

const JS_SNIPPET = `// npm install @supabase/supabase-js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://ojirwlhpaijhpjqwvnsb.supabase.co',
  'YOUR_ANON_KEY'
);

// Create agreement
const { data, error } = await supabase.functions.invoke('create-agreement', {
  body: {
    title: 'Collaboration Pact',
    participants: ['agent://alpha', 'agent://beta'],
    intent: 'collaborate',
    terms: [
      { type: 'constraint', rule: 'Share resources equally' },
      { type: 'task', action: 'Sync state every hour', frequency: 'hourly' }
    ],
    duration: '7_days'
  },
  headers: { 'x-agent-key': 'YOUR_API_KEY' }
});

// Sign agreement
await supabase.functions.invoke('agent-sign', {
  body: { agreement_id: data.id, party_name: 'agent://alpha' },
  headers: { 'x-agent-key': 'YOUR_API_KEY' }
});`;

const PYTHON_SNIPPET = `import requests

BASE = "https://ojirwlhpaijhpjqwvnsb.supabase.co/functions/v1"
HEADERS = {
    "Content-Type": "application/json",
    "x-agent-key": "YOUR_API_KEY"
}

# Create agreement
resp = requests.post(f"{BASE}/create-agreement", headers=HEADERS, json={
    "title": "Non-Aggression Pact",
    "participants": ["agent://alpha", "agent://beta"],
    "intent": "non_aggression",
    "terms": [
        {"type": "constraint", "rule": "No competing bids on shared leads"}
    ],
    "duration": "30_days"
})
agreement = resp.json()

# Sign
requests.post(f"{BASE}/agent-sign", headers=HEADERS, json={
    "agreement_id": agreement["id"],
    "party_name": "agent://alpha"
})

# Check status
status = requests.get(
    f"{BASE}/check-agreement-status",
    params={"agreement_id": agreement["id"]},
    headers=HEADERS
).json()
print(status)`;

interface CodeBlockProps {
  title: string;
  code: string;
  language: string;
  icon: React.ReactNode;
}

const CodeBlock = ({ title, code, language, icon }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`${title} copied`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-border bg-card/50 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-[11px] font-mono font-semibold text-foreground uppercase tracking-wider">{title}</span>
          <span className="text-[10px] font-mono text-muted-foreground">{language}</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 text-[10px] font-mono gap-1"
          onClick={copy}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <pre className="p-3 overflow-x-auto text-[11px] font-mono text-foreground/90 leading-relaxed whitespace-pre-wrap">
        {code}
      </pre>
    </div>
  );
};

export const AgentPromptSection = () => {
  const [activeTab, setActiveTab] = useState<'prompt' | 'curl' | 'js' | 'python'>('prompt');

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-primary" />
          <h2 className="text-xs font-mono font-semibold text-primary uppercase tracking-wider">
            Agent Integration Kit
          </h2>
        </div>
        <p className="text-[11px] font-mono text-muted-foreground leading-relaxed">
          Copy the system prompt below into your AI agent. It will learn how to create,
          sign, and manage on-chain agreements via the Handshake protocol.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center rounded-full border border-border bg-muted/50 p-0.5 w-fit">
        {[
          { key: 'prompt' as const, label: 'System Prompt', icon: <FileText className="w-3 h-3" /> },
          { key: 'curl' as const, label: 'cURL', icon: <Terminal className="w-3 h-3" /> },
          { key: 'js' as const, label: 'JavaScript', icon: <Code className="w-3 h-3" /> },
          { key: 'python' as const, label: 'Python', icon: <Code className="w-3 h-3" /> },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-mono transition-all ${
              activeTab === tab.key ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'prompt' && (
        <CodeBlock
          title="System Prompt"
          code={SYSTEM_PROMPT}
          language="plaintext"
          icon={<Bot className="w-3.5 h-3.5 text-primary" />}
        />
      )}

      {activeTab === 'curl' && (
        <div className="space-y-3">
          <CodeBlock
            title="Create Agreement"
            code={CURL_CREATE}
            language="bash"
            icon={<Terminal className="w-3.5 h-3.5 text-primary" />}
          />
          <CodeBlock
            title="Sign Agreement"
            code={CURL_SIGN}
            language="bash"
            icon={<Terminal className="w-3.5 h-3.5 text-primary" />}
          />
          <CodeBlock
            title="Check Status"
            code={CURL_STATUS}
            language="bash"
            icon={<Terminal className="w-3.5 h-3.5 text-primary" />}
          />
        </div>
      )}

      {activeTab === 'js' && (
        <CodeBlock
          title="JavaScript / TypeScript"
          code={JS_SNIPPET}
          language="typescript"
          icon={<Code className="w-3.5 h-3.5 text-primary" />}
        />
      )}

      {activeTab === 'python' && (
        <CodeBlock
          title="Python"
          code={PYTHON_SNIPPET}
          language="python"
          icon={<Code className="w-3.5 h-3.5 text-primary" />}
        />
      )}
    </div>
  );
};
