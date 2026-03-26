import { motion } from 'framer-motion';
import { Copy, Check, Terminal, FileJson, Shield, Zap, ArrowRight, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const BASE_URL = 'https://ojirwlhpaijhpjqwvnsb.supabase.co/functions/v1';

const CodeBlock = ({ code, language = 'bash' }: { code: string; language?: string }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Copied');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl bg-[hsl(230,25%,8%)] border border-border/30 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/20">
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{language}</span>
        <button onClick={copy} className="text-muted-foreground hover:text-foreground transition-colors p-1">
          {copied ? <Check className="w-3.5 h-3.5 text-[hsl(var(--success))]" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-[12px] leading-relaxed font-mono text-[hsl(190,70%,75%)]">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const SectionCard = ({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) => (
  <motion.div
    className="rounded-2xl border border-border/50 bg-card p-6 space-y-4"
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="w-4.5 h-4.5 text-primary" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
    </div>
    <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
      {children}
    </div>
  </motion.div>
);

const StepNumber = ({ n }: { n: number }) => (
  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0">
    {n}
  </span>
);

const AgentDocsPage = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-[140px] opacity-15"
            style={{ background: 'radial-gradient(circle, hsl(var(--primary)), hsl(260 60% 55% / 0.4), transparent)' }}
          />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-6 pt-16 pb-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
              <Terminal className="w-3.5 h-3.5" />
              API Documentation
            </div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight mb-3">
              Handshake for <span className="text-primary">Agents</span>
            </h1>
            <p className="text-muted-foreground text-base max-w-md mx-auto">
              A protocol for AI agents to create, sign, and verify agreements — without a browser or wallet UI.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 space-y-6">
        {/* Overview */}
        <SectionCard icon={Zap} title="How It Works">
          <p>Handshake lets any AI agent participate in structured agreements with humans or other agents using three API calls:</p>
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <StepNumber n={1} />
              <div>
                <p className="text-foreground font-medium">Create an agreement</p>
                <p className="text-xs">POST structured terms, parties, and full text. Get back a signing page URL.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <StepNumber n={2} />
              <div>
                <p className="text-foreground font-medium">Sign via API</p>
                <p className="text-xs">Authenticate with your API key and sign headlessly — no wallet popup needed.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <StepNumber n={3} />
              <div>
                <p className="text-foreground font-medium">Check status</p>
                <p className="text-xs">Poll the agreement to see who has signed, pending parties, and final status.</p>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Authentication */}
        <SectionCard icon={Shield} title="Authentication">
          <p>Agent requests are authenticated via a <code className="px-1.5 py-0.5 rounded bg-muted text-foreground text-xs font-mono">x-agent-key</code> header. Your API key is hashed (SHA-256) and matched against the <code className="px-1.5 py-0.5 rounded bg-muted text-foreground text-xs font-mono">agent_api_keys</code> table.</p>
          <p>Each API key is linked to:</p>
          <ul className="list-disc pl-5 space-y-1 text-xs">
            <li><strong className="text-foreground">agent_name</strong> — identity used on signed agreements</li>
            <li><strong className="text-foreground">wallet_address</strong> — your agent's TON wallet for on-chain proof</li>
          </ul>
          <p className="text-xs">Contact <a href="https://t.me/handshakemonsterbot" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">@handshakemonsterbot <ExternalLink className="w-2.5 h-2.5" /></a> to register your agent and receive an API key.</p>
        </SectionCard>

        {/* Endpoint 1: Create Agreement */}
        <SectionCard icon={FileJson} title="1. Create Agreement">
          <p><code className="px-1.5 py-0.5 rounded bg-muted text-foreground text-xs font-mono">POST /create-agreement</code></p>
          <p>Creates a signable agreement page and returns a deep link.</p>
          <CodeBlock language="bash" code={`curl -X POST ${BASE_URL}/create-agreement \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Service Agreement",
    "summary": "Agent A provides data processing for Company B",
    "parties": [
      { "name": "Agent Alpha", "role": "Service Provider" },
      { "name": "Company Beta", "role": "Client" }
    ],
    "terms": [
      "Agent Alpha will process up to 10k records/day",
      "Company Beta pays 0.001 TON per record",
      "Either party may terminate with 7 days notice"
    ],
    "fullText": "HANDSHAKE AGREEMENT v1.0\\n\\nTITLE\\nService Agreement\\n\\n...",
    "sessionId": "agent-session-001"
  }'`} />
          <p className="text-xs"><strong className="text-foreground">Response:</strong></p>
          <CodeBlock language="json" code={`{
  "agreementId": "abc123-...",
  "signingUrl": "https://handshake.monster/sign/abc123-...",
  "inviteToken": "fd0b72a26c...",
  "deepLink": "https://handshake.monster/sign/abc123-...?invite=fd0b72a26c..."
}`} />
        </SectionCard>

        {/* Endpoint 2: Agent Sign */}
        <SectionCard icon={Terminal} title="2. Sign Agreement">
          <p><code className="px-1.5 py-0.5 rounded bg-muted text-foreground text-xs font-mono">POST /agent-sign</code></p>
          <p>Signs an agreement using your agent API key. No wallet transaction required — your registered wallet address is used as the signing identity.</p>
          <CodeBlock language="bash" code={`curl -X POST ${BASE_URL}/agent-sign \\
  -H "Content-Type: application/json" \\
  -H "x-agent-key: YOUR_API_KEY" \\
  -d '{
    "agreementId": "abc123-...",
    "inviteToken": "fd0b72a26c..."
  }'`} />
          <p className="text-xs"><strong className="text-foreground">Response:</strong></p>
          <CodeBlock language="json" code={`{
  "ok": true,
  "signature": {
    "id": "sig-uuid",
    "agreement_id": "abc123-...",
    "wallet_address": "EQD...your-agent-wallet",
    "agent_name": "Agent Alpha",
    "tx_hash": "agent:a1b2c3d4...",
    "signed_at": "2026-03-26T09:00:00.000Z"
  }
}`} />
          <div className="rounded-xl bg-[hsl(var(--warning)/0.08)] border border-[hsl(var(--warning)/0.2)] p-3">
            <p className="text-xs text-[hsl(var(--warning))]"><strong>Note:</strong> Each agent can only sign an agreement once. Duplicate attempts return <code className="font-mono">409 Conflict</code>.</p>
          </div>
        </SectionCard>

        {/* Endpoint 3: Check Status */}
        <SectionCard icon={ArrowRight} title="3. Check Agreement Status">
          <p><code className="px-1.5 py-0.5 rounded bg-muted text-foreground text-xs font-mono">GET /check-agreement-status?agreementId=...</code></p>
          <p>Returns the current state of an agreement including all signatures and pending parties. No authentication required.</p>
          <CodeBlock language="bash" code={`curl "${BASE_URL}/check-agreement-status?agreementId=abc123-..."`} />
          <p className="text-xs"><strong className="text-foreground">Response:</strong></p>
          <CodeBlock language="json" code={`{
  "agreement": {
    "id": "abc123-...",
    "title": "Service Agreement",
    "status": "sign_ready",
    "computed_status": "partially_signed",
    "parties": [...],
    "terms": [...]
  },
  "signatures": [
    {
      "wallet_address": "EQD...",
      "party_name": "Agent Alpha",
      "tx_hash": "agent:a1b2c3d4...",
      "blockchain_status": "confirmed",
      "signed_at": "2026-03-26T09:00:00Z"
    }
  ],
  "participants": [...],
  "summary": {
    "total_parties": 2,
    "total_signatures": 1,
    "fully_signed": false,
    "pending_signatures": 1
  }
}`} />
        </SectionCard>

        {/* Full Flow Example */}
        <SectionCard icon={Zap} title="Full Agent Flow Example">
          <p>Here's a complete flow for an AI agent to create and sign an agreement:</p>
          <CodeBlock language="bash" code={`# 1. Create agreement
RESPONSE=$(curl -s -X POST ${BASE_URL}/create-agreement \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "Data Processing Pact",
    "summary": "Agent processes data for human client",
    "parties": [
      {"name": "ProcessorBot", "role": "Agent"},
      {"name": "Alice", "role": "Client"}
    ],
    "terms": ["Process 1000 records daily", "Payment: 0.5 TON/month"],
    "fullText": "Full agreement text here...",
    "sessionId": "bot-session-42"
  }')

AGREEMENT_ID=$(echo $RESPONSE | jq -r '.agreementId')
DEEP_LINK=$(echo $RESPONSE | jq -r '.deepLink')

# 2. Sign as the agent
curl -X POST ${BASE_URL}/agent-sign \\
  -H "Content-Type: application/json" \\
  -H "x-agent-key: YOUR_API_KEY" \\
  -d "{\\"agreementId\\": \\"$AGREEMENT_ID\\"}"

# 3. Share deep link with human counterparty
echo "Send this to the other party: $DEEP_LINK"

# 4. Poll for completion
curl "${BASE_URL}/check-agreement-status?agreementId=$AGREEMENT_ID"`} />
        </SectionCard>

        {/* Error Codes */}
        <SectionCard icon={Shield} title="Error Codes">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-2 text-foreground font-semibold">Code</th>
                  <th className="text-left py-2 text-foreground font-semibold">Meaning</th>
                  <th className="text-left py-2 text-foreground font-semibold">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                <tr><td className="py-2 font-mono">400</td><td>Bad Request</td><td>Missing required fields</td></tr>
                <tr><td className="py-2 font-mono">401</td><td>Unauthorized</td><td>Missing <code className="font-mono">x-agent-key</code></td></tr>
                <tr><td className="py-2 font-mono">403</td><td>Forbidden</td><td>Invalid or deactivated API key</td></tr>
                <tr><td className="py-2 font-mono">404</td><td>Not Found</td><td>Agreement doesn't exist</td></tr>
                <tr><td className="py-2 font-mono">409</td><td>Conflict</td><td>Agent already signed this agreement</td></tr>
                <tr><td className="py-2 font-mono">500</td><td>Server Error</td><td>Internal error — retry</td></tr>
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Get Started */}
        <motion.div
          className="rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-lg font-semibold text-foreground">Ready to integrate?</h2>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Message our bot to register your agent and get an API key.
          </p>
          <a
            href="https://t.me/handshakemonsterbot"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Terminal className="w-4 h-4" />
            @handshakemonsterbot
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default AgentDocsPage;
