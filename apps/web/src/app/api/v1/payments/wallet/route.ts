import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let wallet = await prisma.wallet.findUnique({ where: { userId: profile.id } })
  if (!wallet) {
    wallet = await prisma.wallet.create({ data: { userId: profile.id } })
  }

  return NextResponse.json({
    success: true,
    data: {
      id:             wallet.id,
      userId:         wallet.userId,
      balance:        Number(wallet.balance),
      pendingBalance: Number(wallet.pendingBalance),
      totalEarned:    Number(wallet.totalEarned),
      totalWithdrawn: Number(wallet.totalWithdrawn),
      updatedAt:      wallet.updatedAt.toISOString(),
    },
  })
}
