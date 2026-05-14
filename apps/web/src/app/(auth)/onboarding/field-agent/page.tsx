'use client'

import { useState }          from 'react'
import { useRouter }         from 'next/navigation'
import { useForm }           from 'react-hook-form'
import { zodResolver }       from '@hookform/resolvers/zod'
import { z }                 from 'zod'
import { api }               from '@/lib/api'
import { GHANA_REGIONS }     from '@agroconnect/types'

const schema = z.object({
  fullName:   z.string().min(2, 'Enter your full name'),
  regionId:   z.string().min(1, 'Select your region'),
  community:  z.string().optional(),
  nationalId: z.string().min(5, 'Enter your Ghana Card number'),
  agreeTerms: z.literal(true, { errorMap: () => ({ message: 'You must agree to the terms' }) }),
})
type FormValues = z.infer<typeof schema>

export default function FieldAgentOnboardingPage() {
  const router          = useRouter()
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
        role:       'field_agent',
        fullName:   data.fullName,
        regionId:   Number(data.regionId),
        community:  data.community || undefined,
        nationalId: data.nationalId,
      })
      router.push('/field-agent/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg ?? 'Setup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-forest rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-lime fill-current">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-forest">GENE Agent Setup</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ghana Extension Network for Agriculture
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 shadow-sm">
          <div className="bg-lime/20 border border-lime/40 rounded-xl p-3 mb-6">
            <p className="text-xs text-forest font-semibold">
              As a GENE Agent, you will register and verify farmers in your region.
              You earn GHS 10 per verified farmer.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-forest mb-1.5">Full name</label>
              <input
                {...register('fullName')}
                placeholder="Your full name"
                className="w-full h-11 px-4 rounded-xl border border-border bg-cream focus:outline-none
                           focus:ring-2 focus:ring-lime text-sm"
              />
              {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-forest mb-1.5">Operating region</label>
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
              {errors.regionId && <p className="text-xs text-destructive mt-1">{errors.regionId.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-forest mb-1.5">
                Base community <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                {...register('community')}
                placeholder="e.g. Nsawam"
                className="w-full h-11 px-4 rounded-xl border border-border bg-cream focus:outline-none
                           focus:ring-2 focus:ring-lime text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-forest mb-1.5">Ghana Card number</label>
              <input
                {...register('nationalId')}
                placeholder="GHA-000000000-0"
                className="w-full h-11 px-4 rounded-xl border border-border bg-cream focus:outline-none
                           focus:ring-2 focus:ring-lime text-sm font-mono"
              />
              {errors.nationalId && <p className="text-xs text-destructive mt-1">{errors.nationalId.message}</p>}
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('agreeTerms')}
                className="mt-0.5 w-4 h-4 accent-forest flex-shrink-0"
              />
              <span className="text-xs text-muted-foreground leading-relaxed">
                I agree to the AgroConnect Field Agent terms. I will accurately record farmer
                information and only verify farms I have physically visited.
              </span>
            </label>
            {errors.agreeTerms && <p className="text-xs text-destructive">{errors.agreeTerms.message}</p>}

            {error && (
              <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-xl">{error}</div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-forest text-white rounded-xl font-bold text-sm
                         hover:bg-forest-dark transition-colors disabled:opacity-60"
            >
              {loading ? 'Setting up…' : 'Complete setup'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
