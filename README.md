# SLYKY

> Payment Collection Infrastructure on Stellar

SLYKY lets developers, freelancers, and businesses create payment links and receive XLM, USDC, PYUSD, and USDT on the Stellar network. Simple API, hosted checkout, and real-time confirmation.

[Website](https://slyky.app) • [Documentation](https://slyky.app/docs) • [Integration Guide](./docs/checkout-integration.md) • [API Reference](./docs/api.md)

---

## Table of Contents

- [Why SLYKY](#why-slyky)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Supported Assets](#supported-assets)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Local Development](#local-development)
- [API Overview](#api-overview)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Why SLYKY

Receiving crypto payments is harder than it should be. You need to:

- Generate a unique address per payment
- Handle memos, confirmations, and edge cases
- Poll the blockchain for hours to detect a payment
- Reconcile on-chain transactions with your internal ledger

SLYKY abstracts all of this behind a single API call. You create a payment, share a link, and get notified when it's confirmed. The checkout UI is provided — or you can build your own using the API directly.

**Core principles:**

- **Multi-asset** — XLM, USDC, PYUSD, and USDT on Stellar
- **Adapter-based** — new rails (other chains, other assets) plug in without touching the core
- **Double-entry ledger** — every confirmed payment is recorded as a balanced debit/credit entry
- **Embeddable** — iframe or direct API, your choice

---

## Quick Start

### 1. Create a payment

```bash
curl -X POST https://api.slyky.app/v1/payments \
  -H "Authorization: Bearer sk_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "asset": "USDC",
    "network": "stellar",
    "amount": "10.00",
    "description": "Order #1234"
  }'
```

Response:

```json
{
  "id": "pay_a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "asset": "USDC",
  "amount": "10.00",
  "status": "pending",
  "address": "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOUJ3VJQ5FOTBJR",
  "memo": "slyu_a1b2c3d4e5f67890abcd",
  "createdAt": "2026-10-21T18:15:00.000Z"
}
```

### 2. Embed the checkout

```html
<iframe
  src="https://slyky.app/checkout/pay_a1b2c3d4-e5f6-7890-abcd-ef1234567890?embedded=true"
  width="100%"
  height="600"
  style="border: none; border-radius: 12px;"
  allow="clipboard-write">
</iframe>
```

### 3. Get notified

Poll `GET /v1/payments/{id}` every 5 seconds until `status` becomes `confirmed`.

See the [full integration guide](./docs/checkout-integration.md) for details.

---

## Architecture

### Payment Lifecycle

1. **Merchant creates a payment** via the API or the dashboard.
2. **Backend generates a unique memo** and returns a checkout URL.
3. **Payer opens the checkout**, scans the QR code (SEP-0007 compatible), or copies the address and memo manually.
4. **Payer sends the exact amount** with the correct memo on Stellar.
5. **Detection orchestrator polls Horizon every 10 seconds**, matches the memo, verifies the asset issuer, and confirms the payment.
6. **Confirmed payment is recorded in the double-entry ledger** and visible on the dashboard.

### Adapter Pattern

All payment rails implement `IRailAdapter`:

```typescript
interface IRailAdapter {
  readonly asset: string;
  readonly network: string;
  readonly requiredConfirmations: number;

  generateReceiveAddress(paymentId: string): Promise<ReceiveAddress>;
  startListening(callback: (tx: NormalizedTransaction) => void): void;
  getTransactionStatus(txHash: string): Promise<TransactionStatus>;
  estimateFee(amount: string): Promise<FeeEstimate>;
  estimateSettlementTime(): Promise<number>;
  healthCheck(): Promise<{ healthy: boolean; latency: number }>;
}
```

The `RailRegistry` keeps track of all registered adapters. The `DetectionOrchestrator` is adapter-agnostic: it iterates over the registry and matches incoming transactions against pending payments.

### Detection Method

Streaming (`Horizon.Server.payments().stream()`) proved unreliable in some hosting environments (Render free tier, cold starts, idle timeouts). We switched to **polling**:

- Every 10 seconds, the orchestrator fetches the latest payments for the receiving account
- For each payment, it extracts the memo (with a full transaction lookup as fallback)
- It matches the memo against pending payments of the same asset
- It verifies the asset issuer (for non-native assets) to prevent fake tokens
- On match, it calls `paymentService.confirmPayment()`

### Double-Entry Ledger

Every confirmed payment is recorded as a balanced transfer:

```
Debit:   stellar_network   (external source)
Credit:  user_<uuid>       (merchant account)
```

Balances are computed as `SUM(credits) - SUM(debits)` per account per asset. This makes reconciliation and future payouts straightforward.

---

## Supported Assets

| Asset | Testnet | Mainnet | Notes |
|---|---|---|---|
| **XLM** | ✅ | ✅ | Native asset |
| **USDC** | ✅ | ✅ | Issued by Circle |
| **PYUSD** | ❌ | ✅ | Issued by Paxos. Mainnet only. |
| **USDT** | ❌ | ✅ | USDT0, issued via LayerZero OFT. Mainnet only. |

> **Note:** PYUSD and USDT are not available on the Stellar testnet. Use the sandbox mode (`sk_test_...` keys) for development, or use XLM and USDC for end-to-end testnet testing.

### Asset issuers

For security, the backend verifies the `asset_issuer` on every incoming payment. The recognized issuers are:

| Asset | Issuer |
|---|---|
| USDC | `GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5` |
| PYUSD | `GDQE7IXJ4HUHV6RQHIUPRJSEZE4DRS5WY577O2FY6YQ5LVWZ7JZTU2V5` |
| USDT | `GATISXX6BZ6NC7IKQBY37CJD4SOZL3CYZJWXEDG6JVIY4WBS6KXJHN6Q` |

---

## Tech Stack

### Backend

- **Node.js** 20+
- **Express** 5
- **TypeScript** 6 (strict mode)
- **Prisma** 5 (PostgreSQL)
- **@stellar/stellar-sdk** 15
- **Helmet** — HTTP security headers
- **express-rate-limit** — brute-force protection

### Frontend

- **React** 19
- **React Router** 7
- **Vite** 8
- **Tailwind CSS** 4
- **TypeScript** 6
- **qrcode** — client-side QR code generation

### Infrastructure

- **Database:** PostgreSQL (Supabase)
- **Backend hosting:** Render
- **Frontend hosting:** Render (static site)
- **Monitoring:** cron-job.org health pings (to prevent cold starts)

---

## Repository Structure

```
slyky/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── adapters/
│   │   │   ├── mock/
│   │   │   └── stellar/         # XLM, USDC, PYUSD, USDT adapters
│   │   ├── core/
│   │   │   ├── interfaces/      # IRailAdapter
│   │   │   └── railRegistry.ts
│   │   ├── middleware/          # auth, validation
│   │   ├── routes/              # payments, register, stats, sandbox
│   │   ├── services/            # payment, ledger, detection, database
│   │   └── index.ts
│   └── package.json
│
├── frontend/
│   └── checkout/                # React app (see frontend/checkout/README.md)
│
├── docs/
│   ├── api.md                   # API reference
│   └── checkout-integration.md  # Integration guide for merchants
│
├── CONTRIBUTING.md
├── LICENSE
└── README.md                    # This file
```

---

## Local Development

### Prerequisites

- Node.js 20.19+ (or 22.12+)
- PostgreSQL 14+
- A Stellar testnet account (for `STELLAR_RECEIVING_SECRET`)

### 1. Clone and install

```bash
git clone https://github.com/HabibX/slyky.git
cd slyky

# Backend
cd backend && npm install

# Frontend
cd ../frontend/checkout && npm install
```

### 2. Configure environment

**Backend** — create `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/slyky_dev
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org
STELLAR_NETWORK=testnet
STELLAR_RECEIVING_SECRET=your_testnet_secret_here
API_PORT=3000
```

Generate a testnet account at [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=testnet).

**Frontend** — create `frontend/checkout/.env.local`:

```env
VITE_API_URL=http://localhost:3000
```

### 3. Run

```bash
# Terminal 1 — backend
cd backend
npx prisma migrate dev
npm run dev
# → http://localhost:3000

# Terminal 2 — frontend
cd frontend/checkout
npm run dev
# → http://localhost:5173
```

### 4. Test the flow

1. Register at http://localhost:5173/register — save the API key
2. Log in to http://localhost:5173/dashboard with that key
3. Create a payment (1 XLM)
4. Open the checkout link
5. Send 1 XLM to the address with the exact memo, using [Stellar Laboratory](https://laboratory.stellar.org/#txbuilder?network=testnet) or a testnet wallet
6. Within 10 seconds, the checkout shows "Confirmed"

---

## API Overview

All endpoints are under `https://api.slyky.app`.

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/v1/register` | ❌ | Create an account, returns an API key |
| `POST` | `/v1/payments` | ✅ | Create a payment |
| `GET` | `/v1/payments` | ✅ | List payments for the authenticated user |
| `GET` | `/v1/payments/:id` | ❌ | Get a payment by ID (public, used by the checkout) |
| `GET` | `/v1/stats` | ❌ | Validation campaign metrics |
| `POST` | `/v1/sandbox/payments/:id/confirm` | ❌ | Force-confirm a sandbox payment (dev only) |

See [docs/api.md](./docs/api.md) for request/response schemas.

---

## Roadmap

| Phase | Status | Deliverables |
|---|---|---|
| **Phase 1 — MVP** | ✅ Completed | Payment requests, hosted checkout, detection, dashboard, public registration |
| **Phase 2 — Multi-Asset & Integration** | 🔄 In Progress | USDC/PYUSD/USDT, embeddable checkout, sandbox mode, integration docs |
| **Phase 3 — Mainnet Readiness** | 📅 Planned | Merchant accounts, webhooks, email notifications, analytics, mainnet deployment |
| **Phase 4 — Expansion** | 🔮 Future | Invoicing, business integrations, cross-border payments, Soroban contracts |

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

Quick rules:

- Use conventional commits (`feat:`, `fix:`, `docs:`, etc.)
- Run `npm run lint` and `npm run build` before opening a PR
- Add tests for new features
- Update the relevant docs (`docs/api.md`, `docs/checkout-integration.md`)

---

## License

Licensed under the [Functional Source License 1.1 (FSL-1.1-ALv2)](./LICENSE).

---

Built on Stellar