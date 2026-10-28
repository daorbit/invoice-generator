export type InlineTarget =
  | { kind: 'client'; key: 'name' | 'address' }
  | { kind: 'field'; key: 'notes' | 'terms' }
  | { kind: 'item'; id: string; key: 'description' | 'quantity' | 'rate' };

export const CLIENT_NAME: InlineTarget = { kind: 'client', key: 'name' };
export const CLIENT_ADDRESS: InlineTarget = { kind: 'client', key: 'address' };
export const NOTES: InlineTarget = { kind: 'field', key: 'notes' };
export const TERMS: InlineTarget = { kind: 'field', key: 'terms' };

export function itemTarget(id: string, key: 'description' | 'quantity' | 'rate'): InlineTarget {
  return { kind: 'item', id, key };
}
