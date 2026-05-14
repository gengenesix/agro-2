'use client'

import { useState }      from 'react'
import { useRouter }     from 'next/navigation'
import { useForm }       from 'react-hook-form'
import { zodResolver }   from '@hookform/resolvers/zod'
import { z }             from 'zod'
import { api }           from '@/lib/api'
import { GHANA_REGIONS } from '@agroconnect/types'

const SECTORS = ['crops', 'livestock', 'poultry', 'fisheries', 'inputs'] as const

const schema = z.object({
  fullName:           z.string().min(2, 'Enter full name'),
  phone:              z.string().regex(/^0[235]\d{8}$/, 'Enter a valid Ghana phone number (e.g. 0241234567)'),
  regionId:           z.string().min(1, 'Select region'),
  community:          z.string().optional(),
  farmName:           z.string().optional(),
  farmSizeAcres:      z.string().optional(),
  sectors:            z.array(z.string()).min(1, 'Select at least one sector'),
  gpsLat:             z.string().optional(),
  gpsLng:             z.string().optional(),
  mobileMoneyNumber:  z.string().optional(),
  mobileMoneyNetwork: z.string().optional(),
  nationalId:         z.string().optional(),
})
type FormValues = z.infer<typeof schema>

export default function RegisterFarmerPage() {
  const router          = useRouter()
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [gpsLoading, setGpsLoading] = useState(false)

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { sectors: [] },
  })

  const selectedSectors = watch('sectors') ?? []
  const gpsLat          = watch('gpsLat')
  const gpsLng          = watch('gpsLng')

  const toggleSector = (s: string) => {
    const next = selectedSectors.includes(s)
      ? selectedSectors.filter(x => x !== s)
      : [...selectedSectors, s]
    setValue('sectors', next, { shouldValidate: true })
  }

  const captureGPS = () => {
    if (!navigator.geolocation) return
    setGpsLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setValue('gpsLat', pos.coords.latitude.toFixed(8))
        setValue('gpsLng', pos.coords.longitude.toFixed(8))
        setGpsLoading(false)
      },
      () => setGpsLoading(false),
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  const onSubmit = async (data: FormValues) => {
    setLoading(true)
    setError(null)
    try {
      const res = await api.post('/field-agent/register-farmer', {
        fullName:           data.fullName,
        phone:              data.phone,
        regionId:           Number(data.regionId),
        community:          data.community || undefined,
        farmName:           data.farmName  || undefined,
        farmSizeAcres:      data.farmSizeAcres ? Number(data.farmSizeAcres) : undefined,
        sectors:            data.sectors,
        gpsLat:             data.gpsLat ? Number(data.gpsLat)  : undefined,
        gpsLng:             data.gpsLng ? Number(data.gpsLng)  : undefined,
        mobileMoneyNumber:  data.mobileMoneyNumber  || undefined,
        mobileMoneyNetwork: data.mobileMoneyNetwork || undefined,
        nationalId:         data.nationalId || undefined,
      })
      router.push(`/field-agent/verify-farm/${res.data.data.farmerId}?registered=1`)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg ?? 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-forest">Register farmer</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Fill in the farmer's details. You can verify the farm immediately after.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Personal */}
        <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Personal details</h2>

          <div>
            <label className="block text-sm font-semibold text-forest mb-1.5">Full name</label>
            <input {...register('fullName')} placeholder="e.g. Kwame Asante Boateng"
              className="w-full h-11 px-4 rounded-xl border border-border bg-cream focus:outline-none
                         focus:ring-2 focus:ring-lime text-sm" />
            {errors.fullName && <p className="text-xs text-destructive mt-1">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-forest mb-1.5">Phone number</label>
            <input {...register('phone')} placeholder="0241234567" type="tel"
              className="w-full h-11 px-4 rounded-xl border border-border bg-cream focus:outline-none
                         focus:ring-2 focus:ring-lime text-sm font-mono" />
            {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-forest mb-1.5">Region</label>
              <select {...register('regionId')}
                className="w-full h-11 px-4 rounded-xl border border-border bg-cream focus:outline-none
                           focus:ring-2 focus:ring-lime text-sm">
                <option value="">Select</option>
                {GHANA_REGIONS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
              {errors.regionId && <p className="text-xs text-destructive mt-1">{errors.regionId.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-forest mb-1.5">Community</label>
              <input {...register('community')} placeholder="e.g. Nsawam"
                className="w-full h-11 px-4 rounded-xl border border-border bg-cream focus:outline-none
                           focus:ring-2 focus:ring-lime text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-forest mb-1.5">MoMo number</label>
              <input {...register('mobileMoneyNumber')} placeholder="0241234567" type="tel"
                className="w-full h-11 px-4 rounded-xl border border-border bg-cream focus:outline-none
                           focus:ring-2 focus:ring-lime text-sm font-mono" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-forest mb-1.5">Network</label>
              <select {...register('mobileMoneyNetwork')}
                className="w-full h-11 px-4 rounded-xl border border-border bg-cream focus:outline-none
                           focus:ring-2 focus:ring-lime text-sm">
                <option value="">Select</option>
                <option value="mtn">MTN MoMo</option>
                <option value="vodafone">Vodafone Cash</option>
                <option value="airteltigo">AirtelTigo</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-forest mb-1.5">
              Ghana Card number <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <input {...register('nationalId')} placeholder="GHA-000000000-0"
              className="w-full h-11 px-4 rounded-xl border border-border bg-cream focus:outline-none
                         focus:ring-2 focus:ring-lime text-sm font-mono" />
          </div>
        </div>

        {/* Farm */}
        <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Farm details</h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-forest mb-1.5">Farm name</label>
              <input {...register('farmName')} placeholder="e.g. Asante Farm"
                className="w-full h-11 px-4 rounded-xl border border-border bg-cream focus:outline-none
                           focus:ring-2 focus:ring-lime text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-forest mb-1.5">Size (acres)</label>
              <input {...register('farmSizeAcres')} placeholder="e.g. 5" type="number" step="0.1"
                className="w-full h-11 px-4 rounded-xl border border-border bg-cream focus:outline-none
                           focus:ring-2 focus:ring-lime text-sm font-mono" />
            </div>
          </div>

          {/* Sectors */}
          <div>
            <label className="block text-sm font-semibold text-forest mb-2">Sectors farmed</label>
            <div className="flex flex-wrap gap-2">
              {SECTORS.map(s => (
                <button
                  key={s} type="button"
                  onClick={() => toggleSector(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border capitalize transition-colors ${
                    selectedSectors.includes(s)
                      ? 'bg-forest text-white border-forest'
                      : 'bg-cream text-muted-foreground border-border hover:border-forest/30'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {errors.sectors && <p className="text-xs text-destructive mt-1">{errors.sectors.message}</p>}
          </div>

          {/* GPS */}
          <div>
            <label className="block text-sm font-semibold text-forest mb-1.5">Farm GPS</label>
            {gpsLat && gpsLng ? (
              <div className="flex items-center gap-2 bg-lime/20 border border-lime/40 rounded-xl px-4 py-2.5">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-forest fill-current flex-shrink-0">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                <span className="font-mono text-xs text-forest">{Number(gpsLat).toFixed(5)}, {Number(gpsLng).toFixed(5)}</span>
                <button type="button" onClick={captureGPS}
                  className="ml-auto text-xs text-muted-foreground underline">
                  Recapture
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={captureGPS}
                disabled={gpsLoading}
                className="w-full h-11 border-2 border-dashed border-border rounded-xl text-sm
                           font-semibold text-muted-foreground hover:border-forest/30 transition-colors
                           disabled:opacity-60"
              >
                {gpsLoading ? 'Getting location…' : 'Capture GPS coordinates'}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-xl">{error}</div>
        )}

        <button
          type="submit" disabled={loading}
          className="w-full h-12 bg-forest text-white rounded-xl font-bold text-sm
                     hover:bg-forest-dark transition-colors disabled:opacity-60"
        >
          {loading ? 'Registering…' : 'Register farmer & continue to verify'}
        </button>
      </form>
    </div>
  )
}
