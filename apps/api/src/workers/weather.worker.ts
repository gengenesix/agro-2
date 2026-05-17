import { Worker } from 'bullmq'
import { redis }  from '../config/redis.js'
import { prisma } from '../config/database.js'
import { getDistrictForecast, assessFarmingConditions } from '../lib/open-meteo.js'
import { sendBulkSMS } from '../lib/arkesel.js'
import { logger }  from '../config/logger.js'

export function startWeatherWorker() {
  const worker = new Worker('weather', async (job) => {
    if (job.name === 'fetch-alerts') {
      logger.info('Fetching weather alerts for all districts')

      const districts = await prisma.district.findMany({
        where:   { centerLat: { not: null }, centerLng: { not: null } },
        include: { region: { select: { name: true } } },
      })

      for (const district of districts) {
        try {
          const forecast   = await getDistrictForecast(Number(district.centerLat), Number(district.centerLng))
          const assessment = assessFarmingConditions(forecast)

          if (assessment.alert && assessment.severity !== 'info') {
            const existingAlert = await prisma.weatherAlert.findFirst({
              where: {
                districtId: district.id,
                isSent:     false,
                validUntil: { gte: new Date() },
              },
            })

            if (!existingAlert) {
              const alert = await prisma.weatherAlert.create({
                data: {
                  regionId:   district.regionId,
                  districtId: district.id,
                  alertType:  assessment.severity === 'critical' ? 'drought_warning' : 'drought_warning',
                  severity:   assessment.severity,
                  title:      `Weather Alert: ${district.name}`,
                  message:    assessment.message,
                  validFrom:  new Date(),
                  validUntil: new Date(Date.now() + 6 * 3600 * 1000),
                },
              })

              const farmers = await prisma.profile.findMany({
                where:  { role: 'farmer', districtId: district.id, isActive: true },
                select: { phone: true },
              })

              if (farmers.length > 0) {
                const phones = farmers.map((f: typeof farmers[number]) => f.phone)
                await sendBulkSMS({
                  recipients: phones,
                  message:    `AgroConnect Weather Alert - ${district.name}: ${assessment.message}`,
                })

                await prisma.weatherAlert.update({
                  where: { id: alert.id },
                  data:  { isSent: true },
                })
              }
            }
          }
        } catch (err) {
          logger.warn({ districtId: district.id, err }, 'Weather fetch failed for district')
        }
      }

      logger.info('Weather alert fetch complete')
    }
  }, { connection: redis, concurrency: 1 })

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, err }, 'Weather job failed')
  })

  logger.info('Weather worker started')
  return worker
}
