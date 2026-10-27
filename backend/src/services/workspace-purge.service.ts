import { Invoice } from '../models/invoice.model.js';
import { Quotation } from '../models/quotation.model.js';
import { Counter } from '../models/counter.model.js';
import { BusinessProfile } from '../models/business-profile.model.js';

export async function purgeWorkspace(workspaceId: string) {
  const [invoices, quotations, counters, profiles] = await Promise.all([
    Invoice.deleteMany({ workspaceId }),
    Quotation.deleteMany({ workspaceId }),
    Counter.deleteMany({ workspaceId }),
    BusinessProfile.deleteMany({ workspaceId }),
  ]);
  return {
    invoices: invoices.deletedCount,
    quotations: quotations.deletedCount,
    counters: counters.deletedCount,
    profiles: profiles.deletedCount,
  };
}
