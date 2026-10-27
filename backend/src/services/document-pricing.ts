import type { Party } from '../models/document-parts.js';
import { computeTotals, type PricingInput } from '../lib/totals.js';
import { isInterState, resolvePlaceOfSupply } from '../lib/gst.js';

interface PricedInput extends PricingInput {
  from: Party;
  placeOfSupply?: string;
  exportUnderLut: boolean;
}

export function priceDocument(input: PricedInput, client: Party) {
  const parties = {
    fromGstin: input.from.gstin,
    clientGstin: client.gstin,
    placeOfSupply: input.placeOfSupply,
    exportUnderLut: input.exportUnderLut,
  };
  return {
    ...computeTotals(input),
    supplyState: (input.exportUnderLut ? '96' : resolvePlaceOfSupply(parties)) || undefined,
    interState: isInterState(parties),
  };
}
