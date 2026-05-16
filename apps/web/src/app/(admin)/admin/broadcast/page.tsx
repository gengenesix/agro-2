'use client'

import { useState }    from 'react'
import { api }         from '@/lib/api'
import { LoadingIcon, BellIcon } from '@/components/shared/icons'
import { GHANA_REGIONS } from '@/lib/types'

type Channel = 'sms' | 'in_app' | 'both'
type Target  = 'all' | 'farmers' | 'dealers' | 'buyers' | 'region'

export default function AdminBroadcastPage() {
  const [message, setMessage]   = useState('')
  const [channel, setChannel]   = useState<Channel>('both')
  const [target, setTarget]     = useState<Target>('all')
  const [regionId, setRegionId] = useState('')
  const [sending, setSending]   = useState(false)
  const [sent, setSent]         = useState(false)
  const [error, setError]       = useState('')
  const [preview, setPreview]   = useState(false)

  async function send() {
    if (!message.trim()) { setError('Message is required.'); return }
    setSending(true)
    setError('')
    try {
      await api.post('/admin/broadcast', {
        message: message.trim(),
        channel,
        targetRole: target === 'region' ? undefined : (target === 'all' ? undefined : target),
        regionId: target === 'region' && regionId ? Number(regionId) : undefined,
      })
      setSent(true)
      setMessage('')
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Broadcast failed.')
    } finally {
      setSending(false)
    }
  }

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="font-bold text-forest text-lg">Broadcast</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Send SMS and in-app notifications to users</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {sent && (
          <div className="bg-lime/20 border border-lime/40 rounded-2xl px-5 py-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-forest rounded-full flex items-center justify-center">
              <svg viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="2"
                   strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M3 8l3 3 7-7" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-forest">Broadcast sent successfully!</p>
            <button onClick={() => setSent(false)} className="ml-auto text-xs font-semibold text-forest hover:underline">
              Send another
            </button>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-border p-5 space-y-5">
          {/* Target */}
          <div>
            <label className="text-xs font-bold text-forest uppercase tracking-wider block mb-2.5">
              Target audience
            </label>
            <div className="flex flex-wrap gap-2">
              {([
                { value: 'all',     label: 'All users'  },
                { value: 'farmers', label: 'Farmers'    },
                { value: 'dealers', label: 'Dealers'    },
                { value: 'buyers',  label: 'Buyers'     },
                { value: 'region',  label: 'By region'  },
              ] as const).map(t => (
                <button key={t.value} onClick={() => setTarget(t.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors
                    ${target === t.value ? 'bg-forest text-white border-forest'
                                         : 'bg-white text-muted-foreground border-border hover:border-forest hover:text-forest'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {target === 'region' && (
              <select value={regionId} onChange={e => setRegionId(e.target.value)}
                className="mt-3 w-full px-4 py-2.5 bg-cream border border-border rounded-xl text-sm
                           text-forest focus:border-forest focus:outline-none">
                <option value="">Select region…</option>
                {GHANA_REGIONS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            )}
          </div>

          {/* Channel */}
          <div>
            <label className="text-xs font-bold text-forest uppercase tracking-wider block mb-2.5">
              Channel
            </label>
            <div className="flex gap-2">
              {([
                { value: 'sms',    label: 'SMS only'    },
                { value: 'in_app', label: 'In-app only' },
                { value: 'both',   label: 'SMS + In-app' },
              ] as const).map(c => (
                <button key={c.value} onClick={() => setChannel(c.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors
                    ${channel === c.value ? 'bg-forest text-white border-forest'
                                          : 'bg-white text-muted-foreground border-border hover:border-forest hover:text-forest'}`}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-forest uppercase tracking-wider">Message</label>
              <span className={`text-[10px] font-mono ${message.length > 160 ? 'text-red-500' : 'text-muted-foreground'}`}>
                {message.length}/160
              </span>
            </div>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              placeholder="Type your broadcast message here…"
              className="w-full px-4 py-3 bg-cream border border-border rounded-xl text-sm text-forest
                         placeholder:text-muted-foreground focus:border-forest focus:outline-none
                         focus:ring-2 focus:ring-forest/10 resize-none"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-xl">{error}</p>
          )}

          {/* SMS preview */}
          {preview && message && (
            <div className="bg-cream rounded-xl p-4 border border-border">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">SMS preview</p>
              <div className="bg-white rounded-xl p-3 shadow-sm">
                <p className="text-xs font-bold text-forest mb-1">AgroConnect</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setPreview(p => !p)}
              className="flex-1 py-3 border border-border text-forest text-sm font-bold rounded-xl
                         hover:bg-cream transition-colors">
              {preview ? 'Hide preview' : 'Preview SMS'}
            </button>
            <button onClick={send} disabled={sending || !message.trim()}
              className="flex-1 py-3 bg-forest text-white text-sm font-bold rounded-xl
                         hover:bg-forest-dark active:scale-[0.98] transition-all
                         disabled:opacity-50 flex items-center justify-center gap-2">
              {sending ? <><LoadingIcon size={15} className="animate-spin" /> Sending…</> : (
                <><BellIcon size={15} /> Send broadcast</>
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
