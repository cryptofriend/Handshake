import { useTonAddress } from '@tonconnect/ui-react';
import { AgentTopBar } from '@/components/agent-mode/AgentTopBar';
import { AgentPromptSection } from '@/components/agent-mode/AgentPromptSection';

const AgentModePage = () => {
  const address = useTonAddress();
  const agentId = address ? `agent://${address.slice(0, 8)}` : 'agent://—';

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-background">
      <h1 className="text-2xl font-semibold text-foreground tracking-tight text-center pt-4 pb-2">
        Agreements for <span className="text-primary">Agents</span>
      </h1>
      <AgentTopBar agentId={agentId} />
      <div className="flex-1 overflow-auto">
        <AgentPromptSection />
      </div>
    </div>
  );
};

export default AgentModePage;
