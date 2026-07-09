export interface VmaClientCredentialsTokenRequest {
  grant_type: "client_credentials";
  client_id: string;
  client_secret: string;
}

export interface VmaTokenResponse {
  access_token: string;
  token_type: "Bearer";
  expires_in: number;
}

export interface VmaMiniAppTokenRequest {
  grant_type: "authorization_code" | "refresh_token";
  code?: string;
  refresh_token?: string;
}

export interface VmaMiniAppUserResponse {
  name: string;
  email: string;
  phone_number: string;
}

export interface VmaPaymentInitRequest {
  terminal_id: string;
  order_id: string;
  amount: number;
  description: string;
  metadata: Record<string, string>;
}

export interface VmaPaymentInitResponse {
  payment_id: string;
  provider_payload: Record<string, string | number | boolean>;
  status: "created" | "success" | "failed";
}

export interface VmaPaymentDetailResponse {
  payment_id: string;
  order_id: string;
  amount: number;
  status: "created" | "success" | "failed" | "refunded";
}

export interface VmaRefundRequest {
  payment_id: string;
  amount: number;
  reason: string;
}

export interface VmaRefundResponse {
  refund_id: string;
  payment_id: string;
  status: "created" | "success" | "failed";
}

export interface VmaIpnPayload {
  payment_id: string;
  order_id: string;
  status: "success" | "failed" | "refunded";
  signature: string;
}
