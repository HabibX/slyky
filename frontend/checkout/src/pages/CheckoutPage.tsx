import { useSearchParams, useParams } from 'react-router-dom';
import { usePayment } from '../hooks/usePayment';
import { CheckoutCard } from '../components/checkout/CheckoutCard';
import { Spinner } from '../components/ui/Spinner';

export function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const { id: paramId } = useParams<{ id: string }>();
  const paymentId = paramId || searchParams.get('id');
  const isEmbedded = searchParams.get('embedded') === 'true';

  const { payment, error, loading } = usePayment(paymentId);

  if (!paymentId) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Missing payment ID</div>;
  }

  if (loading && !payment) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner /></div>;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <p className="text-red-600 font-medium mb-2">Error</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!payment) return null;

  // Mode Embedded (Iframe)
  if (isEmbedded) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center p-2">
        <CheckoutCard payment={payment} />
      </div>
    );
  }

  // Mode Normal (Page complète)
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center p-4">
      <CheckoutCard payment={payment} />
    </div>
  );
}