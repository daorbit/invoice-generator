export interface OrbitClientPatch {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  gstin?: string;
  customerId?: string;
}

export interface OrbitItemPatch {
  description?: string;
  quantity?: number;
  rate?: number;
  unit?: string;
  hsn?: string;
  taxRate?: number;
  itemId?: string;
}

export type OrbitOp =
  | { op: 'setClient'; patch: OrbitClientPatch }
  | { op: 'addItem'; item: OrbitItemPatch & { description: string } }
  | { op: 'updateItem'; id: string; patch: OrbitItemPatch }
  | { op: 'removeItem'; id: string }
  | { op: 'setDocument'; patch: Record<string, unknown> };

export interface OrbitReply {
  ops: OrbitOp[];
  summary: string;
  model: string;
}

export function readOrbitReply(raw: unknown): OrbitReply | null {
  const body = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : null;
  if (!body || !Array.isArray(body.ops)) return null;
  return {
    ops: body.ops as OrbitOp[],
    summary: typeof body.summary === 'string' ? body.summary : '',
    model: typeof body.model === 'string' ? body.model : '',
  };
}
