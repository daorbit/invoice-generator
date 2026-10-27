import { BusinessProfile } from '../models/business-profile.model.js';
import { Customer } from '../models/customer.model.js';
import { Invoice } from '../models/invoice.model.js';
import { Quotation } from '../models/quotation.model.js';
import { nameKeyOf } from '../lib/customer-input.js';
import { listRecentClients } from './clients.service.js';

export async function seedCustomersOnce(workspaceId: string): Promise<boolean> {
  const profile = await BusinessProfile.findOne({ workspaceId }).select('customersSeededAt').lean();
  if (profile?.customersSeededAt) return false;

  const [parties] = await Promise.all([
    listRecentClients(workspaceId),
    BusinessProfile.updateOne({ workspaceId }, { $set: { customersSeededAt: new Date() } }, { upsert: true }),
  ]);
  if (!parties.length) return false;

  await Customer.insertMany(
    parties.map((party) => ({
      workspaceId,
      nameKey: nameKeyOf(party.name),
      name: party.name.trim(),
      email: party.email ?? '',
      phone: party.phone ?? '',
      address: party.address ?? '',
      gstin: party.gstin ?? '',
      stateCode: party.gstin?.slice(0, 2) ?? '',
    })),
    { ordered: false }
  ).catch(() => undefined);

  const customers = await Customer.find({ workspaceId, nameKey: { $in: parties.map((p) => nameKeyOf(p.name)) } })
    .select('_id name')
    .lean();

  const links = (field: 'billTo.name' | 'quoteTo.name') =>
    customers.map((customer) => ({
      updateMany: {
        filter: { workspaceId, customerId: { $exists: false }, [field]: customer.name },
        update: { $set: { customerId: String(customer._id) } },
      },
    }));

  if (customers.length) {
    await Promise.all([Invoice.bulkWrite(links('billTo.name')), Quotation.bulkWrite(links('quoteTo.name'))]);
  }
  return true;
}
