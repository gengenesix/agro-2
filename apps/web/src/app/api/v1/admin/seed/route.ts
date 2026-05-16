import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const REGIONS = [
  { id: 1,  name: 'Greater Accra', code: 'GA', zone: 'southern' },
  { id: 2,  name: 'Ashanti',       code: 'AH', zone: 'middle'   },
  { id: 3,  name: 'Western',       code: 'WE', zone: 'southern' },
  { id: 4,  name: 'Western North', code: 'WN', zone: 'southern' },
  { id: 5,  name: 'Eastern',       code: 'ER', zone: 'southern' },
  { id: 6,  name: 'Central',       code: 'CE', zone: 'southern' },
  { id: 7,  name: 'Volta',         code: 'VO', zone: 'southern' },
  { id: 8,  name: 'Oti',           code: 'OT', zone: 'middle'   },
  { id: 9,  name: 'Bono',          code: 'BO', zone: 'middle'   },
  { id: 10, name: 'Bono East',     code: 'BE', zone: 'middle'   },
  { id: 11, name: 'Ahafo',         code: 'AF', zone: 'middle'   },
  { id: 12, name: 'Brong-Ahafo',   code: 'BA', zone: 'middle'   },
  { id: 13, name: 'Northern',      code: 'NO', zone: 'northern' },
  { id: 14, name: 'Savannah',      code: 'SA', zone: 'northern' },
  { id: 15, name: 'North East',    code: 'NE', zone: 'northern' },
  { id: 16, name: 'Upper East',    code: 'UE', zone: 'northern' },
  { id: 17, name: 'Upper West',    code: 'UW', zone: 'northern' },
] as const

export async function POST() {
  const existing = await prisma.region.count()
  if (existing > 0) {
    return NextResponse.json({ success: true, message: 'Already seeded' })
  }

  // Regions
  await prisma.region.createMany({ data: REGIONS.map(r => ({ id: r.id, name: r.name, code: r.code, zone: r.zone as 'southern' | 'middle' | 'northern' })) })

  // Units of measure
  const UNITS = [
    { name: 'kg',          abbreviation: 'kg',   applicableSectors: ['crops', 'livestock', 'poultry', 'fisheries', 'inputs'] },
    { name: 'tonne',       abbreviation: 't',    applicableSectors: ['crops', 'livestock'] },
    { name: 'head',        abbreviation: 'head', applicableSectors: ['livestock', 'poultry'] },
    { name: 'bag (50kg)',  abbreviation: 'bag',  applicableSectors: ['inputs', 'crops'] },
    { name: 'bag (25kg)',  abbreviation: 'bag',  applicableSectors: ['inputs', 'crops'] },
    { name: 'litre',       abbreviation: 'L',    applicableSectors: ['inputs'] },
    { name: 'piece',       abbreviation: 'pc',   applicableSectors: ['inputs', 'crops', 'poultry'] },
    { name: 'crate',       abbreviation: 'crt',  applicableSectors: ['poultry', 'crops'] },
    { name: 'bunch',       abbreviation: 'bnch', applicableSectors: ['crops'] },
    { name: 'basket',      abbreviation: 'bkt',  applicableSectors: ['crops', 'fisheries'] },
  ]
  await prisma.unitOfMeasure.createMany({ data: UNITS })

  return NextResponse.json({ success: true, message: 'Seeded regions and units' })
}
