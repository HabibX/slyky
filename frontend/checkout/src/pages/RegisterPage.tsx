import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/Button';
import { registerUser } from '../lib/api';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const { apiKey } = await registerUser(email);
      setApiKey(apiKey);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-8">
          {!apiKey ? (
            <>
              <h1 className="text-xl font-bold mb-2 text-[var(--color-text-primary)]">Create your account</h1>
              <p className="text-sm text-[var(--color-text-secondary)] mb-6">
                Get an API key to start collecting payments on Stellar.
              </p>
              <form onSubmit={handleSubmit}>
                <label className="block text-sm text-[var(--color-text-secondary)] mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-[var(--color-border)] rounded-lg px-4 py-2.5 mb-4 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                  required
                />
                <Button type="submit" className="w-full">Register</Button>
                {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
              </form>
              <p className="text-xs text-[var(--color-text-muted)] mt-6 text-center">
                Already have a key? <Link to="/dashboard" className="text-[var(--color-accent)] underline">Go to Dashboard</Link>
              </p>
            </>
          ) : (
            <div>
              <h1 className="text-xl font-bold mb-2 text-emerald-600">Your API key is ready</h1>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                Save it securely — it won't be shown again.
              </p>
              <div className="bg-gray-50 border border-[var(--color-border)] rounded-lg p-4 font-mono text-xs break-all mb-6">
                {apiKey}
              </div>
              <Link to="/dashboard">
                <Button className="w-full">Go to Dashboard</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}