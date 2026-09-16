export const ORDER_STATUSES: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  packing: "Packing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const ORDER_STATUS_VALUES = [
  "pending",
  "confirmed",
  "packing",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

export const PAYMENT_STATUS_VALUES = ["pending", "paid"] as const;

export const PAYMENT_METHOD_VALUES = ["cod", "qr", "esewa"] as const;

export const COUPON_TYPE_VALUES = ["flat", "percent"] as const;

export const ROLE_VALUES = ["customer", "admin", "driver"] as const;

export const STATUS_FLOW = [
  "pending",
  "confirmed",
  "packing",
  "out_for_delivery",
  "delivered",
];

export const PAYMENT_METHODS: Record<string, string> = {
  cod: "Cash on Delivery",
  qr: "QR / Khalti",
  esewa: "eSewa",
};

export const STORE_NAME = "Gharmai Kirana";
export const STORE_TAGLINE = "घरमै किराना, पसलभन्दा सस्तो मूल्यमा।";

export const colors = [
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
];