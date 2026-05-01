import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface PaymentData {
  id: string;
  asset: string;
  amount: string;
  status: string;
  address: string;
  memo: string;
  txHash?: string;
  confirmedAt?: string;
  createdAt: string;
}

function App() {
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [qrSvg, setQrSvg] = useState<string>('');

  // Extract payment ID from URL query string
  const params = new URLSearchParams(window.location.search);
  const paymentId = params.get('id');

  const fetchPayment = async () => {
    if (!paymentId) return;
    try {
      const res = await fetch(`http://localhost:3000/v1/payments/${paymentId}`, {
        headers: {
          // No auth needed for public checkout; in production, use a publishable key
          Authorization: `Bearer pk_live_placeholder`,
        },
      });
      if (!res.ok) throw new Error('Payment not found');
      const data: PaymentData = await res.json();
      setPayment(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Generate QR code when payment data arrives
  useEffect(() => {
    if (payment && payment.address) {
      const stellarUri = `web+stellar:pay?destination=${payment.address}&memo=${payment.memo}`;
      QRCode.toString(stellarUri, { type: 'svg', width: 256 }, (err, svg) => {
        if (!err) setQrSvg(svg);
      });
    }
  }, [payment]);

  useEffect(() => {
    fetchPayment();
    // Poll every 5 seconds until confirmed
    const interval = setInterval(() => {
      if (payment?.status !== 'confirmed') {
        fetchPayment();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [paymentId]);

  if (!paymentId) {
    return <div className="text-red-500">Missing payment ID in URL (?id=...)</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!payment) {
    return <div className="text-gray-500">Loading payment details...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-2">Slyky Checkout</h1>
        <p className="text-gray-500 mb-6">Send your payment to the address below</p>

        {payment.status === 'confirmed' ? (
          <div className="text-green-600 font-bold text-lg mb-4">
            ✅ Payment received — thank you!
          </div>
        ) : (
          <div className="text-yellow-600 font-bold text-lg mb-4">
            ⏳ Awaiting payment…
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-xl mb-4">
          <p className="text-sm text-gray-500">Amount</p>
          <p className="text-2xl font-bold">{payment.amount} {payment.asset}</p>
        </div>

        {/* QR Code */}
        {qrSvg && (
          <div
            className="mx-auto mb-4 w-64 h-64 flex items-center justify-center"
            dangerouslySetInnerHTML={{ __html: qrSvg }}
          />
        )}

        <div className="bg-gray-50 p-4 rounded-xl mb-3 text-left">
          <p className="text-xs text-gray-500">Stellar Address</p>
          <p className="text-sm font-mono break-all">{payment.address}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl mb-6 text-left">
          <p className="text-xs text-gray-500">Memo (required!)</p>
          <p className="text-sm font-mono break-all">{payment.memo}</p>
        </div>

        {payment.status === 'confirmed' ? (
          <a
            href="https://docs.google.com/forms/d/e/1FAIpQLScebks7GmTMRizxKA-kLzxeH6MQ8xUlZrWGmBXMmr2zx0txyw/viewform?usp=dialog"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition"
          >
            Share your feedback
          </a>
        ) : (
          <p className="text-sm text-gray-400">Waiting for confirmation…</p>
        )}
      </div>
    </div>
  );
}

export default App;