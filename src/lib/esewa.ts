import { createHmac, timingSafeEqual } from "node:crypto";

const isLive = ["live", "production"].includes((process.env.ESEWA_ENV || "test").toLowerCase());

export const esewaConfig = {
  productCode: process.env.ESEWA_MERCHANT_CODE?.trim() || "EPAYTEST",
  secretKey: process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q",
  formUrl: isLive
    ? "https://epay.esewa.com.np/api/epay/main/v2/form"
    : "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
  statusUrl: isLive
    ? "https://epay.esewa.com.np/api/epay/transaction/status/"
    : "https://uat.esewa.com.np/api/epay/transaction/status/",
  isLive,
};

if (process.env.NODE_ENV === "production" && esewaConfig.productCode === "EPAYTEST") {
  console.warn("eSewa is using UAT test credentials in production. Set ESEWA_ENV=live, ESEWA_MERCHANT_CODE and ESEWA_SECRET_KEY.");
}

export interface EsewaFormInput {
  amount: number;
  deliveryCharge: number;
  transactionUuid: string;
  successUrl: string;
  failureUrl: string;
}

export function signEsewaFields(fields: Record<string, string>, signedFieldNames: string): string {
  const message = signedFieldNames
    .split(",")
    .map((name) => `${name}=${fields[name.trim()] ?? ""}`)
    .join(",");
  return createHmac("sha256", esewaConfig.secretKey).update(message).digest("base64");
}

export function buildEsewaForm(input: EsewaFormInput): { formUrl: string; fields: Record<string, string> } {
  const amount = String(Math.round(input.amount));
  const deliveryCharge = String(Math.round(input.deliveryCharge));
  const totalAmount = String(Number(amount) + Number(deliveryCharge));
  const fields: Record<string, string> = {
    amount,
    tax_amount: "0",
    total_amount: totalAmount,
    transaction_uuid: input.transactionUuid,
    product_code: esewaConfig.productCode,
    product_service_charge: "0",
    product_delivery_charge: deliveryCharge,
    success_url: input.successUrl,
    failure_url: input.failureUrl,
    signed_field_names: "total_amount,transaction_uuid,product_code",
  };
  fields.signature = signEsewaFields(fields, fields.signed_field_names);
  return { formUrl: esewaConfig.formUrl, fields };
}

export interface EsewaCallbackData {
  status?: string;
  transaction_code?: string;
  transaction_uuid?: string;
  total_amount?: string | number;
  product_code?: string;
  signed_field_names?: string;
  signature?: string;
  [key: string]: unknown;
}

export function decodeEsewaResponse(data: string): EsewaCallbackData {
  return JSON.parse(Buffer.from(data, "base64").toString("utf8")) as EsewaCallbackData;
}

export function verifyEsewaSignature(payload: EsewaCallbackData): boolean {
  if (!payload.signed_field_names || !payload.signature) return false;
  const fields: Record<string, string> = {};
  for (const [k, v] of Object.entries(payload)) fields[k] = String(v ?? "");
  const expected = signEsewaFields(fields, payload.signed_field_names);
  const a = Buffer.from(expected);
  const b = Buffer.from(String(payload.signature));
  return a.length === b.length && timingSafeEqual(a, b);
}

export interface EsewaStatusResult {
  status: string;
  refId: string | null;
}

export async function checkEsewaStatus(transactionUuid: string, totalAmount: number): Promise<EsewaStatusResult> {
  const url =
    `${esewaConfig.statusUrl}?` +
    new URLSearchParams({
      product_code: esewaConfig.productCode,
      total_amount: String(totalAmount),
      transaction_uuid: transactionUuid,
    }).toString();
  const res = await fetch(url);
  if (!res.ok) throw new Error(`eSewa status check failed (${res.status})`);
  const body = (await res.json()) as { status?: string; refId?: string | null; ref_id?: string | null };
  return {
    status: String(body.status ?? "UNKNOWN").toUpperCase(),
    refId: body.refId != null ? String(body.refId) : body.ref_id != null ? String(body.ref_id) : null,
  };
}