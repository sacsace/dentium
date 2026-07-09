import crypto from "crypto";

export type CcavenueConfig = {
  merchantId: string;
  accessCode: string;
  workingKey: string;
  gatewayUrl: string;
  appUrl: string;
};

export type CcavenueBillingDetails = {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
};

export type CcavenuePaymentResponse = {
  orderId: string;
  trackingId: string | null;
  orderStatus: string;
  amount: string | null;
  currency: string | null;
  failureMessage: string | null;
  paymentMode: string | null;
  raw: Record<string, string>;
};

const CCAVENUE_TEST_URL = "https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction";
const CCAVENUE_LIVE_URL = "https://secure.ccavenue.com/transaction/transaction.do?command=initiateTransaction";

function md5Key(workingKey: string) {
  return crypto.createHash("md5").update(workingKey).digest();
}

const CCAVENUE_IV = Buffer.from([
  0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f,
]);

export function encryptCcavenuePayload(plainText: string, workingKey: string) {
  const cipher = crypto.createCipheriv("aes-128-cbc", md5Key(workingKey), CCAVENUE_IV);
  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export function decryptCcavenuePayload(encText: string, workingKey: string) {
  const decipher = crypto.createDecipheriv("aes-128-cbc", md5Key(workingKey), CCAVENUE_IV);
  let decrypted = decipher.update(encText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function getCcavenueConfig(): CcavenueConfig | null {
  const merchantId = process.env.CCAVENUE_MERCHANT_ID?.trim();
  const accessCode = process.env.CCAVENUE_ACCESS_CODE?.trim();
  const workingKey = process.env.CCAVENUE_WORKING_KEY?.trim();
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3200").replace(/\/$/, "");

  if (!merchantId || !accessCode || !workingKey) {
    return null;
  }

  const env = (process.env.CCAVENUE_ENV || "test").toLowerCase();
  const gatewayUrl = env === "production" ? CCAVENUE_LIVE_URL : CCAVENUE_TEST_URL;

  return { merchantId, accessCode, workingKey, gatewayUrl, appUrl };
}

export function isCcavenueConfigured() {
  return getCcavenueConfig() !== null;
}

function toQueryString(params: Record<string, string>) {
  return Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
}

function parseQueryString(query: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const part of query.split("&")) {
    if (!part) continue;
    const [rawKey, ...rest] = part.split("=");
    const key = decodeURIComponent(rawKey.replace(/\+/g, " "));
    const value = decodeURIComponent(rest.join("=").replace(/\+/g, " "));
    result[key] = value;
  }
  return result;
}

export function buildCcavenueRequest(params: {
  orderNumber: string;
  amount: number;
  billing: CcavenueBillingDetails;
  config: CcavenueConfig;
}) {
  const { orderNumber, amount, billing, config } = params;
  const amountStr = amount.toFixed(2);

  const payload = toQueryString({
    merchant_id: config.merchantId,
    order_id: orderNumber,
    amount: amountStr,
    currency: "INR",
    redirect_url: `${config.appUrl}/api/payments/ccavenue/callback`,
    cancel_url: `${config.appUrl}/api/payments/ccavenue/cancel`,
    language: "EN",
    billing_name: billing.name,
    billing_address: billing.company || "India",
    billing_city: billing.city || "Gurugram",
    billing_state: billing.state || "Haryana",
    billing_zip: billing.pincode || "122002",
    billing_country: "India",
    billing_tel: billing.phone || "0000000000",
    billing_email: billing.email,
    delivery_name: billing.name,
    delivery_address: billing.company || "India",
    delivery_city: billing.city || "Gurugram",
    delivery_state: billing.state || "Haryana",
    delivery_zip: billing.pincode || "122002",
    delivery_country: "India",
    delivery_tel: billing.phone || "0000000000",
    merchant_param1: orderNumber,
  });

  return {
    encRequest: encryptCcavenuePayload(payload, config.workingKey),
    accessCode: config.accessCode,
    gatewayUrl: config.gatewayUrl,
    amount: amountStr,
  };
}

export function parseCcavenueResponse(encResp: string, workingKey: string): CcavenuePaymentResponse {
  const decrypted = decryptCcavenuePayload(encResp, workingKey);
  const raw = parseQueryString(decrypted);

  return {
    orderId: raw.order_id || "",
    trackingId: raw.tracking_id || null,
    orderStatus: raw.order_status || "",
    amount: raw.amount || null,
    currency: raw.currency || null,
    failureMessage: raw.failure_message || raw.status_message || null,
    paymentMode: raw.payment_mode || null,
    raw,
  };
}

export function isCcavenuePaymentSuccess(orderStatus: string) {
  return orderStatus.toLowerCase() === "success";
}

export function isCcavenuePaymentCancelled(orderStatus: string) {
  const normalized = orderStatus.toLowerCase();
  return normalized === "aborted" || normalized === "cancelled" || normalized === "canceled";
}
