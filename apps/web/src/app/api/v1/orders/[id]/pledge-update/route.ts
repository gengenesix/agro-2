import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

const schema = z.object({
  progress: z.enum(['planted', 'growing', 'ready_to_harvest', 'harvested', 'dispatched', 'delivered']),
  note:     z.string().max(500).optional(),
})

// Ordered stages — seller can only advance forward, never go back
const PROGRESS_ORDER = [
  'planted',
  'growing',
  'ready_to_harvest',
  'harvested',
  'dispatched',
  'delivered',
] as const

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const order = await prisma.order.findFirst({
    where: { id, sellerId: profile.id, orderType: 'harvest_pledge' },
  })

  if (!order) {
    return NextResponse.json(
      { success: false, error: 'Harvest pledge order not found' },
      { status: 404 },
    )
  }

  let body: unknown
  try { body = await req.json() } catch { body = {} }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    )
  }

  const { progress, note } = parsed.data

  const currentIdx = order.pledgeProgress
    ? PROGRESS_ORDER.indexOf(order.pledgeProgress as typeof PROGRESS_ORDER[number])
    : -1
  const nextIdx = PROGRESS_ORDER.indexOf(progress)

  if (nextIdx <= currentIdx) {
    return NextResponse.json(
      {
        success: false,
        error:   `Cannot set progress to '${progress}' — order is already at '${order.pledgeProgress ?? 'none'}' or further.`,
      },
      { status: 400 },
    )
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      pledgeProgress: progress,
      ...(note ? { sellerNotes: note } : {}),
    },
  })

  return NextResponse.json({
    success: true,
    data: {
      id:             updated.id,
      orderNumber:    updated.orderNumber,
      pledgeProgress: updated.pledgeProgress,
      sellerNotes:    updated.sellerNotes,
    },
  })
}
