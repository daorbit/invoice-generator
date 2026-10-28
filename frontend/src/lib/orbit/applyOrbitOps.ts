import dayjs from 'dayjs';
import { newLineItem } from '@/lib/newDraft';
import { lineAmount } from '@/lib/totals';
import type { DocumentDraft, LineItem } from '@/types/document';
import type { OrbitDocumentPatch, OrbitItemPatch, OrbitOp } from '@/types/orbit';

function defined<T extends object>(patch: T): Partial<T> {
  return Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined)) as Partial<T>;
}

function priced(item: LineItem): LineItem {
  return { ...item, amount: lineAmount(item) };
}

function patchItem(item: LineItem, patch: OrbitItemPatch): LineItem {
  const next = { ...item, ...defined(patch) };
  const renamed = patch.description !== undefined && patch.description !== item.description && !patch.itemId;
  return priced(renamed ? { ...next, itemId: undefined } : next);
}

function newItem(draft: DocumentDraft, patch: OrbitItemPatch & { description: string }): LineItem {
  return priced({ ...newLineItem(draft.tax), quantity: 1, ...defined(patch) });
}

function patchDocument(draft: DocumentDraft, patch: OrbitDocumentPatch): DocumentDraft {
  const { dueInDays, taxRate, amountPaid, ...fields } = defined(patch);
  const issueDate = fields.issueDate ?? draft.issueDate;
  const dueDate =
    dueInDays !== undefined ? dayjs(issueDate ?? undefined).add(dueInDays, 'day').format('YYYY-MM-DD') : fields.dueDate ?? draft.dueDate;
  const next: DocumentDraft = { ...draft, ...fields, issueDate, dueDate };
  if (amountPaid !== undefined && draft.kind === 'invoice') next.amountPaid = amountPaid;
  if (taxRate === undefined) return next;
  return { ...next, tax: taxRate, items: next.items.map((item) => priced({ ...item, taxRate })) };
}

function applyOne(draft: DocumentDraft, op: OrbitOp): DocumentDraft {
  switch (op.op) {
    case 'setClient': {
      const { customerId, ...fields } = defined(op.patch);
      const renamed = fields.name !== undefined && fields.name.trim() !== draft.client.name.trim();
      return {
        ...draft,
        client: { ...draft.client, ...fields },
        customerId: customerId ?? (renamed ? undefined : draft.customerId),
      };
    }
    case 'addItem':
      return { ...draft, items: [...draft.items, newItem(draft, op.item)] };
    case 'updateItem':
      return { ...draft, items: draft.items.map((item) => (item.id === op.id ? patchItem(item, op.patch) : item)) };
    case 'removeItem': {
      const items = draft.items.filter((item) => item.id !== op.id);
      return { ...draft, items: items.length ? items : [newLineItem(draft.tax)] };
    }
    case 'setDocument':
      return patchDocument(draft, op.patch);
    default:
      return draft;
  }
}

function withoutBlankLines(draft: DocumentDraft): DocumentDraft {
  const items = draft.items.filter((item) => item.description.trim() || item.amount);
  return { ...draft, items };
}

export function applyOrbitOps(draft: DocumentDraft, ops: OrbitOp[]): DocumentDraft {
  const adds = ops.some((op) => op.op === 'addItem');
  const start = adds ? withoutBlankLines(draft) : draft;
  const next = ops.reduce(applyOne, start);
  return next.items.length ? next : { ...next, items: [newLineItem(next.tax)] };
}
