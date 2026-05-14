import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  update:     vi.fn(),
}))

vi.mock('../src/config/database.js', () => ({
  prisma: {
    profile: {
      findUnique: mocks.findUnique,
      update:     mocks.update,
    },
  },
}))

import { getBNPLTier, getScoreBreakdownTips, recalculateAgroScore } from '../src/lib/score.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFarmerProfile(overrides: Record<string, unknown> = {}) {
  return {
    farmName:          null,
    farmSizeAcres:     null,
    gpsLat:            null,
    gpsLng:            null,
    farmPhotos:        [] as string[],
    mobileMoneyNumber: null,
    nationalId:        null,
    ...overrides,
  }
}

function makeDbProfile(overrides: {
  farmerProfile?: Record<string, unknown> | null
  verificationLevel?: string
  ordersAsSeller?: unknown[]
  bnplApplications?: { status: string }[]
  reviewsReceived?: { rating: number }[]
  createdAt?: Date
} = {}) {
  return {
    farmerProfile:    makeFarmerProfile(overrides.farmerProfile ?? {}),
    verificationLevel: overrides.verificationLevel ?? 'unverified',
    ordersAsSeller:    overrides.ordersAsSeller   ?? [],
    bnplApplications:  overrides.bnplApplications ?? [],
    reviewsReceived:   overrides.reviewsReceived  ?? [],
    createdAt:         overrides.createdAt ?? new Date(),
    ...(overrides.farmerProfile === null ? { farmerProfile: null } : {}),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.update.mockResolvedValue({})
})

// ---------------------------------------------------------------------------
// getBNPLTier
// ---------------------------------------------------------------------------

describe('getBNPLTier', () => {
  it('returns null for score below 20', () => {
    expect(getBNPLTier(0)).toBeNull()
    expect(getBNPLTier(19)).toBeNull()
  })

  it('returns starter tier for score 20–49', () => {
    expect(getBNPLTier(20)).toEqual({ tier: 'starter', maxAmount: 500, interestRate: 0.08 })
    expect(getBNPLTier(49)).toEqual({ tier: 'starter', maxAmount: 500, interestRate: 0.08 })
  })

  it('returns grower tier for score 50–69', () => {
    expect(getBNPLTier(50)).toEqual({ tier: 'grower', maxAmount: 2_000, interestRate: 0.06 })
    expect(getBNPLTier(69)).toEqual({ tier: 'grower', maxAmount: 2_000, interestRate: 0.06 })
  })

  it('returns established tier for score 70–89', () => {
    expect(getBNPLTier(70)).toEqual({ tier: 'established', maxAmount: 10_000, interestRate: 0.05 })
    expect(getBNPLTier(89)).toEqual({ tier: 'established', maxAmount: 10_000, interestRate: 0.05 })
  })

  it('returns commercial tier for score 90–110', () => {
    expect(getBNPLTier(90)).toEqual({ tier: 'commercial', maxAmount: 50_000, interestRate: 0.04 })
    expect(getBNPLTier(110)).toEqual({ tier: 'commercial', maxAmount: 50_000, interestRate: 0.04 })
  })

  it('respects tier boundaries exactly (89 vs 90)', () => {
    expect(getBNPLTier(89)!.tier).toBe('established')
    expect(getBNPLTier(90)!.tier).toBe('commercial')
  })

  it('respects tier boundaries exactly (49 vs 50)', () => {
    expect(getBNPLTier(49)!.tier).toBe('starter')
    expect(getBNPLTier(50)!.tier).toBe('grower')
  })
})

// ---------------------------------------------------------------------------
// getScoreBreakdownTips
// ---------------------------------------------------------------------------

describe('getScoreBreakdownTips', () => {
  it('returns all four tips when every component is zero', () => {
    const tips = getScoreBreakdownTips({
      profileCompleteness: 0,
      verificationLevel:   0,
      orderHistory:        0,
      repaymentHistory:    0,
      platformTenure:      0,
      communityRating:     0,
    })
    expect(tips).toHaveLength(4)
    expect(tips[0]).toContain('farm photos')
    expect(tips[1]).toContain('field-verified')
    expect(tips[2]).toContain('orders')
    expect(tips[3]).toContain('BNPL')
  })

  it('returns no tips when all scored components are at or above thresholds', () => {
    const tips = getScoreBreakdownTips({
      profileCompleteness: 16,
      verificationLevel:   20,
      orderHistory:        10,
      repaymentHistory:    15,
      platformTenure:      10,
      communityRating:     10,
    })
    expect(tips).toHaveLength(0)
  })

  it('returns only the verification tip when everything else is maxed', () => {
    const tips = getScoreBreakdownTips({
      profileCompleteness: 20,
      verificationLevel:   10, // self-declared — below field_verified threshold
      orderHistory:        20,
      repaymentHistory:    20,
      platformTenure:      10,
      communityRating:     10,
    })
    expect(tips).toHaveLength(1)
    expect(tips[0]).toContain('field-verified')
  })

  it('returns only the profile tip when profileCompleteness is 15', () => {
    const tips = getScoreBreakdownTips({
      profileCompleteness: 15, // just below 16
      verificationLevel:   20,
      orderHistory:        10,
      repaymentHistory:    15,
      platformTenure:      0,
      communityRating:     0,
    })
    expect(tips).toHaveLength(1)
    expect(tips[0]).toContain('farm photos')
  })
})

// ---------------------------------------------------------------------------
// recalculateAgroScore
// ---------------------------------------------------------------------------

describe('recalculateAgroScore', () => {
  it('returns 0 when the profile row does not exist', async () => {
    mocks.findUnique.mockResolvedValue(null)
    const score = await recalculateAgroScore('farmer-none')
    expect(score).toBe(0)
    expect(mocks.update).not.toHaveBeenCalled()
  })

  it('returns 0 when farmerProfile relation is null', async () => {
    mocks.findUnique.mockResolvedValue(makeDbProfile({ farmerProfile: null }))
    const score = await recalculateAgroScore('farmer-no-fp')
    expect(score).toBe(0)
    expect(mocks.update).not.toHaveBeenCalled()
  })

  it('scores a fully-complete profile as 20 completeness points', async () => {
    mocks.findUnique.mockResolvedValue(makeDbProfile({
      farmerProfile: {
        farmName:          'Asante Farm',
        farmSizeAcres:     10,
        gpsLat:            6.5,
        gpsLng:            -1.3,
        farmPhotos:        ['a.jpg', 'b.jpg'],
        mobileMoneyNumber: '0241234567',
        nationalId:        'GHA-001-001',
      },
    }))
    const score = await recalculateAgroScore('farmer-full-profile')
    // 20 profile + 0 verification + 0 orders + 10 bnpl-default + 0 tenure + 0 rating = 30
    expect(score).toBe(30)
  })

  it('awards correct verification level points', async () => {
    const levels: [string, number][] = [
      ['unverified',     0],
      ['self_declared',  10],
      ['field_verified', 20],
      ['premium',        30],
    ]
    for (const [level, expected] of levels) {
      mocks.findUnique.mockResolvedValue(makeDbProfile({ verificationLevel: level }))
      const score = await recalculateAgroScore('farmer-v')
      // 0 profile + expected verification + 0 orders + 10 bnpl-default + 0 tenure + 0 rating
      expect(score).toBe(expected + 10)
    }
  })

  it('awards 10 BNPL default points when no BNPL history exists', async () => {
    mocks.findUnique.mockResolvedValue(makeDbProfile({ bnplApplications: [] }))
    const score = await recalculateAgroScore('farmer-new')
    expect(score).toBe(10) // only the default BNPL points
  })

  it('calculates partial order history (5 orders = 10 pts)', async () => {
    const fiveOrders = Array.from({ length: 5 }, () => ({}))
    mocks.findUnique.mockResolvedValue(makeDbProfile({ ordersAsSeller: fiveOrders }))
    const score = await recalculateAgroScore('farmer-5-orders')
    // 0 + 0 + 10 (5/10 * 20) + 10 bnpl-default + 0 + 0 = 20
    expect(score).toBe(20)
  })

  it('caps order history contribution at 20 pts even with 100+ orders', async () => {
    const hundredOrders = Array.from({ length: 100 }, () => ({}))
    mocks.findUnique.mockResolvedValue(makeDbProfile({ ordersAsSeller: hundredOrders }))
    const score = await recalculateAgroScore('farmer-100-orders')
    // max 20 order pts + 10 bnpl-default = 30
    expect(score).toBe(30)
  })

  it('calculates BNPL repayment ratio (2 repaid / 4 total = 10 pts)', async () => {
    mocks.findUnique.mockResolvedValue(makeDbProfile({
      bnplApplications: [
        { status: 'repaid' },
        { status: 'repaid' },
        { status: 'active' },
        { status: 'overdue' },
      ],
    }))
    const score = await recalculateAgroScore('farmer-bnpl')
    // 0 + 0 + 0 + 10 (2/4 * 20 = 10) + 0 + 0 = 10
    expect(score).toBe(10)
  })

  it('uses community rating component correctly (avg 4/5 = 8 pts)', async () => {
    mocks.findUnique.mockResolvedValue(makeDbProfile({
      reviewsReceived: [
        { rating: 4 }, { rating: 4 }, { rating: 4 },
      ],
    }))
    const score = await recalculateAgroScore('farmer-rated')
    // 0 + 0 + 0 + 10 bnpl-default + 0 + 8 (4/5 * 10 = 8) = 18
    expect(score).toBe(18)
  })

  it('caps the final score at 110', async () => {
    const twoYearsAgo    = new Date(Date.now() - 1000 * 60 * 60 * 24 * 30 * 24)
    const hundredOrders  = Array.from({ length: 100 }, () => ({}))
    const tenFiveStars   = Array.from({ length: 10 },  () => ({ rating: 5 }))

    mocks.findUnique.mockResolvedValue({
      farmerProfile: {
        farmName:          'Elite Farm Ghana',
        farmSizeAcres:     500,
        gpsLat:            7.0,
        gpsLng:            -1.0,
        farmPhotos:        ['a.jpg', 'b.jpg', 'c.jpg'],
        mobileMoneyNumber: '0201234567',
        nationalId:        'GHA-999-TOP',
      },
      verificationLevel: 'premium',
      ordersAsSeller:    hundredOrders,
      bnplApplications:  [{ status: 'repaid' }],
      reviewsReceived:   tenFiveStars,
      createdAt:         twoYearsAgo,
    })
    const score = await recalculateAgroScore('farmer-elite')
    expect(score).toBe(110)
  })

  it('persists the computed score to the database', async () => {
    mocks.findUnique.mockResolvedValue(makeDbProfile())
    await recalculateAgroScore('farmer-persist')
    expect(mocks.update).toHaveBeenCalledOnce()
    expect(mocks.update).toHaveBeenCalledWith({
      where: { id: 'farmer-persist' },
      data:  { agroScore: expect.any(Number) },
    })
  })
})
