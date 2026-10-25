import type { PaymentData } from '../../lib/api';
import { PaymentStatus } from './PaymentStatus';
import { PaymentDetails } from './PaymentDetails';
import { QRCodeDisplay } from './QRCodeDisplay';

const explorerUrl = (txHash: string) => `https://stellar.expert/explorer/public/tx/${txHash}`;

export function CheckoutCard({ payment }: { payment: PaymentData }) {
  const isConfirmed = payment.status === 'confirmed';
  const isFailed = payment.status === 'failed' || payment.status === 'expired';

  return (
    <div className="max-w-md w-full bg-white border border-[var(--color-border)] rounded-2xl p-8 text-center">
      <img src="/logo.png" alt="SLYKY" className="w-10 h-10 mx-auto mb-3" />
      <h1 className="text-xl font-bold mb-1 text-[var(--color-text-primary)]">SLYKY Checkout</h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-6">Send your payment to the address below</p>

      <div className="mb-6">
        <PaymentStatus status={payment.status} />
      </div>

      <div className="bg-gray-50 border border-[var(--color-border)] rounded-xl p-5 mb-6">
        <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wide mb-1">Amount</p>
        <p className="text-3xl font-bold text-[var(--color-text-primary)]">
          {payment.amount} <span className="text-[var(--color-text-secondary)]">{payment.asset}</span>
        </p>
      </div>

      {!isConfirmed && !isFailed && <QRCodeDisplay address={payment.address} memo={payment.memo} />}

      <div className="mt-6">
        <PaymentDetails address={payment.address} memo={payment.memo} />
      </div>

      {isConfirmed && (
        <div className="mt-6 space-y-3">
          <p className="text-sm text-emerald-600 font-medium">✓ Payment received — thank you!</p>
          {payment.txHash && (
            <a
              href={explorerUrl(payment.txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-accent hover:underline"
            >
              View on Stellar Expert ↗
            </a>
          )}
        </div>
      )}

      {isFailed && (
        <p className="mt-6 text-sm text-red-600 font-medium">
          This payment {payment.status === 'expired' ? 'has expired' : 'failed'}.
        </p>
      )}
    </div>
  );
}