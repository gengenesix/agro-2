import { z } from 'zod';
export declare const requestOTPSchema: z.ZodObject<{
    phone: z.ZodString;
}, "strip", z.ZodTypeAny, {
    phone: string;
}, {
    phone: string;
}>;
export declare const verifyOTPSchema: z.ZodObject<{
    phone: z.ZodString;
    otp: z.ZodString;
}, "strip", z.ZodTypeAny, {
    phone: string;
    otp: string;
}, {
    phone: string;
    otp: string;
}>;
export declare const updateProfileSchema: z.ZodObject<{
    fullName: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodEnum<["en", "tw", "ha", "ew", "ga"]>>;
    regionId: z.ZodOptional<z.ZodNumber>;
    districtId: z.ZodOptional<z.ZodNumber>;
    community: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    fullName?: string | undefined;
    language?: "en" | "tw" | "ha" | "ew" | "ga" | undefined;
    regionId?: number | undefined;
    districtId?: number | undefined;
    community?: string | undefined;
}, {
    fullName?: string | undefined;
    language?: "en" | "tw" | "ha" | "ew" | "ga" | undefined;
    regionId?: number | undefined;
    districtId?: number | undefined;
    community?: string | undefined;
}>;
export declare const farmerProfileSchema: z.ZodObject<{
    farmName: z.ZodOptional<z.ZodString>;
    farmSizeAcres: z.ZodOptional<z.ZodNumber>;
    gpsLat: z.ZodOptional<z.ZodNumber>;
    gpsLng: z.ZodOptional<z.ZodNumber>;
    sectors: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    primaryProducts: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    farmingMethods: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    mobileMoneyNumber: z.ZodOptional<z.ZodString>;
    mobileMoneyNetwork: z.ZodOptional<z.ZodEnum<["mtn", "vodafone", "airteltigo"]>>;
    nationalId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    sectors: string[];
    primaryProducts: string[];
    farmingMethods: string[];
    nationalId?: string | undefined;
    mobileMoneyNumber?: string | undefined;
    farmName?: string | undefined;
    farmSizeAcres?: number | undefined;
    gpsLat?: number | undefined;
    gpsLng?: number | undefined;
    mobileMoneyNetwork?: "mtn" | "vodafone" | "airteltigo" | undefined;
}, {
    nationalId?: string | undefined;
    mobileMoneyNumber?: string | undefined;
    farmName?: string | undefined;
    farmSizeAcres?: number | undefined;
    gpsLat?: number | undefined;
    gpsLng?: number | undefined;
    sectors?: string[] | undefined;
    primaryProducts?: string[] | undefined;
    farmingMethods?: string[] | undefined;
    mobileMoneyNetwork?: "mtn" | "vodafone" | "airteltigo" | undefined;
}>;
export declare const dealerProfileSchema: z.ZodObject<{
    businessName: z.ZodString;
    registrationNumber: z.ZodOptional<z.ZodString>;
    physicalAddress: z.ZodOptional<z.ZodString>;
    gpsLat: z.ZodOptional<z.ZodNumber>;
    gpsLng: z.ZodOptional<z.ZodNumber>;
    deliveryRadiusKm: z.ZodDefault<z.ZodNumber>;
    sectorsServed: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    mobileMoneyNumber: z.ZodString;
    mobileMoneyNetwork: z.ZodOptional<z.ZodEnum<["mtn", "vodafone", "airteltigo"]>>;
}, "strip", z.ZodTypeAny, {
    mobileMoneyNumber: string;
    businessName: string;
    deliveryRadiusKm: number;
    sectorsServed: string[];
    gpsLat?: number | undefined;
    gpsLng?: number | undefined;
    mobileMoneyNetwork?: "mtn" | "vodafone" | "airteltigo" | undefined;
    registrationNumber?: string | undefined;
    physicalAddress?: string | undefined;
}, {
    mobileMoneyNumber: string;
    businessName: string;
    gpsLat?: number | undefined;
    gpsLng?: number | undefined;
    mobileMoneyNetwork?: "mtn" | "vodafone" | "airteltigo" | undefined;
    registrationNumber?: string | undefined;
    physicalAddress?: string | undefined;
    deliveryRadiusKm?: number | undefined;
    sectorsServed?: string[] | undefined;
}>;
export declare const buyerProfileSchema: z.ZodObject<{
    organizationName: z.ZodOptional<z.ZodString>;
    buyerType: z.ZodEnum<["hotel", "restaurant", "processor", "retailer", "exporter", "individual"]>;
    contactPerson: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    deliveryAddress: z.ZodOptional<z.ZodString>;
    preferredCategories: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    monthlyVolumeEstimate: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    buyerType: "hotel" | "restaurant" | "processor" | "retailer" | "exporter" | "individual";
    preferredCategories: string[];
    email?: string | undefined;
    organizationName?: string | undefined;
    contactPerson?: string | undefined;
    deliveryAddress?: string | undefined;
    monthlyVolumeEstimate?: string | undefined;
}, {
    buyerType: "hotel" | "restaurant" | "processor" | "retailer" | "exporter" | "individual";
    email?: string | undefined;
    organizationName?: string | undefined;
    contactPerson?: string | undefined;
    deliveryAddress?: string | undefined;
    preferredCategories?: string[] | undefined;
    monthlyVolumeEstimate?: string | undefined;
}>;
export declare const createListingSchema: z.ZodObject<{
    title: z.ZodString;
    categoryId: z.ZodNumber;
    unitId: z.ZodNumber;
    listingType: z.ZodEnum<["available_now", "harvest_pledge"]>;
    quantityAvailable: z.ZodNumber;
    pricePerUnit: z.ZodNumber;
    minOrderQuantity: z.ZodDefault<z.ZodNumber>;
    allowNegotiation: z.ZodDefault<z.ZodBoolean>;
    regionId: z.ZodOptional<z.ZodNumber>;
    districtId: z.ZodOptional<z.ZodNumber>;
    community: z.ZodOptional<z.ZodString>;
    gpsLat: z.ZodOptional<z.ZodNumber>;
    gpsLng: z.ZodOptional<z.ZodNumber>;
    farmingMethod: z.ZodOptional<z.ZodEnum<["conventional", "organic", "certified_organic"]>>;
    freshnessDays: z.ZodOptional<z.ZodNumber>;
    deliveryOptions: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    description: z.ZodOptional<z.ZodString>;
    expectedHarvestDate: z.ZodOptional<z.ZodString>;
    depositPercentage: z.ZodDefault<z.ZodNumber>;
    brand: z.ZodOptional<z.ZodString>;
    manufacturer: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    categoryId: number;
    unitId: number;
    listingType: "available_now" | "harvest_pledge";
    quantityAvailable: number;
    pricePerUnit: number;
    minOrderQuantity: number;
    allowNegotiation: boolean;
    deliveryOptions: string[];
    depositPercentage: number;
    regionId?: number | undefined;
    districtId?: number | undefined;
    community?: string | undefined;
    description?: string | undefined;
    gpsLat?: number | undefined;
    gpsLng?: number | undefined;
    farmingMethod?: "conventional" | "organic" | "certified_organic" | undefined;
    freshnessDays?: number | undefined;
    expectedHarvestDate?: string | undefined;
    brand?: string | undefined;
    manufacturer?: string | undefined;
}, {
    title: string;
    categoryId: number;
    unitId: number;
    listingType: "available_now" | "harvest_pledge";
    quantityAvailable: number;
    pricePerUnit: number;
    regionId?: number | undefined;
    districtId?: number | undefined;
    community?: string | undefined;
    description?: string | undefined;
    gpsLat?: number | undefined;
    gpsLng?: number | undefined;
    minOrderQuantity?: number | undefined;
    allowNegotiation?: boolean | undefined;
    farmingMethod?: "conventional" | "organic" | "certified_organic" | undefined;
    freshnessDays?: number | undefined;
    deliveryOptions?: string[] | undefined;
    expectedHarvestDate?: string | undefined;
    depositPercentage?: number | undefined;
    brand?: string | undefined;
    manufacturer?: string | undefined;
}>;
export declare const createOrderSchema: z.ZodObject<{
    listingId: z.ZodString;
    quantity: z.ZodNumber;
    deliveryOption: z.ZodString;
    deliveryAddress: z.ZodOptional<z.ZodString>;
    buyerNotes: z.ZodOptional<z.ZodString>;
    useBNPL: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    listingId: string;
    quantity: number;
    deliveryOption: string;
    deliveryAddress?: string | undefined;
    buyerNotes?: string | undefined;
    useBNPL?: boolean | undefined;
}, {
    listingId: string;
    quantity: number;
    deliveryOption: string;
    deliveryAddress?: string | undefined;
    buyerNotes?: string | undefined;
    useBNPL?: boolean | undefined;
}>;
export declare const initPaymentSchema: z.ZodObject<{
    orderId: z.ZodString;
    amount: z.ZodNumber;
    paymentType: z.ZodEnum<["deposit", "balance", "full"]>;
}, "strip", z.ZodTypeAny, {
    orderId: string;
    amount: number;
    paymentType: "deposit" | "balance" | "full";
}, {
    orderId: string;
    amount: number;
    paymentType: "deposit" | "balance" | "full";
}>;
export declare const bnplApplySchema: z.ZodObject<{
    orderId: z.ZodString;
    amountRequested: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    orderId: string;
    amountRequested: number;
}, {
    orderId: string;
    amountRequested: number;
}>;
export declare const pestReportSchema: z.ZodObject<{
    pestName: z.ZodString;
    categoryId: z.ZodOptional<z.ZodNumber>;
    severity: z.ZodEnum<["mild", "moderate", "severe"]>;
    description: z.ZodOptional<z.ZodString>;
    regionId: z.ZodOptional<z.ZodNumber>;
    districtId: z.ZodOptional<z.ZodNumber>;
    gpsLat: z.ZodOptional<z.ZodNumber>;
    gpsLng: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    pestName: string;
    severity: "mild" | "moderate" | "severe";
    regionId?: number | undefined;
    districtId?: number | undefined;
    description?: string | undefined;
    gpsLat?: number | undefined;
    gpsLng?: number | undefined;
    categoryId?: number | undefined;
}, {
    pestName: string;
    severity: "mild" | "moderate" | "severe";
    regionId?: number | undefined;
    districtId?: number | undefined;
    description?: string | undefined;
    gpsLat?: number | undefined;
    gpsLng?: number | undefined;
    categoryId?: number | undefined;
}>;
export declare const createReviewSchema: z.ZodObject<{
    orderId: z.ZodString;
    rating: z.ZodNumber;
    comment: z.ZodOptional<z.ZodString>;
    tags: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    tags: string[];
    orderId: string;
    rating: number;
    comment?: string | undefined;
}, {
    orderId: string;
    rating: number;
    tags?: string[] | undefined;
    comment?: string | undefined;
}>;
export declare const broadcastSchema: z.ZodObject<{
    message: z.ZodString;
    channels: z.ZodArray<z.ZodEnum<["sms", "push"]>, "many">;
    filter: z.ZodOptional<z.ZodObject<{
        roles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        regionIds: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    }, "strip", z.ZodTypeAny, {
        roles?: string[] | undefined;
        regionIds?: number[] | undefined;
    }, {
        roles?: string[] | undefined;
        regionIds?: number[] | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    message: string;
    channels: ("push" | "sms")[];
    filter?: {
        roles?: string[] | undefined;
        regionIds?: number[] | undefined;
    } | undefined;
}, {
    message: string;
    channels: ("push" | "sms")[];
    filter?: {
        roles?: string[] | undefined;
        regionIds?: number[] | undefined;
    } | undefined;
}>;
export declare const listingFiltersSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    limit: z.ZodDefault<z.ZodNumber>;
    sector: z.ZodOptional<z.ZodString>;
    categorySlug: z.ZodOptional<z.ZodString>;
    regionId: z.ZodOptional<z.ZodNumber>;
    districtId: z.ZodOptional<z.ZodNumber>;
    listingType: z.ZodOptional<z.ZodEnum<["available_now", "harvest_pledge"]>>;
    maxPrice: z.ZodOptional<z.ZodNumber>;
    minQuantity: z.ZodOptional<z.ZodNumber>;
    farmingMethod: z.ZodOptional<z.ZodString>;
    deliveryOption: z.ZodOptional<z.ZodString>;
    verifiedOnly: z.ZodOptional<z.ZodBoolean>;
    bnplOnly: z.ZodOptional<z.ZodBoolean>;
    search: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodEnum<["newest", "price_low", "price_high", "most_viewed", "harvest_soonest", "top_rated"]>>;
    lat: z.ZodOptional<z.ZodNumber>;
    lng: z.ZodOptional<z.ZodNumber>;
    radiusKm: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    limit: number;
    sortBy: "newest" | "price_low" | "price_high" | "most_viewed" | "harvest_soonest" | "top_rated";
    search?: string | undefined;
    regionId?: number | undefined;
    districtId?: number | undefined;
    listingType?: "available_now" | "harvest_pledge" | undefined;
    farmingMethod?: string | undefined;
    deliveryOption?: string | undefined;
    sector?: string | undefined;
    categorySlug?: string | undefined;
    maxPrice?: number | undefined;
    minQuantity?: number | undefined;
    verifiedOnly?: boolean | undefined;
    bnplOnly?: boolean | undefined;
    lat?: number | undefined;
    lng?: number | undefined;
    radiusKm?: number | undefined;
}, {
    search?: string | undefined;
    regionId?: number | undefined;
    districtId?: number | undefined;
    listingType?: "available_now" | "harvest_pledge" | undefined;
    farmingMethod?: string | undefined;
    deliveryOption?: string | undefined;
    page?: number | undefined;
    limit?: number | undefined;
    sector?: string | undefined;
    categorySlug?: string | undefined;
    maxPrice?: number | undefined;
    minQuantity?: number | undefined;
    verifiedOnly?: boolean | undefined;
    bnplOnly?: boolean | undefined;
    sortBy?: "newest" | "price_low" | "price_high" | "most_viewed" | "harvest_soonest" | "top_rated" | undefined;
    lat?: number | undefined;
    lng?: number | undefined;
    radiusKm?: number | undefined;
}>;
export type RequestOTPInput = z.infer<typeof requestOTPSchema>;
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type FarmerProfileInput = z.infer<typeof farmerProfileSchema>;
export type DealerProfileInput = z.infer<typeof dealerProfileSchema>;
export type BuyerProfileInput = z.infer<typeof buyerProfileSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type InitPaymentInput = z.infer<typeof initPaymentSchema>;
export type BNPLApplyInput = z.infer<typeof bnplApplySchema>;
export type PestReportInput = z.infer<typeof pestReportSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type BroadcastInput = z.infer<typeof broadcastSchema>;
export type ListingFilters = z.infer<typeof listingFiltersSchema>;
//# sourceMappingURL=index.d.ts.map