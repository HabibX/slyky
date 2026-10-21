import { Badge } from '../ui/Badge';

const PHASES = [
  {
    phase: 'Phase 1 — MVP',
    status: 'completed',
    items: ['Payment Requests', 'Hosted Checkout', 'Payment Detection', 'Merchant Dashboard', 'Public Registration'],
  },
  {
    phase: 'Phase 2 — Validation',
    status: 'in-progress',
    items: ['Community Testing', 'Feedback Collection', 'UX Improvements', 'Bug Fixes'],
  },
  {
    phase: 'Phase 3 — Mainnet',
    status: 'planned',
    items: ['Merchant Accounts', 'Analytics', 'Webhooks', 'Mainnet Deployment'],
  },
  {
    phase: 'Phase 4 — Expansion',
    status: 'future',
    items: ['Payment APIs', 'Invoicing', 'Business Integrations', 'Cross-border Payments'],
  },
];

const STATUS_LABEL: Record<string, { label: string; variant: 'success' | 'accent' | 'warning' | 'default' }> = {
  completed: { label: 'Completed', variant: 'success' },
  'in-progress': { label: 'In Progress', variant: 'accent' },
  planned: { label: 'Planned', variant: 'warning' },
  future: { label: 'Future', variant: 'default' },
};

export function Roadmap() {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h2 className="text-2xl font-bold text-center mb-8 text-[var(--color-text-primary)]">
        Public Roadmap
      </h2>
      <div className="space-y-3">
        {PHASES.map(({ phase, status, items }) => (
          <details key={phase} className="bg-white border border-[var(--color-border)] rounded-xl p-5" open={status === 'in-progress'}>
            <summary className="font-semibold text-[var(--color-text-primary)] cursor-pointer list-none flex justify-between items-center">
              <span>{phase}</span>
              <Badge variant={STATUS_LABEL[status].variant}>{STATUS_LABEL[status].label}</Badge>
            </summary>
            <ul className="mt-3 space-y-1 text-sm text-[var(--color-text-secondary)]">
              {items.map((item) => <li key={item}>• {item}</li>)}
            </ul>
          </details>
        ))}
      </div>
    </section>
  );
}