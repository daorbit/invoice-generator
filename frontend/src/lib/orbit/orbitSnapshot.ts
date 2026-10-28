import { todayIso } from '@/lib/format';
import { isGstDocument, taxRatesFor } from '@/lib/gst';
import type { DocumentDraft } from '@/types/document';
import type { OrbitDocumentMeta, OrbitSnapshot } from '@/types/orbit';

export function isBlankDraft(draft: DocumentDraft): boolean {
  return !draft.client.name.trim() && draft.items.every((item) => !item.description.trim() && !item.amount);
}

export function orbitDocumentMeta(draft: DocumentDraft): OrbitDocumentMeta {
  return {
    kind: draft.kind,
    currency: draft.currency,
    today: todayIso(),
    gst: isGstDocument(draft),
    taxRates: taxRatesFor(draft),
  };
}

export function orbitSnapshot(draft: DocumentDraft): OrbitSnapshot {
  return {
    client: {
      name: draft.client.name,
      email: draft.client.email,
      phone: draft.client.phone,
      address: draft.client.address,
      gstin: draft.client.gstin ?? '',
    },
    items: draft.items.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      rate: item.rate,
      unit: item.unit ?? '',
      hsn: item.hsn ?? '',
      taxRate: item.taxRate,
    })),
    currency: draft.currency,
    issueDate: draft.issueDate ?? '',
    dueDate: draft.dueDate ?? '',
    discount: draft.discount,
    discountType: draft.discountType,
    shipping: draft.shipping,
    amountPaid: draft.amountPaid,
    reference: draft.reference,
    notes: draft.notes,
    terms: draft.terms,
  };
}
