import type { FastifyInstance } from 'fastify'
import { createClient }         from '@supabase/supabase-js'
import { env }                  from '../../config/env.js'
import { AuthError, BusinessError } from '../../lib/errors.js'

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5MB

// Detect MIME from magic bytes
function detectMime(buf: Buffer): string | null {
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg'
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png'
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46) return 'image/webp'
  return null
}

export default async function uploadsRoutes(app: FastifyInstance) {
  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

  app.post('/photo', async (req, reply) => {
    if (!req.user) throw new AuthError()

    const data = await req.file()
    if (!data) throw new BusinessError('No file provided.')

    const chunks: Buffer[] = []
    for await (const chunk of data.file) {
      chunks.push(chunk as Buffer)
    }
    const fileBuffer = Buffer.concat(chunks)

    if (fileBuffer.length > MAX_SIZE_BYTES) {
      throw new BusinessError('File exceeds 5MB limit.')
    }

    const detectedMime = detectMime(fileBuffer)
    if (!detectedMime || !ALLOWED_MIME.has(detectedMime)) {
      throw new BusinessError('Only JPEG, PNG, and WebP images are accepted.')
    }

    const ext  = detectedMime.split('/')[1].replace('jpeg', 'jpg')
    const path = `listings/${req.user.id}/${Date.now()}.${ext}`

    const { error } = await supabase.storage
      .from('agroconnect')
      .upload(path, fileBuffer, {
        contentType: detectedMime,
        upsert:      false,
      })

    if (error) throw new BusinessError('Upload failed. Please try again.')

    const { data: urlData } = supabase.storage
      .from('agroconnect')
      .getPublicUrl(path)

    return reply.status(201).send({ success: true, data: { url: urlData.publicUrl } })
  })
}
