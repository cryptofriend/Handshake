import { motion } from 'framer-motion';
import { AgreementSignature } from '@/types/agreement';
import { Shield, Clock, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

const TONSCAN_BASE = 'https://tonscan.org';

interface Props {
  signatures: AgreementSignature[];
  receiptStatus: 'none' | 'minting' | 'minted';
  shortHash: string;
}

const statusIcon = {
  pending: <Clock className="w-3.5 h-3.5 text-warning" />,
  confirmed: <CheckCircle2 className="w-3.5 h-3.5 text-success" />,
  failed: <AlertCircle className="w-3.5 h-3.5 text-destructive" />,
};

const statusLabel = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  failed: 'Failed',
};

export const ProofSection = ({ signatures, receiptStatus, shortHash }: Props) => {
  if (signatures.length === 0) return null;

  return (
    <motion.div
      className="rounded-2xl border border-border/50 bg-card p-4 space-y-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className="flex items-center gap-2">
        <Shield className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">On-Chain Proof</span>
      </div>

      {signatures.map((sig) => (
        <div key={sig.party} className="space-y-2 pl-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Signed by</span>
            <span className="text-foreground font-medium">{sig.party}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Wallet</span>
            <a
              href={`${TONSCAN_BASE}/address/${sig.walletAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] text-primary hover:underline inline-flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {sig.walletAddress.slice(0, 8)}...{sig.walletAddress.slice(-4)}
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Signed at</span>
            <span className="text-foreground font-medium">
              {new Date(sig.signedAt).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-xs items-center">
            <span className="text-muted-foreground">Blockchain</span>
            <span className="flex items-center gap-1 text-foreground font-medium">
              {statusIcon[sig.blockchainStatus]}
              {statusLabel[sig.blockchainStatus]}
            </span>
          </div>
          {sig.txHash && (
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Tx Proof</span>
              <a
                href={`${TONSCAN_BASE}/address/${sig.walletAddress}#transactions`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] text-primary hover:underline inline-flex items-center gap-1 max-w-[160px] text-right"
                onClick={(e) => e.stopPropagation()}
              >
                View on TONScan
                <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
              </a>
            </div>
          )}
        </div>
      ))}

      <div className="flex justify-between text-xs pt-2 border-t border-border/30">
        <span className="text-muted-foreground">Agreement Hash</span>
        <span className="font-mono text-[10px] text-foreground/70">{shortHash}</span>
      </div>

      {receiptStatus !== 'none' && (
        <div className="flex justify-between text-xs items-center">
          <span className="text-muted-foreground">Receipt</span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
            receiptStatus === 'minted'
              ? 'bg-success/10 text-success'
              : 'bg-warning/10 text-warning'
          }`}>
            {receiptStatus === 'minted' ? '✓ Minted' : '⏳ Minting...'}
          </span>
        </div>
      )}

      <div className="pt-2 border-t border-border/30">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-[10px] font-medium">
          <Shield className="w-3 h-3" />
          Non-transferable encrypted receipt
        </span>
      </div>
    </motion.div>
  );
};
