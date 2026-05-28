import type { MetadataRoute } from 'next'

const BASE_URL = 'https://agroconnect.io'

async function getActiveListingSlugs(): Promise<string[]> {
  try {
    const apiBase = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000/api/v1'
    const res     = await fetch(`${apiBase}/listings?status=active&limit=500`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const json = await res.json()
    return (json.data?.listings ?? []).map((l: { slug: string }) => l.slug)
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getActiveListingSlugs()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url:              BASE_URL,
      lastModified:     new Date(),
      changeFrequency:  'daily',
      priority:         1,
    },
    {
      url:              `${BASE_URL}/produce`,
      lastModified:     new Date(),
      changeFrequency:  'hourly',
      priority:         0.9,
    },
    {
      url:              `${BASE_URL}/pledges`,
      lastModified:     new Date(),
      changeFrequency:  'hourly',
      priority:         0.85,
    },
    {
      url:              `${BASE_URL}/inputs`,
      lastModified:     new Date(),
      changeFrequency:  'daily',
      priority:         0.8,
    },
    {
      url:              `${BASE_URL}/login`,
      lastModified:     new Date(),
      changeFrequency:  'monthly',
      priority:         0.5,
    },
  ]

  const listingPages: MetadataRoute.Sitemap = slugs.map(slug => ({
    url:             `${BASE_URL}/produce/${slug}`,
    lastModified:    new Date(),
    changeFrequency: 'daily' as const,
    priority:        0.7,
  }))

  return [...staticPages, ...listingPages]
}
