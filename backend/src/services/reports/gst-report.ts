import { Invoice } from '../../models/invoice.model.js';
import type { TaxLine } from '../../models/document-parts.js';
import type { ReportPeriod } from '../../lib/report-period.js';
import { round2 } from '../../lib/totals.js';
import { issuedInvoices } from './report-filters.js';

const GST_LIMIT = 2000;

interface GstRow {
  _id: unknown;
  invoiceNumber: string;
  invoiceDate: Date | null;
  name: string | null;
  gstin: string | null;
  supplyState: string | null;
  interState: boolean | null;
  reverseCharge: boolean | null;
  exportUnderLut: boolean | null;
  total: number;
  lines: TaxLine[];
}

interface Split {
  taxable: number;
  igst: number;
  cgst: number;
  sgst: number;
}

const ZERO: Split = { taxable: 0, igst: 0, cgst: 0, sgst: 0 };

function split(line: TaxLine, interState: boolean): Split {
  if (interState) return { taxable: line.taxable, igst: line.tax, cgst: 0, sgst: 0 };
  const cgst = round2(line.tax / 2);
  return { taxable: line.taxable, igst: 0, cgst, sgst: round2(line.tax - cgst) };
}

function add(a: Split, b: Split): Split {
  return { taxable: a.taxable + b.taxable, igst: a.igst + b.igst, cgst: a.cgst + b.cgst, sgst: a.sgst + b.sgst };
}

function rounded(value: Split): Split {
  return { taxable: round2(value.taxable), igst: round2(value.igst), cgst: round2(value.cgst), sgst: round2(value.sgst) };
}

function taxOf(value: Split): number {
  return round2(value.igst + value.cgst + value.sgst);
}

export async function gstReport(workspaceId: string, period: ReportPeriod) {
  const rows = await Invoice.aggregate<GstRow>([
    { $match: issuedInvoices(workspaceId, period) },
    { $sort: { invoiceDate: 1 } },
    { $limit: GST_LIMIT },
    {
      $project: {
        invoiceNumber: 1,
        invoiceDate: 1,
        name: '$billTo.name',
        gstin: '$billTo.gstin',
        supplyState: 1,
        interState: 1,
        reverseCharge: 1,
        exportUnderLut: 1,
        total: 1,
        lines: {
          $cond: [
            { $gt: [{ $size: { $ifNull: ['$taxLines', []] } }, 0] },
            '$taxLines',
            [{ rate: '$tax', taxable: '$subtotal', tax: '$taxAmount' }],
          ],
        },
      },
    },
  ]);

  const byRate = new Map<number, Split>();
  let b2b = { count: 0, ...ZERO };
  let b2c = { count: 0, ...ZERO };

  const invoices = rows.map((row) => {
    const interState = Boolean(row.interState);
    const totals = row.lines.reduce((sum, line) => {
      const part = split(line, interState);
      byRate.set(line.rate, add(byRate.get(line.rate) ?? ZERO, part));
      return add(sum, part);
    }, ZERO);
    if (row.gstin) b2b = { count: b2b.count + 1, ...add(b2b, totals) };
    else b2c = { count: b2c.count + 1, ...add(b2c, totals) };
    return {
      id: String(row._id),
      number: row.invoiceNumber,
      date: row.invoiceDate?.toISOString() ?? null,
      client: row.name ?? '',
      gstin: row.gstin ?? '',
      placeOfSupply: row.supplyState ?? '',
      interState,
      reverseCharge: Boolean(row.reverseCharge),
      exportUnderLut: Boolean(row.exportUnderLut),
      total: round2(row.total ?? 0),
      ...rounded(totals),
      tax: taxOf(totals),
    };
  });

  const summary = rounded(invoices.reduce((sum, invoice) => add(sum, invoice), ZERO));
  return {
    summary: { ...summary, tax: taxOf(summary), invoices: invoices.length },
    byRate: [...byRate.entries()]
      .sort(([a], [b]) => a - b)
      .map(([rate, value]) => ({ rate, ...rounded(value), tax: taxOf(value) })),
    b2b: { count: b2b.count, ...rounded(b2b), tax: taxOf(b2b) },
    b2c: { count: b2c.count, ...rounded(b2c), tax: taxOf(b2c) },
    invoices,
    truncated: rows.length === GST_LIMIT,
  };
}
