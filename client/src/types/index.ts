export interface Category {
  id: number;
  slug: string;
  name: string;
  image: string | null;
  active: boolean;
  _count?: { products: number };
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  categoryId: number;
  brand: string | null;
  unit: string;
  mrp: number;
  price: number;
  purchasePrice: number;
  stock: number;
  image: string | null;
  description: string | null;
  batch: string | null;
  supplier: string | null;
  expiryDate: string | null;
  active: boolean;
  featured: boolean;
  bestSeller: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

export interface DeliveryZone {
  id: number;
  name: string;
  charge: number;
  minOrderForFree: number;
  sortOrder: number;
}

export interface StoreSettings {
  freeDeliveryThreshold: number;
  minOrderAmount: number;
  storeName: string;
  storePhone: string;
  openHours: string;
}

export interface Coupon {
  id: number;
  code: string;
  type: "flat" | "percent";
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  active: boolean;
  expiresAt: string | null;
  usageLimit: number | null;
  usedCount: number;
  createdAt: string;
}

export interface Address {
  id: number;
  userId: number;
  label: string;
  recipientName: string;
  phone: string;
  addressLine: string;
  landmark: string | null;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number | null;
  productName: string;
  unit: string;
  price: number;
  qty: number;
  subtotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number | null;
  customerName: string;
  customerPhone: string;
  deliveryLabel: string;
  addressLine: string;
  landmark: string | null;
  deliveryZoneName: string | null;
  deliveryFee: number;
  itemsSubtotal: number;
  discountAmount: number;
  total: number;
  paymentMethod: "cod" | "qr" | "esewa" | "khalti";
  paymentStatus: "pending" | "paid";
  paymentRef: string | null;
  status: string;
  notes: string | null;
  assignedTo: string | null;
  deliveryBoyId: number | null;
  deliveryOtp: string | null;
  proofImage: string | null;
  deliveryNotes: string | null;
  deliveryPerson?: { name: string; phone: string; vehicleType?: string | null } | null;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

export interface PreviewLine {
  productId: number;
  name: string;
  unit: string;
  price: number;
  mrp: number;
  qty: number;
  lineTotal: number;
  stock: number;
  available: boolean;
  image: string | null;
  categoryIndex: number;
}

export interface OrderTotals {
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  couponCode: string | null;
}

export interface HomeSections {
  categories: Category[];
  deals: Product[];
  bestSellers: Product[];
  combos: Product[];
}

export interface CustomerWithTotals {
  customers: (UserWithCounts & { orders: never[] })[];
  totalsByUser: Record<number, number>;
}

export interface UserWithCounts {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  role: string;
  loyaltyPoints: number;
  createdAt: string;
  _count: { orders: number; wishlistItems: number };
}

export interface DashboardData {
  cards: { label: string; value: number; color: string }[];
  financial: { revenue: number; grossProfit: number; valueAtCost: number; valueAtSell: number };
  topProducts: { productName: string; _sum: { qty: number | null; subtotal: number | null } }[];
  lowStock: Product[];
  expiringSoon: Product[];
  recentOrders: Order[];
}