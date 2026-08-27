export interface TLV {
  tag: string;
  name: string;
  id: string;
  length: number;
  value: string;
  children?: TLV[];
}

export interface EMVCoField {
  id: string;
  name: string;
  length: number;
  value: string;
}

export interface MerchantAccountInfo {
  tag: string;
  globallyUniqueId: string;
  merchantId?: string;
  merchantCriteria?: string;
  fields: EMVCoField[];
}

export interface QRISData {
  version: string;
  method: 'static' | 'dynamic';
  merchantAccountInfo: MerchantAccountInfo[];
  merchantCategoryCode: string;
  currency: string;
  amount?: number;
  tipIndicator?: 'fixed' | 'percentage' | 'none';
  tipFixed?: number;
  tipPercentage?: number;
  countryCode: string;
  merchantName: string;
  merchantCity: string;
  postalCode?: string;
  additionalData?: string;
  crc: string;
  raw: string;
}

export interface ConvertOptions {
  amount: number;
  fee?: {
    type: 'fixed' | 'percentage';
    value: number;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
