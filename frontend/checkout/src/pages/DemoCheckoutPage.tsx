// frontend/checkout/src/pages/DemoCheckoutPage.tsx
import { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/ui/Card';

const DEMO_PAYMENT_ID = 'demo_payment_placeholder'; // Remplacer par un vrai ID

export function DemoCheckoutPage() {
  const [showCode, setShowCode] = useState(false);

  const snippet = `<iframe
  src="https://slyky.app/checkout/${DEMO_PAYMENT_ID}?embedded=true"
  width="100%"
  height="600"
  style="border: none; border-radius: 12px;"
  allow="clipboard-write"
></iframe>`;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-3 text-[var(--color-text-primary)]">
            Embedded Checkout Demo
          </h1>
          <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto">
            This is a live preview of how the SLYKY checkout looks when embedded
            in your website using an iframe.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Colonne gauche : Aperçu live */}
          <Card>
            <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">
              Live Preview
            </h2>
            <div className="border border-[var(--color-border)] rounded-lg overflow-hidden bg-white">
              <iframe
                src={`/checkout/${DEMO_PAYMENT_ID}?embedded=true`}
                width="100%"
                height="600"
                style={{ border: 'none' }}
                allow="clipboard-write"
                title="SLYKY Checkout Demo"
              />
            </div>
          </Card>

          {/* Colonne droite : Code à copier */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide">
                Integration Code
              </h2>
              <button
                onClick={() => navigator.clipboard.writeText(snippet)}
                className="text-xs text-[var(--color-accent)] hover:underline"
              >
                Copy
              </button>
            </div>
            <pre className="bg-gray-50 border border-[var(--color-border)] rounded-lg p-4 text-xs overflow-x-auto">
              <code>{snippet}</code>
            </pre>
            <p className="text-xs text-[var(--color-text-muted)] mt-3">
              Replace <code className="font-mono">DEMO_PAYMENT_ID</code> with the ID
              returned by your API call to <code className="font-mono">POST /v1/payments</code>.
            </p>
          </Card>
        </div>

        {/* Lien vers la doc complète */}
        <div className="mt-8 text-center">
          <a
            href="https://docs.slyky.app/checkout-integration"
            className="text-sm text-[var(--color-accent)] hover:underline"
          >
            Read the full integration guide →
          </a>
        </div>
      </div>
    </Layout>
  );
}