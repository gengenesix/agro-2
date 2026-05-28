'use client'

import { useState }  from 'react'
import Link          from 'next/link'

const OFFICES = [
  {
    region: 'Global HQ · Accra, Ghana',
    address: 'Airport Residential Area, Accra',
    phone:   '+233 30 000 0000',
    email:   'info@agroconnect.io',
  },
  {
    region: 'Pilot Operations · Kumasi',
    address: 'Adum Commercial District, Kumasi',
    phone:   '+233 32 000 0000',
    email:   'operations@agroconnect.io',
  },
  {
    region: 'Field Network · Northern Ghana',
    address: 'Tamale Central Market District',
    phone:   '+233 37 000 0000',
    email:   'agents@agroconnect.io',
  },
]

const SUBJECTS = [
  'Farmer registration support',
  'Dealer account & inventory',
  'Buyer / wholesale inquiry',
  'Harvest pledge dispute',
  'BNPL credit application',
  'Field agent recruitment',
  'Media & press',
  'Other',
]

export default function ContactPage() {
  const [form, setForm]       = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [status, setStatus]   = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    // Simulated submit — replace with API call when backend contact endpoint exists
    await new Promise(r => setTimeout(r, 900))
    setStatus('sent')
  }

  const inputCls = `w-full px-4 py-3 bg-cream border border-border rounded-xl text-sm text-forest
                    placeholder:text-muted-foreground focus:outline-none focus:ring-2
                    focus:ring-forest/10 focus:border-forest transition-all`

  return (
    <main>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-forest py-20 text-center px-4">
        <p className="text-lime text-xs font-bold uppercase tracking-widest mb-5">
          Get in Touch
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white
                       leading-tight mb-4">
          Contact AgroConnect
        </h1>
        <p className="text-white/60 text-lg max-w-xl mx-auto">
          Reach our team for account support, partnership inquiries, field agent
          recruitment, or press. We respond within one business day.
        </p>
      </section>

      {/* ── Form + Offices ────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-5 gap-12">

            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-border p-7 sm:p-9">
                <h2 className="font-bold text-forest text-xl mb-6">Send a message</h2>

                {status === 'sent' ? (
                  <div className="text-center py-12">
                    <div className="w-14 h-14 bg-lime/20 rounded-full flex items-center
                                    justify-center mx-auto mb-4">
                      <svg viewBox="0 0 24 24" width="24" height="24" fill="none"
                           stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                           className="text-lime-dark">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </div>
                    <p className="font-bold text-forest text-lg mb-2">Message received</p>
                    <p className="text-muted-foreground text-sm">
                      We&apos;ll respond to <strong>{form.email}</strong> within one business day.
                    </p>
                    <button onClick={() => { setStatus('idle'); setForm({ name: '', email: '', phone: '', subject: '', message: '' }) }}
                      className="mt-6 text-sm font-semibold text-forest hover:text-forest-dark
                                 underline underline-offset-2 transition-colors">
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-forest uppercase tracking-wider
                                          block mb-2">
                          Full Name
                        </label>
                        <input name="name" value={form.name} onChange={handleChange}
                          required placeholder="Kwame Asante"
                          className={inputCls} />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-forest uppercase tracking-wider
                                          block mb-2">
                          Phone Number
                        </label>
                        <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                          placeholder="+233 XX XXX XXXX"
                          className={inputCls} />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-forest uppercase tracking-wider
                                        block mb-2">
                        Email Address
                      </label>
                      <input name="email" type="email" value={form.email} onChange={handleChange}
                        required placeholder="kwame@example.com"
                        className={inputCls} />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-forest uppercase tracking-wider
                                        block mb-2">
                        Subject
                      </label>
                      <select name="subject" value={form.subject} onChange={handleChange}
                        required className={inputCls}>
                        <option value="">Select a topic…</option>
                        {SUBJECTS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-forest uppercase tracking-wider
                                        block mb-2">
                        Message
                      </label>
                      <textarea name="message" value={form.message} onChange={handleChange}
                        required rows={5} placeholder="Describe your question or request…"
                        className={`${inputCls} resize-none`} />
                    </div>

                    {status === 'error' && (
                      <p className="text-xs text-red-600 bg-red-50 border border-red-200
                                    px-4 py-3 rounded-xl">
                        Something went wrong. Please email us directly at info@agroconnect.io.
                      </p>
                    )}

                    <button type="submit" disabled={status === 'sending'}
                      className="w-full py-3.5 bg-forest text-white text-sm font-bold rounded-2xl
                                 hover:bg-forest-dark active:scale-[0.98] transition-all
                                 disabled:opacity-50 flex items-center justify-center gap-2">
                      {status === 'sending' ? (
                        <>
                          <svg className="animate-spin" viewBox="0 0 24 24" width="16" height="16"
                               fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" strokeLinecap="round"/>
                          </svg>
                          Sending…
                        </>
                      ) : 'Send Message'}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Offices */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="font-display font-bold text-forest text-xl mb-2">Our offices</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Walk-in support is available at our Accra and Kumasi offices during business hours
                  (Mon–Fri 8:00–17:00 GMT). Global HQ based in Accra, Ghana.
                </p>
              </div>

              {OFFICES.map((o) => (
                <div key={o.region}
                  className="bg-white rounded-2xl border border-border p-5">
                  <p className="font-bold text-forest text-sm mb-3">{o.region}</p>
                  <ul className="space-y-1.5 text-sm text-muted-foreground">
                    <li>{o.address}</li>
                    <li>{o.phone}</li>
                    <li>
                      <a href={`mailto:${o.email}`}
                        className="hover:text-forest transition-colors underline-offset-2 hover:underline">
                        {o.email}
                      </a>
                    </li>
                  </ul>
                </div>
              ))}

              <div className="bg-forest rounded-2xl p-5">
                <p className="font-bold text-white text-sm mb-1">International Inquiries</p>
                <p className="font-display font-extrabold text-lime text-lg">trade@agroconnect.io</p>
                <p className="text-white/50 text-xs mt-1">
                  For cross-border trade partnerships, institutional buyers,
                  and export contract inquiries — response within one business day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ nudge ─────────────────────────────────────────────────────── */}
      <section className="py-16 bg-white border-t border-border text-center px-4">
        <p className="text-muted-foreground text-sm mb-3">
          Looking for platform documentation or feature details?
        </p>
        <Link href="/features"
          className="inline-flex items-center gap-2 text-sm font-bold text-forest
                     hover:text-forest-dark transition-colors">
          Browse Platform Features
          <svg viewBox="0 0 16 16" width="13" height="13" fill="none"
               stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 8h10M9 4l4 4-4 4"/>
          </svg>
        </Link>
      </section>

    </main>
  )
}
