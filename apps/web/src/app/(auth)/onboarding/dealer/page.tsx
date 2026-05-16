'use client'

import { useRouter }   from 'next/navigation'
import { useAuth }     from '@/context/auth-context'
import { api }         from '@/lib/api'
import { useForm }     from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z }           from 'zod'
import { useState }    from 'react'
import { LoadingIcon } from '@/components/shared/icons'
import { GHANA_REGIONS } from '@/lib/types'

const schema = z.object({
  fullName:       z.string().min(2, 'Your full name is required'),
  businessName:   z.string().min(2, 'Business name required'),
  regionId:       z.coerce.number().min(1, 'Select region'),
  district:       z.string().min(2, 'Enter district'),
  businessRegNo:  z.string().optional(),
  sectors:        z.array(z.string()).min(1, 'Select at least one sector'),
  mobileMoneyNumber: z.string().regex(/^\+233[0-9]{9}$/, 'Enter +233... number'),
})
type FormData = z.infer<typeof schema>

const SECTORS = [
  { value: 'crops',     label: 'Crop Inputs'    },
  { value: 'livestock', label: 'Livestock Drugs' },
  { value: 'poultry',   label: 'Poultry Feeds'  },
  { value: 'fisheries', label: 'Fish Feed'       },
  { value: 'equipment', label: 'Equipment'       },
]

export default function DealerOnboardingPage() {
  const { refresh } = useAuth()
  const router      = useRouter()
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } =
    useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { sectors: [] } })

  const sectors = watch('sectors') ?? []

  function toggleSector(v: string) {
    setValue('sectors', sectors.includes(v) ? sectors.filter(s => s !== v) : [...sectors, v])
  }

  async function onSubmit(data: FormData) {
    if (data.fullName) {
      await api.put('/users/me', { fullName: data.fullName })
    }
    await api.put('/users/me/dealer-profile', data)
    await refresh()
    router.push('/dealer/dashboard')
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-forest">Set up your dealership</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Let farmers in your region find your products.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-border p-6 space-y-5">
          <Field label="Your full name" error={errors.fullName?.message}>
            <input {...register('fullName')} placeholder="e.g. Kwame Asante Boateng"
              className={inputCls(!!errors.fullName)} autoFocus />
          </Field>

          <Field label="Business name" error={errors.businessName?.message}>
            <input {...register('businessName')} placeholder="e.g. Agro Solutions Ltd"
              className={inputCls(!!errors.businessName)} />
          </Field>

          <Field label="Region" error={errors.regionId?.message}>
            <select {...register('regionId')} className={inputCls(!!errors.regionId)}>
              <option value="">Select region…</option>
              {GHANA_REGIONS.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </Field>

          <Field label="District" error={errors.district?.message}>
            <input {...register('district')} placeholder="e.g. Accra Metropolitan"
              className={inputCls(!!errors.district)} />
          </Field>

          <Field label="Business registration number" error={errors.businessRegNo?.message}>
            <input {...register('businessRegNo')} placeholder="Optional — improves trust"
              className={inputCls(false)} />
          </Field>

          <div>
            <p className="text-xs font-bold text-forest uppercase tracking-wider mb-2">Input sectors</p>
            <div className="flex flex-wrap gap-2">
              {SECTORS.map(s => {
                const active = sectors.includes(s.value)
                return (
                  <button key={s.value} type="button" onClick={() => toggleSector(s.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors
                      ${active ? 'bg-forest text-white border-forest'
                               : 'bg-white text-muted-foreground border-border hover:border-forest hover:text-forest'}`}>
                    {s.label}
                  </button>
                )
              })}
            </div>
            {errors.sectors && <p className="text-xs text-red-500 mt-1">{errors.sectors.message}</p>}
          </div>

          <Field label="Mobile Money number" error={errors.mobileMoneyNumber?.message}>
            <input {...register('mobileMoneyNumber')} placeholder="+233XXXXXXXXX"
              className={`${inputCls(!!errors.mobileMoneyNumber)} font-mono`} />
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
