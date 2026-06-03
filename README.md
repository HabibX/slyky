# Slyky

> Payment reception platform for developers, freelancers, and businesses — powered by Stellar.

Slyky is built to make receiving global payments simpler, faster, and more accessible, especially for underserved markets.

⚠️ **Currently under active development for the Stellar Journey to Mastery – Blue Belt Challenge.**

---

## 🚀 MVP Features (Phase 1 – Stellar Testnet)

- ✅ REST API to create payment requests (XLM, USDC)
- ✅ Unique Stellar address + memo per payment (28‑byte limit compatible)
- ✅ Automatic payment detection via Horizon polling (10‑second interval)
- ✅ Hosted checkout page with QR code (SEP‑0007 standard), live status, and feedback link
- ✅ Payment history dashboard with API key entry and payment creation form
- ✅ User registration endpoint to generate API keys
- ✅ Double‑entry ledger for balance tracking
- ✅ Public registration flow: users can sign up via the frontend and get their API key

**Status:** 🟢 MVP Complete & Deployed  
**Current Focus:** User feedback collection, final submission

---

## 🛠️ Tech Stack

- **Backend:** Node.js, TypeScript, Express, Prisma, PostgreSQL (Supabase)
- **Blockchain:** Stellar SDK, Horizon (Testnet)
- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Detection:** Polling‑based payment detection (every 10s) using Horizon REST API
- **Deployment:** Render (backend & frontend)
- **Monitoring:** cron‑job.org health checks to prevent cold starts

---

## 🗺️ Build Roadmap

- [x] Project approved for Blue Belt
- [x] Repository setup & license
- [x] Backend API MVP (payment creation, listing, status)
- [x] Checkout page MVP (QR code, polling, feedback link)
- [x] Stellar payment detection (polling with memo matching)
- [x] Dashboard MVP (list payments, create payment, API key entry)
- [x] Deployed backend & frontend on Render
- [x] QR code validated with Lobstr wallet (testnet)
- [ ] 5+ user onboarding & feedback collection
- [ ] Final iteration based on feedback
- [ ] Final submission

---

## 🔗 Required Blue Belt Links

- **Live Frontend:** [https://slyky.app](https://slyky.app)
- **Live Backend API:** [https://slyky.onrender.com](https://slyky.onrender.com)
- **Demo Video:** *(coming soon – add link after recording)*
- **User Feedback Sheet:** [Slyky MVP – User Feedback Form](https://docs.google.com/forms/d/e/1FAIpQLScebks7GmTMRizxKA-kLzxeH6MQ8xUlZrWGmBXMmr2zx0txyw/viewform?usp=dialog)
- **5+ Testnet Wallet Addresses:** *(to be added after feedback collection)*

---

## 🧱 Architecture

### High‑Level Overview

1. **Frontend** (React + Vite) – two pages: `/` (checkout) and `/dashboard`.
2. **Backend** (Express + TypeScript) – REST API with API key auth, payment state machine, double‑entry ledger, detection orchestrator.
3. **Database** – Supabase PostgreSQL accessed via Prisma ORM.
4. **Blockchain** – Stellar testnet Horizon API for transaction detection.

### Payment Lifecycle

1. Merchant creates a payment via dashboard (or API) – backend generates a unique memo (`sly_xxxx` for XLM).
2. The checkout page (`/?id=<paymentId>`) displays QR code, address, memo, and polls for status.
3. Payer sends exact amount with correct memo on Stellar testnet.
4. Backend detection orchestrator polls Horizon every 10 seconds, fetches recent payments, matches memo, and confirms the payment.
5. Confirmed payment updates the double‑entry ledger (debit network, credit user) and marks payment status `confirmed`.
6. Dashboard / checkout reflects the new status; payer is prompted to fill feedback form.

### Detection Method

Because streaming (SSE) was unreliable on some networks, the orchestrator uses a **polling** approach:
- Every 10 seconds, it calls `GET /accounts/{publicKey}/payments?order=desc&limit=10` on Horizon.
- It extracts the memo from the transaction (fallback: fetches full transaction via `getTransactionStatus`).
- If a pending payment with that memo exists, it confirms the payment.

### Data Model (Prisma)

The schema includes extension fields for future smart‑contract payments (`paymentType`, `conditions`, `contractId`), even though they are unused in the MVP.

---

## 📈 Improvement Plan

After collecting the first round of user feedback, the following improvements were made:

- **Memo length fix:** Original memos (`slyky_<uuid>`) exceeded Stellar’s 28‑byte memo limit. Shortened to `sly_<uuid22>` for XLM and `slyu_<uuid22>` for USDC.  
  *Commit:* [`abc123`](https://github.com/HabibX/slyky/commit/abc123) *(replace with actual commit hash)*
- **CORS policy fix:** Backend CORS updated to allow the live frontend origin, resolving blocked API requests.  
  *Commit:* [`def456`](https://github.com/HabibX/slyky/commit/def456) *(replace with actual commit hash)*
- **Public registration endpoint:** Added `POST /v1/register` to allow users to generate API keys directly from the frontend, removing terminal dependency.  
  *Commit:* [`ghi789`](https://github.com/HabibX/slyky/commit/ghi789) *(replace with actual commit hash)*

Further improvements planned after the next feedback round:
- Add email notifications on payment confirmation
- Support for USDC on testnet (USDC adapter already built)
- Mobile‑responsive dashboard

---

## 📄 License

This project is licensed under the Functional Source License 1.1 (FSL-1.1-ALv2). See [LICENSE](./LICENSE) for details.