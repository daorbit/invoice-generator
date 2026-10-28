import { BusinessProfile, DEFAULT_PROFILE } from '../models/business-profile.model.js';
import { Customer } from '../models/customer.model.js';
import { Item } from '../models/item.model.js';
import { nameKeyOf } from '../lib/customer-input.js';
import { badRequestError } from '../lib/http-error.js';
import { askOrbit } from '../lib/quantalog-orbit.js';
import type { OrbitDocumentMeta, OrbitRequest } from '../lib/orbit-input.js';
import type { OrbitOp, OrbitReply } from '../lib/orbit-ops.js';

const CONTEXT_LIMIT = 40;
const MATCH_LIMIT = 100;

async function buildContext(workspaceId: string, meta: OrbitDocumentMeta) {
  const [profile, items, customers] = await Promise.all([
    BusinessProfile.findOne({ workspaceId }).select('paymentTermsDays').lean(),
    Item.find({ workspaceId }).sort({ updatedAt: -1 }).limit(CONTEXT_LIMIT).select('name rate unit hsn taxRate').lean(),
    Customer.find({ workspaceId }).sort({ updatedAt: -1 }).limit(CONTEXT_LIMIT).select('name').lean(),
  ]);
  return {
    ...meta,
    paymentTermsDays: profile?.paymentTermsDays ?? DEFAULT_PROFILE.paymentTermsDays,
    catalog: items.map((item) => ({
      name: item.name,
      rate: item.rate ?? 0,
      unit: item.unit ?? '',
      hsn: item.hsn ?? '',
      taxRate: item.taxRate ?? 0,
    })),
    customers: customers.map((customer) => customer.name),
  };
}

async function matchSaved(workspaceId: string, ops: OrbitOp[]): Promise<OrbitOp[]> {
  const client = ops.find((op) => op.op === 'setClient');
  const clientName = client?.op === 'setClient' ? client.patch.name : undefined;
  const itemKeys = [
    ...new Set(ops.flatMap((op) => (op.op === 'addItem' ? [nameKeyOf(op.item.description)] : []))),
  ];

  const [customer, items] = await Promise.all([
    clientName
      ? Customer.findOne({ workspaceId, nameKey: nameKeyOf(clientName) }).select('name email phone address gstin').lean()
      : null,
    itemKeys.length
      ? Item.find({ workspaceId, nameKey: { $in: itemKeys } })
          .select('nameKey rate unit hsn taxRate')
          .limit(MATCH_LIMIT)
          .lean()
      : [],
  ]);
  const savedItems = new Map(items.map((item) => [item.nameKey, item]));

  return ops.map((op): OrbitOp => {
    if (op.op === 'setClient' && customer) {
      return {
        op: 'setClient',
        patch: {
          name: customer.name,
          email: op.patch.email || customer.email || undefined,
          phone: op.patch.phone || customer.phone || undefined,
          address: op.patch.address || customer.address || undefined,
          gstin: op.patch.gstin || customer.gstin || undefined,
          customerId: String(customer._id),
        },
      };
    }
    if (op.op === 'addItem') {
      const saved = savedItems.get(nameKeyOf(op.item.description));
      if (!saved) return op;
      return {
        op: 'addItem',
        item: {
          ...op.item,
          itemId: String(saved._id),
          rate: op.item.rate ?? saved.rate,
          unit: op.item.unit ?? (saved.unit || undefined),
          hsn: op.item.hsn ?? (saved.hsn || undefined),
          taxRate: op.item.taxRate ?? saved.taxRate,
        },
      };
    }
    return op;
  });
}

function answer(reply: OrbitReply, ops: OrbitOp[]) {
  return { ops, summary: reply.summary };
}

export async function orbitDraft(workspaceId: string, request: OrbitRequest) {
  if (!request.prompt && !request.attachment) {
    throw badRequestError('Tell Orbit what to bill for, or attach a photo or PDF.');
  }
  const context = await buildContext(workspaceId, request.meta);
  const reply = await askOrbit('draft', workspaceId, {
    prompt: request.prompt,
    context,
    attachment: request.attachment,
  });
  return answer(reply, await matchSaved(workspaceId, reply.ops));
}

export async function orbitEdit(workspaceId: string, request: OrbitRequest) {
  if (!request.prompt) throw badRequestError('Tell Orbit what to change.');
  if (!request.snapshot) throw badRequestError('Missing the document to change.');
  const context = await buildContext(workspaceId, request.meta);
  const reply = await askOrbit('edit', workspaceId, { prompt: request.prompt, context, snapshot: request.snapshot });
  return answer(reply, await matchSaved(workspaceId, reply.ops));
}

export async function orbitGst(workspaceId: string, request: OrbitRequest) {
  if (!request.snapshot) throw badRequestError('Missing the document to check.');
  const reply = await askOrbit('gst', workspaceId, { snapshot: request.snapshot });
  return answer(reply, reply.ops);
}
