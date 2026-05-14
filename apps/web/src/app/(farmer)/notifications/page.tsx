'use client'

import { useEffect, useState } from 'react'
import { api }                  from '@/lib/api'

interface Notification {
  id:        string
  type:      string
  title:     string
  body:      string
  channel:   string
  isRead:    boolean
  createdAt: string
}

const TYPE_ICON: Record<string, string> = {
  order_placed:       '📦',
  order_confirmed:    '✓',
  order_dispatched:   '🚚',
  order_delivered:    '✓',
  payment_received:   '💳',
  pledge_update:      '🌱',
  weather_alert:      '⚠',
  price_alert:        '📊',
  bnpl_approved:      '💰',
  bnpl_due:           '⏰',
  score_updated:      '⭐',
  verification:       '✓',
}

function typeIcon(type: string) {
  return TYPE_ICON[type] ?? '🔔'
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unread, setUnread]               = useState(0)
  const [loading, setLoading]             = useState(true)
  const [page, setPage]                   = useState(1)
  const [pages, setPages]                 = useState(1)

  const load = (p: number) => {
    setLoading(true)
    api.get(`/notifications?page=${p}`).then(res => {
      setNotifications(res.data.data ?? [])
      setUnread(res.data.unreadCount ?? 0)
      setPages(res.data.pagination?.pages ?? 1)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load(page) }, [page])

  const markRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    setUnread(prev => Math.max(0, prev - 1))
  }

  const markAllRead = async () => {
    await api.post('/notifications/read-all')
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnread(0)
  }

  return (
    <div className="max-w-xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest">Notifications</h1>
          {unread > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">{unread} unread</p>
          )}
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-semibold text-forest hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-14 bg-cream-dark rounded-xl animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 bg-cream-dark rounded-2xl flex items-center justify-center mx-auto mb-3">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-muted-foreground fill-current">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">No notifications yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map(n => (
              <button
                key={n.id}
                onClick={() => !n.isRead && markRead(n.id)}
                className={`w-full text-left px-5 py-4 flex items-start gap-4 transition-colors
                            ${n.isRead ? '' : 'bg-lime/10 hover:bg-lime/20'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                                 text-base ${n.isRead ? 'bg-cream-dark' : 'bg-lime/30'}`}>
                  {typeIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm leading-snug ${n.isRead ? 'text-forest' : 'font-semibold text-forest'}`}>
                      {n.title}
                    </p>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-forest flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(n.createdAt).toLocaleDateString('en-GH', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="px-5 py-4 border-t border-border flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="text-xs font-semibold text-forest disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs text-muted-foreground">Page {page} of {pages}</span>
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages || loading}
              className="text-xs font-semibold text-forest disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
