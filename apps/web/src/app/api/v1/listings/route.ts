import { NextRequest, NextResponse } from 'next/server'
import { getAuthProfile } from '@/lib/api-auth'

const MOCK_LISTINGS = [
  { id: 'lst-001', title: 'Fresh Organic Tomatoes — Kumasi Farm', slug: 'fresh-organic-tomatoes-kumasi-farm', listingType: 'available_now', status: 'active', quantityAvailable: 500, pricePerUnit: 2.50, minOrderQuantity: 10, photos: ['https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400&q=80'], farmingMethod: 'organic', expectedHarvestDate: null, depositPercentage: 20, pledgeStatus: null, bnplAvailable: false, viewsCount: 142, createdAt: '2025-06-01T08:00:00.000Z', unit: { name: 'Kilogram', abbreviation: 'kg' }, category: { name: 'Tomato', sector: 'crops', slug: 'tomato' }, region: { name: 'Ashanti', code: 'AH' }, district: { name: 'Kumasi Metropolitan' }, seller: { id: 'usr-001', fullName: 'Kwame Asante Boateng', avatarUrl: null, verificationLevel: 'field_verified', agroScore: 82 } },
  { id: 'lst-002', title: '2-Month Maize Harvest — 5 Tonnes Reserved', slug: 'maize-harvest-5-tonnes-eastern', listingType: 'harvest_pledge', status: 'active', quantityAvailable: 5000, pricePerUnit: 1.80, minOrderQuantity: 500, photos: ['https://images.unsplash.com/photo-1568219557405-376e23e4f7cf?w=400&q=80'], farmingMethod: 'conventional', expectedHarvestDate: '2025-09-15T00:00:00.000Z', depositPercentage: 20, pledgeStatus: 'open', bnplAvailable: false, viewsCount: 89, createdAt: '2025-05-28T10:00:00.000Z', unit: { name: 'Kilogram', abbreviation: 'kg' }, category: { name: 'Maize', sector: 'crops', slug: 'maize' }, region: { name: 'Eastern', code: 'ER' }, district: { name: 'Asuogyaman' }, seller: { id: 'usr-002', fullName: 'Abena Owusu Mensah', avatarUrl: null, verificationLevel: 'premium', agroScore: 95 } },
  { id: 'lst-003', title: 'NPK 15-15-15 Fertilizer — 50kg Bags', slug: 'npk-fertilizer-50kg-bags', listingType: 'available_now', status: 'active', quantityAvailable: 200, pricePerUnit: 180.00, minOrderQuantity: 1, photos: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80'], farmingMethod: null, expectedHarvestDate: null, depositPercentage: 0, pledgeStatus: null, bnplAvailable: true, viewsCount: 231, createdAt: '2025-05-20T09:00:00.000Z', unit: { name: 'Bag (50kg)', abbreviation: 'bag' }, category: { name: 'Fertilizer', sector: 'inputs', slug: 'fertilizer' }, region: { name: 'Greater Accra', code: 'GA' }, district: { name: 'Accra Metropolitan' }, seller: { id: 'usr-003', fullName: 'Agro Solutions Ltd', avatarUrl: null, verificationLevel: 'premium', agroScore: 98 } },
  { id: 'lst-004', title: 'Live Broiler Chickens — Farm Gate', slug: 'live-broiler-chickens-eastern', listingType: 'available_now', status: 'active', quantityAvailable: 300, pricePerUnit: 35.00, minOrderQuantity: 10, photos: ['https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=400&q=80'], farmingMethod: 'conventional', expectedHarvestDate: null, depositPercentage: 0, pledgeStatus: null, bnplAvailable: false, viewsCount: 67, createdAt: '2025-06-02T07:00:00.000Z', unit: { name: 'Head', abbreviation: 'hd' }, category: { name: 'Broiler Chicken', sector: 'poultry', slug: 'broiler-chicken' }, region: { name: 'Eastern', code: 'ER' }, district: { name: 'Lower Manya Krobo' }, seller: { id: 'usr-004', fullName: 'Emmanuel Tetteh', avatarUrl: null, verificationLevel: 'field_verified', agroScore: 74 } },
  { id: 'lst-005', title: 'Live Tilapia — Volta Lake Farm', slug: 'live-tilapia-volta-lake', listingType: 'available_now', status: 'active', quantityAvailable: 800, pricePerUnit: 22.00, minOrderQuantity: 20, photos: ['https://images.unsplash.com/photo-1570367823578-74b3ef1eba96?w=400&q=80'], farmingMethod: 'conventional', expectedHarvestDate: null, depositPercentage: 0, pledgeStatus: null, bnplAvailable: false, viewsCount: 115, createdAt: '2025-05-30T06:00:00.000Z', unit: { name: 'Kilogram', abbreviation: 'kg' }, category: { name: 'Tilapia', sector: 'fisheries', slug: 'tilapia' }, region: { name: 'Volta', code: 'VO' }, district: { name: 'South Tongu' }, seller: { id: 'usr-005', fullName: 'Yaw Darko Asante', avatarUrl: null, verificationLevel: 'self_declared', agroScore: 58 } },
  { id: 'lst-006', title: 'Cocoa Beans — Certified Fine Flavour', slug: 'cocoa-beans-certified-western', listingType: 'harvest_pledge', status: 'active', quantityAvailable: 3000, pricePerUnit: 12.50, minOrderQuantity: 100, photos: ['https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=400&q=80'], farmingMethod: 'certified_organic', expectedHarvestDate: '2025-11-01T00:00:00.000Z', depositPercentage: 25, pledgeStatus: 'partially_pledged', bnplAvailable: false, viewsCount: 203, createdAt: '2025-05-15T10:00:00.000Z', unit: { name: 'Kilogram', abbreviation: 'kg' }, category: { name: 'Cocoa', sector: 'crops', slug: 'cocoa' }, region: { name: 'Western', code: 'WE' }, district: { name: 'Juaboso' }, seller: { id: 'usr-006', fullName: 'Akosua Frimpong', avatarUrl: null, verificationLevel: 'premium', agroScore: 101 } },
]

export async function POST(req: NextRequest) {
  const profile = await getAuthProfile(req)
  if (!profile) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({
    success: true,
    data: { id: 'lst-new-001', slug: 'new-listing-demo', title: 'Demo Listing' },
  }, { status: 201 })
}

export async function GET(req: NextRequest) {
  const url         = new URL(req.url)
  const sector      = url.searchParams.get('sector')
  const listingType = url.searchParams.get('listingType')
  const search      = url.searchParams.get('q')?.toLowerCase()
  const page        = Math.max(1, Number(url.searchParams.get('page') ?? 1))
  const limit       = Math.min(50, Number(url.searchParams.get('limit') ?? 20))

  let filtered = MOCK_LISTINGS.filter(l => {
    if (sector      && l.category.sector !== sector) return false
    if (listingType && l.listingType     !== listingType) return false
    if (search      && !l.title.toLowerCase().includes(search)) return false
    return true
  })

  const total = filtered.length
  const listings = filtered.slice((page - 1) * limit, page * limit)

  return NextResponse.json({
    success: true,
    data: { listings, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
  })
}
