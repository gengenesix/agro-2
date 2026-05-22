'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { formatRelative } from '@/lib/format'

export interface NotificationItem {
  id:        string
  type:      string
  title:     string
  body:      string
  actionUrl: string | null
  isRead:    boolean
  createdAt: string
}

interface NotificationPanelProps {
  isOpen:  boolean
  onClose: () => void
}

// Financial settlements → forest green
// Transit / logistics  → amber
// Verification success → lime
// Alerts / disputes    → red
// Everything else      → neutral border
const FINANCIAL = new Set(['ESCROW_RELEASED', 'ESCROW_HOLD', 'PAYMENT_RECEIVED', 'WITHDRAWAL', 'COMMISSION', 'CREDIT', 'REFUND'])
const TRANSIT   = new Set(['ORDER_DISPATCHED', 'ORDER_IN_TRANSIT', 'ORDER_DELIVERED', 'ORDER_CONFIRMED', 'ORDER_SHIPPED', 'ORDER_PREPARING'])
const SUCCESS   = new Set(['VERIFICATION_SUCCESS', 'FARMER_VERIFIED', 'BNPL_APPROVED', 'ORDER_COMPLETED'])
const ALERT     = new Set(['PEST_ALERT', 'WEATHER_ALERT', 'DISPUTE_OPENED', 'ORDER_CANCELLED', 'BNPL_OVERDUE'])

function borderFor(type: string): string {
  if (FINANCIAL.has(type)) return 'border-l-4 border-forest'
  if (TRANSIT.has(type))   return 'border-l-4 border-amber-500'
  if (SUCCESS.has(type))   return 'border-l-4 border-lime-dark'
  if (ALERT.has(type))     return 'border-l-4 border-red-400'
  return 'border-l-4 border-border'
}

function dotFor(type: string): string {
  if (FINANCIAL.has(type)) return 'bg-forest'
  if (TRANSIT.has(type))   return 'bg-amber-500'
  if (SUCCESS.has(type))   return 'bg-lime-dark'
  if (ALERT.has(type))     return 'bg-red-400'
  return 'bg-muted-foreground'
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const router = useRouter()
  const [items,   setItems]   = useState<NotificationItem[]>([])
  const [unread,  setUnread]  = useState(0)
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/notifications?page=1')
      setItems(res.data.data ?? [])
      setUnread(res.data.unreadCount ?? 0)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) load()
  }, [isOpen, load])

  async function markOne(id: string) {
    await api.patch(`/notifications/${id}/read`).catch(() => {})
    setItems(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    setUnread(prev => Math.max(0, prev - 1))
  }

  async function markAll() {
    await api.post('/notifications/read-all').catch(() => {})
    setItems(prev => prev.map(n => ({ ...n, isRead: true })))
    setUnread(0)
  }

  async function handleClick(n: NotificationItem) {
    if (!n.isRead) await markOne(n.id)
    if (n.actionUrl) {
      onClose()
      router.push(n.actionUrl)
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300
                    ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Slide-out panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-sm bg-white shadow-2xl
                    flex flex-col transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <h2 className="font-bold text-forest text-base">Notifications</h2>
            {unread > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full leading-none">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {unread > 0 && (
              <button
                onClick={markAll}
                className="text-xs font-semibold text-forest hover:text-forest-dark transition-colors"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-forest hover:bg-cream transition-colors"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75"
                   className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3l10 10M13 3L3 13" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-cream-dark rounded-xl animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 px-6 text-center">
              <div className="w-14 h-14 bg-cream-dark rounded-full flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                     className="w-7 h-7 text-muted-foreground" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
              <p className="font-bold text-forest text-sm">All caught up</p>
              <p className="text-xs text-muted-foreground mt-1">No notifications yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {items.map(n => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={`w-full text-left px-5 py-4 transition-colors hover:bg-cream/60
                              ${borderFor(n.type)}
                              ${!n.isRead ? 'bg-cream/30' : 'bg-white'}`}
                >
                  <div className="flex items-start gap-3">
                    {/* Type dot */}
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotFor(n.type)}`} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-snug ${
                          n.isRead ? 'text-muted-foreground font-medium' : 'text-forest font-bold'
                        }`}>
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                        {n.body}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1.5">
                        {formatRelative(n.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-5 py-3 flex-shrink-0">
          <p className="text-[10px] text-muted-foreground text-center">
            Showing latest 20 notifications
          </p>
        </div>
      </div>
    </>
  )
}
