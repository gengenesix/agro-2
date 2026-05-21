'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/context/auth-context'
import { api } from '@/lib/api'
import { formatPhoneGhana } from '@/lib/format'
import { LoadingIcon } from '@/components/shared/icons'
import { GHANA_REGIONS } from '@/lib/types'

interface ProfileForm {
  fullName:  string
  email:     string
  regionId:  number | null
  community: string
}

export default function ConsumerProfilePage() {
  const { user, refresh } = useAuth()
  const [form, setForm]   = useState<ProfileForm>({
    fullName:  '',
    email:     '',
    regionId:  null,
    community: '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      setForm({
        fullName:  user.fullName  ?? '',
        email:     user.email     ?? '',
        regionId:  user.regionId  ?? null,
        community: user.community ?? '',
      })
    }
  }, [user])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await api.patch('/users/me', {
        fullName:  form.fullName,
        email:     form.email || undefined,
        regionId:  form.regionId,
        community: form.community || undefined,
      })
      await refresh()
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="font-bold text-forest text-lg">My Profile</h1>
          {user?.phone && (
            <p className="text-xs text-muted-foreground">{formatPhoneGhana(user.phone)}</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="max-w-lg mx-auto px-4 py-6 space-y-5">
        <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
          <h2 className="font-bold text-forest text-sm">Personal information</h2>

          <div>
            <label className="text-xs font-bold text-forest uppercase tracking-wider block mb-2">
              Full name <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.fullName}
              onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
              placeholder="Your full name"
              className="w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-cream
                         focus:border-forest focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-forest uppercase tracking-wider block mb-2">
              Email address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="your@email.com"
              className="w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-cream
                         focus:border-forest focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-forest uppercase tracking-wider block mb-2">
              Region
            </label>
            <select
              value={form.regionId ?? ''}
              onChange={e => setForm(f => ({ ...f, regionId: e.target.value ? Number(e.target.value) : null }))}
              className="w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-cream
                         focus:border-forest focus:outline-none"
            >
              <option value="">Select region…</option>
              {GHANA_REGIONS.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-forest uppercase tracking-wider block mb-2">
              Community / Town
            </label>
            <input
              value={form.community}
              onChange={e => setForm(f => ({ ...f, community: e.target.value }))}
              placeholder="e.g. Osu, Accra"
              className="w-full px-4 py-2.5 text-sm border border-border rounded-xl bg-cream
                         focus:border-forest focus:outline-none"
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-forest text-white text-sm font-bold rounded-xl
                     hover:bg-forest-dark transition-colors disabled:opacity-60
                     flex items-center justify-center gap-2"
        >
          {saving
            ? <><LoadingIcon size={16} className="animate-spin" /> Saving…</>
            : saved
            ? 'Saved!'
            : 'Save profile'
          }
        </button>
      </form>
    </main>
  )
}
