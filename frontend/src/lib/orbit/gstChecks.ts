import { GSTIN_PATTERN, isGstDocument, placeOfSupply } from '@/lib/gst';
import { plural } from '@/lib/format';
import type { DocumentDraft } from '@/types/document';

export function gstChecks(draft: DocumentDraft): string[] {
  const items = draft.items.filter((item) => item.description.trim());

  if (!isGstDocument(draft)) {
    const taxed = draft.currency === 'INR' && items.some((item) => item.taxRate > 0);
    return taxed ? ['Add your GSTIN in Business details to issue a GST tax invoice.'] : [];
  }

  const missingCodes = items.filter((item) => !item.hsn).length;
  const clientGstin = draft.client.gstin?.trim() ?? '';

  return [
    missingCodes ? `${plural(missingCodes, 'item')} still ${missingCodes === 1 ? 'has' : 'have'} no HSN/SAC code.` : '',
    clientGstin && !GSTIN_PATTERN.test(clientGstin) ? "The client's GSTIN does not look right." : '',
    !clientGstin ? 'No client GSTIN, so this is a B2C invoice.' : '',
    !placeOfSupply(draft) ? 'Pick the place of supply in the Tax step.' : '',
    draft.exportUnderLut && items.some((item) => item.taxRate > 0) ? 'Export under LUT is on, so items should carry no GST.' : '',
  ].filter(Boolean);
}
