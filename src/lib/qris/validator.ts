import { QRISData, ValidationResult } from './types';

/**
 * Validate a parsed QRIS structure (static or dynamic).
 * Ported from https://github.com/verssache/qris-dinamis (MIT)
 */
export function validateQRIS(data: QRISData): ValidationResult {
  const errors: string[] = [];

  if (!data.version) {
    errors.push('Missing Payload Format Indicator (tag 00)');
  } else if (data.version !== '01') {
    errors.push(`Unsupported Payload Format Indicator: ${data.version}`);
  }

  if (data.merchantAccountInfo.length === 0) {
    errors.push('No Merchant Account Information found (tags 26-32, 51)');
  }

  if (!data.merchantCategoryCode) {
    errors.push('Missing Merchant Category Code (tag 52)');
  }

  if (!data.currency) {
    errors.push('Missing Transaction Currency (tag 53)');
  }

  if (!data.countryCode) {
    errors.push('Missing Country Code (tag 58)');
  }

  if (!data.merchantName) {
    errors.push('Missing Merchant Name (tag 59)');
  }

  if (!data.merchantCity) {
    errors.push('Missing Merchant City (tag 60)');
  }

  if (!data.crc) {
    errors.push('Missing CRC (tag 63)');
  }

  if (data.method === 'dynamic' && !data.amount) {
    errors.push('Dynamic QRIS is missing a transaction amount (tag 54)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
