import {
  BusinessProfile,
  DEFAULT_PROFILE,
  type BusinessProfileFields,
} from '../models/business-profile.model.js';

const PROFILE_FIELDS = Object.keys(DEFAULT_PROFILE).join(' ');

function toProfile(doc: Partial<BusinessProfileFields> | null): BusinessProfileFields {
  const profile = { ...DEFAULT_PROFILE };
  if (!doc) return profile;
  for (const key of Object.keys(DEFAULT_PROFILE) as (keyof BusinessProfileFields)[]) {
    const value = doc[key];
    if (value !== undefined && value !== null) (profile as Record<string, unknown>)[key] = value;
  }
  return profile;
}

function isComplete(profile: BusinessProfileFields): boolean {
  return Boolean(profile.businessName && profile.email && profile.address);
}

function respond(profile: BusinessProfileFields) {
  return { profile, complete: isComplete(profile) };
}

export async function getBusinessProfile(workspaceId: string) {
  const doc = await BusinessProfile.findOne({ workspaceId }).select(PROFILE_FIELDS).lean();
  return respond(toProfile(doc));
}

export async function getHomeCurrency(workspaceId: string): Promise<string> {
  const doc = await BusinessProfile.findOne({ workspaceId }).select('currency').lean();
  return doc?.currency ?? DEFAULT_PROFILE.currency;
}

export async function saveBusinessProfile(
  workspaceId: string,
  actorId: string | undefined,
  input: BusinessProfileFields
) {
  const doc = await BusinessProfile.findOneAndUpdate(
    { workspaceId },
    { $set: { ...input, updatedBy: actorId } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )
    .select(PROFILE_FIELDS)
    .lean();
  return respond(toProfile(doc));
}

export async function getPaymentTermsDays(workspaceId: string): Promise<number> {
  const doc = await BusinessProfile.findOne({ workspaceId }).select('paymentTermsDays').lean();
  return doc?.paymentTermsDays ?? DEFAULT_PROFILE.paymentTermsDays;
}

export async function getNumberPrefixes(workspaceId: string) {
  const doc = await BusinessProfile.findOne({ workspaceId }).select('invoicePrefix quotationPrefix').lean();
  return {
    invoice: doc?.invoicePrefix || DEFAULT_PROFILE.invoicePrefix,
    quotation: doc?.quotationPrefix || DEFAULT_PROFILE.quotationPrefix,
  };
}
