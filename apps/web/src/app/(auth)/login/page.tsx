'use client'

import { useState } from 'react'
import { useForm }  from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { api }  from '@/lib/api'
import { normalizePhone } from '@/lib/format'
import { SendIcon, LoadingIcon, ArrowLeftIcon } from '@/components/shared/icons'

const phoneSchema = z.object({
  phone: z.string().regex(/^(\+233|0)[0-9]{9}$/, 'Enter a valid Ghana phone number'),
})

const otpSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits').regex(/^\d+$/, 'Digits only'),
})

type PhoneInput = z.infer<typeof phoneSchema>
type OTPInput   = z.infer<typeof otpSchema>

export default function LoginPage() {
  const [step,    setStep]    = useState<'phone' | 'otp'>('phone')
  const [phone,   setPhone]   = useState('')
  const [loading, setLoading] = useState(false)
  const router                = useRouter()

  const phoneForm = useForm<PhoneInput>({ resolver: zodResolver(phoneSchema) })
  const otpForm   = useForm<OTPInput>({ resolver: zodResolver(otpSchema) })

  async function onPhoneSubmit({ phone: p }: PhoneInput) {
    setLoading(true)
    try {
      const formatted = normalizePhone(p)
      await api.post('/auth/request-otp', { phone: formatted })
      setPhone(formatted)
      setStep('otp')
      toast.success('OTP sent to your phone.')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg ?? 'Failed to send OTP. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const ROLE_HOME: Record<string, string> = {
    farmer:      '/dashboard',
    dealer:      '/dealer/dashboard',
    buyer:       '/buyer/dashboard',
    consumer:    '/consumer',
    field_agent: '/field-agent/dashboard',
    admin:       '/admin/dashboard',
  }

  async function onOTPSubmit({ otp }: OTPInput) {
    setLoading(true)
    try {
      const { data } = await api.post('/auth/verify-otp', { phone, otp })
      const session  = data.data?.session
      const profile  = data.data?.profile

      if (session?.access_token) {
        localStorage.setItem('agroconnect_token', session.access_token)
        // Set role cookie so middleware can redirect by role (1 year expiry)
        document.cookie = `agro_role=${profile?.role ?? 'farmer'}; path=/; max-age=31536000; SameSite=Lax`
      }

      toast.success('Welcome to AgroConnect.')

      if (data.data?.isNewUser) {
        router.push('/onboarding/role')
      } else {
        const next = new URLSearchParams(window.location.search).get('next')
        router.push(next ?? ROLE_HOME[profile?.role ?? 'farmer'] ?? '/dashboard')
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      toast.error(msg ?? 'Invalid OTP. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-[420px]">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-11 h-11 rounded-xl bg-forest flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 32 32" width="22" height="22" fill="none">
              <path d="M16 4C12 4 9 8 9 12c0 5 7 13 7 13s7-8 7-13c0-4-3-8-7-8Z" fill="oklch(0.88 0.22 120)"/>
              <path d="M10 26h12" stroke="oklch(0.88 0.22 120)" strokeWidth="2.5" strokeLinecap="round"/>
              <path d="M16 15v9" stroke="oklch(0.88 0.22 120)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p className="font-bold text-forest text-lg leading-none tracking-tight">AgroConnect</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">From seed to sale.</p>
          </div>
        </div>

        {step === 'phone' ? (
          <form onSubmit={phoneForm.handleSubmit(onPhoneSubmit)} className="space-y-5">
            <div>
              <h1 className="text-2xl font-extrabold text-forest mb-1">Sign in</h1>
              <p className="text-sm text-muted-foreground">Enter your Ghana phone number to continue.</p>
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
        ) : (
          <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-5">
            <div>
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-forest
                           transition-colors mb-4"
              >
                <ArrowLeftIcon size={16} />
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
              onClick={() => {
                setStep('phone')
                otpForm.reset()
              }}
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
