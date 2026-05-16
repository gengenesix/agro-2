'use client'

import { useEffect, useState } from 'react'
import { useForm }             from 'react-hook-form'
import { zodResolver }         from '@hookform/resolvers/zod'
import { z }                   from 'zod'
import { api }                 from '@/lib/api'
import { EmptyState }          from '@/components/shared/empty-state'
import { GHANA_REGIONS }       from '@/lib/types'
import { BellIcon, PlusIcon, CloseIcon, PricesIcon } from '@/components/shared/icons'
import { formatGHS } from '@/lib/format'

interface PriceAlert {
  id:         string
  crop:       string
  regionId:   number
  region:     string
  condition:  'above' | 'below'
  targetPrice: number
  active:     boolean
  createdAt:  string
}

const alertSchema = z.object({
  crop:        z.string().min(1, 'Select a crop'),
  regionId:    z.coerce.number().min(1, 'Select a region'),
  condition:   z.enum(['above', 'below']),
  targetPrice: z.coerce.number().min(0.01, 'Enter a price'),
})

type AlertForm = z.infer<typeof alertSchema>

const CROPS = [
  'Maize', 'Rice', 'Tomato', 'Pepper', 'Onion', 'Yam', 'Cassava',
  'Plantain', 'Mango', 'Pineapple', 'Cocoa', 'Tilapia', 'Catfish',
  'Broiler Chicken', 'Eggs',
]

export default function BuyerAlertsPage() {
  const [alerts, setAlerts]     = useState<PriceAlert[]>([])
  const [loading, setLoading]   = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting },
  } = useForm<AlertForm>({ resolver: zodResolver(alertSchema) })

  function load() {
    api.get('/intelligence/alerts')
      .then(r => setAlerts(r.data.data?.alerts ?? []))
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  async function onSubmit(data: AlertForm) {
    await api.post('/intelligence/alerts', data)
    reset()
    setShowForm(false)
    load()
  }

  async function deleteAlert(id: string) {
    setDeleting(id)
    try {
      await api.delete(`/intelligence/alerts/${id}`)
      load()
    } finally {
      setDeleting(null)
    }
  }

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-forest text-lg">Price Alerts</h1>
            <p className="text-xs text-muted-foreground">Get notified when prices hit your target</p>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-forest text-white
                       rounded-xl hover:bg-forest-dark transition-colors">
            <PlusIcon size={14} /> New alert
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* Create form */}
        {showForm && (
          <div className="bg-white rounded-2xl border border-border p-5">
            <h2 className="font-bold text-forest text-sm mb-4">Set price alert</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Crop</label>
                  <select {...register('crop')}
                    className="w-full py-2.5 px-3 text-sm border border-border rounded-xl bg-cream
                               focus:border-forest focus:outline-none">
                    <option value="">Select crop</option>
                    {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.crop && <p className="text-xs text-red-500 mt-0.5">{errors.crop.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Region</label>
                  <select {...register('regionId')}
                    className="w-full py-2.5 px-3 text-sm border border-border rounded-xl bg-cream
                               focus:border-forest focus:outline-none">
                    <option value="">All regions</option>
                    {GHANA_REGIONS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Condition</label>
                  <select {...register('condition')}
                    className="w-full py-2.5 px-3 text-sm border border-border rounded-xl bg-cream
                               focus:border-forest focus:outline-none">
                    <option value="below">Price drops below</option>
                    <option value="above">Price rises above</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Target price (GHS/kg)</label>
                  <input type="number" step="0.01" min="0" {...register('targetPrice')}
                    placeholder="e.g. 2.50"
                    className="w-full py-2.5 px-3 text-sm border border-border rounded-xl bg-cream
                               focus:border-forest focus:outline-none font-mono" />
                  {errors.targetPrice && <p className="text-xs text-red-500 mt-0.5">{errors.targetPrice.message}</p>}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-forest text-white text-sm font-bold rounded-xl
                             hover:bg-forest-dark transition-colors disabled:opacity-60">
                  {isSubmitting ? 'Creating…' : 'Create alert'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 border border-border rounded-xl text-sm font-semibold
                             text-muted-foreground hover:text-forest transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Alert list */}
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-16 bg-white rounded-2xl border border-border animate-pulse" />
          ))
        ) : alerts.length === 0 ? (
          <EmptyState
            icon={<BellIcon size={32} />}
            title="No price alerts"
            description="Create an alert to be notified via SMS when crop prices hit your target."
          />
        ) : (
          alerts.map(alert => (
            <div key={alert.id}
              className={`bg-white rounded-2xl border border-border p-4 flex items-center gap-4
                ${!alert.active ? 'opacity-50' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-sector-fisheries-bg flex items-center justify-center flex-shrink-0">
                <PricesIcon size={18} className="text-sector-fisheries" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-forest">{alert.crop}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Alert when price {alert.condition}s{' '}
                  <span className="font-mono font-bold text-forest">{formatGHS(alert.targetPrice)}</span>
                  {' '}in {alert.region ?? 'All regions'}
                </p>
              </div>

              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mr-2
                ${alert.active ? 'bg-lime/20 text-forest' : 'bg-cream-dark text-muted-foreground'}`}>
                {alert.active ? 'Active' : 'Paused'}
              </span>

              <button
                disabled={deleting === alert.id}
                onClick={() => deleteAlert(alert.id)}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-red-50
                           text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-40">
                <CloseIcon size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </main>
  )
}
