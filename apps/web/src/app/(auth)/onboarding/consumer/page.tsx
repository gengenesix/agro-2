'use client'

import { useState }      from 'react'
import { useRouter }     from 'next/navigation'
import { useForm }       from 'react-hook-form'
import { zodResolver }   from '@hookform/resolvers/zod'
import { z }             from 'zod'
import { api }           from '@/lib/api'
import { GHANA_REGIONS } from '@agroconnect/types'

const schema = z.object({
  fullName: z.string().min(2, 'Enter your name'),
  regionId: z.string().min(1, 'Select your region'),
})
type FormValues = z.infer<typeof schema>

export default function ConsumerOnboardingPage() {
  const router              = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    setError(null)
    try {
      await api.post('/users/onboard', {
        role:     'consumer',
        fullName: data.fullName,
        regionId: Number(data.regionId),
      })
      router.push('/consumer')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg ?? 'Setup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-forest rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-lime fill-current">
              <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-13 6.5S11.5 20 11.5 20"/>
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-forest">Welcome to AgroConnect</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Fresh produce, direct from Ghanaian farms
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-forest mb-1.5">Your name</label>
              <input
                {...register('fullName')}
                placeholder="e.g. Abena Mensah"
                autoFocus
                className="w-full h-11 px-4 rounded-xl border border-border bg-cream focus:outline-none
                           focus:ring-2 focus:ring-lime text-sm"
              />
              {errors.fullName && (
                <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-forest mb-1.5">Your region</label>
              <select
                {...register('regionId')}
                className="w-full h-11 px-4 rounded-xl border border-border bg-cream focus:outline-none
                           focus:ring-2 focus:ring-lime text-sm"
              >
                <option value="">Select region</option>
                {GHANA_REGIONS.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
              {errors.regionId && (
                <p className="text-xs text-destructive mt-1">{errors.regionId.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-forest text-white rounded-xl font-bold text-sm
                         hover:bg-forest-dark transition-colors disabled:opacity-60"
            >
              {loading ? 'Setting up…' : 'Start shopping'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-4">
          By continuing you agree to AgroConnect's Terms of Service
        </p>
      </div>
    </div>
  )
}
