export const khaltiConfig = {
  secretKey: process.env.KHALTI_SECRET_KEY?.trim() || "ce28912bbc65490da156aad616cdc747",
  baseUrl: process.env.KHALTI_BASE_URL?.trim()?.replace(/\/+$/, "") || "https://dev.khalti.com/api/v2",
};

export interface KhaltiCustomerInfo {
  name: string;
  email?: string;
  phone: string;
}

export interface KhaltiInitiateInput {
  returnUrl: string;
  websiteUrl: string;
  amountInPaisa: number;
  purchaseOrderId: string;
  purchaseOrderName: string;
  customerInfo: KhaltiCustomerInfo;
}

export interface KhaltiInitiateResponse {
  pidx: string;
  payment_url: string;
  expires_at: string;
  expires_in: number;
}

export interface KhaltiLookupResponse {
  pidx: string;
  total_amount: number;
  status: "Completed" | "Pending" | "Initiated" | "Refunded" | "Expired" | "User canceled" | string;
  transaction_id: string | null;
  fee: number;
  refunded: boolean;
}

export async function initiateKhalti(input: KhaltiInitiateInput): Promise<KhaltiInitiateResponse> {
  const url = `${khaltiConfig.baseUrl}/epayment/initiate/`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Key ${khaltiConfig.secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      return_url: input.returnUrl,
      website_url: input.websiteUrl,
      amount: Math.round(input.amountInPaisa),
      purchase_order_id: input.purchaseOrderId,
      purchase_order_name: input.purchaseOrderName,
      customer_info: {
        name: input.customerInfo.name || "Test Bahadur",
        email: input.customerInfo.email || "test@khalti.com",
        phone: input.customerInfo.phone || "9800000001",
      },
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Khalti initiate failed (${res.status}): ${errorText}`);
  }

  return (await res.json()) as KhaltiInitiateResponse;
}

export async function lookupKhalti(pidx: string): Promise<KhaltiLookupResponse> {
  const url = `${khaltiConfig.baseUrl}/epayment/lookup/`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Key ${khaltiConfig.secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pidx }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Khalti lookup failed (${res.status}): ${errorText}`);
  }

  return (await res.json()) as KhaltiLookupResponse;
}

