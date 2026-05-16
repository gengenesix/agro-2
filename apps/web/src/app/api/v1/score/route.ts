import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const [fp, orderCount, bnplApps, reviews] = await Promise.all([
    prisma.farmerProfile.findUnique({ where: { userId: profile.id } }),
    prisma.order.count({ where: { sellerId: profile.id, trackingStatus: { in: ['delivered', 'cancelled'] } } }),
    prisma.bNPLApplication.findMany({
      where: { farmerId: profile.id },
      select: { status: true },
    }),
    prisma.review.aggregate({
      where: { revieweeId: profile.id },
      _avg: { rating: true },
      _count: true,
    }),
  ])

  // Profile completeness (0–20)
  let profileScore = 0
  if (profile.fullName && profile.fullName.length > 1) profileScore += 4
  if (fp?.farmName)          profileScore += 4
  if (fp?.gpsLat)            profileScore += 4
  if (fp?.mobileMoneyNumber) profileScore += 4
  if (profile.regionId)      profileScore += 2
  if (fp?.farmPhotos && fp.farmPhotos.length >= 2) profileScore += 2

  // Verification (0–30)
  const verificationScore =
    profile.verificationLevel === 'premium'      ? 30 :
    profile.verificationLevel === 'field_verified'? 20 :
    profile.verificationLevel === 'self_declared' ? 10 : 0

  // Order history (0–20)
  const orderScore = Math.min(orderCount, 20)

  // Repayment history (0–20)
  const repaid = bnplApps.filter(a => a.status === 'repaid').length
  const total  = bnplApps.filter(a => ['repaid', 'defaulted'].includes(a.status)).length
  const repaymentScore = total === 0 ? 10 : Math.round((repaid / total) * 20)

  // Tenure (0–10)
  const months = Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30))
  const tenureScore = Math.min(Math.floor(months / 2), 10)

  // Community rating (0–10)
  const avgRating = reviews._avg.rating ?? 0
  const ratingScore = Math.round((avgRating / 5) * 10)

  const totalScore = profileScore + verificationScore + orderScore + repaymentScore + tenureScore + ratingScore

  // Completeness items
  const completenessItems = [
    { label: 'Full name',         done: !!(profile.fullName && profile.fullName.length > 1) },
    { label: 'Farm name',         done: !!fp?.farmName },
    { label: 'GPS location',      done: !!fp?.gpsLat },
    { label: 'Mobile Money',      done: !!fp?.mobileMoneyNumber },
    { label: 'Region',            done: !!profile.regionId },
    { label: '2+ farm photos',    done: !!(fp?.farmPhotos && fp.farmPhotos.length >= 2) },
  ]

  return NextResponse.json({
    success: true,
    data: {
      total: totalScore,
      components: {
        profileCompleteness: { score: profileScore,      max: 20, items: completenessItems },
        verificationLevel:   { score: verificationScore, max: 30, level: profile.verificationLevel },
        orderHistory:        { score: orderScore,        max: 20, completedOrders: orderCount },
        repaymentHistory:    { score: repaymentScore,    max: 20, repaid, total },
        platformTenure:      { score: tenureScore,       max: 10, months },
        communityRating:     { score: ratingScore,       max: 10, avgRating: Number(avgRating.toFixed(1)), reviewCount: reviews._count },
      },
    },
  })
}
