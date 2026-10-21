import { CopyButton } from '../ui/CopyButton';

export function PaymentDetails({ address, memo }: { address: string; memo: string }) {
  return (
    <div className="space-y-3 text-left">
      <div className="bg-gray-50 border border-[var(--color-border)] rounded-lg p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-(--color-text-muted) uppercase tracking-wide">Stellar Address</span>
          <CopyButton value={address} />
        </div>
        <p className="font-mono text-sm break-all text-[var(--color-text-primary)]">{address}</p>
      </div>
      <div className="bg-gray-50 border border-[var(--color-border)] rounded-lg p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-(--color-text-muted) uppercase tracking-wide">Memo (required)</span>
          <CopyButton value={memo} />
        </div>
        <p className="font-mono text-sm break-all text-[var(--color-text-primary)]">{memo}</p>
      </div>
    </div>
  );
}