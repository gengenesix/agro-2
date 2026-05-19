import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'
import { uploadImage }   from '@/lib/supabase-storage'

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE     = 5 * 1024 * 1024

function detectMime(buf: Buffer): string | null {
  if (buf[0] === 0xff && buf[1] === 0xd8) return 'image/jpeg'
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return 'image/png'
  if (buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return 'image/webp'
  return null
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

  const files = formData.getAll('photos').filter(f => f instanceof Blob) as Blob[]
  if (files.length === 0) {
    return NextResponse.json({ success: false, error: 'No files provided' }, { status: 400 })
  }

  const urls: string[] = []
  const errors: string[] = []

  for (const file of files.slice(0, 5)) {
    if (file.size > MAX_SIZE) {
      errors.push(`File too large (max 5 MB)`)
      continue
    }
    const buf  = Buffer.from(await file.arrayBuffer())
    const mime = detectMime(buf)
    if (!mime || !ALLOWED_MIME.includes(mime)) {
      errors.push(`Invalid image format`)
      continue
    }
    try {
      const url = await uploadImage('listing-photos', buf, mime)
      urls.push(url)
    } catch (err: unknown) {
      errors.push(err instanceof Error ? err.message : 'Upload failed')
    }
  }

  if (urls.length === 0) {
    return NextResponse.json(
      { success: false, error: errors[0] ?? 'All uploads failed' },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true, data: { urls } })
}
