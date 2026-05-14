'use client'

import { useState, useRef }   from 'react'
import { useRouter }           from 'next/navigation'
import { useForm }             from 'react-hook-form'
import { zodResolver }         from '@hookform/resolvers/zod'
import { z }                   from 'zod'
import Image                   from 'next/image'
import { api }                 from '@/lib/api'
import { GHANA_REGIONS }       from '@agroconnect/types'
import { LoadingIcon, PlusIcon, CloseIcon, CalendarIcon } from '@/components/shared/icons'

const schema = z.object({
  title:             z.string().min(5, 'Title must be at least 5 characters'),
  description:       z.string().max(1000).optional(),
  sector:            z.enum(['crops', 'livestock', 'poultry', 'fisheries', 'inputs']),
  category:          z.string().min(1, 'Select a category'),
  listingType:       z.enum(['available_now', 'harvest_pledge']),
  quantity:          z.coerce.number().min(1),
  unit:              z.string().min(1, 'Enter a unit'),
  pricePerUnit:      z.coerce.number().min(0.01),
  minimumOrder:      z.coerce.number().min(1).optional(),
  farmingMethod:     z.enum(['conventional', 'organic', 'certified_organic']).optional(),
  harvestDate:       z.string().optional(),
  depositPercent:    z.coerce.number().min(5).max(50).optional(),
  regionId:          z.coerce.number().min(1),
  district:          z.string().min(2),
  bnplEligible:      z.boolean().optional(),
  deliveryAvailable: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

const CATEGORIES_BY_SECTOR: Record<string, string[]> = {
  crops:     ['Maize', 'Rice', 'Tomato', 'Pepper', 'Onion', 'Yam', 'Cassava', 'Plantain', 'Mango', 'Pineapple', 'Cocoa', 'Ginger', 'Other'],
  livestock: ['Cattle', 'Sheep', 'Goat', 'Pig', 'Rabbit', 'Grasscutter', 'Snail'],
  poultry:   ['Broiler Chicken', 'Layer Chicken', 'Eggs', 'Turkey', 'Guinea Fowl', 'Duck'],
  fisheries: ['Tilapia', 'Catfish', 'Tuna', 'Sardine', 'Shrimp', 'Crayfish'],
  inputs:    ['Seeds', 'NPK Fertilizer', 'Urea', 'Organic Fertilizer', 'Pesticide', 'Herbicide', 'Veterinary Drug', 'Fish Feed', 'Equipment', 'Packaging'],
}

interface CreateListingFormProps {
  initialData?: Partial<FormData>
  listingId?:   string
}

export function CreateListingForm({ initialData, listingId }: CreateListingFormProps) {
  const router              = useRouter()
  const fileRef             = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError]   = useState('')

  const {
    register, handleSubmit, watch, setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { listingType: 'available_now', deliveryAvailable: true, ...initialData },
  })

  const sector      = watch('sector')
  const listingType = watch('listingType')
  const categories  = sector ? CATEGORIES_BY_SECTOR[sector] ?? [] : []

  async function handlePhotoUpload(files: FileList) {
    setUploading(true)
    const formData = new FormData()
    Array.from(files).slice(0, 5 - photos.length).forEach(f => formData.append('photos', f))
    try {
      const { data } = await api.post('/uploads/listing-photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setPhotos(p => [...p, ...data.data.urls])
    } finally {
      setUploading(false)
    }
  }

  async function onSubmit(data: FormData) {
    setError('')
    try {
      if (listingId) {
        await api.put(`/listings/${listingId}`, { ...data, photos })
      } else {
        await api.post('/listings', { ...data, photos })
      }
      router.push('/listings')
    } catch (err: any) {
      setError(err.response?.data?.error ?? 'Failed to save listing. Try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Photos */}
      <Section title="Photos">
        <div className="flex flex-wrap gap-3">
          {photos.map((url, i) => (
            <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-border">
              <Image src={url} alt="" fill className="object-cover" sizes="96px" />
              <button
                type="button"
                onClick={() => setPhotos(p => p.filter((_, j) => j !== i))}
                className="absolute top-1 right-1 w-5 h-5 bg-black/50 text-white rounded-full
                           flex items-center justify-center hover:bg-black/70"
              >
                <CloseIcon size={10} />
              </button>
            </div>
          ))}
          {photos.length < 5 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex flex-col
                         items-center justify-center gap-1 text-muted-foreground hover:border-forest
                         hover:text-forest transition-colors disabled:opacity-50"
            >
              {uploading ? <LoadingIcon size={18} className="animate-spin" /> : <PlusIcon size={18} />}
              <span className="text-[10px] font-semibold">
                {uploading ? 'Uploading…' : 'Add photo'}
              </span>
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => e.target.files && handlePhotoUpload(e.target.files)}
        />
        <p className="text-[10px] text-muted-foreground">Max 5 photos · 5 MB each · JPEG or PNG</p>
      </Section>

      {/* Basic info */}
      <Section title="Listing details">
        <Field label="Title" error={errors.title?.message}>
          <input {...register('title')} placeholder="e.g. Fresh Organic Tomatoes — Kumasi Farm"
            className={inputCls(!!errors.title)} />
        </Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Sector" error={errors.sector?.message}>
            <select {...register('sector')} className={inputCls(!!errors.sector)}
              onChange={e => { register('sector').onChange(e); setValue('category', '') }}>
              <option value="">Select sector…</option>
              {['crops', 'livestock', 'poultry', 'fisheries', 'inputs'].map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </Field>
          <Field label="Category" error={errors.category?.message}>
            <select {...register('category')} className={inputCls(!!errors.category)} disabled={!sector}>
              <option value="">Select category…</option>
              {categories.map(c => <option key={c} value={c.toLowerCase().replace(/\s/g, '_')}>{c}</option>)}
            </select>
          </Field>
        </div>

        <Field label="Description" error={errors.description?.message}>
          <textarea {...register('description')} rows={3} placeholder="Describe your produce — quality, farming practices, delivery options…"
            className={`${inputCls(false)} resize-none`} />
        </Field>
      </Section>

      {/* Pricing & quantity */}
      <Section title="Pricing & quantity">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Listing type" error={errors.listingType?.message}>
            <select {...register('listingType')} className={inputCls(!!errors.listingType)}>
              <option value="available_now">Available Now</option>
              <option value="harvest_pledge">Harvest Pledge</option>
            </select>
          </Field>
          <Field label="Farming method" error={errors.farmingMethod?.message}>
            <select {...register('farmingMethod')} className={inputCls(!!errors.farmingMethod)}>
              <option value="conventional">Conventional</option>
              <option value="organic">Organic</option>
              <option value="certified_organic">Certified Organic</option>
            </select>
          </Field>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <Field label="Price (GHS)" error={errors.pricePerUnit?.message}>
            <input type="number" step="0.01" min="0.01" {...register('pricePerUnit')}
              placeholder="0.00" className={`${inputCls(!!errors.pricePerUnit)} font-mono`} />
          </Field>
          <Field label="Quantity" error={errors.quantity?.message}>
            <input type="number" min="1" {...register('quantity')}
              placeholder="e.g. 500" className={`${inputCls(!!errors.quantity)} font-mono`} />
          </Field>
          <Field label="Unit" error={errors.unit?.message}>
            <select {...register('unit')} className={inputCls(!!errors.unit)}>
              {['kg', 'bag (50kg)', 'bag (100kg)', 'tonne', 'crate', 'head', 'dozen', 'litre', 'piece'].map(u => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Minimum order" error={errors.minimumOrder?.message}>
          <input type="number" min="1" {...register('minimumOrder')}
            placeholder="Leave blank for no minimum" className={`${inputCls(false)} font-mono`} />
        </Field>

        {/* Harvest pledge extras */}
        {listingType === 'harvest_pledge' && (
          <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border">
            <Field label="Expected harvest date" error={errors.harvestDate?.message}>
              <div className="relative">
                <input type="date" {...register('harvestDate')} className={inputCls(!!errors.harvestDate)} />
                <CalendarIcon size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </Field>
            <Field label="Deposit % required" error={errors.depositPercent?.message}>
              <input type="number" min="5" max="50" {...register('depositPercent')}
                placeholder="e.g. 20" className={`${inputCls(!!errors.depositPercent)} font-mono`} />
            </Field>
          </div>
        )}
      </Section>

      {/* Location */}
      <Section title="Location">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Region" error={errors.regionId?.message}>
            <select {...register('regionId')} className={inputCls(!!errors.regionId)}>
              <option value="">Select region…</option>
              {GHANA_REGIONS.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </Field>
          <Field label="District" error={errors.district?.message}>
            <input {...register('district')} placeholder="e.g. Kumasi Metropolitan"
              className={inputCls(!!errors.district)} />
          </Field>
        </div>
      </Section>

      {/* Options */}
      <Section title="Options">
        {[
          { key: 'deliveryAvailable', label: 'Delivery available',   sub: 'I can deliver or arrange pickup' },
          { key: 'bnplEligible',      label: 'BNPL / Pay at Harvest', sub: 'Allow buyers to pay after delivery' },
        ].map(opt => (
          <label key={opt.key} className="flex items-start gap-3 cursor-pointer group">
            <input type="checkbox" {...register(opt.key as any)}
              className="mt-0.5 w-4 h-4 accent-forest cursor-pointer" />
            <div>
              <p className="text-sm font-semibold text-forest group-hover:text-forest/80 transition-colors">{opt.label}</p>
              <p className="text-xs text-muted-foreground">{opt.sub}</p>
            </div>
          </label>
        ))}
      </Section>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
          {error}
        </p>
      )}

      <div className="flex gap-3 pb-10">
        <button type="button" onClick={() => router.back()}
          className="flex-1 py-3.5 border border-border text-forest text-sm font-bold rounded-2xl
                     hover:bg-cream transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={isSubmitting}
          className="flex-1 py-3.5 bg-forest text-white text-sm font-bold rounded-2xl
                     hover:bg-forest-dark active:scale-[0.98] transition-all
                     disabled:opacity-50 flex items-center justify-center gap-2">
          {isSubmitting ? (
            <><LoadingIcon size={16} className="animate-spin" /> Saving…</>
          ) : listingId ? 'Update listing' : 'Publish listing'}
        </button>
      </div>
    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
      <h2 className="font-bold text-forest text-sm border-b border-border pb-3">{title}</h2>
      {children}
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
