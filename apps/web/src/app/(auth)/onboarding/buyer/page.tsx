'use client'

import { useRouter }   from 'next/navigation'
import { useAuth }     from '@/context/auth-context'
import { api }         from '@/lib/api'
import { useForm }     from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z }           from 'zod'
import { LoadingIcon } from '@/components/shared/icons'
import { GHANA_REGIONS } from '@agroconnect/types'

const schema = z.object({
  organizationName: z.string().min(2, 'Organization name required'),
  buyerType: z.enum(['hotel', 'restaurant', 'processor', 'retailer', 'exporter', 'individual']),
  regionId:  z.coerce.number().min(1, 'Select region'),
  deliveryAddress: z.string().min(5, 'Enter delivery address'),
})
type FormData = z.infer<typeof schema>

const BUYER_TYPES = [
  { value: 'hotel',       label: 'Hotel'          },
  { value: 'restaurant',  label: 'Restaurant'     },
  { value: 'processor',   label: 'Food Processor' },
  { value: 'retailer',    label: 'Retailer'       },
  { value: 'exporter',    label: 'Exporter'       },
  { value: 'individual',  label: 'Individual'     },
]

export default function BuyerOnboardingPage() {
  const { refresh } = useAuth()
  const router      = useRouter()
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    await api.put('/users/me/buyer-profile', data)
    await refresh()
    router.push('/buyer/dashboard')
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-forest">Set up your buyer profile</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Help farmers know who they're selling to.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-border p-6 space-y-5">
          <Field label="Organization / full name" error={errors.organizationName?.message}>
            <input {...register('organizationName')} placeholder="e.g. Fresh Foods Ltd"
              className={inputCls(!!errors.organizationName)} />
          </Field>

          <Field label="Buyer type" error={errors.buyerType?.message}>
            <select {...register('buyerType')} className={inputCls(!!errors.buyerType)}>
              <option value="">Select type…</option>
              {BUYER_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Region" error={errors.regionId?.message}>
            <select {...register('regionId')} className={inputCls(!!errors.regionId)}>
              <option value="">Select region…</option>
              {GHANA_REGIONS.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Delivery address" error={errors.deliveryAddress?.message}>
            <textarea
              {...register('deliveryAddress')}
              rows={3}
              placeholder="Full delivery address including neighbourhood and city"
              className={`${inputCls(!!errors.deliveryAddress)} resize-none`}
            />
          </Field>

          <button type="submit" disabled={isSubmitting}
            className="w-full py-3.5 bg-forest text-white font-bold text-sm rounded-2xl
                       hover:bg-forest-dark active:scale-[0.98] transition-all
                       disabled:opacity-50 flex items-center justify-center gap-2">
            {isSubmitting ? <><LoadingIcon size={16} className="animate-spin" /> Saving…</> : 'Complete setup'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-bold text-forest uppercase tracking-wider block mb-2">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function inputCls(hasError: boolean) {
  return `w-full px-4 py-2.5 bg-cream border rounded-xl text-sm text-forest
          placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all
          ${hasError ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                     : 'border-border focus:border-forest focus:ring-forest/10'}`
}
