import { useEffect, useState } from 'react';

interface PaymentItem {
  id: string;
  asset: string;
  amount: string;
  status: string;
  address: string;
  memo: string;
  txHash?: string;
  createdAt: string;
  confirmedAt?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const statusStyle = (status: string) => {
  switch (status) {
    case 'confirmed':  return 'bg-green-100 text-green-800';
    case 'failed':
    case 'expired':    return 'bg-red-100 text-red-800';
    case 'processing':
    case 'confirming':  return 'bg-blue-100 text-blue-800';
    case 'created':     return 'bg-gray-100 text-gray-800';
    default:            return 'bg-yellow-100 text-yellow-800';
  }
};

function Dashboard() {
  const [apiKey, setApiKey] = useState('');
  const [submittedKey, setSubmittedKey] = useState('');
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [error, setError] = useState('');
  const [createAmount, setCreateAmount] = useState('');
  const [createDescription, setCreateDescription] = useState('');
  const [newPaymentId, setNewPaymentId] = useState<string | null>(null);

  const fetchPayments = async () => {
    if (!submittedKey) return;
    try {
      const res = await fetch(`${API_URL}/v1/payments`, {
        headers: { Authorization: `Bearer ${submittedKey}` },
      });
      if (!res.ok) throw new Error('Failed to fetch payments. Check your API key.');
      const data: PaymentItem[] = await res.json();
      setPayments(data);
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchPayments();
    const interval = setInterval(fetchPayments, 10000);
    return () => clearInterval(interval);
  }, [submittedKey]);

  const handleSubmitKey = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedKey(apiKey);
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createAmount) return;
    try {
      const res = await fetch(`${API_URL}/v1/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${submittedKey}`,
        },
        body: JSON.stringify({
          asset: 'XLM',
          network: 'stellar',
          amount: createAmount,
          description: createDescription || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to create payment.');
      const newPayment: PaymentItem = await res.json();
      setNewPaymentId(newPayment.id);
      setCreateAmount('');
      setCreateDescription('');
      fetchPayments();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // ---- Login screen ----
  if (!submittedKey) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <form onSubmit={handleSubmitKey} className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
          <h1 className="text-2xl font-bold mb-4">Slyky Dashboard</h1>
          <label className="block text-sm text-gray-600 mb-2">Enter your secret API key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 mb-4"
            placeholder="sk_live_..."
            required
          />
          <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition w-full">
            View Payments
          </button>
          <p className="text-sm text-gray-400 mt-3 text-center">
            Don't have a key?{' '}
            <a href="/register" className="text-blue-600 underline">Create one here</a>
          </p>
          <p className="text-xs text-gray-400 mt-4 text-center">
            <a href="/" className="underline">← Back to homepage</a>
          </p>
        </form>
      </div>
    );
  }

  // ---- Main dashboard ----
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Payment History</h1>

        {/* Create Payment Section */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Payment</h2>
          <form onSubmit={handleCreatePayment} className="flex flex-col sm:flex-row gap-4">
            <input
              type="number"
              step="any"
              placeholder="Amount (XLM)"
              value={createAmount}
              onChange={(e) => setCreateAmount(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-2 flex-1"
              required
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={createDescription}
              onChange={(e) => setCreateDescription(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-2 flex-1"
            />
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition">
              Create Payment
            </button>
          </form>
          {newPaymentId && (
            <div className="mt-4 text-center">
              <a
                href={`/?id=${newPaymentId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Open Checkout Page for this payment ↗
              </a>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Payment list – mobile-friendly */}
        {payments.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <p className="text-gray-500 text-lg">No payments yet.</p>
            <p className="text-gray-400 text-sm mt-2">Create your first payment above.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Checkout</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((p) => (
                    <tr key={p.id}>
                      <td className="px-3 sm:px-6 py-4 text-sm font-mono truncate max-w-25 sm:max-w-37.5">{p.id}</td>
                      <td className="px-3 sm:px-6 py-4 text-sm">{p.asset}</td>
                      <td className="px-3 sm:px-6 py-4 text-sm">{p.amount}</td>
                      <td className="px-3 sm:px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${statusStyle(p.status)}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="hidden sm:table-cell px-3 sm:px-6 py-4 text-sm text-gray-500">
                        {new Date(p.createdAt).toLocaleString()}
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm">
                        <a href={`/?id=${p.id}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                          Pay ↗
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;