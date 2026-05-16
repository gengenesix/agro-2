
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.RegionScalarFieldEnum = {
  id: 'id',
  name: 'name',
  capital: 'capital',
  code: 'code',
  zone: 'zone'
};

exports.Prisma.DistrictScalarFieldEnum = {
  id: 'id',
  regionId: 'regionId',
  name: 'name',
  capital: 'capital',
  centerLat: 'centerLat',
  centerLng: 'centerLng'
};

exports.Prisma.ProductCategoryScalarFieldEnum = {
  id: 'id',
  sector: 'sector',
  parentId: 'parentId',
  name: 'name',
  nameTwi: 'nameTwi',
  nameHausa: 'nameHausa',
  nameEwe: 'nameEwe',
  slug: 'slug',
  iconUrl: 'iconUrl',
  isActive: 'isActive'
};

exports.Prisma.UnitOfMeasureScalarFieldEnum = {
  id: 'id',
  name: 'name',
  abbreviation: 'abbreviation',
  applicableSectors: 'applicableSectors'
};

exports.Prisma.ProfileScalarFieldEnum = {
  id: 'id',
  phone: 'phone',
  fullName: 'fullName',
  role: 'role',
  language: 'language',
  regionId: 'regionId',
  districtId: 'districtId',
  community: 'community',
  avatarUrl: 'avatarUrl',
  isActive: 'isActive',
  isBanned: 'isBanned',
  banReason: 'banReason',
  agroScore: 'agroScore',
  verificationLevel: 'verificationLevel',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FarmerProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  farmName: 'farmName',
  farmSizeAcres: 'farmSizeAcres',
  gpsLat: 'gpsLat',
  gpsLng: 'gpsLng',
  sectors: 'sectors',
  primaryProducts: 'primaryProducts',
  farmingMethods: 'farmingMethods',
  farmPhotos: 'farmPhotos',
  nationalId: 'nationalId',
  mobileMoneyNumber: 'mobileMoneyNumber',
  mobileMoneyNetwork: 'mobileMoneyNetwork',
  bankAccountNumber: 'bankAccountNumber',
  bankName: 'bankName',
  fieldVerifiedAt: 'fieldVerifiedAt',
  fieldAgentId: 'fieldAgentId',
  createdAt: 'createdAt'
};

exports.Prisma.DealerProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  businessName: 'businessName',
  registrationNumber: 'registrationNumber',
  physicalAddress: 'physicalAddress',
  gpsLat: 'gpsLat',
  gpsLng: 'gpsLng',
  deliveryRadiusKm: 'deliveryRadiusKm',
  sectorsServed: 'sectorsServed',
  businessPhotos: 'businessPhotos',
  mobileMoneyNumber: 'mobileMoneyNumber',
  mobileMoneyNetwork: 'mobileMoneyNetwork',
  isVerified: 'isVerified',
  createdAt: 'createdAt'
};

exports.Prisma.BuyerProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  organizationName: 'organizationName',
  buyerType: 'buyerType',
  contactPerson: 'contactPerson',
  email: 'email',
  deliveryAddress: 'deliveryAddress',
  preferredCategories: 'preferredCategories',
  monthlyVolumeEstimate: 'monthlyVolumeEstimate',
  createdAt: 'createdAt'
};

exports.Prisma.ListingScalarFieldEnum = {
  id: 'id',
  sellerId: 'sellerId',
  categoryId: 'categoryId',
  unitId: 'unitId',
  title: 'title',
  slug: 'slug',
  description: 'description',
  listingType: 'listingType',
  quantityAvailable: 'quantityAvailable',
  pricePerUnit: 'pricePerUnit',
  minOrderQuantity: 'minOrderQuantity',
  allowNegotiation: 'allowNegotiation',
  regionId: 'regionId',
  districtId: 'districtId',
  community: 'community',
  gpsLat: 'gpsLat',
  gpsLng: 'gpsLng',
  photos: 'photos',
  farmingMethod: 'farmingMethod',
  freshnessDays: 'freshnessDays',
  deliveryOptions: 'deliveryOptions',
  deliveryCostPerKm: 'deliveryCostPerKm',
  expectedHarvestDate: 'expectedHarvestDate',
  harvestWindowDays: 'harvestWindowDays',
  depositPercentage: 'depositPercentage',
  pledgeStatus: 'pledgeStatus',
  status: 'status',
  brand: 'brand',
  manufacturer: 'manufacturer',
  expiryDate: 'expiryDate',
  applicableSectors: 'applicableSectors',
  bnplAvailable: 'bnplAvailable',
  viewsCount: 'viewsCount',
  inquiriesCount: 'inquiriesCount',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  orderNumber: 'orderNumber',
  buyerId: 'buyerId',
  sellerId: 'sellerId',
  listingId: 'listingId',
  orderType: 'orderType',
  quantity: 'quantity',
  unitPrice: 'unitPrice',
  subtotal: 'subtotal',
  deliveryCost: 'deliveryCost',
  platformCommission: 'platformCommission',
  totalAmount: 'totalAmount',
  depositAmount: 'depositAmount',
  balanceAmount: 'balanceAmount',
  depositPaidAt: 'depositPaidAt',
  balancePaidAt: 'balancePaidAt',
  deliveryOption: 'deliveryOption',
  deliveryAddress: 'deliveryAddress',
  expectedDeliveryDate: 'expectedDeliveryDate',
  actualDeliveryDate: 'actualDeliveryDate',
  trackingStatus: 'trackingStatus',
  pledgeProgress: 'pledgeProgress',
  buyerNotes: 'buyerNotes',
  sellerNotes: 'sellerNotes',
  createdAt: 'createdAt',
  confirmedAt: 'confirmedAt',
  deliveredAt: 'deliveredAt',
  cancelledAt: 'cancelledAt',
  cancellationReason: 'cancellationReason'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  payerId: 'payerId',
  payeeId: 'payeeId',
  paymentType: 'paymentType',
  amount: 'amount',
  currency: 'currency',
  status: 'status',
  paymentMethod: 'paymentMethod',
  paystackReference: 'paystackReference',
  paystackTransactionId: 'paystackTransactionId',
  mobileMoneyNumber: 'mobileMoneyNumber',
  createdAt: 'createdAt',
  completedAt: 'completedAt'
};

exports.Prisma.WalletScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  balance: 'balance',
  pendingBalance: 'pendingBalance',
  totalEarned: 'totalEarned',
  totalWithdrawn: 'totalWithdrawn',
  updatedAt: 'updatedAt'
};

exports.Prisma.WalletTransactionScalarFieldEnum = {
  id: 'id',
  walletId: 'walletId',
  type: 'type',
  amount: 'amount',
  balanceAfter: 'balanceAfter',
  reference: 'reference',
  description: 'description',
  orderId: 'orderId',
  createdAt: 'createdAt'
};

exports.Prisma.BNPLApplicationScalarFieldEnum = {
  id: 'id',
  farmerId: 'farmerId',
  orderId: 'orderId',
  amountRequested: 'amountRequested',
  amountApproved: 'amountApproved',
  creditTier: 'creditTier',
  interestRate: 'interestRate',
  totalRepayable: 'totalRepayable',
  status: 'status',
  agroScoreAtApplication: 'agroScoreAtApplication',
  rejectionReason: 'rejectionReason',
  appliedAt: 'appliedAt',
  approvedAt: 'approvedAt',
  disbursedAt: 'disbursedAt',
  dueDate: 'dueDate',
  repaidAt: 'repaidAt'
};

exports.Prisma.BNPLRepaymentScalarFieldEnum = {
  id: 'id',
  applicationId: 'applicationId',
  farmerId: 'farmerId',
  amount: 'amount',
  repaymentMethod: 'repaymentMethod',
  orderId: 'orderId',
  createdAt: 'createdAt'
};

exports.Prisma.MarketPriceScalarFieldEnum = {
  id: 'id',
  categoryId: 'categoryId',
  regionId: 'regionId',
  districtId: 'districtId',
  pricePerUnit: 'pricePerUnit',
  unitId: 'unitId',
  source: 'source',
  recordedAt: 'recordedAt',
  createdAt: 'createdAt'
};

exports.Prisma.WeatherAlertScalarFieldEnum = {
  id: 'id',
  regionId: 'regionId',
  districtId: 'districtId',
  alertType: 'alertType',
  severity: 'severity',
  title: 'title',
  message: 'message',
  messageTwi: 'messageTwi',
  messageHausa: 'messageHausa',
  validFrom: 'validFrom',
  validUntil: 'validUntil',
  isSent: 'isSent',
  createdAt: 'createdAt'
};

exports.Prisma.PestReportScalarFieldEnum = {
  id: 'id',
  reporterId: 'reporterId',
  categoryId: 'categoryId',
  pestName: 'pestName',
  description: 'description',
  severity: 'severity',
  regionId: 'regionId',
  districtId: 'districtId',
  gpsLat: 'gpsLat',
  gpsLng: 'gpsLng',
  photos: 'photos',
  isVerified: 'isVerified',
  adminNote: 'adminNote',
  createdAt: 'createdAt'
};

exports.Prisma.ReviewScalarFieldEnum = {
  id: 'id',
  reviewerId: 'reviewerId',
  revieweeId: 'revieweeId',
  orderId: 'orderId',
  rating: 'rating',
  comment: 'comment',
  tags: 'tags',
  isPublic: 'isPublic',
  createdAt: 'createdAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  title: 'title',
  body: 'body',
  data: 'data',
  channel: 'channel',
  isRead: 'isRead',
  sentAt: 'sentAt',
  createdAt: 'createdAt'
};

exports.Prisma.MessageScalarFieldEnum = {
  id: 'id',
  senderId: 'senderId',
  recipientId: 'recipientId',
  listingId: 'listingId',
  orderId: 'orderId',
  content: 'content',
  isRead: 'isRead',
  createdAt: 'createdAt'
};

exports.Prisma.PlatformStatsScalarFieldEnum = {
  id: 'id',
  totalGMV: 'totalGMV',
  totalFarmers: 'totalFarmers',
  totalDealers: 'totalDealers',
  totalBuyers: 'totalBuyers',
  totalListings: 'totalListings',
  activePledges: 'activePledges',
  bnplDisbursed: 'bnplDisbursed',
  bnplRepaid: 'bnplRepaid',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.Zone = exports.$Enums.Zone = {
  southern: 'southern',
  middle: 'middle',
  northern: 'northern'
};

exports.Sector = exports.$Enums.Sector = {
  crops: 'crops',
  livestock: 'livestock',
  poultry: 'poultry',
  fisheries: 'fisheries',
  inputs: 'inputs'
};

exports.Role = exports.$Enums.Role = {
  farmer: 'farmer',
  dealer: 'dealer',
  buyer: 'buyer',
  consumer: 'consumer',
  field_agent: 'field_agent',
  admin: 'admin'
};

exports.Language = exports.$Enums.Language = {
  en: 'en',
  tw: 'tw',
  ha: 'ha',
  ew: 'ew',
  ga: 'ga'
};

exports.VerificationLevel = exports.$Enums.VerificationLevel = {
  unverified: 'unverified',
  self_declared: 'self_declared',
  field_verified: 'field_verified',
  premium: 'premium'
};

exports.BuyerType = exports.$Enums.BuyerType = {
  hotel: 'hotel',
  restaurant: 'restaurant',
  processor: 'processor',
  retailer: 'retailer',
  exporter: 'exporter',
  individual: 'individual'
};

exports.ListingType = exports.$Enums.ListingType = {
  available_now: 'available_now',
  harvest_pledge: 'harvest_pledge'
};

exports.FarmingMethod = exports.$Enums.FarmingMethod = {
  conventional: 'conventional',
  organic: 'organic',
  certified_organic: 'certified_organic'
};

exports.PledgeStatus = exports.$Enums.PledgeStatus = {
  open: 'open',
  partially_pledged: 'partially_pledged',
  fully_pledged: 'fully_pledged',
  harvested: 'harvested',
  delivered: 'delivered',
  cancelled: 'cancelled'
};

exports.ListingStatus = exports.$Enums.ListingStatus = {
  draft: 'draft',
  active: 'active',
  paused: 'paused',
  sold_out: 'sold_out',
  expired: 'expired',
  removed: 'removed'
};

exports.OrderType = exports.$Enums.OrderType = {
  direct_purchase: 'direct_purchase',
  harvest_pledge: 'harvest_pledge',
  input_purchase: 'input_purchase',
  input_bnpl: 'input_bnpl'
};

exports.TrackingStatus = exports.$Enums.TrackingStatus = {
  pending: 'pending',
  confirmed: 'confirmed',
  preparing: 'preparing',
  dispatched: 'dispatched',
  in_transit: 'in_transit',
  delivered: 'delivered',
  disputed: 'disputed',
  cancelled: 'cancelled'
};

exports.PledgeProgress = exports.$Enums.PledgeProgress = {
  planted: 'planted',
  growing: 'growing',
  ready_to_harvest: 'ready_to_harvest',
  harvested: 'harvested',
  dispatched: 'dispatched',
  delivered: 'delivered'
};

exports.PaymentType = exports.$Enums.PaymentType = {
  deposit: 'deposit',
  balance: 'balance',
  full: 'full',
  refund: 'refund',
  bnpl_repayment: 'bnpl_repayment'
};

exports.PaymentStatus = exports.$Enums.PaymentStatus = {
  pending: 'pending',
  processing: 'processing',
  success: 'success',
  failed: 'failed',
  refunded: 'refunded'
};

exports.PaymentMethod = exports.$Enums.PaymentMethod = {
  mtn_momo: 'mtn_momo',
  vodafone_cash: 'vodafone_cash',
  airteltigo_money: 'airteltigo_money',
  card: 'card',
  bank: 'bank',
  wallet: 'wallet'
};

exports.WalletTxType = exports.$Enums.WalletTxType = {
  credit: 'credit',
  debit: 'debit',
  escrow_hold: 'escrow_hold',
  escrow_release: 'escrow_release',
  withdrawal: 'withdrawal',
  bnpl_deduction: 'bnpl_deduction'
};

exports.BNPLTier = exports.$Enums.BNPLTier = {
  starter: 'starter',
  grower: 'grower',
  established: 'established',
  commercial: 'commercial'
};

exports.BNPLStatus = exports.$Enums.BNPLStatus = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
  disbursed: 'disbursed',
  repaid: 'repaid',
  defaulted: 'defaulted'
};

exports.AlertType = exports.$Enums.AlertType = {
  drought_warning: 'drought_warning',
  flood_warning: 'flood_warning',
  storm: 'storm',
  heat_wave: 'heat_wave',
  optimal_planting: 'optimal_planting'
};

exports.AlertSeverity = exports.$Enums.AlertSeverity = {
  info: 'info',
  warning: 'warning',
  critical: 'critical'
};

exports.Prisma.ModelName = {
  Region: 'Region',
  District: 'District',
  ProductCategory: 'ProductCategory',
  UnitOfMeasure: 'UnitOfMeasure',
  Profile: 'Profile',
  FarmerProfile: 'FarmerProfile',
  DealerProfile: 'DealerProfile',
  BuyerProfile: 'BuyerProfile',
  Listing: 'Listing',
  Order: 'Order',
  Payment: 'Payment',
  Wallet: 'Wallet',
  WalletTransaction: 'WalletTransaction',
  BNPLApplication: 'BNPLApplication',
  BNPLRepayment: 'BNPLRepayment',
  MarketPrice: 'MarketPrice',
  WeatherAlert: 'WeatherAlert',
  PestReport: 'PestReport',
  Review: 'Review',
  Notification: 'Notification',
  Message: 'Message',
  PlatformStats: 'PlatformStats'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
