import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

  const [totalVerified, verifiedThisMonth, pendingInRegion, wallet, monthEarnings] = await Promise.all([
    prisma.farmerProfile.count({
      where: { fieldAgentId: profile.id },
    }),
    prisma.farmerProfile.count({
      where: { fieldAgentId: profile.id, fieldVerifiedAt: { gte: monthStart } },
    }),
    prisma.profile.count({
      where: {
        role:              'farmer',
        verificationLevel: 'unverified',
        ...(profile.regionId ? { regionId: profile.regionId } : {}),
      },
    }),
    prisma.wallet.findUnique({ where: { userId: profile.id } }),
    prisma.walletTransaction.aggregate({
      where: {
        wallet:    { userId: profile.id },
        type:      'credit',
        createdAt: { gte: monthStart },
      },
      _sum: { amount: true },
    }),
  ])

  return NextResponse.json({
    success: true,
    data: {
      totalVerified,
      verifiedThisMonth,
      pendingInRegion,
      earningsThisMonth: Number(monthEarnings._sum.amount ?? 0),
      walletBalance:     Number(wallet?.balance ?? 0),
    },
  })
}
