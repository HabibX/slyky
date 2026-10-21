const STEPS = [
  { title: 'Create an account', desc: 'Register with your email and get an API key.' },
  { title: 'Generate a payment', desc: 'Call the API to create a payment request with amount and asset.' },
  { title: 'Share the checkout link', desc: 'Send the hosted checkout URL to your customer.' },
  { title: 'Receive payment', desc: 'Customer sends XLM, USDC, PYUSD or USDT on Stellar.' },
  { title: 'Get confirmation', desc: 'SLYKY detects the payment and updates the status in real time.' },
  { title: 'Integrate webhooks', desc: 'Get notified when a payment is confirmed.' },
];

export function HowItWorks() {
  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h2 className="text-2xl font-bold text-center mb-8 text-[var(--color-text-primary)]">
        How It Works
      </h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {STEPS.map((step, i) => (
          <div key={step.title} className="bg-white border border-[var(--color-border)] rounded-xl p-5 flex gap-4">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--color-accent)] text-white flex items-center justify-center text-sm font-bold">
              {i + 1}
            </span>
            <div>
              <h3 className="font-semibold text-[var(--color-text-primary)] mb-1">{step.title}</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}