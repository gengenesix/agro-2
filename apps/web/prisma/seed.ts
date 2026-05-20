import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

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

async function main() {
  for (const r of REGIONS) {
    await prisma.region.upsert({
      where:  { code: r.code },
      update: { name: r.name, zone: r.zone },
      create: { id: r.id, name: r.name, code: r.code, zone: r.zone },
    })
  }
  console.log(`Seeded ${REGIONS.length} Ghana regions.`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
