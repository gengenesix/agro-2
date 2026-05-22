import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const url   = new URL(req.url)
  const page  = Math.max(1, Number(url.searchParams.get('page') ?? 1))
  const limit = 20

  const [total, unread, notifications] = await Promise.all([
    prisma.notification.count({ where: { userId: profile.id } }),
    prisma.notification.count({ where: { userId: profile.id, isRead: false } }),
    prisma.notification.findMany({
      where:   { userId: profile.id },
      orderBy: { createdAt: 'desc' },
      skip:    (page - 1) * limit,
      take:    limit,
    }),
  ])

  return NextResponse.json({
    success: true,
    data: notifications.map(n => ({
      id:        n.id,
      type:      n.type,
      title:     n.title,
      body:      n.body,
      actionUrl: (n.data as { actionUrl?: string } | null)?.actionUrl ?? null,
      isRead:    n.isRead,
      createdAt: n.createdAt.toISOString(),
    })),
    unreadCount: unread,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}
