import { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { createPayment, listPayments } from '../lib/api';
import type { PaymentData } from '../lib/api';
import { formatDate } from '../lib/format';

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'danger' | 'default' | 'accent'> = {
  confirmed: 'success',
  pending: 'warning',
  processing: 'accent',
  confirming: 'accent',
  failed: 'danger',
  expired: 'danger',
  created: 'default',
};

export function DashboardPage() {
  const [apiKey, setApiKey] = useState('');
  const [submittedKey, setSubmittedKey] = useState('');
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState('');
  const [asset, setAsset] = useState('XLM');
  const [description, setDescription] = useState('');
  const [newPayment, setNewPayment] = useState<PaymentData | null>(null);

  const refresh = async () => {
    if (!submittedKey) return;
    try {
      const data = await listPayments(submittedKey);
      setPayments(data);
      setError('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 10000);
    return () => clearInterval(interval);
  }, [submittedKey]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const p = await createPayment(submittedKey, { asset, network: 'stellar', amount, description });
      setNewPayment(p);
      setAmount('');
      setDescription('');
      refresh();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (!submittedKey) {
    return (
      <Layout>
        <div className="max-w-md mx-auto px-4 py-16">
          <div className="bg-white border border-[var(--color-border)] rounded-2xl p-8">
            <h1 className="text-xl font-bold mb-6 text-[var(--color-text-primary)]">Dashboard Login</h1>
            <form onSubmit={(e) => { e.preventDefault(); setSubmittedKey(apiKey); }}>
              <label className="block text-sm text-[var(--color-text-secondary)] mb-2">API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk_live_..."
                className="w-full border border-[var(--color-border)] rounded-lg px-4 py-2.5 mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                required
              />
              <Button type="submit" className="w-full">View Payments</Button>
            </form>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Dashboard</h1>
          <Button variant="ghost" size="sm" onClick={() => setSubmittedKey('')}>Sign out</Button>
        </div>

        {/* Create Payment */}
        <div className="bg-white border border-[var(--color-border)] rounded-xl p-6 mb-8">
          <h2 className="font-semibold mb-4 text-[var(--color-text-primary)]">Create Payment</h2>
          <form onSubmit={handleCreate} className="grid sm:grid-cols-4 gap-3">
            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm"
            >
              <option value="XLM">XLM</option>
              <option value="USDC">USDC</option>
              <option value="PYUSD">PYUSD</option>
              <option value="USDT">USDT</option>
            </select>
            <input
              type="number"
              step="any"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm"
              required
            />
            <input
              type="text"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="border border-[var(--color-border)] rounded-lg px-3 py-2.5 text-sm"
            />
            <Button type="submit">Create</Button>
          </form>
          {newPayment && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
              <span className="text-[var(--color-text-secondary)]">Checkout link: </span>
              <a
                href={`/checkout/${newPayment.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-accent)] underline"
              >
                {window.location.origin}/checkout/{newPayment.id} ↗
              </a>
            </div>
          )}
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {/* Payments Table */}
        <div className="bg-white border border-[var(--color-border)] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-[var(--color-text-secondary)]">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">ID</th>
                  <th className="text-left px-4 py-3 font-medium">Amount</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">Created</th>
                  <th className="text-left px-4 py-3 font-medium">Checkout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-[var(--color-text-muted)] py-10">
                      No payments yet.
                    </td>
                  </tr>
                )}
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3 font-mono text-xs truncate max-w-[120px]">{p.id}</td>
                    <td className="px-4 py-3">{p.amount} {p.asset}</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[p.status] || 'default'}>{p.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)] hidden sm:table-cell">
                      {formatDate(p.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <a href={`/checkout/${p.id}`} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">
                        Pay ↗
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}