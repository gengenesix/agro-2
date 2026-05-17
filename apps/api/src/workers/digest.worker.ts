import { Worker }     from 'bullmq'
import { redis }      from '../config/redis.js'
import { prisma }     from '../config/database.js'
import { addEmailJob } from './queues.js'
import { logger }     from '../config/logger.js'

function buildDigestHtml(buyerName: string, listings: {
  title: string; pricePerUnit: number; unit: string; region: string; slug: string
}[]): string {
  const rows = listings.map((l: (typeof listings)[number]) => `
    <tr>
      <td style="padding:12px 0;border-bottom:1px solid #e8e0d0;">
        <strong style="font-family:Georgia,serif;color:#1a3a24;">${l.title}</strong><br/>
        <span style="font-family:monospace;color:#1a3a24;font-weight:700;">
          GHS ${l.pricePerUnit.toFixed(2)}/${l.unit}
        </span>
        &nbsp;&middot;&nbsp;
        <span style="color:#6b7a5e;font-size:13px;">${l.region}</span>
      </td>
      <td style="padding:12px 0 12px 16px;border-bottom:1px solid #e8e0d0;white-space:nowrap;">
        <a href="https://agroconnect.com.gh/produce/${l.slug}"
           style="background:#1a3a24;color:#fff;padding:8px 16px;border-radius:8px;
                  text-decoration:none;font-size:13px;font-weight:600;">
          View
        </a>
      </td>
    </tr>`).join('')

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f8f3e8;font-family:'Plus Jakarta Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e8e0d0;">
          <!-- Header -->
          <tr>
            <td style="background:#1a3a24;padding:28px 32px;">
              <p style="margin:0;color:#c8f542;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">
                AgroConnect &bull; Weekly Digest
              </p>
              <h1 style="margin:8px 0 0;color:#fff;font-size:22px;font-weight:700;">
                New listings for you, ${buyerName.split(' ')[0]}
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 20px;color:#3d4f3a;font-size:15px;line-height:1.6;">
                Here are ${listings.length} new listing${listings.length !== 1 ? 's' : ''} matching your
                buying preferences from the past 7 days.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${rows}
              </table>
              <div style="margin-top:28px;text-align:center;">
                <a href="https://agroconnect.com.gh/produce"
                   style="background:#c8f542;color:#1a3a24;padding:14px 32px;border-radius:12px;
                          text-decoration:none;font-weight:700;font-size:15px;display:inline-block;">
                  Browse all listings
                </a>
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8f3e8;padding:20px 32px;border-top:1px solid #e8e0d0;">
              <p style="margin:0;font-size:12px;color:#8a9280;text-align:center;">
                AgroConnect Ghana &bull; From seed to sale. Every farmer. Every region.<br/>
                <a href="https://agroconnect.com.gh/buyer/alerts"
                   style="color:#6b7a5e;">Manage your preferences</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function startDigestWorker() {
  const worker = new Worker(
    'digest',
    async (job) => {
      logger.info({ jobId: job.id }, 'Running weekly buyer digest')

      const buyers = await prisma.profile.findMany({
        where: { role: 'buyer', isActive: true, isBanned: false },
        include: {
          buyerProfile: { select: { preferredCategories: true, email: true, contactPerson: true } },
        },
      })

      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

      let emailsSent = 0

      for (const buyer of buyers) {
        const email = buyer.buyerProfile?.email
        if (!email) continue

        const prefs = buyer.buyerProfile?.preferredCategories ?? []

        const newListings = await prisma.listing.findMany({
          where: {
            status:    'active',
            createdAt: { gte: oneWeekAgo },
            ...(prefs.length > 0
              ? { category: { slug: { in: prefs } } }
              : {}),
          },
          take:    10,
          orderBy: { createdAt: 'desc' },
          include: {
            region:   { select: { name: true } },
            unit:     { select: { abbreviation: true } },
          },
        })

        if (newListings.length === 0) continue

        const listingData = newListings.map(l => ({
          title:        l.title,
          pricePerUnit: Number(l.pricePerUnit),
          unit:         l.unit.abbreviation,
          region:       l.region?.name ?? 'Ghana',
          slug:         l.slug,
        }))

        const buyerName = buyer.buyerProfile?.contactPerson ?? buyer.fullName

        await addEmailJob({
          to:      email,
          subject: `${newListings.length} new listings match your preferences — AgroConnect`,
          html:    buildDigestHtml(buyerName, listingData),
        })

        emailsSent++
      }

      logger.info({ emailsSent }, 'Weekly digest complete')
    },
    { connection: redis, concurrency: 1 },
  )

  worker.on('failed', (job, err) =>
    logger.error({ jobId: job?.id, err }, 'Digest worker job failed'),
  )

  return worker
}
