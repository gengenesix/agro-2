import { z } from 'zod'

const ghanaPhone = z
  .string()
  .regex(/^(\+233|0)[0-9]{9}$/, 'Enter a valid Ghana phone number')

export const requestOTPSchema = z.object({
  phone: ghanaPhone,
})

export const verifyOTPSchema = z.object({
  phone: ghanaPhone,
  otp:   z.string().length(6).regex(/^\d+$/),
})

export const updateProfileSchema = z.object({
  fullName:   z.string().min(2).max(100).optional(),
  language:   z.enum(['en', 'tw', 'ha', 'ew', 'ga']).optional(),
  regionId:   z.number().int().positive().optional(),
  districtId: z.number().int().positive().optional(),
  community:  z.string().max(100).optional(),
})

export const farmerProfileSchema = z.object({
  farmName:           z.string().min(2).max(200).optional(),
  farmSizeAcres:      z.number().positive().optional(),
  gpsLat:             z.number().min(-90).max(90).optional(),
  gpsLng:             z.number().min(-180).max(180).optional(),
  sectors:            z.array(z.string()).default([]),
  primaryProducts:    z.array(z.string()).default([]),
  farmingMethods:     z.array(z.string()).default([]),
  mobileMoneyNumber:  z.string().optional(),
  mobileMoneyNetwork: z.enum(['mtn', 'vodafone', 'airteltigo']).optional(),
  nationalId:         z.string().optional(),
})

export const dealerProfileSchema = z.object({
  businessName:       z.string().min(2).max(200),
  registrationNumber: z.string().optional(),
  physicalAddress:    z.string().optional(),
  gpsLat:             z.number().min(-90).max(90).optional(),
  gpsLng:             z.number().min(-180).max(180).optional(),
  deliveryRadiusKm:   z.number().int().min(1).max(500).default(20),
  sectorsServed:      z.array(z.string()).default([]),
  mobileMoneyNumber:  z.string(),
  mobileMoneyNetwork: z.enum(['mtn', 'vodafone', 'airteltigo']).optional(),
})

export const buyerProfileSchema = z.object({
  organizationName:      z.string().max(200).optional(),
  buyerType:             z.enum(['hotel', 'restaurant', 'processor', 'retailer', 'exporter', 'individual']),
  contactPerson:         z.string().max(100).optional(),
  email:                 z.string().email().optional(),
  deliveryAddress:       z.string().optional(),
  preferredCategories:   z.array(z.string()).default([]),
  monthlyVolumeEstimate: z.string().optional(),
})

export const createListingSchema = z.object({
  title:               z.string().min(5).max(300),
  categoryId:          z.number().int().positive(),
  unitId:              z.number().int().positive(),
  listingType:         z.enum(['available_now', 'harvest_pledge']),
  quantityAvailable:   z.number().positive(),
  pricePerUnit:        z.number().positive(),
  minOrderQuantity:    z.number().positive().default(1),
  allowNegotiation:    z.boolean().default(true),
  regionId:            z.number().int().positive().optional(),
  districtId:          z.number().int().positive().optional(),
  community:           z.string().max(100).optional(),
  gpsLat:              z.number().min(-90).max(90).optional(),
  gpsLng:              z.number().min(-180).max(180).optional(),
  farmingMethod:       z.enum(['conventional', 'organic', 'certified_organic']).optional(),
  freshnessDays:       z.number().int().positive().optional(),
  deliveryOptions:     z.array(z.string()).default([]),
  description:         z.string().max(5000).optional(),
  expectedHarvestDate: z.string().datetime().optional(),
  depositPercentage:   z.number().int().min(10).max(100).default(20),
  brand:               z.string().max(100).optional(),
  manufacturer:        z.string().max(200).optional(),
})

export const createOrderSchema = z.object({
  listingId:       z.string().uuid(),
  quantity:        z.number().positive(),
  deliveryOption:  z.string(),
  deliveryAddress: z.string().optional(),
  buyerNotes:      z.string().max(500).optional(),
  useBNPL:         z.boolean().optional(),
})

export const initPaymentSchema = z.object({
  orderId:     z.string().uuid(),
  amount:      z.number().positive(),
  paymentType: z.enum(['deposit', 'balance', 'full']),
})

export const bnplApplySchema = z.object({
  orderId:         z.string().uuid(),
  amountRequested: z.number().positive(),
})

export const pestReportSchema = z.object({
  pestName:   z.string().min(2).max(200),
  categoryId: z.number().int().positive().optional(),
  severity:   z.enum(['mild', 'moderate', 'severe']),
  description: z.string().max(2000).optional(),
  regionId:   z.number().int().positive().optional(),
  districtId: z.number().int().positive().optional(),
  gpsLat:     z.number().min(-90).max(90).optional(),
  gpsLng:     z.number().min(-180).max(180).optional(),
})

export const createReviewSchema = z.object({
  orderId: z.string().uuid(),
  rating:  z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  tags:    z.array(z.string()).default([]),
})

export const broadcastSchema = z.object({
  message:  z.string().min(10).max(160),
  channels: z.array(z.enum(['sms', 'push'])).min(1),
  filter:   z.object({
    roles:     z.array(z.string()).optional(),
    regionIds: z.array(z.number()).optional(),
  }).optional(),
})

export const listingFiltersSchema = z.object({
  page:           z.coerce.number().int().positive().default(1),
  limit:          z.coerce.number().int().min(1).max(50).default(12),
  sector:         z.string().optional(),
  categorySlug:   z.string().optional(),
  regionId:       z.coerce.number().int().positive().optional(),
  districtId:     z.coerce.number().int().positive().optional(),
  listingType:    z.enum(['available_now', 'harvest_pledge']).optional(),
  maxPrice:       z.coerce.number().positive().optional(),
  minQuantity:    z.coerce.number().positive().optional(),
  farmingMethod:  z.string().optional(),
  deliveryOption: z.string().optional(),
  verifiedOnly:   z.coerce.boolean().optional(),
  bnplOnly:       z.coerce.boolean().optional(),
  search:         z.string().max(200).optional(),
  sortBy:         z.enum(['newest', 'price_low', 'price_high', 'most_viewed', 'harvest_soonest', 'top_rated']).default('newest'),
  lat:            z.coerce.number().optional(),
  lng:            z.coerce.number().optional(),
  radiusKm:       z.coerce.number().positive().optional(),
})

export type RequestOTPInput    = z.infer<typeof requestOTPSchema>
export type VerifyOTPInput     = z.infer<typeof verifyOTPSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type FarmerProfileInput = z.infer<typeof farmerProfileSchema>
export type DealerProfileInput = z.infer<typeof dealerProfileSchema>
export type BuyerProfileInput  = z.infer<typeof buyerProfileSchema>
export type CreateListingInput = z.infer<typeof createListingSchema>
export type CreateOrderInput   = z.infer<typeof createOrderSchema>
export type InitPaymentInput   = z.infer<typeof initPaymentSchema>
export type BNPLApplyInput     = z.infer<typeof bnplApplySchema>
export type PestReportInput    = z.infer<typeof pestReportSchema>
export type CreateReviewInput  = z.infer<typeof createReviewSchema>
export type BroadcastInput     = z.infer<typeof broadcastSchema>
export type ListingFilters     = z.infer<typeof listingFiltersSchema>
