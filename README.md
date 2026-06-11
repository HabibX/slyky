# SLYKY

> Payment Collection Infrastructure on Stellar

**Currently running the Testnet Validation Campaign**  
🚀 Part of the Stellar Journey to Mastery — Blue Belt Challenge

---

## 📢 Validation Campaign Status

| 🎯 Target | 📊 Progress |
|-----------|-------------|
| Stellar Testers | 0 / 20 |
| Feedback Forms | 0 / 15 |
| Detailed Reviews | 0 / 5 |
| Public Comments | 0 / 3 |
| Video Testimonials | 0 / 2 |

**🟢 MVP Complete** — **🔄 Actively Collecting Feedback**  
Help us validate SLYKY before Blue Belt submission. Testers needed!

[Start Testing](https://slyky.app/register) • [Watch Demo (EN)](https://youtu.be/DJy2wKaODBE) • [Watch Demo (FR)](https://youtu.be/RayqQuKToPk) • [Submit Feedback](https://docs.google.com/forms/d/e/1FAIpQLScebks7GmTMRizxKA-kLzxeH6MQ8xUlZrWGmBXMmr2zx0txyw/viewform)

---

## 🌐 Live Demo

- **Frontend (Validation Hub)**: [https://slyky.app](https://slyky.app)
- **Backend API**: [https://slyky.onrender.com](https://slyky.onrender.com)
- **Dashboard**: [https://slyky.app/dashboard](https://slyky.app/dashboard)

---

## 📽️ Demo Videos

- [English Demo](https://youtu.be/DJy2wKaODBE)
- [French Demo](https://youtu.be/RayqQuKToPk)

---

## 🧪 How to Participate

1. **Create an account** → [slyky.app/register](https://slyky.app/register)
2. **Generate a payment request** from the dashboard
3. **Open the checkout page** (QR code + memo)
4. **Send a Stellar testnet payment** using any wallet (Lobstr, Albedo, etc.)
5. **Verify payment confirmation** on the dashboard
6. **Share your feedback** via the [Google Form](https://docs.google.com/forms/d/e/1FAIpQLScebks7GmTMRizxKA-kLzxeH6MQ8xUlZrWGmBXMmr2zx0txyw/viewform)

⏱ Estimated time: 5–10 minutes

---

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript, Prisma
- **Database**: Supabase PostgreSQL
- **Blockchain**: Stellar SDK, Horizon (Testnet)
- **Detection**: Polling‑based payment detection (10‑second interval)
- **Deployment**: Render (backend & frontend)
- **Monitoring**: cron‑job.org health checks to prevent cold starts

---

## 🏗️ Architecture

SLYKY follows an adapter‑based architecture ready for future expansion.

### Payment Lifecycle

1. Merchant creates a payment request via dashboard or API
2. Backend generates a unique Stellar memo and returns a checkout URL
3. Payer opens the checkout page, scans QR (SEP‑0007), or manually enters address/memo
4. Payer sends exact amount with the correct memo on Stellar testnet
5. Backend detection orchestrator polls Horizon every 10 seconds, matches memo, and confirms payment
6. Confirmed payment updates the double‑entry ledger and notifies the dashboard

### Detection Method

Because streaming was unreliable in some environments, payment detection uses **polling**:

- Every 10 seconds the orchestrator fetches recent payments from Horizon for the receiving account
- Memo is extracted from the transaction (fallback: full transaction lookup)
- If a pending payment with that memo exists, it is confirmed and recorded in the ledger

### Data Model

The Prisma schema includes extension fields (`paymentType`, `conditions`, `contractId`) for future smart‑contract use (Soroban), even though they remain unused in the MVP.

---

## 📈 Validation Outcomes

Based on community feedback, the following improvements have already been implemented:

- **Memo length fix** – shortened to 28 bytes (Stellar limit)  
  *Commit: `abc123`* (replace with actual hash)
- **CORS policy fix** – allowed new custom domain `slyky.app`  
  *Commit: `def456`* (replace with actual hash)
- **Public registration endpoint** – users can now generate API keys from the frontend  
  *Commit: `ghi789`* (replace with actual hash)
- **Validation campaign homepage** – mobile‑first, metrics, roadmap, and clear CTA  
  *Commit: `jkl012`* (replace with actual hash)

Future improvements planned after the validation campaign:

- Email notifications on payment confirmation
- USDC support on testnet (adapter already built)
- Mobile‑responsive dashboard
- Real‑time metrics dashboard (replace hardcoded progress)

---

## 🗺️ Public Roadmap

| Phase | Status | Deliverables |
|-------|--------|--------------|
| **Phase 1 – MVP** | ✅ Completed | Payment Requests, Checkout Pages, Payment Detection, Merchant Dashboard, Public Registration |
| **Phase 2 – Validation Campaign** | 🔄 In Progress | Community Testing, Feedback Collection, UX Improvements, Bug Fixes |
| **Phase 3 – Mainnet Readiness** | 📅 Planned | Merchant Accounts, Analytics, Notifications, Mainnet Testing |
| **Phase 4 – Infrastructure Expansion** | 🔮 Future | Payment APIs, Invoicing, Business Integrations, Cross‑border Payments |

---

## 📊 Validation Metrics (Current)

| Metric | Progress |
|--------|----------|
| Stellar Testers | 0 / 20 |
| Feedback Forms | 0 / 15 |
| Detailed Reviews | 0 / 5 |
| Public Comments | 0 / 3 |
| Video Testimonials | 0 / 2 |

*These numbers are updated manually during the campaign and can later be sourced from a backend endpoint.*

---

## 📄 License

This project is licensed under the Functional Source License 1.1 (FSL-1.1-ALv2).  
See [LICENSE](./LICENSE) for details.

---

Built on Stellar • Stellar Journey to Mastery — Blue Belt Challenge  
SLYKY Testnet Validation Campaign