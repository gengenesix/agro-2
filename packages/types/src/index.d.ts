export type Role = 'farmer' | 'dealer' | 'buyer' | 'consumer' | 'field_agent' | 'admin';
export type Language = 'en' | 'tw' | 'ha' | 'ew' | 'ga';
export type VerificationLevel = 'unverified' | 'self_declared' | 'field_verified' | 'premium';
export type Sector = 'crops' | 'livestock' | 'poultry' | 'fisheries' | 'inputs';
export type FarmingMethod = 'conventional' | 'organic' | 'certified_organic';
export type ListingType = 'available_now' | 'harvest_pledge';
export type ListingStatus = 'draft' | 'active' | 'paused' | 'sold_out' | 'expired' | 'removed';
export type PledgeStatus = 'open' | 'partially_pledged' | 'fully_pledged' | 'harvested' | 'delivered' | 'cancelled';
export type PledgeProgress = 'planted' | 'growing' | 'ready_to_harvest' | 'harvested' | 'dispatched' | 'delivered';
export type OrderType = 'direct_purchase' | 'harvest_pledge' | 'input_purchase' | 'input_bnpl';
export type TrackingStatus = 'pending' | 'confirmed' | 'preparing' | 'dispatched' | 'in_transit' | 'delivered' | 'disputed' | 'cancelled';
export type PaymentStatus = 'pending' | 'processing' | 'success' | 'failed' | 'refunded';
export type PaymentMethod = 'mtn_momo' | 'vodafone_cash' | 'airteltigo_money' | 'card' | 'bank' | 'wallet';
export type BNPLStatus = 'pending' | 'approved' | 'rejected' | 'disbursed' | 'repaid' | 'defaulted';
export type BNPLTier = 'starter' | 'grower' | 'established' | 'commercial';
export type AlertSeverity = 'info' | 'warning' | 'critical';
export interface GhanaRegion {
    id: number;
    name: string;
    code: string;
    zone: 'southern' | 'middle' | 'northern';
}
export interface Profile {
    id: string;
    phone: string;
    fullName: string;
    role: Role;
    language: Language;
    regionId: number | null;
    districtId: number | null;
    community: string | null;
    avatarUrl: string | null;
    isActive: boolean;
    agroScore: number;
    verificationLevel: VerificationLevel;
    createdAt: string;
}
export interface FarmerProfile {
    id: string;
    userId: string;
    farmName: string | null;
    farmSizeAcres: number | null;
    gpsLat: number | null;
    gpsLng: number | null;
    sectors: string[];
    primaryProducts: string[];
    farmingMethods: string[];
    farmPhotos: string[];
    mobileMoneyNumber: string | null;
    mobileMoneyNetwork: string | null;
}
export interface DealerProfile {
    id: string;
    userId: string;
    businessName: string;
    registrationNumber: string | null;
    physicalAddress: string | null;
    gpsLat: number | null;
    gpsLng: number | null;
    deliveryRadiusKm: number;
    sectorsServed: string[];
    mobileMoneyNumber: string;
    isVerified: boolean;
}
export interface BuyerProfile {
    id: string;
    userId: string;
    organizationName: string | null;
    buyerType: 'hotel' | 'restaurant' | 'processor' | 'retailer' | 'exporter' | 'individual';
    contactPerson: string | null;
    email: string | null;
    deliveryAddress: string | null;
    preferredCategories: string[];
}
export interface ListingSummary {
    id: string;
    title: string;
    slug: string;
    listingType: ListingType;
    quantityAvailable: number;
    pricePerUnit: number;
    photos: string[];
    farmingMethod: FarmingMethod | null;
    expectedHarvestDate: string | null;
    depositPercentage: number;
    pledgeStatus: PledgeStatus | null;
    status: ListingStatus;
    bnplAvailable: boolean;
    viewsCount: number;
    createdAt: string;
    unit: {
        name: string;
        abbreviation: string;
    };
    category: {
        name: string;
        sector: Sector;
        slug: string;
    };
    region: {
        name: string;
        code: string;
    } | null;
    district: {
        name: string;
    } | null;
    seller: {
        id: string;
        fullName: string;
        avatarUrl: string | null;
        verificationLevel: VerificationLevel;
        agroScore: number;
    };
}
export interface ListingDetail extends ListingSummary {
    description: string | null;
    minOrderQuantity: number;
    allowNegotiation: boolean;
    community: string | null;
    gpsLat: number | null;
    gpsLng: number | null;
    freshnessDays: number | null;
    deliveryOptions: string[];
    deliveryCostPerKm: number | null;
    brand: string | null;
    manufacturer: string | null;
    harvestWindowDays: number;
}
export interface Order {
    id: string;
    orderNumber: string;
    buyerId: string;
    sellerId: string;
    listingId: string;
    orderType: OrderType;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    deliveryCost: number;
    platformCommission: number;
    totalAmount: number;
    depositAmount: number | null;
    balanceAmount: number | null;
    trackingStatus: TrackingStatus;
    pledgeProgress: PledgeProgress | null;
    deliveryOption: string | null;
    deliveryAddress: string | null;
    buyerNotes: string | null;
    createdAt: string;
    confirmedAt: string | null;
    deliveredAt: string | null;
}
export interface Wallet {
    id: string;
    userId: string;
    balance: number;
    pendingBalance: number;
    totalEarned: number;
    totalWithdrawn: number;
    updatedAt: string;
}
export interface WalletTransaction {
    id: string;
    type: 'credit' | 'debit' | 'escrow_hold' | 'escrow_release' | 'withdrawal' | 'bnpl_deduction';
    amount: number;
    balanceAfter: number;
    description: string | null;
    reference: string | null;
    createdAt: string;
}
export interface BNPLApplication {
    id: string;
    farmerId: string;
    orderId: string;
    amountRequested: number;
    amountApproved: number | null;
    creditTier: BNPLTier;
    interestRate: number;
    totalRepayable: number | null;
    status: BNPLStatus;
    agroScoreAtApplication: number;
    rejectionReason: string | null;
    appliedAt: string;
    approvedAt: string | null;
    dueDate: string | null;
    repaidAt: string | null;
}
export interface WeatherDay {
    date: string;
    maxTempC: number;
    minTempC: number;
    precipitationMm: number;
    weatherCode: number;
    description: string;
}
export interface WeatherAssessment {
    alert: boolean;
    severity: AlertSeverity;
    message: string;
}
export interface MarketPrice {
    id: number;
    categoryId: number;
    regionId: number | null;
    pricePerUnit: number;
    recordedAt: string;
    category: {
        name: string;
        slug: string;
    };
    region: {
        name: string;
    } | null;
    unit: {
        abbreviation: string;
    };
}
export interface PestAlert {
    id: string;
    pestName: string;
    description: string | null;
    severity: 'mild' | 'moderate' | 'severe';
    regionId: number | null;
    districtId: number | null;
    isVerified: boolean;
    createdAt: string;
    category: {
        name: string;
    } | null;
    region: {
        name: string;
    } | null;
}
export interface Notification {
    id: string;
    type: string;
    title: string;
    body: string;
    channel: string;
    isRead: boolean;
    createdAt: string;
    sentAt: string | null;
}
export interface Review {
    id: string;
    reviewerId: string;
    revieweeId: string;
    orderId: string;
    rating: number;
    comment: string | null;
    tags: string[];
    isPublic: boolean;
    createdAt: string;
    reviewer: {
        fullName: string;
        avatarUrl: string | null;
    };
}
export interface AgroScoreBreakdown {
    total: number;
    components: {
        profileCompleteness: number;
        verificationLevel: number;
        orderHistory: number;
        repaymentHistory: number;
        platformTenure: number;
        communityRating: number;
    };
    tier: {
        tier: string;
        maxAmount: number;
        interestRate: number;
    } | null;
    improvementTips: string[];
}
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}
export interface APIResponse<T = unknown> {
    success: boolean;
    data: T;
    message?: string;
}
export interface APIError {
    success: false;
    error: string;
    statusCode: number;
    details?: unknown;
}
export declare const GHANA_REGIONS: GhanaRegion[];
export declare const COMMISSION_RATES: {
    readonly direct_purchase: 0.03;
    readonly harvest_pledge: 0.025;
    readonly input_purchase: 0.015;
    readonly input_bnpl: 0;
};
//# sourceMappingURL=index.d.ts.map