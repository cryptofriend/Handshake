import { useState, useEffect, useCallback } from 'react';

import { useTonAddress } from '@tonconnect/ui-react';
import { Button } from '@/components/ui/button';
import { AgentTopBar } from '@/components/agent-mode/AgentTopBar';
import { AgreementBuilder } from '@/components/agent-mode/AgreementBuilder';
import { LivePreview } from '@/components/agent-mode/LivePreview';
import { AgentPromptSection } from '@/components/agent-mode/AgentPromptSection';
import { AgentAgreementPayload, AgentAgreementSigned } from '@/types/agentMode';
import { supabase } from '@/integrations/supabase/client';
import { useTonProofSign } from '@/hooks/useTonProofSign';
import { toast } from 'sonner';
import { Loader2, PenTool, Rocket } from 'lucide-react';

const createEmptyPayload = (agentId: string): AgentAgreementPayload => ({
  title: 'Agent Agreement',
  participants: [agentId, ''],
  intent: 'collaborate',
  terms: [],
  duration: '7_days',
  created_at: new Date().toISOString(),
  signature_required: true,
});

const hashPayload = async (payload: AgentAgreementPayload): Promise<string> => {
  const encoded = new TextEncoder().encode(JSON.stringify(payload) + Date.now());
  const buf = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
};

const AgentModePage = () => {
  const address = useTonAddress();
  const agentId = address ? `agent://${address.slice(0, 8)}` : 'agent://—';
  const { signWithProof } = useTonProofSign();

  const [payload, setPayload] = useState<AgentAgreementPayload>(() => createEmptyPayload(agentId));
  const [signedData, setSignedData] = useState<AgentAgreementSigned | null>(null);
  const [signing, setSigning] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [mobileTab, setMobileTab] = useState<'builder' | 'preview'>('builder');
  const [mainView, setMainView] = useState<'prompt' | 'builder'>('prompt');

  // Keep participants[0] in sync with agent id
  useEffect(() => {
    if (payload.participants[0] !== agentId) {
      setPayload(prev => ({ ...prev, participants: [agentId, prev.participants[1] || ''] }));
    }
  }, [agentId]);

  const handleSign = useCallback(async () => {
    if (!address) { toast.error('Connect wallet first'); return; }
    if (!payload.participants[1]) { toast.error('Enter counterparty agent ID'); return; }

    setSigning(true);
    try {
      // 1. Create agreement draft first
      const agreementId = (await hashPayload(payload)).slice(0, 36);

      await supabase.from('agreement_drafts').insert({
        id: agreementId,
        title: payload.title,
        summary: `Agent agreement: ${payload.intent}`,
        session_id: agentId,
        user_id: address,
        status: 'pending_signature',
        parties: payload.participants as any,
        terms: payload.terms as any,
        full_text: JSON.stringify(payload),
      });

      // 2. Sign on-chain with ton_proof (gasless)
      const result = await signWithProof({
        agreementId,
        partyName: agentId,
      });

      if (!result.ok) {
        // Clean up draft if signing was cancelled/failed
        if (result.error === 'cancelled') {
          toast.info('Signing cancelled');
        } else {
          toast.error(result.error || 'Signing failed');
        }
        await supabase.from('agreement_drafts').delete().eq('id', agreementId);
        return;
      }

      const signed: AgentAgreementSigned = {
        ...payload,
        agreement_id: agreementId,
        signatures: [{
          agent_id: agentId,
          wallet_address: address,
          signed_at: new Date().toISOString(),
          tx_hash: result.txHash || '',
        }],
        status: 'pending_counterparty',
      };

      setSignedData(signed);
      setMobileTab('preview');
      toast.success('Agreement signed on-chain via ton_proof ✅');
    } catch (err) {
      toast.error('Signing failed');
      console.error(err);
    } finally {
      setSigning(false);
    }
  }, [address, payload, agentId, signWithProof]);

  const handleExecute = useCallback(async () => {
    if (!signedData) return;
    setExecuting(true);
    try {
      const { data, error } = await supabase.functions.invoke('execute-agreement', {
        body: {
          agreement_id: signedData.agreement_id,
          participants: signedData.participants,
          terms: signedData.terms,
        },
      });
      if (error) throw error;
      setSignedData(prev => prev ? { ...prev, status: 'executed' } : prev);
      toast.success('Agreement executed ✅');
      console.log('Execution result:', data);
    } catch (err) {
      toast.error('Execution failed');
      console.error(err);
    } finally {
      setExecuting(false);
    }
  }, [signedData]);

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-background">
      <h1 className="text-2xl font-semibold text-foreground tracking-tight text-center pt-4 pb-2">
        Agreements for <span className="text-primary">Agents</span>
      </h1>
      <AgentTopBar agentId={agentId} />

      {/* Mobile tabs */}
      <div className="md:hidden flex border-b border-border">
        <button
          onClick={() => setMobileTab('builder')}
          className={`flex-1 py-2 text-xs font-mono text-center transition-colors ${
            mobileTab === 'builder' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground'
          }`}
        >
          Builder
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-2 text-xs font-mono text-center transition-colors ${
            mobileTab === 'preview' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground'
          }`}
        >
          Preview
        </button>
      </div>

      {/* Split layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Builder */}
        <div className={`w-full md:w-1/2 md:border-r border-border overflow-auto ${mobileTab !== 'builder' ? 'hidden md:block' : ''}`}>
          <AgreementBuilder payload={payload} onChange={setPayload} myAgentId={agentId} />

          {/* Action buttons */}
          <div className="p-4 space-y-2 border-t border-border">
            {!signedData ? (
              <Button
                onClick={handleSign}
                disabled={signing || !address}
                className="w-full gap-2 font-mono text-xs"
              >
                {signing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PenTool className="w-3.5 h-3.5" />}
                Sign as Agent
              </Button>
            ) : signedData.status !== 'executed' ? (
              <Button
                onClick={handleExecute}
                disabled={executing}
                variant="outline"
                className="w-full gap-2 font-mono text-xs"
              >
                {executing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
                Execute Agreement
              </Button>
            ) : (
              <div className="text-center text-xs font-mono text-[hsl(var(--success))]">
                ✅ Executed
              </div>
            )}

            {signedData && (
              <p className="text-[10px] font-mono text-muted-foreground text-center">
                Status: {signedData.status}
              </p>
            )}
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className={`w-full md:w-1/2 overflow-hidden ${mobileTab !== 'preview' ? 'hidden md:block' : ''}`}>
          <LivePreview payload={payload} signedData={signedData} />
        </div>
      </div>
    </div>
  );
};

export default AgentModePage;
