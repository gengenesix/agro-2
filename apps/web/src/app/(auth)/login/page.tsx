'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { normalizePhone } from '@/lib/format'
import {
  ArrowLeftIcon, SendIcon, LoadingIcon,
  CropsIcon, InputsIcon, HarvestPledgeIcon, MarketIcon,
} from '@/components/shared/icons'
import type { Role } from '@agroconnect/types'

// ─── Schemas ─────────────────────────────────────────────────────────────────

const phoneSchema = z.object({
  phone: z.string().regex(/^(\+233|0)[0-9]{9}$/, 'Enter a valid Ghana phone number'),
})

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'Digits only'),
})

type PhoneInput = z.infer<typeof phoneSchema>
type OTPInput   = z.infer<typeof otpSchema>

// ─── Role definitions ─────────────────────────────────────────────────────────

const ROLES: {
  id:    Role
  label: string
  desc:  string
  Icon:  React.ComponentType<{ size?: number; className?: string }>
  color: string
  bg:    string
}[] = [
  {
    id:    'farmer',
    label: 'Farmer',
    desc:  'Sell produce, pledge harvests, access BNPL credit',
    Icon:  CropsIcon,
    color: 'text-sector-crops',
    bg:    'bg-sector-crops-bg',
  },
  {
    id:    'dealer',
    label: 'Agro-Input Dealer',
    desc:  'List seeds, fertilizers and farm equipment',
    Icon:  InputsIcon,
    color: 'text-sector-inputs',
    bg:    'bg-sector-inputs-bg',
  },
  {
    id:    'buyer',
    label: 'Buyer / Processor',
    desc:  'Source produce and reserve future harvests in bulk',
    Icon:  HarvestPledgeIcon,
    color: 'text-harvest-gold',
    bg:    'bg-harvest-gold-bg',
  },
  {
    id:    'consumer',
    label: 'Consumer',
    desc:  'Order fresh farm produce directly from verified farms',
    Icon:  MarketIcon,
    color: 'text-sector-fisheries',
    bg:    'bg-sector-fisheries-bg',
  },
]

const ROLE_LABELS: Record<string, string> = {
  farmer:      'Farmer',
  dealer:      'Agro-Input Dealer',
  buyer:       'Business Buyer',
  consumer:    'Consumer',
  field_agent: 'Field Agent',
}

const ROLE_HOME: Record<string, string> = {
  farmer:      '/dashboard',
  dealer:      '/dealer/dashboard',
  buyer:       '/buyer/dashboard',
  consumer:    '/consumer',
  field_agent: '/field-agent/dashboard',
  admin:       '/admin/dashboard',
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="flex items-center gap-3 mb-10">
      <div className="w-11 h-11 rounded-xl bg-forest flex items-center justify-center shadow-sm">
        <svg viewBox="0 0 32 32" width="22" height="22" fill="none">
          <path d="M16 4C12 4 9 8 9 12c0 5 7 13 7 13s7-8 7-13c0-4-3-8-7-8Z" fill="oklch(0.88 0.22 120)" />
          <path d="M10 26h12" stroke="oklch(0.88 0.22 120)" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M16 15v9" stroke="oklch(0.88 0.22 120)" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div>
        <p className="font-bold text-forest text-lg leading-none tracking-tight">AgroConnect</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">From seed to sale.</p>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [step,   setStep]   = useState<'role' | 'phone' | 'otp'>('role')
  const [role,   setRole]   = useState<Role | null>(null)
  const [phone,  setPhone]  = useState('')
  const [loading, setLoading] = useState(false)
  const router               = useRouter()

  const phoneForm = useForm<PhoneInput>({ resolver: zodResolver(phoneSchema) })
  const otpForm   = useForm<OTPInput>({ resolver: zodResolver(otpSchema) })

  // ── Step 1 → 2 ────────────────────────────────────────────────────────────
  function selectRole(r: Role) {
    setRole(r)
    setStep('phone')
  }

  // ── Step 2: request OTP ───────────────────────────────────────────────────
  async function onPhoneSubmit({ phone: p }: PhoneInput) {
    setLoading(true)
    try {
      const formatted = normalizePhone(p)
      const res = await fetch('/api/auth/request-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone: formatted, role }),
      })
      const data = await res.json() as { success: boolean; devOtp?: string; error?: string }

      if (!data.success) throw new Error(data.error ?? 'Failed to send OTP')

      setPhone(formatted)
      setStep('otp')

      if (data.devOtp) {
        toast.info(`Dev OTP: ${data.devOtp}`, { duration: 30_000, description: 'Only visible in development mode' })
      } else {
        toast.success('OTP sent to your phone.')
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send OTP. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 3: verify OTP ────────────────────────────────────────────────────
  async function onOTPSubmit({ otp }: OTPInput) {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ phone, otp }),
      })
      const data = await res.json() as {
        success: boolean
        error?:  string
        data?: { access_token: string; profile: Record<string, unknown>; isNewUser: boolean }
      }

      if (!data.success || !data.data) throw new Error(data.error ?? 'Invalid OTP')

      const { access_token, profile, isNewUser } = data.data

      localStorage.setItem('agroconnect_token',   access_token)
      localStorage.setItem('agroconnect_profile',  JSON.stringify(profile))
      document.cookie = `agro_role=${String(profile.role ?? 'farmer')}; path=/; max-age=31536000; SameSite=Lax`

      toast.success('Welcome to AgroConnect.')

      const next = new URLSearchParams(window.location.search).get('next')
      router.push(next ?? ROLE_HOME[String(profile.role ?? 'farmer')] ?? '/dashboard')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid OTP. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-[480px]">
        <Logo />

        {/* ── Step 1: Role selection ─────────────────────────────────────── */}
        {step === 'role' && (
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground
                         hover:text-forest transition-colors mb-6"
            >
              <ArrowLeftIcon size={15} />
              Back to AgroConnect
            </Link>

            <div className="mb-7">
              <h1 className="text-2xl font-extrabold text-forest mb-1">Join AgroConnect</h1>
              <p className="text-sm text-muted-foreground">
                Choose how you will use the platform to get started.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => selectRole(r.id)}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white border-2 border-border
                             hover:border-forest hover:shadow-sm transition-all duration-150
                             text-left group active:scale-[0.99]"
                >
                  <div className={`p-2.5 rounded-xl ${r.bg} ${r.color} shrink-0 group-hover:scale-105 transition-transform`}>
                    <r.Icon size={22} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-forest text-sm">{r.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{r.desc}</p>
                  </div>
                  <ArrowLeftIcon size={14} className="ml-auto rotate-180 text-muted-foreground/40 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Phone number ───────────────────────────────────────── */}
        {step === 'phone' && (
          <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-5">
            <div>
              <button
                type="button"
                onClick={() => setStep('role')}
                className="flex items-center gap-1.5 text-sm text-muted-foreground
                           hover:text-forest transition-colors mb-6"
              >
                <ArrowLeftIcon size={15} />
                Back
              </button>

              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Signing in as
                </span>
                <span className="text-xs font-bold text-forest bg-lime/20 px-2.5 py-1 rounded-full">
                  {role ? ROLE_LABELS[role] : ''}
                </span>
              </div>

              <h1 className="text-2xl font-extrabold text-forest mb-1">Enter your number</h1>
              <p className="text-sm text-muted-foreground">
                We will send a one-time code to verify your phone.
              </p>
            </div>

            <div>
              <label className="text-sm font-semibold text-forest block mb-2">
                Phone Number
              </label>
              <div className="flex gap-2">
                <span className="flex items-center px-3.5 bg-cream-dark border border-border
                                 rounded-xl text-sm font-bold text-forest select-none">
                  +233
                </span>
                <input
                  {...phoneForm.register('phone')}
                  type="tel"
                  inputMode="numeric"
                  placeholder="024 000 0000"
                  autoFocus
                  className="flex-1 px-4 py-3.5 border-2 border-border rounded-xl text-sm font-medium
                             focus:border-forest focus:outline-none text-forest bg-white
                             transition-colors placeholder:text-muted-foreground/50"
                />
              </div>
              {phoneForm.formState.errors.phone && (
                <p className="text-destructive text-xs mt-1.5">
                  {phoneForm.formState.errors.phone.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-forest text-white font-bold text-sm rounded-2xl
                         transition-all duration-150 active:scale-[0.98] disabled:opacity-50
                         flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <LoadingIcon size={18} className="text-white" />
              ) : (
                <>
                  Get OTP via SMS
                  <SendIcon size={16} />
                </>
              )}
            </button>

            <p className="text-center text-xs text-muted-foreground">
              An SMS will be sent to your number. Standard rates apply.
            </p>
          </form>
        )}

        {/* ── Step 3: OTP entry ─────────────────────────────────────────── */}
        {step === 'otp' && (
          <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-5">
            <div>
              <button
                type="button"
                onClick={() => { setStep('phone'); otpForm.reset() }}
                className="flex items-center gap-1.5 text-sm text-muted-foreground
                           hover:text-forest transition-colors mb-6"
              >
                <ArrowLeftIcon size={15} />
                Back
              </button>
              <h1 className="text-2xl font-extrabold text-forest mb-1">Enter OTP</h1>
              <p className="text-sm text-muted-foreground">
                6-digit code sent to{' '}
                <strong className="text-forest font-semibold">
                  {phone.replace('+233', '0').replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3')}
                </strong>
              </p>
            </div>

            <div>
              <input
                {...otpForm.register('otp')}
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                autoFocus
                className="w-full px-4 py-5 border-2 border-border rounded-2xl text-center
                           text-3xl font-mono font-bold text-forest tracking-[0.6em]
                           focus:border-forest focus:outline-none bg-white transition-colors"
              />
              {otpForm.formState.errors.otp && (
                <p className="text-destructive text-xs mt-1.5 text-center">
                  {otpForm.formState.errors.otp.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-forest text-white font-bold text-sm rounded-2xl
                         transition-all duration-150 active:scale-[0.98] disabled:opacity-50
                         flex items-center justify-center gap-2"
            >
              {loading ? <LoadingIcon size={18} className="text-white" /> : 'Verify & Continue'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('phone'); otpForm.reset() }}
              className="w-full text-sm text-muted-foreground hover:text-forest text-center transition-colors"
            >
              Did not receive code? Change number
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
