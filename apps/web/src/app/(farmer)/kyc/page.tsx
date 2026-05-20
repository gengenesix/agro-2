'use client'

import { useEffect, useRef, useState } from 'react'
import Image      from 'next/image'
import Link       from 'next/link'
import { useAuth } from '@/context/auth-context'
import { api }    from '@/lib/api'
import {
  ArrowLeftIcon, LoadingIcon, PlusIcon, ChevronRightIcon,
} from '@/components/shared/icons'

type KycStatus = 'not_submitted' | 'pending' | 'approved' | 'rejected'

interface KycState {
  nationalId:       string
  kycFrontPhotoUrl: string | null
  kycBackPhotoUrl:  string | null
  kycSelfieUrl:     string | null
  kycStatus:        KycStatus
  kycRejectedReason: string | null
  kycSubmittedAt:   string | null
}

const STATUS_BADGE: Record<KycStatus, { label: string; cls: string }> = {
  not_submitted: { label: 'Not submitted',  cls: 'bg-cream-dark text-muted-foreground border-border'           },
  pending:       { label: 'Under review',   cls: 'bg-lime/15 text-forest border-lime/30'                      },
  approved:      { label: 'Approved',       cls: 'bg-sector-crops-bg text-sector-crops border-sector-crops/30'  },
  rejected:      { label: 'Rejected',       cls: 'bg-destructive/10 text-destructive border-destructive/20'    },
}

export default function KYCPage() {
  const { user } = useAuth()

  const frontRef  = useRef<HTMLInputElement>(null)
  const backRef   = useRef<HTMLInputElement>(null)
  const videoRef  = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [kyc, setKyc]               = useState<KycState | null>(null)
  const [loading, setLoading]       = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState('')
  const [success, setSuccess]       = useState(false)

  const [nationalId,       setNationalId]       = useState('')
  const [frontPhotoUrl,    setFrontPhotoUrl]    = useState('')
  const [backPhotoUrl,     setBackPhotoUrl]     = useState('')
  const [selfieUrl,        setSelfieUrl]        = useState('')
  const [uploadingFront,   setUploadingFront]   = useState(false)
  const [uploadingBack,    setUploadingBack]    = useState(false)
  const [uploadingSelfie,  setUploadingSelfie]  = useState(false)
  const [cameraOpen,       setCameraOpen]       = useState(false)
  const [cameraError,      setCameraError]      = useState('')

  useEffect(() => {
    api.get('/users/me/farmer-profile').then(r => {
      const d = r.data?.data
      if (d) {
        setKyc({
          nationalId:        d.nationalId       ?? '',
          kycFrontPhotoUrl:  d.kycFrontPhotoUrl ?? null,
          kycBackPhotoUrl:   d.kycBackPhotoUrl  ?? null,
          kycSelfieUrl:      d.kycSelfieUrl     ?? null,
          kycStatus:         (d.kycStatus       ?? 'not_submitted') as KycStatus,
          kycRejectedReason: d.kycRejectedReason ?? null,
          kycSubmittedAt:    d.kycSubmittedAt    ?? null,
        })
        setNationalId(d.nationalId       ?? '')
        setFrontPhotoUrl(d.kycFrontPhotoUrl ?? '')
        setBackPhotoUrl(d.kycBackPhotoUrl  ?? '')
        setSelfieUrl(d.kycSelfieUrl       ?? '')
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  // Cleanup camera on unmount
  useEffect(() => {
    return () => { stopCamera() }
  }, [])

  async function uploadPhoto(
    file: File,
    setUrl: (u: string) => void,
    setUploading: (v: boolean) => void,
  ) {
    setUploading(true)
    const form = new FormData()
    form.append('photos', file)
    try {
      const { data } = await api.post('/uploads/listing-photos', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setUrl(data.data.urls[0])
    } catch {
      setError('Photo upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  async function startCamera() {
    setCameraError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraOpen(true)
    } catch {
      setCameraError('Camera access denied. Please upload a selfie photo instead.')
    }
  }

  function stopCamera() {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    setCameraOpen(false)
  }

  async function captureSelfie() {
    if (!videoRef.current || !canvasRef.current) return
    setUploadingSelfie(true)
    const v = videoRef.current
    const c = canvasRef.current
    c.width  = v.videoWidth
    c.height = v.videoHeight
    c.getContext('2d')?.drawImage(v, 0, 0)

    c.toBlob(async (blob) => {
      if (!blob) { setUploadingSelfie(false); return }
      const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' })
      stopCamera()
      await uploadPhoto(file, setSelfieUrl, setUploadingSelfie)
    }, 'image/jpeg', 0.92)
  }

  async function handleSubmit() {
    if (!nationalId.trim()) { setError('Ghana Card number is required'); return }
    if (!frontPhotoUrl)     { setError('Front photo of Ghana Card is required'); return }
    if (!backPhotoUrl)      { setError('Back photo of Ghana Card is required');  return }
    if (!selfieUrl)         { setError('Selfie is required for identity matching'); return }

    setSubmitting(true)
    setError('')
    try {
      await api.put('/users/me/farmer-profile', {
        nationalId,
        kycFrontPhotoUrl:  frontPhotoUrl,
        kycBackPhotoUrl:   backPhotoUrl,
        kycSelfieUrl:      selfieUrl,
        kycStatus:         'pending',
        kycSubmittedAt:    new Date().toISOString(),
      })
      setSuccess(true)
      setKyc(prev => prev ? { ...prev, kycStatus: 'pending' } : prev)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setError(msg ?? 'Submission failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <LoadingIcon size={28} className="text-forest animate-spin" />
      </div>
    )
  }

  const status      = kyc?.kycStatus ?? 'not_submitted'
  const badge       = STATUS_BADGE[status]
  const isApproved  = status === 'approved'
  const isPending   = status === 'pending'

  return (
    <main className="min-h-screen bg-cream pb-24">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <Link href="/profile"
            className="p-2 -ml-2 text-muted-foreground hover:text-forest transition-colors">
            <ArrowLeftIcon size={18} />
          </Link>
          <h1 className="font-bold text-forest text-lg">Identity Verification (KYC)</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Status card */}
        <div className="bg-white rounded-2xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-forest text-sm">Verification status</h2>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badge.cls}`}>
              {badge.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isApproved
              ? 'Your identity has been verified. You qualify for Field Verified status.'
              : isPending
                ? 'Your documents are under review. This typically takes 1–2 business days.'
                : status === 'rejected'
                  ? `Your verification was rejected: ${kyc?.kycRejectedReason ?? 'No reason provided'}. Please resubmit.`
                  : 'Submit your Ghana Card and a live selfie to verify your identity. This unlocks Field Verified status and higher AgroScore.'}
          </p>

          {isApproved && (
            <Link href="/profile"
              className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-forest hover:underline">
              Return to profile <ChevronRightIcon size={13} />
            </Link>
          )}
        </div>

        {!isApproved && (
          <>
            {/* Step 1: Ghana Card number */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h2 className="font-bold text-forest text-sm mb-1">
                Step 1 — Ghana Card number
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Enter the 15-character number printed on your Ghana Card (GHA-XXXXXXXXX-X).
              </p>
              <input
                value={nationalId}
                onChange={e => setNationalId(e.target.value.toUpperCase())}
                placeholder="GHA-000000000-0"
                disabled={isPending}
                className="w-full h-11 px-4 rounded-xl border border-border bg-cream focus:outline-none
                           focus:ring-2 focus:ring-lime text-sm font-mono tracking-widest
                           disabled:opacity-60"
              />
            </div>

            {/* Step 2: Ghana Card photos */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h2 className="font-bold text-forest text-sm mb-1">
                Step 2 — Ghana Card photos
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Upload clear, well-lit photos of both sides of your Ghana Card.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {/* Front */}
                <div>
                  <p className="text-[11px] font-bold text-forest uppercase tracking-wider mb-2">
                    Front side
                  </p>
                  <PhotoSlot
                    url={frontPhotoUrl}
                    uploading={uploadingFront}
                    disabled={isPending}
                    onClear={() => setFrontPhotoUrl('')}
                    onPick={() => frontRef.current?.click()}
                  />
                  <input
                    ref={frontRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (f) uploadPhoto(f, setFrontPhotoUrl, setUploadingFront)
                    }}
                  />
                </div>

                {/* Back */}
                <div>
                  <p className="text-[11px] font-bold text-forest uppercase tracking-wider mb-2">
                    Back side
                  </p>
                  <PhotoSlot
                    url={backPhotoUrl}
                    uploading={uploadingBack}
                    disabled={isPending}
                    onClear={() => setBackPhotoUrl('')}
                    onPick={() => backRef.current?.click()}
                  />
                  <input
                    ref={backRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0]
                      if (f) uploadPhoto(f, setBackPhotoUrl, setUploadingBack)
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Selfie / live check */}
            <div className="bg-white rounded-2xl border border-border p-5">
              <h2 className="font-bold text-forest text-sm mb-1">
                Step 3 — Live selfie
              </h2>
              <p className="text-xs text-muted-foreground mb-4">
                Take a live selfie so we can match your face with your Ghana Card photo.
                Make sure your face is clearly visible and well lit.
              </p>

              {selfieUrl ? (
                <div className="relative w-full aspect-video max-w-xs mx-auto rounded-xl overflow-hidden
                                border-2 border-forest/30">
                  <Image src={selfieUrl} alt="Your selfie" fill className="object-cover" />
                  {!isPending && (
                    <button
                      type="button"
                      onClick={() => setSelfieUrl('')}
                      className="absolute top-2 right-2 bg-black/60 text-white text-xs font-bold
                                 px-2 py-1 rounded-lg hover:bg-black/80 transition-colors">
                      Retake
                    </button>
                  )}
                </div>
              ) : cameraOpen ? (
                <div className="space-y-3">
                  <div className="relative w-full aspect-video max-w-xs mx-auto rounded-xl overflow-hidden
                                  border-2 border-forest/30 bg-black">
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-32 h-40 rounded-full border-2 border-white/60 border-dashed" />
                    </div>
                  </div>
                  <div className="flex gap-2 max-w-xs mx-auto">
                    <button
                      type="button"
                      onClick={captureSelfie}
                      disabled={uploadingSelfie}
                      className="flex-1 h-11 bg-forest text-white rounded-xl font-bold text-sm
                                 hover:bg-forest-dark disabled:opacity-50 flex items-center justify-center gap-2">
                      {uploadingSelfie
                        ? <><LoadingIcon size={14} className="animate-spin" /> Uploading…</>
                        : 'Take photo'}
                    </button>
                    <button type="button" onClick={stopCamera}
                      className="h-11 px-4 border border-border rounded-xl text-sm font-semibold
                                 text-muted-foreground hover:text-forest transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {cameraError && (
                    <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-xl">
                      {cameraError}
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={startCamera}
                      disabled={isPending}
                      className="flex-1 h-11 bg-forest text-white rounded-xl font-bold text-sm
                                 hover:bg-forest-dark disabled:opacity-50 flex items-center justify-center gap-2">
                      Open camera
                    </button>
                    <label className={`flex-1 h-11 border border-border rounded-xl font-semibold text-sm
                                      text-forest hover:bg-cream transition-colors flex items-center
                                      justify-center gap-2 cursor-pointer ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
                      <PlusIcon size={14} />
                      Upload selfie
                      <input
                        type="file"
                        accept="image/*"
                        capture="user"
                        className="hidden"
                        onChange={e => {
                          const f = e.target.files?.[0]
                          if (f) uploadPhoto(f, setSelfieUrl, setUploadingSelfie)
                        }}
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Face the camera directly, remove glasses or hats, and ensure good lighting.
                  </p>
                </div>
              )}
            </div>

            {/* Submit */}
            {!isPending && (
              <div className="space-y-3">
                {error && (
                  <div className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-lime/20 border border-lime/40 text-forest text-sm font-semibold
                                  px-4 py-3 rounded-xl">
                    Documents submitted for review. We will notify you within 1–2 business days.
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || success}
                  className="w-full h-12 bg-forest text-white rounded-xl font-bold text-sm
                             hover:bg-forest-dark transition-colors disabled:opacity-60
                             flex items-center justify-center gap-2">
                  {submitting
                    ? <><LoadingIcon size={15} className="animate-spin" /> Submitting…</>
                    : 'Submit for verification'}
                </button>
                <p className="text-[11px] text-center text-muted-foreground">
                  Your documents are encrypted and only used for identity verification.
                  We comply with the Ghana Data Protection Act 2012.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}

function PhotoSlot({
  url, uploading, disabled, onClear, onPick,
}: {
  url: string; uploading: boolean; disabled: boolean
  onClear: () => void; onPick: () => void
}) {
  if (uploading) {
    return (
      <div className="w-full aspect-[3/2] rounded-xl border-2 border-dashed border-border
                      flex items-center justify-center bg-cream-dark">
        <LoadingIcon size={20} className="text-muted-foreground animate-spin" />
      </div>
    )
  }

  if (url) {
    return (
      <div className="relative w-full aspect-[3/2] rounded-xl overflow-hidden border border-border">
        <Image src={url} alt="" fill className="object-cover" />
        {!disabled && (
          <button
            type="button"
            onClick={onClear}
            className="absolute top-1.5 right-1.5 bg-black/60 text-white text-[10px] font-bold
                       px-1.5 py-0.5 rounded-lg hover:bg-black/80 transition-colors">
            Change
          </button>
        )}
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={onPick}
      disabled={disabled}
      className="w-full aspect-[3/2] rounded-xl border-2 border-dashed border-border
                 flex flex-col items-center justify-center gap-1.5 text-muted-foreground
                 hover:border-forest hover:text-forest transition-colors disabled:opacity-50">
      <PlusIcon size={18} />
      <span className="text-[10px] font-semibold">Upload photo</span>
    </button>
  )
}
