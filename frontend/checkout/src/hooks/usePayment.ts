import { useCallback, useEffect, useState } from 'react';
import { fetchPayment } from '../lib/api';
import type { PaymentData } from '../lib/api';

export function usePayment(paymentId: string | null) {
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async () => {
    if (!paymentId) return;
    setLoading(true);
    try {
      const data = await fetchPayment(paymentId);
      setPayment(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [paymentId]);

  useEffect(() => {
    refetch();
    if (!paymentId) return;
    const interval = setInterval(() => {
      if (payment?.status !== 'confirmed' && payment?.status !== 'failed' && payment?.status !== 'expired') {
        refetch();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [paymentId, payment?.status, refetch]);

  return { payment, error, loading, refetch };
}