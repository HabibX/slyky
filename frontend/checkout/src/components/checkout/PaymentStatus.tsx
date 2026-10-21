import { Badge } from '../ui/Badge';
import type { PaymentData } from '../../lib/api';

const STATUS_MAP: Record<PaymentData['status'], { label: string; variant: 'success' | 'warning' | 'danger' | 'default' | 'accent' }> = {
  created: { label: 'Created', variant: 'default' },
  pending: { label: 'Awaiting payment', variant: 'warning' },
  processing: { label: 'Processing', variant: 'accent' },
  confirming: { label: 'Confirming', variant: 'accent' },
  confirmed: { label: 'Confirmed', variant: 'success' },
  failed: { label: 'Failed', variant: 'danger' },
  expired: { label: 'Expired', variant: 'danger' },
};

export function PaymentStatus({ status }: { status: PaymentData['status'] }) {
  const s = STATUS_MAP[status];
  return <Badge variant={s.variant}>{s.label}</Badge>;
}