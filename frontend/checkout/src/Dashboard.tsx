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

function Dashboard() {
  const [apiKey, setApiKey] = useState('');
  const [submittedKey, setSubmittedKey] = useState('');
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [error, setError] = useState('');

  const fetchPayments = async () => {
    if (!submittedKey) return;
    try {
      const res = await fetch('http://localhost:3000/v1/payments', {
        headers: {
          Authorization: `Bearer ${submittedKey}`,
        },
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
    // Refresh every 10 seconds
    const interval = setInterval(fetchPayments, 10000);
    return () => clearInterval(interval);
  }, [submittedKey]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedKey(apiKey);
  };

  if (!submittedKey) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
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
          <p className="text-xs text-gray-400 mt-2">Your key is never stored on the server or in the browser permanently.</p>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Payment History</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {payments.length === 0 ? (
          <p className="text-gray-500">No payments found.</p>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-4 text-sm font-mono truncate max-w-[200px]">{p.id}</td>
                    <td className="px-6 py-4 text-sm">{p.asset}</td>
                    <td className="px-6 py-4 text-sm">{p.amount}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        p.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(p.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;