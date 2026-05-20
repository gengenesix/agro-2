import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

// ─── Regions ──────────────────────────────────────────────────────────────────

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

// ─── Commodity catalogue ──────────────────────────────────────────────────────
// basePrice = GHS per unit at Accra Central / Agbogbloshie (2024 reference)

const COMMODITIES = [
  { name: 'Maize',          sector: 'crops',     slug: 'maize',          unit: '100kg bag',   abbr: 'bag',    basePrice: 175  },
  { name: 'Rice (Local)',    sector: 'crops',     slug: 'rice-local',     unit: '50kg bag',    abbr: 'bag',    basePrice: 280  },
  { name: 'Tomato',         sector: 'crops',     slug: 'tomato',         unit: 'Crate (30kg)',abbr: 'crate',  basePrice: 90   },
  { name: 'Cassava',        sector: 'crops',     slug: 'cassava',        unit: '50kg bag',    abbr: 'bag',    basePrice: 42   },
  { name: 'Yam',            sector: 'crops',     slug: 'yam',            unit: '100 tubers',  abbr: '100 tub',basePrice: 130  },
  { name: 'Plantain',       sector: 'crops',     slug: 'plantain',       unit: 'Bunch',       abbr: 'bunch',  basePrice: 65   },
  { name: 'Onion',          sector: 'crops',     slug: 'onion',          unit: '50kg bag',    abbr: 'bag',    basePrice: 150  },
  { name: 'Groundnut',      sector: 'crops',     slug: 'groundnut',      unit: '50kg bag',    abbr: 'bag',    basePrice: 210  },
  { name: 'Tilapia (Live)', sector: 'fisheries', slug: 'tilapia-live',   unit: 'kg',          abbr: 'kg',     basePrice: 28   },
  { name: 'Catfish',        sector: 'fisheries', slug: 'catfish',        unit: 'kg',          abbr: 'kg',     basePrice: 32   },
  { name: 'Broiler Chicken',sector: 'poultry',   slug: 'broiler-chicken',unit: 'bird',        abbr: 'bird',   basePrice: 38   },
  { name: 'Eggs (Tray)',    sector: 'poultry',   slug: 'eggs-tray',      unit: 'tray (30)',   abbr: 'tray',   basePrice: 24   },
] as const

// ─── Seed helpers ─────────────────────────────────────────────────────────────

/** Deterministic ±pct swing seeded by (dayOffset, index) — no randomness. */
function deterministicVariation(dayOffset: number, index: number, pct: number): number {
  return Math.sin(dayOffset * 1.618 + index * 2.718) * pct
}

async function seedRegions() {
  for (const r of REGIONS) {
    await prisma.region.upsert({
      where:  { code: r.code },
      update: { name: r.name, zone: r.zone },
      create: { id: r.id, name: r.name, code: r.code, zone: r.zone },
    })
  }
  console.log(`✓ ${REGIONS.length} Ghana regions`)
}

async function seedMarketPrices() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 0; i < COMMODITIES.length; i++) {
    const c = COMMODITIES[i]

    // Ensure unit exists (no unique constraint on name — use findFirst)
    let unit = await prisma.unitOfMeasure.findFirst({ where: { name: c.unit } })
    if (!unit) {
      unit = await prisma.unitOfMeasure.create({
        data: { name: c.unit, abbreviation: c.abbr, applicableSectors: [c.sector] },
      })
    }

    // Ensure category exists
    const category = await prisma.productCategory.upsert({
      where:  { slug: c.slug },
      update: { name: c.name },
      create: { name: c.name, sector: c.sector as 'crops' | 'livestock' | 'poultry' | 'fisheries' | 'inputs', slug: c.slug },
    })

    // Seed 8 days of price history (today + 7 days back) for sparklines
    for (let dayOffset = 7; dayOffset >= 0; dayOffset--) {
      const date = new Date(today)
      date.setDate(date.getDate() - dayOffset)

      const variation  = deterministicVariation(dayOffset, i, 0.04) // ±4% daily swing
      const price      = Math.round(c.basePrice * (1 + variation) * 100) / 100

      // Use upsert keyed on category + region + date to stay idempotent
      const existing = await prisma.marketPrice.findFirst({
        where: {
          categoryId: category.id,
          regionId:   1,
          recordedAt: date,
        },
      })

      if (!existing) {
        await prisma.marketPrice.create({
          data: {
            categoryId:  category.id,
            unitId:      unit.id,
            regionId:    1,   // Greater Accra
            pricePerUnit: price,
            recordedAt:  date,
            source:      'Agbogbloshie / Makola Market',
          },
        })
      }
    }
  }

  console.log(`✓ Market prices for ${COMMODITIES.length} commodities (8 days each)`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  await seedRegions()
  await seedMarketPrices()
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
