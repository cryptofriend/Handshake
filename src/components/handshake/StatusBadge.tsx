import { AgreementStatus } from '@/types/agreement';

const statusConfig: Record<AgreementStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'status-draft' },
  signed_by_one: { label: 'Waiting for counterparty', className: 'status-waiting' },
  fully_signed: { label: 'Fully signed', className: 'status-signed' },
  rejected: { label: 'Rejected', className: 'status-rejected' },
};

export const StatusBadge = ({ status }: { status: AgreementStatus }) => {
  const config = statusConfig[status];
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
};
