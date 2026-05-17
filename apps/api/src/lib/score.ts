import { prisma } from '../config/database.js'

export interface AgroScoreComponents {
  profileCompleteness: number
  verificationLevel:   number
  orderHistory:        number
  repaymentHistory:    number
  platformTenure:      number
  communityRating:     number
}

export async function recalculateAgroScore(farmerId: string): Promise<number> {
  const farmer = await prisma.profile.findUnique({
    where:   { id: farmerId },
    include: {
      farmerProfile:    true,
      ordersAsSeller:   { where: { trackingStatus: 'delivered' } },
      bnplApplications: true,
      reviewsReceived:  true,
    },
  })

  if (!farmer?.farmerProfile) return 0

  let score = 0
  const fp  = farmer.farmerProfile

  // Profile completeness — max 20
  if (fp.farmName)                   score += 2
  if (fp.farmSizeAcres)              score += 2
  if (fp.gpsLat && fp.gpsLng)       score += 4
  if (fp.farmPhotos.length >= 2)     score += 4
  if (fp.mobileMoneyNumber)          score += 4
  if (fp.nationalId)                 score += 4

  // Verification level — max 30
  const verificationPts: Record<string, number> = {
    unverified:     0,
    self_declared:  10,
    field_verified: 20,
    premium:        30,
  }
  score += verificationPts[farmer.verificationLevel] ?? 0

  // Order history — max 20
  const completedOrders = farmer.ordersAsSeller.length
  score += Math.round(Math.min(completedOrders / 10, 1) * 20)

  // Repayment history — max 20
  const totalBNPL = farmer.bnplApplications.length
  if (totalBNPL > 0) {
    const repaid = farmer.bnplApplications.filter((a: { status: string }) => a.status === 'repaid').length
    score += Math.round((repaid / totalBNPL) * 20)
  } else {
    score += 10
  }

  // Platform tenure — max 10
  const months = Math.floor(
    (Date.now() - farmer.createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30),
  )
  score += Math.min(Math.floor(months / 2), 10)

  // Community rating — max 10
  const reviews = farmer.reviewsReceived
  if (reviews.length > 0) {
    const avg = reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviews.length
    score += Math.round((avg / 5) * 10)
  }

  const finalScore = Math.min(score, 110)

  await prisma.profile.update({
    where: { id: farmerId },
    data:  { agroScore: finalScore },
  })

  return finalScore
}

export function getBNPLTier(score: number): {
  tier: string; maxAmount: number; interestRate: number
} | null {
  if (score >= 90) return { tier: 'commercial',  maxAmount: 50_000, interestRate: 0.04 }
  if (score >= 70) return { tier: 'established', maxAmount: 10_000, interestRate: 0.05 }
  if (score >= 50) return { tier: 'grower',      maxAmount: 2_000,  interestRate: 0.06 }
  if (score >= 20) return { tier: 'starter',     maxAmount: 500,    interestRate: 0.08 }
  return null
}

export function getScoreBreakdownTips(components: AgroScoreComponents): string[] {
  const tips: string[] = []

  if (components.profileCompleteness < 16) {
    tips.push('Upload at least 2 farm photos to earn more profile points.')
  }
  if (components.verificationLevel < 20) {
    tips.push('Get field-verified by a GENE agent to unlock GHS 2,000+ BNPL credit.')
  }
  if (components.orderHistory < 10) {
    tips.push('Complete more orders to build your trading history.')
  }
  if (components.repaymentHistory < 15) {
    tips.push('Repay BNPL loans on time to maximize your repayment score.')
  }

  return tips
}
