"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listingFiltersSchema = exports.broadcastSchema = exports.createReviewSchema = exports.pestReportSchema = exports.bnplApplySchema = exports.initPaymentSchema = exports.createOrderSchema = exports.createListingSchema = exports.buyerProfileSchema = exports.dealerProfileSchema = exports.farmerProfileSchema = exports.updateProfileSchema = exports.verifyOTPSchema = exports.requestOTPSchema = void 0;
const zod_1 = require("zod");
const ghanaPhone = zod_1.z
    .string()
    .regex(/^(\+233|0)[0-9]{9}$/, 'Enter a valid Ghana phone number');
exports.requestOTPSchema = zod_1.z.object({
    phone: ghanaPhone,
});
exports.verifyOTPSchema = zod_1.z.object({
    phone: ghanaPhone,
    otp: zod_1.z.string().length(6).regex(/^\d+$/),
});
exports.updateProfileSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2).max(100).optional(),
    language: zod_1.z.enum(['en', 'tw', 'ha', 'ew', 'ga']).optional(),
    regionId: zod_1.z.number().int().positive().optional(),
    districtId: zod_1.z.number().int().positive().optional(),
    community: zod_1.z.string().max(100).optional(),
});
exports.farmerProfileSchema = zod_1.z.object({
    farmName: zod_1.z.string().min(2).max(200).optional(),
    farmSizeAcres: zod_1.z.number().positive().optional(),
    gpsLat: zod_1.z.number().min(-90).max(90).optional(),
    gpsLng: zod_1.z.number().min(-180).max(180).optional(),
    sectors: zod_1.z.array(zod_1.z.string()).default([]),
    primaryProducts: zod_1.z.array(zod_1.z.string()).default([]),
    farmingMethods: zod_1.z.array(zod_1.z.string()).default([]),
    mobileMoneyNumber: zod_1.z.string().optional(),
    mobileMoneyNetwork: zod_1.z.enum(['mtn', 'vodafone', 'airteltigo']).optional(),
    nationalId: zod_1.z.string().optional(),
});
exports.dealerProfileSchema = zod_1.z.object({
    businessName: zod_1.z.string().min(2).max(200),
    registrationNumber: zod_1.z.string().optional(),
    physicalAddress: zod_1.z.string().optional(),
    gpsLat: zod_1.z.number().min(-90).max(90).optional(),
    gpsLng: zod_1.z.number().min(-180).max(180).optional(),
    deliveryRadiusKm: zod_1.z.number().int().min(1).max(500).default(20),
    sectorsServed: zod_1.z.array(zod_1.z.string()).default([]),
    mobileMoneyNumber: zod_1.z.string(),
    mobileMoneyNetwork: zod_1.z.enum(['mtn', 'vodafone', 'airteltigo']).optional(),
});
exports.buyerProfileSchema = zod_1.z.object({
    organizationName: zod_1.z.string().max(200).optional(),
    buyerType: zod_1.z.enum(['hotel', 'restaurant', 'processor', 'retailer', 'exporter', 'individual']),
    contactPerson: zod_1.z.string().max(100).optional(),
    email: zod_1.z.string().email().optional(),
    deliveryAddress: zod_1.z.string().optional(),
    preferredCategories: zod_1.z.array(zod_1.z.string()).default([]),
    monthlyVolumeEstimate: zod_1.z.string().optional(),
});
exports.createListingSchema = zod_1.z.object({
    title: zod_1.z.string().min(5).max(300),
    categoryId: zod_1.z.number().int().positive(),
    unitId: zod_1.z.number().int().positive(),
    listingType: zod_1.z.enum(['available_now', 'harvest_pledge']),
    quantityAvailable: zod_1.z.number().positive(),
    pricePerUnit: zod_1.z.number().positive(),
    minOrderQuantity: zod_1.z.number().positive().default(1),
    allowNegotiation: zod_1.z.boolean().default(true),
    regionId: zod_1.z.number().int().positive().optional(),
    districtId: zod_1.z.number().int().positive().optional(),
    community: zod_1.z.string().max(100).optional(),
    gpsLat: zod_1.z.number().min(-90).max(90).optional(),
    gpsLng: zod_1.z.number().min(-180).max(180).optional(),
    farmingMethod: zod_1.z.enum(['conventional', 'organic', 'certified_organic']).optional(),
    freshnessDays: zod_1.z.number().int().positive().optional(),
    deliveryOptions: zod_1.z.array(zod_1.z.string()).default([]),
    description: zod_1.z.string().max(5000).optional(),
    expectedHarvestDate: zod_1.z.string().datetime().optional(),
    depositPercentage: zod_1.z.number().int().min(10).max(100).default(20),
    brand: zod_1.z.string().max(100).optional(),
    manufacturer: zod_1.z.string().max(200).optional(),
});
exports.createOrderSchema = zod_1.z.object({
    listingId: zod_1.z.string().uuid(),
    quantity: zod_1.z.number().positive(),
    deliveryOption: zod_1.z.string(),
    deliveryAddress: zod_1.z.string().optional(),
    buyerNotes: zod_1.z.string().max(500).optional(),
});
exports.initPaymentSchema = zod_1.z.object({
    orderId: zod_1.z.string().uuid(),
    amount: zod_1.z.number().positive(),
    paymentType: zod_1.z.enum(['deposit', 'balance', 'full']),
});
exports.bnplApplySchema = zod_1.z.object({
    orderId: zod_1.z.string().uuid(),
    amountRequested: zod_1.z.number().positive(),
});
exports.pestReportSchema = zod_1.z.object({
    pestName: zod_1.z.string().min(2).max(200),
    categoryId: zod_1.z.number().int().positive().optional(),
    severity: zod_1.z.enum(['mild', 'moderate', 'severe']),
    description: zod_1.z.string().max(2000).optional(),
    regionId: zod_1.z.number().int().positive().optional(),
    districtId: zod_1.z.number().int().positive().optional(),
    gpsLat: zod_1.z.number().min(-90).max(90).optional(),
    gpsLng: zod_1.z.number().min(-180).max(180).optional(),
});
exports.createReviewSchema = zod_1.z.object({
    orderId: zod_1.z.string().uuid(),
    rating: zod_1.z.number().int().min(1).max(5),
    comment: zod_1.z.string().max(1000).optional(),
    tags: zod_1.z.array(zod_1.z.string()).default([]),
});
exports.broadcastSchema = zod_1.z.object({
    message: zod_1.z.string().min(10).max(160),
    channels: zod_1.z.array(zod_1.z.enum(['sms', 'push'])).min(1),
    filter: zod_1.z.object({
        roles: zod_1.z.array(zod_1.z.string()).optional(),
        regionIds: zod_1.z.array(zod_1.z.number()).optional(),
    }).optional(),
});
exports.listingFiltersSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(50).default(12),
    sector: zod_1.z.string().optional(),
    categorySlug: zod_1.z.string().optional(),
    regionId: zod_1.z.coerce.number().int().positive().optional(),
    districtId: zod_1.z.coerce.number().int().positive().optional(),
    listingType: zod_1.z.enum(['available_now', 'harvest_pledge']).optional(),
    maxPrice: zod_1.z.coerce.number().positive().optional(),
    minQuantity: zod_1.z.coerce.number().positive().optional(),
    farmingMethod: zod_1.z.string().optional(),
    deliveryOption: zod_1.z.string().optional(),
    verifiedOnly: zod_1.z.coerce.boolean().optional(),
    bnplOnly: zod_1.z.coerce.boolean().optional(),
    search: zod_1.z.string().max(200).optional(),
    sortBy: zod_1.z.enum(['newest', 'price_low', 'price_high', 'most_viewed', 'harvest_soonest', 'top_rated']).default('newest'),
    lat: zod_1.z.coerce.number().optional(),
    lng: zod_1.z.coerce.number().optional(),
    radiusKm: zod_1.z.coerce.number().positive().optional(),
});
//# sourceMappingURL=index.js.map