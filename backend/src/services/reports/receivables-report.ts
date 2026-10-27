import { Invoice } from '../../models/invoice.model.js';
import type { ReportScope } from '../../lib/report-period.js';
import { round2 } from '../../lib/totals.js';
import { customerKey, DAY_MS, ROW_LIMIT, UNPAID } from './report-filters.js';

const BUCKETS = [
  { key: 'current', min: Number.NEGATIVE_INFINITY, max: 0 },
  { key: 'days1to15', min: 1, max: 15 },
  { key: 'days16to30', min: 16, max: 30 },
  { key: 'days31to45', min: 31, max: 45 },
  { key: 'over45', min: 46, max: Number.POSITIVE_INFINITY },
] as const;

type BucketKey = (typeof BUCKETS)[number]['key'];

type AgingRow = { _id: string; name: string; customerId: string | null; invoices: number; total: number } & Record<
  BucketKey,
  number
>;

function bucketSum(min: number, max: number) {
  const conditions: object[] = [];
  if (Number.isFinite(min)) conditions.push({ $gte: ['$days', min] });
  if (Number.isFinite(max)) conditions.push({ $lte: ['$days', max] });
  return { $sum: { $cond: [{ $and: conditions }, '$balanceDue', 0] } };
}

export async function receivablesReport(workspaceId: string, scope: ReportScope) {
  const now = new Date();
  const rows = await Invoice.aggregate<AgingRow>([
    { $match: { workspaceId, currency: scope.currency, status: { $in: UNPAID }, balanceDue: { $gt: 0 } } },
    {
      $project: {
        customerId: 1,
        name: '$billTo.name',
        balanceDue: 1,
        days: { $floor: { $divide: [{ $subtract: [now, { $ifNull: ['$dueDate', now] }] }, DAY_MS] } },
      },
    },
    {
      $group: {
        _id: customerKey('$name'),
        name: { $first: '$name' },
        customerId: { $first: '$customerId' },
        invoices: { $sum: 1 },
        total: { $sum: '$balanceDue' },
        ...Object.fromEntries(BUCKETS.map((bucket) => [bucket.key, bucketSum(bucket.min, bucket.max)])),
      },
    },
    { $sort: { total: -1 } },
    { $limit: ROW_LIMIT },
  ]);

  const customers = rows.map((row) => ({
    key: row._id,
    name: row.name || 'Unnamed client',
    customerId: row.customerId ?? null,
    invoices: row.invoices,
    total: round2(row.total),
    ...(Object.fromEntries(BUCKETS.map((bucket) => [bucket.key, round2(row[bucket.key])])) as Record<BucketKey, number>),
  }));

  const totals = Object.fromEntries(
    (['total', ...BUCKETS.map((bucket) => bucket.key)] as const).map((key) => [
      key,
      round2(customers.reduce((sum, row) => sum + row[key], 0)),
    ])
  ) as Record<'total' | BucketKey, number>;

  return { customers, totals, truncated: rows.length === ROW_LIMIT };
}
