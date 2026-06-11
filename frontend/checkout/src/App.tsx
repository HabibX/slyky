import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const DEMO_EN = import.meta.env.VITE_DEMO_EN || 'https://example.com/demo-en';
const DEMO_FR = import.meta.env.VITE_DEMO_FR || 'https://example.com/demo-fr';
const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO || 'https://github.com/your-repo';

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

  const params = new URLSearchParams(window.location.search);
  const paymentId = params.get('id');

  const fetchPayment = async () => {
    if (!paymentId) return;
    try {
      const res = await fetch(`${API_URL}/v1/payments/${paymentId}`, {
        headers: {
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
      const destination = encodeURIComponent(payment.address);
      const memo = encodeURIComponent(payment.memo);
      const stellarUri = `web+stellar:pay?destination=${destination}&memo=${memo}&network=testnet`;

      QRCode.toString(stellarUri, { type: 'svg', width: 256 }, (err, svg) => {
        if (!err) setQrSvg(svg);
      });
    }
  }, [payment]);

  useEffect(() => {
    fetchPayment();
    const interval = setInterval(() => {
      if (payment?.status !== 'confirmed') {
        fetchPayment();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [paymentId]);

  // ====== LANDING PAGE (no ?id= present) ======
  if (!paymentId) {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-gray-100">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-16 sm:py-24 text-center">
        {/* Trust badges */}
        <div className="flex justify-center gap-3 mb-6 flex-wrap">
          <span className="inline-flex items-center rounded-full bg-green-100 text-green-800 px-3 py-1 text-xs font-medium">
            ✅ MVP Complete
          </span>
          <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-800 px-3 py-1 text-xs font-medium">
            🔄 Collecting Feedback
          </span>
          <span className="inline-flex items-center rounded-full bg-purple-100 text-purple-800 px-3 py-1 text-xs font-medium">
            🎯 Goal: 20 Stellar Testers
          </span>
          <span className="inline-flex items-center rounded-full bg-yellow-100 text-yellow-800 px-3 py-1 text-xs font-medium">
            📅 Blue Belt Submission In Progress
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
          SLYKY Testnet Validation Campaign
        </h1>

        <p className="text-lg sm:text-xl text-gray-700 mb-4">
          Payment Collection Infrastructure on Stellar
        </p>

        <p className="max-w-2xl mx-auto text-gray-600 mb-6">
          Help validate SLYKY before Blue Belt submission.
          <br />
          We're looking for Stellar developers, wallet users, and ecosystem contributors.
        </p>

        <p className="text-sm text-gray-500 mb-8">⏱ 5–10 minute test</p>

        {/* Primary CTA */}
        <a
          href="/register"
          className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition shadow-lg"
        >
          Start Testing
        </a>

        {/* Secondary links */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
          <a href={DEMO_EN} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 underline">
            ▶ Watch Demo (EN)
          </a>
          <a href={DEMO_FR} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 underline">
            ▶ Watch Demo (FR)
          </a>
          <a href={GITHUB_REPO} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 underline">
            📁 GitHub
          </a>
        </div>
      </section>

      {/* Metrics */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { target: 20, current: 0, label: 'Stellar Testers' },
            { target: 15, current: 0, label: 'Feedback Forms' },
            { target: 5, current: 0, label: 'Detailed Reviews' },
            { target: 3, current: 0, label: 'Public Comments' },
            { target: 2, current: 0, label: 'Video Testimonials' },
          ].map(({ target, current, label }) => (
            <div key={label} className="bg-white rounded-xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-gray-800">{current}</div>
              <div className="text-xs text-gray-500">/ {target}</div>
              <div className="text-sm font-medium text-gray-700 mt-1">{label}</div>
              {/* Simple progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div
                  className="bg-blue-600 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, (current / target) * 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How to Participate */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h3 className="text-3xl font-bold text-center mb-8">How To Participate</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            'Create an account',
            'Generate a payment request',
            'Open the checkout page',
            'Send a Stellar testnet payment',
            'Verify confirmation',
            'Share your feedback',
          ].map((step, index) => (
            <div key={step} className="bg-white rounded-xl p-4 flex items-start gap-3 shadow-sm">
              <span className="shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <span className="text-gray-700">{step}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap – simple accordion on mobile, always open on desktop */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h3 className="text-3xl font-bold text-center mb-8">Public Roadmap</h3>
        <div className="space-y-4">
          {[
            {
              phase: 'Phase 1 — MVP',
              status: '✅ Completed',
              items: ['Payment Requests', 'Hosted Checkout Pages', 'Payment Detection', 'Merchant Dashboard', 'Public Registration'],
            },
            {
              phase: 'Phase 2 — Validation Campaign',
              status: '🔄 In Progress',
              items: ['Community Testing', 'Feedback Collection', 'UX Improvements', 'Bug Fixes'],
            },
            {
              phase: 'Phase 3 — Mainnet Readiness',
              status: '📅 Planned',
              items: ['Merchant Accounts', 'Analytics', 'Notifications', 'Mainnet Testing'],
            },
            {
              phase: 'Phase 4 — Infrastructure Expansion',
              status: '🔮 Future',
              items: ['Payment APIs', 'Invoicing', 'Business Integrations', 'Cross‑border Payments'],
            },
          ].map(({ phase, status, items }) => (
            <details key={phase} className="bg-white rounded-xl p-4 shadow-sm" open>
              <summary className="font-semibold text-lg cursor-pointer list-none flex justify-between items-center">
                <span>{phase}</span>
                <span className="text-sm text-gray-500">{status}</span>
              </summary>
              <ul className="mt-3 space-y-1 text-gray-700 text-sm">
                {items.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </section>

      {/* Why SLYKY */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <h3 className="text-2xl font-bold mb-3">Why SLYKY?</h3>
          <p className="text-gray-600 leading-relaxed">
            Receiving payments should be as simple as sharing a link. SLYKY provides payment collection infrastructure
            powered by Stellar for developers, freelancers, and businesses. The long‑term vision is to enable
            programmable payment collection tools accessible worldwide.
          </p>
        </div>
      </section>

      {/* Founding Tester CTA */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h3 className="text-3xl sm:text-4xl font-bold mb-4">Become a Founding Tester</h3>
        <p className="text-gray-600 mb-8">
          Help validate SLYKY before Blue Belt submission and directly influence future development.
        </p>
        <a
          href="/register"
          className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition shadow-lg"
        >
          Join The Campaign
        </a>
      </section>

      {/* Footer */}
      <footer className="text-center text-sm text-gray-500 py-8 border-t border-gray-200">
        Built on Stellar &middot; Stellar Journey to Mastery &middot; SLYKY Testnet Validation Campaign
      </footer>
    </div>
  );
}

  // ====== CHECKOUT PAGE (when ?id= is present) ======
  if (error) {
    return <div className="text-red-500">{`Error: ${error}`}</div>;
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