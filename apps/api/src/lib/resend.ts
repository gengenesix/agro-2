import { Resend } from 'resend'
import { env }    from '../config/env.js'
import { logger } from '../config/logger.js'

const resend = new Resend(env.RESEND_API_KEY)

export async function sendEmail(opts: {
  to:      string | string[]
  subject: string
  html:    string
  from?:   string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from:    opts.from ?? 'AgroConnect <noreply@agroconnect.com.gh>',
      to:      Array.isArray(opts.to) ? opts.to : [opts.to],
      subject: opts.subject,
      html:    opts.html,
    })
    if (error) {
      logger.warn({ error }, 'Resend email error')
    }
    return data
  } catch (err) {
    logger.error({ err }, 'Failed to send email')
    return undefined
  }
}

export function orderConfirmationEmail(opts: {
  buyerName:  string
  listingTitle: string
  quantity:   number
  unit:       string
  totalAmount: number
  orderId:    string
}) {
  return {
    subject: `Order confirmed — ${opts.listingTitle}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: #1a3a24; padding: 24px; border-radius: 16px; margin-bottom: 24px;">
          <h1 style="color: #c8f441; margin: 0; font-size: 20px;">AgroConnect</h1>
          <p style="color: rgba(255,255,255,0.7); margin: 4px 0 0; font-size: 13px;">From seed to sale.</p>
        </div>
        <h2 style="color: #1a3a24;">Order Confirmed</h2>
        <p>Hi ${opts.buyerName},</p>
        <p>Your order has been confirmed. The seller has been notified.</p>
        <div style="background: #f5f0e8; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 8px; font-size: 13px; color: #6b6b5b;">Product</p>
          <p style="margin: 0 0 16px; font-weight: bold; color: #1a3a24;">${opts.listingTitle}</p>
          <div style="display: flex; justify-content: space-between;">
            <div>
              <p style="margin: 0 0 4px; font-size: 12px; color: #6b6b5b;">Quantity</p>
              <p style="margin: 0; font-family: monospace; font-weight: bold;">${opts.quantity} ${opts.unit}</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0 0 4px; font-size: 12px; color: #6b6b5b;">Total paid</p>
              <p style="margin: 0; font-family: monospace; font-weight: bold; color: #1a3a24;">GHS ${opts.totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <p>Order ID: <code style="background: #f5f0e8; padding: 2px 6px; border-radius: 4px;">${opts.orderId}</code></p>
        <p style="color: #6b6b5b; font-size: 13px;">Questions? Reply to this email or call 0800-AGRO (24/7).</p>
        <hr style="border: none; border-top: 1px solid #e8e0d0; margin: 24px 0;" />
        <p style="color: #9b9b8b; font-size: 11px;">AgroConnect · agroconnect.com.gh · Ghana</p>
      </div>
    `,
  }
}
