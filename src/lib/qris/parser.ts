import { TLV, MerchantAccountInfo, QRISData, EMVCoField } from './types';

/**
 * Parse a string of concatenated EMVCo TLV data into a flat list of TLV nodes.
 * Ported from https://github.com/verssache/qris-dinamis (MIT)
 */
export function parseTLV(data: string): TLV[] {
  const tlvs: TLV[] = [];
  let index = 0;

  while (index < data.length) {
    if (index + 4 > data.length) break;

    const tag = data.slice(index, index + 2);
    const length = parseInt(data.slice(index + 2, index + 4), 10);

    if (isNaN(length) || index + 4 + length > data.length) break;

    const value = data.slice(index + 4, index + 4 + length);
    tlvs.push({
      tag,
      name: getTagName(tag),
      id: tag,
      length,
      value,
    });

    index += 4 + length;
  }

  return tlvs;
}

function getTagName(tag: string): string {
  const tagNames: Record<string, string> = {
    '00': 'Payload Format Indicator',
    '01': 'Point of Initiation Method',
    '26': 'Merchant Account Information',
    '27': 'Merchant Account Information',
    '28': 'Merchant Account Information',
    '29': 'Merchant Account Information',
    '30': 'Merchant Account Information',
    '31': 'Merchant Account Information',
    '32': 'Merchant Account Information',
    '51': 'Merchant Account Information',
    '52': 'Merchant Category Code',
    '53': 'Transaction Currency',
    '54': 'Transaction Amount',
    '55': 'Tip Indicator',
    '56': 'Tip Amount (Fixed)',
    '57': 'Tip Amount (Percentage)',
    '58': 'Country Code',
    '59': 'Merchant Name',
    '60': 'Merchant City',
    '61': 'Postal Code',
    '62': 'Additional Data Field Template',
    '63': 'CRC',
    '64': 'Merchant Information Language Template',
  };
  return tagNames[tag] || `Tag ${tag}`;
}

/**
 * Parse a QRIS string into a structured QRISData object.
 * Ported from https://github.com/verssache/qris-dinamis (MIT)
 */
export function parseQRIS(qris: string): QRISData {
  const tlvs = parseTLV(qris);

  const getValue = (tag: string): string | undefined =>
    tlvs.find((t) => t.tag === tag)?.value;

  const accountTags = [
    '26', '27', '28', '29', '30', '31', '32', '51',
  ];

  const merchantAccountInfo: MerchantAccountInfo[] = [];
  for (const tag of accountTags) {
    const tlv = tlvs.find((t) => t.tag === tag);
    if (!tlv || !tlv.value) continue;

    const subTlvs = parseTLV(tlv.value);
    const globallyUniqueId = subTlvs.find((s) => s.tag === '00')?.value || '';
    const merchantId = subTlvs.find(
      (s) => s.tag === '01' || s.tag === '02' || s.tag === '03'
    )?.value;

    const fields: EMVCoField[] = subTlvs.map((s) => ({
      id: s.tag,
      name: s.name,
      length: s.length,
      value: s.value,
    }));

    merchantAccountInfo.push({
      tag,
      globallyUniqueId,
      merchantId,
      fields,
    });
  }

  const tipIndicatorRaw = getValue('55');
  let tipIndicator: QRISData['tipIndicator'] = 'none';
  if (tipIndicatorRaw === '01') tipIndicator = 'fixed';
  else if (tipIndicatorRaw === '02') tipIndicator = 'percentage';

  const amountRaw = getValue('54');

  return {
    version: getValue('00') || '',
    method: getValue('01') === '01' ? 'dynamic' : 'static',
    merchantAccountInfo,
    merchantCategoryCode: getValue('52') || '',
    currency: getValue('53') || '',
    amount: amountRaw ? parseFloat(amountRaw) : undefined,
    tipIndicator,
    tipFixed: getValue('56') ? parseFloat(getValue('56')!) : undefined,
    tipPercentage: getValue('57') ? parseFloat(getValue('57')!) : undefined,
    countryCode: getValue('58') || '',
    merchantName: getValue('59') || '',
    merchantCity: getValue('60') || '',
    postalCode: getValue('61'),
    additionalData: getValue('62'),
    crc: getValue('63') || '',
    raw: qris,
  };
}
