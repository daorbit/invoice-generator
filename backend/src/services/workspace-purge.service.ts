import { Invoice } from '../models/invoice.model.js';
import { Quotation } from '../models/quotation.model.js';
import { Counter } from '../models/counter.model.js';
import { BusinessProfile } from '../models/business-profile.model.js';
import { Customer } from '../models/customer.model.js';
import { Item } from '../models/item.model.js';
import { EmailOutbox } from '../models/email-outbox.model.js';

export async function purgeWorkspace(workspaceId: string) {
  const [invoices, quotations, counters, profiles, customers, items, emails] = await Promise.all([
    Invoice.deleteMany({ workspaceId }),
    Quotation.deleteMany({ workspaceId }),
    Counter.deleteMany({ workspaceId }),
    BusinessProfile.deleteMany({ workspaceId }),
    Customer.deleteMany({ workspaceId }),
    Item.deleteMany({ workspaceId }),
    EmailOutbox.deleteMany({ workspaceId }),
  ]);
  return {
    invoices: invoices.deletedCount,
    quotations: quotations.deletedCount,
    counters: counters.deletedCount,
    profiles: profiles.deletedCount,
    customers: customers.deletedCount,
    items: items.deletedCount,
    emails: emails.deletedCount,
  };
}
