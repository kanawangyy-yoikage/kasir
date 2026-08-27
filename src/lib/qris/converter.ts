import { QRISData, ConvertOptions } from './types';
import { calculateCRC16 } from './crc16';

/**
 * Convert a static QRIS string into a dynamic QRIS string for a specific amount.
 * Ported from https://github.com/verssache/qris-dinamis (MIT)
 */
export function convertQRIS(staticQRIS: string, options: ConvertOptions): string {
  const { amount, fee } = options;

  // Remove the old CRC (tag 63) before re-building
  const withoutCRC = stripCRC(staticQRIS);

  // Recompute total amount including fee
  let totalAmount = amount;
  if (fee) {
    totalAmount =
      fee.type === 'fixed'
        ? amount + fee.value
        : amount + amount * (fee.value / 100);
  }

  const billAmount = Math.round(totalAmount * 100) / 100;

  // 54 field: transaction amount
  const amountField = buildTLV('54', billAmount.toFixed(2));

  // Rebuild the string with the new amount and computed CRC
  const data = withoutCRC + amountField;
  const crc = calculateCRC16(data + '6304');

  return data + '6304' + crc;
}

function stripCRC(qris: string): string {
  // Find the tag 6304 (CRC TLV). Everything before it is the data.
  const idx = qris.indexOf('6304');
  if (idx === -1) return qris;
  return qris.slice(0, idx);
}

function buildTLV(tag: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return tag + length + value;
}
