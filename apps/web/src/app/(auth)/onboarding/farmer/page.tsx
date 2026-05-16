'use client'

import { useRouter }     from 'next/navigation'
import { useAuth }       from '@/context/auth-context'
import { api }           from '@/lib/api'
import { useState }      from 'react'
import { useForm }       from 'react-hook-form'
import { zodResolver }   from '@hookform/resolvers/zod'
import { z }             from 'zod'
import { LoadingIcon, MapPinIcon } from '@/components/shared/icons'
import { GHANA_REGIONS } from '@/lib/types'

const schema = z.object({
  fullName:         z.string().min(2, 'Your full name is required'),
  farmName:         z.string().min(2, 'Farm name is required'),
  farmSizeHectares: z.coerce.number().min(0.1, 'Enter a valid size'),
  regionId:         z.coerce.number().min(1, 'Select your region'),
  district:         z.string().min(2, 'Enter your district'),
  mobileMoneyNumber:z.string().regex(/^\+233[0-9]{9}$/, 'Enter a valid Ghana number (+233...)'),
  sectors:          z.array(z.string()).min(1, 'Select at least one sector'),
})

type FormData = z.infer<typeof schema>

const SECTORS = [
  { value: 'crops',     label: 'Crops'     },
  { value: 'livestock', label: 'Livestock' },
  { value: 'poultry',   label: 'Poultry'   },
  { value: 'fisheries', label: 'Fisheries' },
]

export default function FarmerOnboardingPage() {
  const { refresh } = useAuth()
  const router      = useRouter()
  const [gpsLoading, setGpsLoading] = useState(false)
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null)

  const {
    register, handleSubmit, setValue, watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema), defaultValues: { sectors: [] } })

  const sectors = watch('sectors')

  function toggleSector(v: string) {
    const current = sectors ?? []
    setValue('sectors', current.includes(v) ? current.filter(s => s !== v) : [...current, v])
  }

  function captureGPS() {
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setGpsLoading(false)
      },
      () => setGpsLoading(false),
      { timeout: 10_000 },
    )
  }

  async function onSubmit(data: FormData) {
    await api.put('/users/me/farmer-profile', { ...data, gpsLat: gps?.lat, gpsLng: gps?.lng })
    await refresh()
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-forest">Set up your farm profile</h1>
          <p className="text-muted-foreground text-sm mt-2">
            This information helps buyers find and trust your listings.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-border p-6 space-y-5">
          {/* Full name */}
          <Field label="Your full name" error={errors.fullName?.message}>
            <input
              {...register('fullName')}
              placeholder="e.g. Kwame Asante Boateng"
              className={inputCls(!!errors.fullName)}
            />
          </Field>

          {/* Farm name */}
          <Field label="Farm name" error={errors.farmName?.message}>
            <input
              {...register('farmName')}
              placeholder="e.g. Asante Family Farm"
              className={inputCls(!!errors.farmName)}
            />
          </Field>

          {/* Farm size */}
          <Field label="Farm size (hectares)" error={errors.farmSizeHectares?.message}>
            <input
              type="number"
              step="0.1"
              min="0.1"
              {...register('farmSizeHectares')}
              placeholder="e.g. 2.5"
              className={`${inputCls(!!errors.farmSizeHectares)} font-mono`}
            />
          </Field>

          {/* Region */}
          <Field label="Region" error={errors.regionId?.message}>
            <select {...register('regionId')} className={inputCls(!!errors.regionId)}>
              <option value="">Select region…</option>
              {GHANA_REGIONS.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </Field>

          {/* District */}
          <Field label="District / community" error={errors.district?.message}>
            <input
              {...register('district')}
              placeholder="e.g. Kumasi Metropolitan"
              className={inputCls(!!errors.district)}
            />
          </Field>

          {/* GPS */}
          <div>
            <p className="text-xs font-bold text-forest uppercase tracking-wider mb-2">
              Farm GPS location <span className="text-muted-foreground font-normal normal-case">(optional)</span>
            </p>
            {gps ? (
              <div className="flex items-center gap-2 px-3 py-2.5 bg-lime/15 rounded-xl border border-lime/30">
                <MapPinIcon size={14} className="text-forest" />
                <span className="font-mono text-xs text-forest">
                  {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}
                </span>
                <button type="button" onClick={() => setGps(null)} className="ml-auto text-xs text-muted-foreground hover:text-red-500">
                  Remove
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={captureGPS}
                disabled={gpsLoading}
                className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-xl text-sm
                           font-semibold text-forest hover:bg-cream transition-colors disabled:opacity-50"
              >
                {gpsLoading ? <LoadingIcon size={14} className="animate-spin" /> : <MapPinIcon size={14} />}
                {gpsLoading ? 'Locating…' : 'Capture GPS location'}
              </button>
            )}
          </div>

          {/* Sectors */}
          <div>
            <p className="text-xs font-bold text-forest uppercase tracking-wider mb-2">
              Farming sectors
            </p>
            <div className="flex flex-wrap gap-2">
              {SECTORS.map(s => {
                const active = sectors?.includes(s.value)
                return (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => toggleSector(s.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors
                      ${active
                        ? 'bg-forest text-white border-forest'
                        : 'bg-white text-muted-foreground border-border hover:border-forest hover:text-forest'}`}
                  >
                    {s.label}
                  </button>
                )
              })}
            </div>
            {errors.sectors && (
              <p className="text-xs text-red-500 mt-1">{errors.sectors.message}</p>
            )}
          </div>

          {/* MoMo number */}
          <Field label="Mobile Money number" error={errors.mobileMoneyNumber?.message}>
            <input
              {...register('mobileMoneyNumber')}
              placeholder="+233XXXXXXXXX"
              className={`${inputCls(!!errors.mobileMoneyNumber)} font-mono`}
            />
          </Field>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-forest text-white font-bold text-sm rounded-2xl
                       hover:bg-forest-dark active:scale-[0.98] transition-all
                       disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <><LoadingIcon size={16} className="animate-spin" /> Saving…</>
            ) : 'Complete setup'}
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
          ${hasError
            ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
            : 'border-border focus:border-forest focus:ring-forest/10'}`
}
