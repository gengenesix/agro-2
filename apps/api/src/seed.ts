import { prisma } from './config/database.js'
import { logger } from './config/logger.js'

const GHANA_REGIONS = [
  { id: 1,  name: 'Greater Accra', code: 'GA' },
  { id: 2,  name: 'Ashanti',       code: 'AH' },
  { id: 3,  name: 'Western',       code: 'WE' },
  { id: 4,  name: 'Western North', code: 'WN' },
  { id: 5,  name: 'Eastern',       code: 'ER' },
  { id: 6,  name: 'Central',       code: 'CE' },
  { id: 7,  name: 'Volta',         code: 'VO' },
  { id: 8,  name: 'Oti',           code: 'OT' },
  { id: 9,  name: 'Bono',          code: 'BO' },
  { id: 10, name: 'Bono East',     code: 'BE' },
  { id: 11, name: 'Ahafo',         code: 'AF' },
  { id: 12, name: 'Brong-Ahafo',   code: 'BA' },
  { id: 13, name: 'Northern',      code: 'NO' },
  { id: 14, name: 'Savannah',      code: 'SA' },
  { id: 15, name: 'North East',    code: 'NE' },
  { id: 16, name: 'Upper East',    code: 'UE' },
  { id: 17, name: 'Upper West',    code: 'UW' },
]

const SEED_LISTINGS = [
  {
    title:       'Fresh Organic Tomatoes — Kumasi Farm',
    description: 'Sun-ripened organic tomatoes grown without pesticides. Firm, flavourful, and perfect for market. Bulk orders welcome — delivery available across Ashanti.',
    sector:      'crops',
    category:    'tomato',
    listingType: 'available_now',
    farmingMethod: 'organic',
    pricePerUnit: 2.50,
    quantity:    500,
    unit:        'kg',
    regionCode:  'AH',
    district:    'Kumasi Metropolitan',
    farmName:    'Asante Organic Farm',
    farmerName:  'Kwame Asante Boateng',
    farmerPhone: '+233244000001',
    photos: [
      'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&q=80&fit=crop',
    ],
  },
  {
    title:       '2-Month Maize Harvest — 5 Tonnes Reserved',
    description: 'High-yield OPAM variety maize. Farm is 8 hectares in Asuogyaman. Expecting 5–6 tonnes based on current crop condition. Open to partial pledges from 500 kg.',
    sector:      'crops',
    category:    'maize',
    listingType: 'harvest_pledge',
    farmingMethod: 'conventional',
    pricePerUnit: 1.80,
    quantity:    5000,
    unit:        'kg',
    regionCode:  'ER',
    district:    'Asuogyaman',
    farmName:    'Owusu Mensah Farm',
    farmerName:  'Abena Owusu Mensah',
    farmerPhone: '+233244000002',
    harvestDate: new Date(Date.now() + 60 * 86_400_000).toISOString(),
    depositPercent: 20,
    photos: [
      'https://images.unsplash.com/photo-1568219557405-376e23e4f7cf?w=800&q=80&fit=crop',
    ],
  },
  {
    title:       'NPK 15-15-15 Fertilizer — 50 kg Bags',
    description: 'Genuine NPK 15-15-15 sourced from Yara International. Suitable for cereals, vegetables, and cash crops. Available in pallet quantities. BNPL available for registered farmers.',
    sector:      'inputs',
    category:    'fertilizer',
    listingType: 'available_now',
    farmingMethod: 'conventional',
    pricePerUnit: 180.00,
    quantity:    200,
    unit:        'bag (50kg)',
    regionCode:  'GA',
    district:    'Accra Metropolitan',
    farmName:    'Agro Solutions Ltd',
    farmerName:  'Emmanuel Darko Oppong',
    farmerPhone: '+233244000003',
    bnplEligible: true,
    minimumOrder: 5,
    photos: [
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80&fit=crop',
    ],
  },
  {
    title:       'Live Broiler Chickens — Ready for Market',
    description: '6-week-old broilers averaging 2.5 kg. Fed on certified feed, vaccinated against Newcastle and Gumboro. Available for farmgate pickup in Lower Manya Krobo.',
    sector:      'poultry',
    category:    'broiler_chicken',
    listingType: 'available_now',
    farmingMethod: 'conventional',
    pricePerUnit: 35.00,
    quantity:    300,
    unit:        'head',
    regionCode:  'ER',
    district:    'Lower Manya Krobo',
    farmName:    'Tetteh Poultry Farm',
    farmerName:  'Emmanuel Tetteh',
    farmerPhone: '+233244000004',
    photos: [
      'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800&q=80&fit=crop',
    ],
  },
  {
    title:       'Live Tilapia — Fresh from Volta Lake',
    description: 'Cage-farmed Nile tilapia averaging 450g per fish. Very fresh — harvested same day. Ideal for hotels, restaurants, and retailers in Accra. Delivery arranged to Tema and Accra markets.',
    sector:      'fisheries',
    category:    'tilapia',
    listingType: 'available_now',
    farmingMethod: 'conventional',
    pricePerUnit: 22.00,
    quantity:    800,
    unit:        'kg',
    regionCode:  'VO',
    district:    'South Tongu',
    farmName:    'Volta Lake Fish Farm',
    farmerName:  'Yaw Darko Asante',
    farmerPhone: '+233244000005',
    photos: [
      'https://images.unsplash.com/photo-1570367823578-74b3ef1eba96?w=800&q=80&fit=crop',
    ],
  },
  {
    title:       'Premium Cocoa Beans — Certified Grade 1',
    description: 'Fermented and sun-dried Grade 1 cocoa beans from Ahafo. Moisture content 7.5%, no mould. COCOBOD certified. Exporter-ready with all documentation available.',
    sector:      'crops',
    category:    'cocoa',
    listingType: 'available_now',
    farmingMethod: 'certified_organic',
    pricePerUnit: 35.00,
    quantity:    2000,
    unit:        'kg',
    regionCode:  'AF',
    district:    'Tano South',
    farmName:    'Ahafo Cocoa Cooperative',
    farmerName:  'Nana Yaw Boateng',
    farmerPhone: '+233244000006',
    photos: [
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&q=80&fit=crop',
    ],
  },
  {
    title:       'Fresh Ginger — Northern Region Harvest',
    description: 'Hand-harvested fresh ginger from the Northern Region. Strong aroma, high oleoresin content. Popular with processors and exporters. 200 kg minimum order.',
    sector:      'crops',
    category:    'ginger',
    listingType: 'available_now',
    farmingMethod: 'organic',
    pricePerUnit: 8.50,
    quantity:    1200,
    unit:        'kg',
    minimumOrder: 200,
    regionCode:  'NO',
    district:    'Tamale Metropolis',
    farmName:    'Northern Spice Farms',
    farmerName:  'Alhassan Mohammed Ibrahim',
    farmerPhone: '+233244000007',
    photos: [
      'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&q=80&fit=crop',
    ],
  },
  {
    title:       'Catfish (Clarias) — Live & Ready',
    description: 'Grown in earthen ponds in Brong-Ahafo. Average weight 600g–800g. Can be sold live or dressed. Delivery to Kumasi central market available every Tuesday and Friday.',
    sector:      'fisheries',
    category:    'catfish',
    listingType: 'available_now',
    farmingMethod: 'conventional',
    pricePerUnit: 28.00,
    quantity:    500,
    unit:        'kg',
    regionCode:  'BA',
    district:    'Techiman',
    farmName:    'Techiman Fish Ponds',
    farmerName:  'Akosua Frimpong',
    farmerPhone: '+233244000008',
    photos: [
      'https://images.unsplash.com/photo-1570367823578-74b3ef1eba96?w=800&q=80&fit=crop',
    ],
  },
]

async function seed() {
  logger.info('Starting seed…')

  // Seed regions
  for (const r of GHANA_REGIONS) {
    await prisma.region.upsert({
      where:  { id: r.id },
      update: { name: r.name, code: r.code },
      create: { id: r.id, name: r.name, code: r.code },
    })
  }
  logger.info(`Seeded ${GHANA_REGIONS.length} regions`)

  // Seed listings with farmers
  let created = 0
  for (const seed of SEED_LISTINGS) {
    const region = await prisma.region.findFirst({ where: { code: seed.regionCode } })
    if (!region) continue

    // Upsert farmer user
    const farmer = await prisma.profile.upsert({
      where:  { phone: seed.farmerPhone },
      update: { fullName: seed.farmerName, verificationLevel: 'verified' },
      create: {
        phone:             seed.farmerPhone,
        fullName:          seed.farmerName,
        role:              seed.sector === 'inputs' ? 'dealer' : 'farmer',
        verificationLevel: 'verified',
        supabaseId:        `seed-${seed.farmerPhone}`,
      },
    })

    // Upsert farmer profile
    if (farmer.role === 'farmer') {
      await prisma.farmerProfile.upsert({
        where:  { userId: farmer.id },
        update: { farmName: seed.farmName, agroScore: 65, regionId: region.id },
        create: {
          userId:          farmer.id,
          farmName:        seed.farmName,
          farmSizeHectares: 4.5,
          agroScore:       65,
          regionId:        region.id,
          district:        seed.district,
        },
      })
    } else {
      await prisma.dealerProfile.upsert({
        where:  { userId: farmer.id },
        update: { businessName: seed.farmName, regionId: region.id },
        create: {
          userId:       farmer.id,
          businessName: seed.farmName,
          regionId:     region.id,
          district:     seed.district,
        },
      })
    }

    // Create wallet if missing
    await prisma.wallet.upsert({
      where:  { userId: farmer.id },
      update: {},
      create: { userId: farmer.id, balance: 0, pendingBalance: 0, currency: 'GHS' },
    })

    // Create listing
    const slug = seed.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .slice(0, 60)
      + `-${Date.now().toString(36)}`

    await prisma.listing.create({
      data: {
        title:          seed.title,
        slug,
        description:    seed.description,
        sector:         seed.sector as any,
        category:       seed.category,
        listingType:    seed.listingType as any,
        farmingMethod:  seed.farmingMethod as any,
        pricePerUnit:   seed.pricePerUnit,
        quantityTotal:  seed.quantity,
        quantityAvailable: seed.quantity,
        unit:           seed.unit,
        sellerId:       farmer.id,
        regionId:       region.id,
        district:       seed.district,
        status:         'active',
        bnplEligible:   seed.bnplEligible ?? false,
        minimumOrder:   seed.minimumOrder ?? 1,
        deliveryAvailable: true,
        photos:         seed.photos,
        ...(seed.harvestDate && { harvestDate: new Date(seed.harvestDate) }),
        ...(seed.depositPercent && { depositPercent: seed.depositPercent }),
      },
    })

    created++
  }

  logger.info(`Seeded ${created} listings`)
  logger.info('Seed complete.')
}

seed()
  .catch(err => { logger.error(err); process.exit(1) })
  .finally(() => prisma.$disconnect())
