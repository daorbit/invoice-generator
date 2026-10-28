import { FxRate } from '../models/fx-rate.model.js';
import { fetchFxRates } from '../lib/quantalog.js';

const FX_KEY = 'quantalog';
const REFRESH_MS = 6 * 60 * 60 * 1000;

export interface FxRates {
  base: string;
  rates: Record<string, number>;
  fetchedAt: string;
}

interface StoredRates {
  base: string;
  rates: Record<string, number>;
  fetchedAt: Date;
  checkedAt: Date;
}

function toRates(doc: StoredRates): FxRates {
  return { base: doc.base, rates: doc.rates ?? {}, fetchedAt: doc.fetchedAt.toISOString() };
}

function usableRates(rates: Record<string, unknown>): Record<string, number> {
  return Object.fromEntries(
    Object.entries(rates).filter((entry): entry is [string, number] => Number.isFinite(entry[1]) && Number(entry[1]) > 0),
  );
}

export async function getFxRates(): Promise<FxRates | null> {
  const stored = await FxRate.findOne({ key: FX_KEY }).select('base rates fetchedAt checkedAt').lean<StoredRates>();
  if (stored && Date.now() - stored.checkedAt.getTime() < REFRESH_MS) return toRates(stored);

  const fresh = await fetchFxRates();
  const now = new Date();
  if (!fresh) {
    if (stored) await FxRate.updateOne({ key: FX_KEY }, { $set: { checkedAt: now } });
    return stored ? toRates(stored) : null;
  }

  const fetchedAt = new Date(fresh.fetchedAt);
  const next: StoredRates = {
    base: fresh.base,
    rates: usableRates(fresh.rates),
    fetchedAt: Number.isNaN(fetchedAt.getTime()) ? now : fetchedAt,
    checkedAt: now,
  };
  await FxRate.updateOne({ key: FX_KEY }, { $set: next }, { upsert: true });
  return toRates(next);
}
