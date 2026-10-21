const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface PaymentData {
  id: string;
  asset: string;
  amount: string;
  status: 'created' | 'pending' | 'processing' | 'confirming' | 'confirmed' | 'failed' | 'expired';
  address: string;
  memo: string;
  txHash?: string;
  confirmedAt?: string;
  createdAt: string;
}

export interface Stats {
  testers: number;
  feedbackForms: number;
  reviews: number;
  publicComments: number;
  testimonials: number;
}

export async function fetchPayment(id: string): Promise<PaymentData> {
  const res = await fetch(`${API_URL}/v1/payments/${id}`);
  if (!res.ok) throw new Error('Payment not found');
  return res.json();
}

export async function fetchStats(): Promise<Stats> {
  try {
    const res = await fetch(`${API_URL}/v1/stats`);
    if (!res.ok) return { testers: 0, feedbackForms: 0, reviews: 0, publicComments: 0, testimonials: 0 };
    return res.json();
  } catch {
    return { testers: 0, feedbackForms: 0, reviews: 0, publicComments: 0, testimonials: 0 };
  }
}

export async function registerUser(email: string): Promise<{ apiKey: string }> {
  const res = await fetch(`${API_URL}/v1/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Registration failed');
  }
  return res.json();
}

export async function createPayment(apiKey: string, params: {
  asset: string;
  network: string;
  amount: string;
  description?: string;
}): Promise<PaymentData> {
  const res = await fetch(`${API_URL}/v1/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error('Failed to create payment');
  return res.json();
}

export async function listPayments(apiKey: string): Promise<PaymentData[]> {
  const res = await fetch(`${API_URL}/v1/payments`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error('Failed to fetch payments');
  return res.json();
}