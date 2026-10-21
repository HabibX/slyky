import { Link } from 'react-router-dom';

export function FoundingTesterCTA() {
  return (
    <section className="max-w-3xl mx-auto px-4 sm:px-6 py-16 text-center">
      <h2 className="text-3xl font-bold mb-4 text-[var(--color-text-primary)]">
        Become a Founding Tester
      </h2>
      <p className="text-[var(--color-text-secondary)] mb-8">
        Your feedback shapes the roadmap. Test the API, try the checkout, and help us build
        the payment infrastructure Stellar deserves.
      </p>
      <Link
        to="/register"
        className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-[var(--color-accent)] text-white font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
      >
        Join the Campaign
      </Link>
    </section>
  );
}