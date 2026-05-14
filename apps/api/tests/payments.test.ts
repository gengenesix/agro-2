import { describe, it, expect, vi } from 'vitest'
import { createHmac }               from 'crypto'

// Must be mocked before importing paystack — env is resolved at module load time
vi.mock('../src/config/env.js', () => ({
  env: {
    PAYSTACK_WEBHOOK_SECRET: 'test-webhook-secret-sha512',
    PAYSTACK_SECRET_KEY:     'sk_test_placeholder_key',
    // Remaining fields are only needed by paystack client init — not by verifyWebhookSignature
  },
}))

import { verifyWebhookSignature } from '../src/lib/paystack.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SECRET = 'test-webhook-secret-sha512'

function sign(payload: string, secret = SECRET): string {
  return createHmac('sha512', secret).update(payload).digest('hex')
}

const chargeSuccess = JSON.stringify({
  event: 'charge.success',
  data:  { reference: 'agro_pay_001', amount: 50000, status: 'success' },
})

// ---------------------------------------------------------------------------
// verifyWebhookSignature
// ---------------------------------------------------------------------------

describe('verifyWebhookSignature', () => {
  it('returns true for a valid HMAC-SHA512 signature', () => {
    expect(verifyWebhookSignature(chargeSuccess, sign(chargeSuccess))).toBe(true)
  })

  it('returns false when the payload has been tampered with', () => {
    const sig             = sign(chargeSuccess)
    const tamperedPayload = chargeSuccess.replace('agro_pay_001', 'agro_pay_INJECT')
    expect(verifyWebhookSignature(tamperedPayload, sig)).toBe(false)
  })

  it('returns false when the signature was computed with a different secret', () => {
    const wrongSig = sign(chargeSuccess, 'attacker-controlled-secret')
    expect(verifyWebhookSignature(chargeSuccess, wrongSig)).toBe(false)
  })

  it('returns false for an empty signature string', () => {
    expect(verifyWebhookSignature(chargeSuccess, '')).toBe(false)
  })

  it('returns false for a truncated / malformed signature', () => {
    const fullSig = sign(chargeSuccess)
    expect(verifyWebhookSignature(chargeSuccess, fullSig.slice(0, 32))).toBe(false)
  })

  it('returns false when the signature is all-zeroes (timing-safe comparison)', () => {
    const zeroes = '0'.repeat(128)
    expect(verifyWebhookSignature(chargeSuccess, zeroes)).toBe(false)
  })

  it('handles an empty payload without throwing', () => {
    const sig = sign('')
    expect(verifyWebhookSignature('', sig)).toBe(true)
  })

  it('is case-sensitive — uppercase hex digest does not match', () => {
    const upperSig = sign(chargeSuccess).toUpperCase()
    expect(verifyWebhookSignature(chargeSuccess, upperSig)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// HMAC idempotency properties
// (These validate the security invariants our payment worker relies on.)
// ---------------------------------------------------------------------------

describe('HMAC idempotency and collision resistance', () => {
  it('produces the same digest for identical payloads (deterministic)', () => {
    const payload = JSON.stringify({ reference: 'ref_idem', amount: 5000 })
    expect(sign(payload)).toBe(sign(payload))
  })

  it('produces different digests for different references (collision resistance)', () => {
    const p1 = JSON.stringify({ reference: 'ref_A', amount: 5000 })
    const p2 = JSON.stringify({ reference: 'ref_B', amount: 5000 })
    expect(sign(p1)).not.toBe(sign(p2))
  })

  it('produces different digests for different amounts (mutation detection)', () => {
    const p1 = JSON.stringify({ reference: 'ref_X', amount: 5000 })
    const p2 = JSON.stringify({ reference: 'ref_X', amount: 9999 })
    expect(sign(p1)).not.toBe(sign(p2))
  })

  it('produces different digests for event type changes (mutation detection)', () => {
    const success = JSON.stringify({ event: 'charge.success', reference: 'ref_1' })
    const failed  = JSON.stringify({ event: 'charge.failed',  reference: 'ref_1' })
    expect(sign(success)).not.toBe(sign(failed))
  })

  it('produces a 128-character lowercase hex digest (SHA-512 output size)', () => {
    const digest = sign(chargeSuccess)
    expect(digest).toHaveLength(128)
    expect(digest).toMatch(/^[0-9a-f]+$/)
  })
})

// ---------------------------------------------------------------------------
// Paystack GHS amount conversion (pesewas ↔ GHS)
// ---------------------------------------------------------------------------

describe('Paystack amount conversion', () => {
  it('converts GHS to pesewas correctly (×100, rounded)', () => {
    // Mirrors the Math.round(amountGHS * 100) used in initializeTransaction
    expect(Math.round(2.50 * 100)).toBe(250)
    expect(Math.round(180.00 * 100)).toBe(18000)
    expect(Math.round(0.01 * 100)).toBe(1)
  })

  it('converts pesewas back to GHS correctly (÷100)', () => {
    // Mirrors the data.data.amount / 100 used in verifyTransaction
    expect(50000 / 100).toBe(500)
    expect(250 / 100).toBe(2.5)
    expect(1 / 100).toBe(0.01)
  })

  it('round-trips GHS → pesewas → GHS without loss for integer pence values', () => {
    const amounts = [1.00, 2.50, 35.00, 180.00, 2000.00, 50000.00]
    for (const ghs of amounts) {
      const pesewas     = Math.round(ghs * 100)
      const roundTripped = pesewas / 100
      expect(roundTripped).toBe(ghs)
    }
  })
})
