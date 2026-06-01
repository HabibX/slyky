import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function Register() {
  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API_URL}/v1/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Registration failed');
      }
      const data = await res.json();
      setApiKey(data.apiKey);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Create your Slyky account</h1>
        {!apiKey ? (
          <form onSubmit={handleRegister}>
            <label className="block text-sm text-gray-600 mb-2">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2 mb-4"
              placeholder="you@example.com"
              required
            />
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition w-full">
              Register
            </button>
            {error && <p className="text-red-500 mt-3">{error}</p>}
          </form>
        ) : (
          <div className="text-center">
            <p className="text-lg font-semibold text-green-600 mb-4">Your API key is ready!</p>
            <div className="bg-gray-100 p-4 rounded-xl break-all font-mono text-sm mb-4">
              {apiKey}
            </div>
            <p className="text-sm text-gray-500 mb-4">Save this key – it won’t be shown again.</p>
            <a
              href="/dashboard"
              className="inline-block bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition"
            >
              Go to Dashboard
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default Register;