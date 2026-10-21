# SLYKY Frontend

The React app that powers the SLYKY landing page, the hosted checkout, the merchant dashboard, and the registration flow.

[Parent repository](../../README.md) • [Integration guide](../../docs/checkout-integration.md) • [API reference](../../docs/api.md)

---

## Stack

- **React** 19
- **React Router** 7 (client-side routing)
- **Vite** 8 (build tool, dev server)
- **Tailwind CSS** 4 (styling)
- **TypeScript** 6 (strict mode)
- **qrcode** (client-side QR code generation)

---

## Project Structure

```
src/
├── components/
│   ├── layout/           # Header, Footer, Layout
│   ├── ui/               # Button, Badge, Card, Spinner, CopyButton, MetricCard
│   ├── landing/          # Hero, MetricsGrid, HowItWorks, Roadmap, FoundingTesterCTA
│   └── checkout/         # CheckoutCard, PaymentStatus, PaymentDetails, QRCodeDisplay
├── pages/
│   ├── LandingPage.tsx
│   ├── CheckoutPage.tsx
│   ├── DashboardPage.tsx
│   └── RegisterPage.tsx
├── hooks/
│   └── usePayment.ts     # Fetch + polling logic
├── lib/
│   ├── api.ts            # Typed API client
│   └── format.ts         # Date and string helpers
├── styles/
│   └── tokens.css        # Design tokens (colors, spacing, radii)
├── App.tsx               # Route definitions
├── main.tsx              # Entry point + legacy redirect
└── index.css             # Tailwind import + base styles
```

---

## Getting Started

### Prerequisites

- Node.js 20.19+ (or 22.12+)
- The SLYKY backend running (see [backend setup](../../README.md#local-development))

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the API URL

Create a `.env.local` file in this directory:

```env
VITE_API_URL=http://localhost:3000
```

The default is `http://localhost:3000` if the variable is unset, so this step is optional for local development.

### 3. Run the dev server

```bash
npm run dev
# → http://localhost:5173
```

Vite provides hot module replacement (HMR), so changes to source files appear instantly.

### 4. Build for production

```bash
npm run build
```

Output goes to `dist/`. The build runs `tsc -b` first (type checking) then `vite build`.

### 5. Preview the production build

```bash
npm run preview
# → http://localhost:4173
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Vite dev server on port 5173 |
| `npm run build` | Type-check with `tsc -b` then build with Vite |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint on all `.ts` and `.tsx` files |
| `npm start` | Serve the production build via `server.cjs` (Express) |

---

## Routes

| Route | Page | Description |
|---|---|---|
| `/` | `LandingPage` | Marketing page with metrics, roadmap, and CTA |
| `/checkout/:id` | `CheckoutPage` | Hosted checkout for a specific payment |
| `/dashboard` | `DashboardPage` | Merchant dashboard (API-key gated) |
| `/register` | `RegisterPage` | Public registration to get an API key |

### Legacy redirect

Old links using the `?id=` query string (e.g. `/?id=xxx`) are automatically redirected to `/checkout/xxx` by a small script in `main.tsx`. This is a temporary compatibility layer that can be removed once the old links are no longer in circulation.

---

## Embedded Mode

The checkout page supports an `?embedded=true` query parameter that hides the header and footer, making it suitable for embedding in an iframe on a merchant's site.

```
https://slyky.app/checkout/{id}?embedded=true
```

See the [integration guide](../../docs/checkout-integration.md) for the full iframe snippet and recommendations.

---

## Design Tokens

Colors, spacing, and radii are defined in `src/styles/tokens.css` as CSS custom properties. Tailwind utility classes reference these variables (e.g. `text-[var(--color-text-primary)]`).

If you change the brand colors, update `tokens.css` — everything else follows.

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | ❌ | `http://localhost:3000` | Base URL of the SLYKY backend API |

Variables prefixed with `VITE_` are exposed to the client at build time. Never put secrets in a `VITE_` variable.

---

## Deployment

The frontend is a static SPA. Any static host works (Vercel, Netlify, Render, Cloudflare Pages).

### SPA fallback

All unknown routes must serve `index.html` so that React Router can handle them client-side. Two options are provided in the repo:

- **`vercel.json`** — rewrites every route to `/index.html` (use if deploying on Vercel)
- **`server.cjs`** — an Express server that serves `dist/` with the same fallback (use if deploying on Render or a VPS)

Pick one and delete the other to avoid confusion.

---

## Linting

ESLint is configured in `eslint.config.js` with:

- `@eslint/js` recommended rules
- `typescript-eslint` recommended rules
- `eslint-plugin-react-hooks` recommended rules
- `eslint-plugin-react-refresh` for Vite

Run it with:

```bash
npm run lint
```

The TypeScript configuration (`tsconfig.app.json`) uses strict settings including `noUnusedLocals`, `noUnusedParameters`, and `verbatimModuleSyntax`. When importing types, always use `import type { ... }` — otherwise the build will fail.

---

## Common Issues

| Issue | Cause | Fix |
|---|---|---|
| Blank white screen | TypeScript type import not marked (`import { Foo }` instead of `import type { Foo }`) | Check the browser console; fix the import |
| `VITE_API_URL` ignored | `.env.local` not restarted | Stop and restart `npm run dev` |
| QR code doesn't render | Missing `qrcode` dependency | `npm install qrcode @types/qrcode` |
| CORS error on API calls | Backend not running or wrong URL | Verify the backend is up on the port in `VITE_API_URL` |
| `npm install` fails with `edgesOut` | npm version too old | `npm install -g "npm@^11"` |

---

## License

See the [root LICENSE](../../LICENSE).