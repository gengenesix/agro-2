import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const applications = await prisma.bNPLApplication.findMany({
    where:   { farmerId: profile.id },
    orderBy: { appliedAt: 'desc' },
    take:    10,
    include: { order: { select: { orderNumber: true } } },
  })

  return NextResponse.json({
    success: true,
    data: {
      applications: applications.map(a => ({
        id:            a.id,
        amount:        Number(a.amountRequested),
        approvedAmount:a.amountApproved ? Number(a.amountApproved) : null,
        status:        a.status,
        tier:          a.creditTier,
        interestRate:  Number(a.interestRate),
        totalRepayable:a.totalRepayable ? Number(a.totalRepayable) : null,
        dueDate:       a.dueDate?.toISOString()    ?? null,
        appliedAt:     a.appliedAt.toISOString(),
        repaidAt:      a.repaidAt?.toISOString()   ?? null,
        orderNumber:   a.order.orderNumber,
      })),
    },
  })
}
