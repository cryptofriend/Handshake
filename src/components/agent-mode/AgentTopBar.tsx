import { Check, Plug, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTonAddress, useTonConnectModal } from '@tonconnect/ui-react';

interface AgentTopBarProps {
  agentId: string;
}

export const AgentTopBar = ({ agentId }: AgentTopBarProps) => {
  const address = useTonAddress();
  const { open } = useTonConnectModal();
  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null;

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-4 text-xs font-mono">
        <span className="text-primary">{agentId || 'agent://—'}</span>
        {shortAddr && (
          <span className="text-muted-foreground">{shortAddr}</span>
        )}
        {address && (
          <span className="flex items-center gap-1 text-[hsl(var(--success))]">
            <Check className="w-3 h-3" /> Connected
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {!address && (
          <Button size="sm" variant="outline" onClick={() => open()} className="text-xs h-7 gap-1">
            <Plug className="w-3 h-3" /> Connect Wallet
          </Button>
        )}
        <Button size="sm" variant="ghost" className="text-xs h-7 gap-1 text-muted-foreground">
          <Key className="w-3 h-3" /> API Key
        </Button>
      </div>
    </div>
  );
};
