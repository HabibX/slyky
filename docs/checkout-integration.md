# SLYKY Checkout Integration Guide

This guide explains how to integrate the SLYKY checkout into your website or application. You'll learn how to create a payment, display the checkout to your customers, and receive confirmation when the payment is complete.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Quick Start](#2-quick-start)
3. [Creating a Payment](#3-creating-a-payment)
4. [Integration Methods](#4-integration-methods)
   - [4.1 Hosted Checkout (redirect)](#41-hosted-checkout-redirect)
   - [4.2 Embedded Checkout (iframe)](#42-embedded-checkout-iframe)
   - [4.3 Direct API (custom UI)](#43-direct-api-custom-ui)
5. [Tracking Payment Status](#5-tracking-payment-status)
6. [Supported Assets](#6-supported-assets)
7. [Sandbox Mode](#7-sandbox-mode)
8. [Error Handling](#8-error-handling)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. Prerequisites

Before integrating the checkout, you need:

- A SLYKY account (register at [https://slyky.app/register](https://slyky.app/register))
- An API key (`sk_live_...` for production, `sk_test_...` for sandbox)
- A server-side environment to call the SLYKY API securely

> **⚠️ Security note:** Never expose your API key in client-side code. All API calls to `/v1/payments` must be made from your backend server.

---

## 2. Quick Start

The complete flow is:

```
1. Your server  → POST /v1/payments          → SLYKY creates the payment
2. Your server  → Sends the checkout URL     → Your frontend
3. Your customer → Pays on the checkout page → SLYKY detects the payment
4. Your server  → Polls or receives webhook  → You're notified
```

Here's a minimal working example:

```bash
# Step 1: Create a payment
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
  "network": "stellar",
  "amount": "10.00",
  "status": "pending",
  "address": "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOUJ3VJQ5FOTBJR",
  "memo": "slyu_a1b2c3d4e5f67890abcd",
  "description": "Order #1234",
  "expiresAt": "2026-10-21T18:45:00.000Z",
  "createdAt": "2026-10-21T18:15:00.000Z"
}
```

```html
<!-- Step 2: Display the checkout -->
<iframe
  src="https://slyky.app/checkout/pay_a1b2c3d4-e5f6-7890-abcd-ef1234567890?embedded=true"
  width="100%"
  height="600"
  style="border: none; border-radius: 12px;"
  allow="clipboard-write">
</iframe>
```

That's it. The customer scans the QR code, sends the payment, and SLYKY updates the status automatically.

---

## 3. Creating a Payment

### Endpoint

```
POST https://api.slyky.app/v1/payments
```

### Authentication

```
Authorization: Bearer sk_live_...
```

### Request body

| Field | Type | Required | Description |
|---|---|---|---|
| `asset` | string | ✅ | One of `XLM`, `USDC`, `PYUSD`, `USDT` |
| `network` | string | ✅ | Must be `stellar` |
| `amount` | string | ✅ | Decimal amount as string (e.g. `"10.00"`) |
| `description` | string | ❌ | Optional note visible on the checkout page (max 255 chars) |
| `idempotencyKey` | string | ❌ | Unique key to prevent duplicate payments (UUID v4 recommended) |

### Example

```bash
curl -X POST https://api.slyky.app/v1/payments \
  -H "Authorization: Bearer sk_live_your_key_here" \
  -H "Content-Type: application/json" \
  -d '{
    "asset": "USDC",
    "network": "stellar",
    "amount": "10.00",
    "description": "Order #1234",
    "idempotencyKey": "5c7c5b8e-1234-4a5b-9c1d-abcdef123456"
  }'
```

### Response

```json
{
  "id": "pay_a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "asset": "USDC",
  "network": "stellar",
  "amount": "10.00",
  "status": "pending",
  "address": "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOUJ3VJQ5FOTBJR",
  "memo": "slyu_a1b2c3d4e5f67890abcd",
  "description": "Order #1234",
  "expiresAt": "2026-10-21T18:45:00.000Z",
  "createdAt": "2026-10-21T18:15:00.000Z"
}
```

### Important fields

- **`id`** — Use this to build the checkout URL: `https://slyky.app/checkout/{id}`
- **`address`** — The Stellar address the customer must send funds to
- **`memo`** — **Critical.** The customer MUST include this memo in their transaction. Without it, SLYKY cannot match the payment and it will not be confirmed.
- **`expiresAt`** — Payments expire after 30 minutes by default. After expiry, the checkout will show an "Expired" state and cannot be paid.

### Idempotency

If you pass an `idempotencyKey` and repeat the same request within 24 hours, SLYKY returns the existing payment instead of creating a new one. This is useful to avoid duplicate charges in case of network retries.

---

## 4. Integration Methods

You have three options for displaying the checkout. Choose the one that fits your use case.

### 4.1 Hosted Checkout (redirect)

The simplest integration: redirect the customer to the SLYKY-hosted checkout page.

```html
<a href="https://slyky.app/checkout/pay_a1b2c3d4-e5f6-7890-abcd-ef1234567890" target="_blank">
  Pay with SLYKY
</a>
```

Or programmatically:

```js
window.location.href = `https://slyky.app/checkout/${paymentId}`;
```

**Best for:** Email links, invoices, or cases where you don't want to embed the checkout in your own UI.

---

### 4.2 Embedded Checkout (iframe)

Embed the checkout directly in your page. The `?embedded=true` query parameter hides the header and footer, so the checkout adapts to your layout.

```html
<iframe
  src="https://slyky.app/checkout/pay_a1b2c3d4-e5f6-7890-abcd-ef1234567890?embedded=true"
  width="100%"
  height="600"
  style="border: none; border-radius: 12px;"
  allow="clipboard-write"
  title="SLYKY Checkout">
</iframe>
```

**React example:**

```tsx
export function SlykyCheckout({ paymentId }: { paymentId: string }) {
  return (
    <iframe
      src={`https://slyky.app/checkout/${paymentId}?embedded=true`}
      width="100%"
      height="600"
      style={{ border: 'none', borderRadius: '12px' }}
      allow="clipboard-write"
      title="SLYKY Checkout"
    />
  );
}
```

**Best for:** E-commerce product pages, SaaS billing dashboards, or any place where you want to keep the customer on your site.

**Recommendations:**
- Use `width="100%"` with a `max-width` on the parent container (e.g. `max-width: 480px`) for a clean layout
- `height="600"` works well; you can increase to `700` for a more spacious view
- The `allow="clipboard-write"` attribute is needed for the "Copy" buttons on the address and memo

> **Note:** The iframe communicates with SLYKY's backend directly to poll the payment status. You don't need to do anything extra for real-time updates — the iframe handles it.

---

### 4.3 Direct API (custom UI)

If you want full control over the checkout UI, you can build your own by calling the payment API directly. This is the most flexible option but requires more work.

```tsx
// 1. Your backend creates the payment (as shown in section 3)

// 2. Your frontend fetches the payment details
const res = await fetch(`https://api.slyky.app/v1/payments/${paymentId}`);
const payment = await res.json();

// 3. You render your own UI using payment.address, payment.memo, payment.amount, etc.
```

Then poll the payment status every 5 seconds:

```ts
setInterval(async () => {
  const res = await fetch(`https://api.slyky.app/v1/payments/${paymentId}`);
  const payment = await res.json();
  if (payment.status === 'confirmed') {
    // Payment is complete
  }
}, 5000);
```

**Best for:** Marketplaces, mobile apps, or cases where the SLYKY UI doesn't fit your brand.

---

## 5. Tracking Payment Status

A payment goes through the following statuses:

| Status | Meaning |
|---|---|
| `created` | Payment record created, not yet ready to accept funds |
| `pending` | Ready to accept funds — the customer can pay |
| `processing` | A matching transaction has been detected, being processed |
| `confirming` | Transaction is on-chain, waiting for confirmation |
| `confirmed` | Payment is complete ✅ |
| `failed` | Transaction failed or was rejected |
| `expired` | Payment expired (default: 30 minutes after creation) |

### Polling

Poll the public endpoint (no authentication required) to track a payment:

```bash
GET https://api.slyky.app/v1/payments/{id}
```

We recommend polling every **5 seconds** while the payment is in `pending`, `processing`, or `confirming` state. Stop polling when the status becomes `confirmed`, `failed`, or `expired`.

### Webhooks

Webhook notifications are **planned for a future release** (Phase 3). For now, you must poll the API. Once webhooks are available, this guide will be updated with:
- Webhook signature verification (HMAC-SHA256)
- Retry strategy
- Event types (`payment.confirmed`, `payment.failed`, `payment.expired`)

If you need webhook support now, contact us at `hello@slyky.app`.

---

## 6. Supported Assets

SLYKY supports the following assets on the Stellar network:

| Asset | Code | Testnet | Mainnet | Notes |
|---|---|---|---|---|
| **Stellar Lumens** | `XLM` | ✅ Available | ✅ Available | Native asset |
| **USD Coin** | `USDC` | ✅ Available | ✅ Available | Issued by Circle |
| **PayPal USD** | `PYUSD` | ❌ Not available | ✅ Available | Issued by Paxos |
| **Tether USD** | `USDT` | ❌ Not available | ✅ Available | USDT0, issued via LayerZero OFT |

### Testnet considerations

If you're developing on the Stellar **testnet** (sandbox), only **XLM** and **USDC** are fully testable end-to-end. PYUSD and USDT exist on the **mainnet only**.

To test PYUSD and USDT flows before going live, use the **Sandbox mode** described in the next section.

### Stellar address format

All assets use a standard Stellar address (56 characters, starting with `G`). For non-native assets (USDC, PYUSD, USDT), the transaction must include the correct `asset_code` and `asset_issuer`.

SLYKY's backend validates the `asset_issuer` to prevent fake tokens. Only the officially recognized issuers are accepted.

---

## 7. Sandbox Mode

Sandbox mode lets you test the full integration without sending real funds. It is enabled when you use an API key that starts with **`sk_test_`** instead of `sk_live_`.

### Getting a sandbox key

Register at [https://slyky.app/register](https://slyky.app/register) and select "Sandbox" during signup, or contact us to enable sandbox on an existing account.

### Simulating a payment

In sandbox mode, you can force a payment to be confirmed without an actual blockchain transaction:

```bash
curl -X POST https://api.slyky.app/v1/sandbox/payments/{paymentId}/confirm
```

The payment will immediately transition to `confirmed`, and any polling clients (including the embedded iframe) will see the updated status within 5 seconds.

### Limitations

- Sandbox mode is **disabled in production** (when `NODE_ENV=production`)
- Payments created with `sk_test_` keys are marked in the database and never touch the Stellar network
- Sandbox data is isolated from live data — you can't mix test and live payments

### Recommended test flow

1. Create a payment with your `sk_test_...` key
2. Open the checkout URL: `https://slyky.app/checkout/{paymentId}`
3. Verify the UI shows the correct amount, address, and memo
4. Call `POST /v1/sandbox/payments/{paymentId}/confirm`
5. Verify the checkout updates to "Confirmed" within 5 seconds
6. Verify your backend received the correct status when polling

---

## 8. Error Handling

The API returns standard HTTP status codes:

| Status | Meaning | What to do |
|---|---|---|
| `200` | Success (GET) | — |
| `201` | Created (POST) | — |
| `400` | Bad request | Check the request body against the schema |
| `401` | Missing API key | Add `Authorization: Bearer sk_...` header |
| `403` | Invalid API key | Check your key hasn't been revoked |
| `404` | Payment not found | The ID doesn't exist or was deleted |
| `429` | Rate limit exceeded | Back off and retry after the `Retry-After` header |
| `500` | Server error | Retry with exponential backoff; if persists, contact support |

### Error response format

```json
{
  "error": "Human-readable message explaining what went wrong"
}
```

### Validation errors

For validation failures, the response includes the specific field:

```json
{
  "error": "asset must be one of: XLM, USDC, PYUSD, USDT"
}
```

### Common errors

| Error message | Cause | Fix |
|---|---|---|
| `asset, network, and amount are required` | Missing required field | Check the request body |
| `No adapter for ASSET:stellar` | Unsupported asset | Use one of the supported assets |
| `STELLAR_RECEIVING_SECRET is not set` | Backend misconfiguration | Contact SLYKY support |

---

## 9. Troubleshooting

### The iframe shows "Payment not found"

**Cause:** The payment ID in the iframe URL is incorrect, or the payment was created with a different API key.

**Fix:**
- Verify the `id` from the creation response is exactly what's in the URL
- Ensure the payment hasn't expired (payments expire after 30 minutes)
- Check that you're using the correct environment (sandbox vs. production)

### The QR code doesn't scan

**Cause:** The QR code uses the `web+stellar:pay` URI scheme, which requires a compatible Stellar wallet.

**Fix:**
- Use a wallet that supports Stellar URIs (Lobstr, Freighter mobile, Solar)
- Alternatively, manually copy the address and memo from the checkout page

### Payment stays "pending" after sending

**Cause:** The customer didn't include the memo, or sent the wrong asset/amount.

**Fix:**
- Verify the transaction on [Stellar Expert](https://stellar.expert) includes the exact memo
- Verify the asset matches (e.g. sending XLM to a USDC payment won't work)
- Verify the destination address matches exactly
- Contact SLYKY support with the transaction hash

### "Copied" button doesn't work in the iframe

**Cause:** Missing the `allow="clipboard-write"` attribute on the iframe.

**Fix:** Add the attribute:

```html
<iframe ... allow="clipboard-write"></iframe>
```

### Rate limit errors (429)

**Cause:** Too many requests in a short period.

**Fix:**
- Reduce polling frequency (5 seconds is recommended)
- Use webhooks instead of polling (once available)
- Implement exponential backoff starting at 1 second

### CORS errors in the browser

**Cause:** The API doesn't allow requests from your domain.

**Fix:**
- Public endpoints (`GET /v1/payments/:id`, `GET /v1/stats`) are CORS-enabled for all origins
- Authenticated endpoints (`POST /v1/payments`) should be called from your **server**, not the browser. If you must call them from the browser, contact us to add your domain to the allowlist.

---

## Support

- **Documentation:** [https://docs.slyky.app](https://docs.slyky.app)
- **Email:** hello@slyky.app
- **GitHub:** [https://github.com/HabibX/slyky](https://github.com/HabibX/slyky)
- **Status page:** [https://status.slyky.app](https://status.slyky.app) *(planned)*

---

*Last updated: October 2026*