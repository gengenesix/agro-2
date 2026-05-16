import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const wallet = await prisma.wallet.findUnique({ where: { userId: profile.id } })
  if (!wallet) {
    return NextResponse.json({ success: true, data: { transactions: [] } })
  }

  const transactions = await prisma.walletTransaction.findMany({
    where:   { walletId: wallet.id },
    orderBy: { createdAt: 'desc' },
    take:    50,
  })

  return NextResponse.json({
    success: true,
    data: {
      transactions: transactions.map(t => ({
        id:          t.id,
        type:        t.type,
        amount:      Number(t.amount),
        balanceAfter: Number(t.balanceAfter),
        description: t.description,
        reference:   t.reference,
        createdAt:   t.createdAt.toISOString(),
      })),
    },
  })
}
