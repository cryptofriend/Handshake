import { useState } from 'react';
import { Copy, Check, Link, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AgentAgreementPayload, AgentAgreementSigned } from '@/types/agentMode';
import { toast } from 'sonner';

interface LivePreviewProps {
  payload: AgentAgreementPayload;
  signedData: AgentAgreementSigned | null;
}

export const LivePreview = ({ payload, signedData }: LivePreviewProps) => {
  const [view, setView] = useState<'json' | 'human'>('json');
  const [copied, setCopied] = useState<string | null>(null);

  const displayData = signedData || payload;

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied`);
    setTimeout(() => setCopied(null), 2000);
  };

  const jsonStr = JSON.stringify(displayData, null, 2);

  const curlCommand = `curl -X POST https://handshake.monster/respond \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(displayData)}'`;

  return (
    <div className="flex flex-col h-full">
      {/* Toggle */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center rounded-full border border-border bg-muted/50 p-0.5">
          <button
            onClick={() => setView('json')}
            className={`px-3 py-1 rounded-full text-[10px] font-mono transition-all ${
              view === 'json' ? 'bg-foreground text-background' : 'text-muted-foreground'
            }`}
          >
            JSON
          </button>
          <button
            onClick={() => setView('human')}
            className={`px-3 py-1 rounded-full text-[10px] font-mono transition-all ${
              view === 'human' ? 'bg-foreground text-background' : 'text-muted-foreground'
            }`}
          >
            Human
          </button>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-[10px] font-mono gap-1"
            onClick={() => copyToClipboard(jsonStr, 'JSON')}
          >
            {copied === 'JSON' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} JSON
          </Button>
          {signedData && (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-[10px] font-mono gap-1"
                onClick={() => copyToClipboard(window.location.origin + '/agreement/' + signedData.agreement_id, 'Link')}
              >
                {copied === 'Link' ? <Check className="w-3 h-3" /> : <Link className="w-3 h-3" />} Link
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-6 text-[10px] font-mono gap-1"
                onClick={() => copyToClipboard(curlCommand, 'cURL')}
              >
                {copied === 'cURL' ? <Check className="w-3 h-3" /> : <Terminal className="w-3 h-3" />} cURL
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {view === 'json' ? (
          <pre className="text-[11px] font-mono text-foreground/90 whitespace-pre-wrap leading-relaxed">
            {jsonStr}
          </pre>
        ) : (
          <div className="space-y-3 text-xs font-mono">
            <div>
              <span className="text-muted-foreground">title:</span>{' '}
              <span className="text-foreground">{displayData.title}</span>
            </div>
            <div>
              <span className="text-muted-foreground">participants:</span>
              {displayData.participants.map((p, i) => (
                <div key={i} className="ml-4 text-primary">{p}</div>
              ))}
            </div>
            <div>
              <span className="text-muted-foreground">intent:</span>{' '}
              <span className="text-foreground">{displayData.intent}</span>
            </div>
            <div>
              <span className="text-muted-foreground">terms:</span>
              {displayData.terms.map((t, i) => (
                <div key={i} className="ml-4 text-foreground">
                  [{t.type}] {t.type === 'constraint' ? t.rule : t.action}
                  {t.type === 'task' && t.frequency && <span className="text-muted-foreground"> ({t.frequency})</span>}
                </div>
              ))}
            </div>
            <div>
              <span className="text-muted-foreground">duration:</span>{' '}
              <span className="text-foreground">{displayData.duration}</span>
            </div>
            {signedData && (
              <>
                <div className="pt-2 border-t border-border">
                  <span className="text-muted-foreground">status:</span>{' '}
                  <span className={signedData.status === 'executed' ? 'text-[hsl(var(--success))]' : 'text-primary'}>
                    {signedData.status}
                  </span>
                </div>
                {signedData.signatures.map((sig, i) => (
                  <div key={i} className="ml-4">
                    <span className="text-muted-foreground">sig[{i}]:</span>{' '}
                    <span className="text-foreground">{sig.wallet_address.slice(0, 8)}...{sig.tx_hash?.slice(0, 8)}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
