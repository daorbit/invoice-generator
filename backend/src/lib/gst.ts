export const GST_STATES: Record<string, string> = {
  '01': 'Jammu and Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '13': 'Nagaland',
  '14': 'Manipur',
  '15': 'Mizoram',
  '16': 'Tripura',
  '17': 'Meghalaya',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '26': 'Dadra and Nagar Haveli and Daman and Diu',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '31': 'Lakshadweep',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '34': 'Puducherry',
  '35': 'Andaman and Nicobar Islands',
  '36': 'Telangana',
  '37': 'Andhra Pradesh',
  '38': 'Ladakh',
  '96': 'Outside India',
  '97': 'Other Territory',
};

export function readStateCode(value: unknown): string {
  return typeof value === 'string' && value in GST_STATES ? value : '';
}

export function stateOfGstin(gstin: string | undefined | null): string {
  return readStateCode(gstin?.slice(0, 2));
}

export interface SupplyParties {
  fromGstin?: string | null;
  clientGstin?: string | null;
  placeOfSupply?: string | null;
  exportUnderLut?: boolean;
}

export function resolvePlaceOfSupply(parties: SupplyParties): string {
  return readStateCode(parties.placeOfSupply) || stateOfGstin(parties.clientGstin) || stateOfGstin(parties.fromGstin);
}

export function isInterState(parties: SupplyParties): boolean {
  if (parties.exportUnderLut) return true;
  const seller = stateOfGstin(parties.fromGstin);
  const supply = resolvePlaceOfSupply(parties);
  return Boolean(seller && supply && seller !== supply);
}
