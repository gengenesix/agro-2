'use client'

import { useEffect, useState } from 'react'
import Image                   from 'next/image'
import { useAuth }             from '@/context/auth-context'
import { api }                 from '@/lib/api'
import { LogoutIcon, ProfileIcon } from '@/components/shared/icons'
import { formatPhoneGhana }    from '@/lib/format'

const BUYER_TYPE_LABEL: Record<string, string> = {
  hotel:       'Hotel',
  restaurant:  'Restaurant',
  processor:   'Food Processor',
  retailer:    'Retailer',
  exporter:    'Exporter',
  individual:  'Individual Buyer',
}

interface BuyerProfileData {
  organizationName:      string | null
  buyerType:             string
  contactPerson:         string | null
  email:                 string | null
  deliveryAddress:       string | null
  preferredCategories:   string[]
  monthlyVolumeEstimate: string | null
}

export default function BuyerProfilePage() {
  const { user, logout } = useAuth()
  const [profile, setProfile] = useState<BuyerProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/users/me/buyer-profile')
      .then(r => setProfile(r.data?.data ?? null))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (!user) return null

  return (
    <main className="min-h-screen bg-cream pb-10">
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="font-bold text-forest text-lg">Profile</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Your account details</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">

        {/* Identity card */}
        <div className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-cream-dark flex-shrink-0 border border-border">
            {user.avatarUrl ? (
              <Image src={user.avatarUrl} alt="" width={64} height={64} className="object-cover w-full h-full" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ProfileIcon size={28} className="text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-forest text-lg leading-tight truncate">{user.fullName}</p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {user.email ?? formatPhoneGhana(user.phone)}
            </p>
            <span className="inline-block mt-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full
                             bg-sector-fisheries-bg text-sector-fisheries border border-sector-fisheries/20 uppercase tracking-wide">
              Buyer Account
            </span>
          </div>
        </div>

        {/* Buyer profile details */}
        {!loading && profile && (
          <div className="bg-white rounded-2xl border border-border p-5 space-y-3">
            <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Organisation details
            </h2>
            {[
              { label: 'Buyer type',       value: BUYER_TYPE_LABEL[profile.buyerType] ?? profile.buyerType },
              { label: 'Organisation',     value: profile.organizationName },
              { label: 'Contact person',   value: profile.contactPerson },
              { label: 'Email',            value: profile.email },
              { label: 'Delivery address', value: profile.deliveryAddress },
              { label: 'Monthly volume',   value: profile.monthlyVolumeEstimate },
            ].filter(r => r.value).map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0 gap-4">
                <span className="text-xs text-muted-foreground flex-shrink-0">{label}</span>
                <span className="text-xs font-semibold text-forest text-right truncate">{value}</span>
              </div>
            ))}

            {profile.preferredCategories.length > 0 && (
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-2">Preferred categories</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.preferredCategories.map(cat => (
                    <span key={cat}
                      className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full
                                 bg-lime/15 text-forest border border-lime/25 capitalize">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-border
                     text-sm font-semibold text-muted-foreground hover:text-red-600 hover:border-red-200
                     hover:bg-red-50 transition-colors"
        >
          <LogoutIcon size={16} />
          Sign out
        </button>
      </div>
    </main>
  )
}
