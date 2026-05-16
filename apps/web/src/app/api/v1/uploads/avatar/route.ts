import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { getAuthProfile } from '@/lib/api-auth'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE     = 5 * 1024 * 1024 // 5 MB

function detectMime(buf: Buffer): string | null {
  // JPEG
  if (buf[0] === 0xff && buf[1] === 0xd8) return 'image/jpeg'
  // PNG
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png'
  // WEBP
  if (buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return 'image/webp'
  // GIF
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return 'image/gif'
  return null
}

const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/gif':  'gif',
}

export async function POST(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('avatar')
  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ success: false, error: 'File too large (max 5 MB)' }, { status: 413 })
  }

  const buf    = Buffer.from(await file.arrayBuffer())
  const mime   = detectMime(buf)

  if (!mime || !ALLOWED_MIME.includes(mime)) {
    return NextResponse.json({ success: false, error: 'Invalid image format' }, { status: 415 })
  }

  const uploadsDir = join(process.cwd(), 'public', 'uploads', 'avatars')
  await mkdir(uploadsDir, { recursive: true })

  const filename = `${randomUUID()}.${EXT[mime]}`
  await writeFile(join(uploadsDir, filename), buf)

  const url = `/uploads/avatars/${filename}`

  return NextResponse.json({ success: true, data: { url } })
}
