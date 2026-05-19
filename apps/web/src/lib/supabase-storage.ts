import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

type Folder = 'avatars' | 'farm-photos' | 'listing-photos' | 'kyc'

const MIME_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/gif':  'gif',
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('[storage] NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set')
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

export async function uploadImage(
  folder: Folder,
  buffer: Buffer,
  mime: string,
): Promise<string> {
  const ext  = MIME_EXT[mime] ?? 'jpg'
  const path = `${folder}/${randomUUID()}.${ext}`
  const bucket = process.env.SUPABASE_STORAGE_BUCKET ?? 'agroconnect'

  const supabase = getAdminClient()
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, { contentType: mime, upsert: false })

  if (error) throw new Error(`Storage upload failed: ${error.message}`)

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}
