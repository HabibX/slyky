import { Link } from 'react-router-dom';
import { Badge } from '../ui/Badge';

export function Hero() {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 text-center">
      <div className="flex justify-center gap-2 mb-6 flex-wrap">
        <Badge variant="success">MVP Complete</Badge>
        <Badge variant="accent">Collecting Feedback</Badge>
        <Badge variant="warning">Goal: 50 Stellar Testers</Badge>
      </div>

      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-[var(--color-text-primary)] mb-4">
        Payment Collection Infrastructure on Stellar
      </h1>

      <p className="max-w-2xl mx-auto text-lg text-[var(--color-text-secondary)] mb-8">
        Create payment links, receive XLM, USDC, PYUSD and USDT on Stellar.
        Simple API, hosted checkout, and real-time confirmation.
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          to="/register"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[var(--color-accent)] text-white font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          Start Testing
        </Link>
        <a
          href="https://docs.slyky.app"
          className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-white border border-[var(--color-border)] text-[var(--color-text-primary)] font-medium hover:bg-gray-50 transition-colors"
        >
          Read the Docs
        </a>
      </div>
    </section>
  );
}