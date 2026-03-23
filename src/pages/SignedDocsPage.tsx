import { motion } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import { AgreementCard } from '@/components/handshake/AgreementCard';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileCheck, Inbox } from 'lucide-react';

const SignedDocsPage = () => {
  const navigate = useNavigate();
  const agreements = useAppStore((s) => s.agreements);

  const signedAgreements = agreements.filter(
    (a) => a.status === 'fully_signed' || a.status === 'signed_by_one'
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center gap-3 px-5 pt-5 pb-2">
        <button
          onClick={() => navigate('/create')}
          className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-lg font-semibold text-foreground">Signed Documents</h1>
      </div>

      <div className="px-5 pb-10 max-w-md mx-auto mt-4">
        {signedAgreements.length === 0 ? (
          <motion.div
            className="flex flex-col items-center justify-center py-20 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">No signed documents yet</h3>
            <p className="text-sm text-muted-foreground max-w-[240px]">
              Once both parties sign an agreement, it will appear here.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {signedAgreements.map((agreement, i) => (
              <motion.div
                key={agreement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <AgreementCard agreement={agreement} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignedDocsPage;
