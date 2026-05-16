import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'

const TIERS = [
  { minScore: 90, tier: 'commercial',  max: 50000, rate: 4 },
  { minScore: 70, tier: 'established', max: 10000, rate: 5 },
  { minScore: 50, tier: 'grower',      max: 2000,  rate: 6 },
  { minScore: 20, tier: 'starter',     max: 500,   rate: 8 },
]

export async function GET(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const score = profile.agroScore
  const tier  = TIERS.find(t => score >= t.minScore) ?? null

  return NextResponse.json({
    success: true,
    data: {
      eligible:     !!tier,
      tier:         tier?.tier ?? null,
      maxAmount:    tier?.max ?? 0,
      interestRate: tier?.rate ?? 0,
      score,
      reason: tier
        ? null
        : `Your AgroScore of ${score} is below the minimum of 20. Complete your profile and make transactions to improve your score.`,
    },
  })
}
