import dayjs from 'dayjs';
import { useUpiQr } from '@/hooks/useUpiQr';
import { useBrandLogo } from './BrandLogo';
import { amountInWords } from '@/lib/amountInWords';
import { KIND_META } from '@/lib/documentMeta';
import { formatDate, formatMoney } from '@/lib/format';
import { isGstDocument, placeOfSupply, stateLabel } from '@/lib/gst';
import { lineMeta, totalRows, type Row } from '@/lib/taxRows';
import { computeTotals, type DraftTotals } from '@/lib/totals';
import type { DocumentDraft, LineItem, Party } from '@/types/document';

export type { Row };

export interface DocumentView {
  draft: DocumentDraft;
  isInvoice: boolean;
  logo: string;
  heading: string;
  number: string;
  from: Party;
  client: Party;
  fromContact: string;
  clientContact: string;
  clientLabel: string;
  meta: Row[];
  items: LineItem[];
  totals: DraftTotals;
  totalRows: Row[];
  headlineLabel: string;
  headline: string;
  dueText: string;
  issueDate: string;
  dueDate: string;
  dueLabel: string;
  words: string;
  payment: Row[];
  qr: string | null;
  termsLabel: string;
  stamp: { label: string; tone: 'paid' | 'cancelled' } | null;
  money: (value: number) => string;
  qty: (item: LineItem) => string;
  itemMeta: (item: LineItem) => string;
}

function paymentTerms(issue: string | null, due: string | null): string {
  if (!issue || !due) return '';
  const days = dayjs(due).diff(dayjs(issue), 'day');
  if (days <= 0) return 'Due on receipt';
  return `Net ${days}`;
}

function filled(rows: Row[]): Row[] {
  return rows.filter(([, value]) => Boolean(value));
}

function heading(draft: DocumentDraft): string {
  if (draft.kind === 'quotation') return 'Quotation';
  return draft.from.gstin ? 'Tax Invoice' : 'Invoice';
}

function gstMeta(draft: DocumentDraft): Row[] {
  if (!isGstDocument(draft)) return [];
  return [
    ['Place of Supply', stateLabel(placeOfSupply(draft))],
    ['Reverse Charge', draft.reverseCharge ? 'Yes' : ''],
    ['Supply Type', draft.exportUnderLut ? 'Export under LUT' : ''],
  ];
}

function quantity(item: LineItem): string {
  return item.unit ? `${item.quantity} ${item.unit}` : String(item.quantity);
}

export function useDocumentView(draft: DocumentDraft): DocumentView {
  const meta = KIND_META[draft.kind];
  const brandLogo = useBrandLogo();
  const isInvoice = draft.kind === 'invoice';
  const totals = computeTotals(draft);
  const money = (value: number) => formatMoney(value, draft.currency);
  const qr = useUpiQr({
    upiId: isInvoice ? draft.payment?.upiId : undefined,
    payee: draft.from.name,
    amount: totals.balanceDue,
    currency: draft.currency,
    note: draft.number || 'Invoice',
  });

  const headlineAmount = isInvoice ? totals.balanceDue : totals.total;
  const stampTone = isInvoice && (draft.status === 'paid' || draft.status === 'cancelled') ? draft.status : null;

  return {
    draft,
    isInvoice,
    logo: draft.logo || brandLogo,
    heading: heading(draft),
    number: draft.number || 'Draft',
    from: draft.from,
    client: draft.client,
    fromContact: [draft.from.email, draft.from.phone, draft.from.website].filter(Boolean).join(' · '),
    clientContact: [draft.client.email, draft.client.phone].filter(Boolean).join(' · '),
    clientLabel: meta.clientLabel,
    meta: filled(
      isInvoice
        ? [
            ['Invoice Date', formatDate(draft.issueDate)],
            ['Terms', paymentTerms(draft.issueDate, draft.dueDate)],
            ['Due Date', formatDate(draft.dueDate)],
            ['P.O.#', draft.reference],
            ...gstMeta(draft),
          ]
        : [
            ['Quote Date', formatDate(draft.issueDate)],
            ['Valid Until', formatDate(draft.dueDate)],
            ['Reference', draft.reference],
            ...gstMeta(draft),
          ]
    ),
    items: draft.items.filter((item) => item.description || item.amount),
    totals,
    totalRows: totalRows(draft, totals, money),
    headlineLabel: isInvoice ? 'Balance Due' : 'Quote Total',
    headline: money(headlineAmount),
    dueText: draft.dueDate ? `${isInvoice ? 'Due' : 'Valid until'} ${formatDate(draft.dueDate)}` : '',
    issueDate: formatDate(draft.issueDate),
    dueDate: formatDate(draft.dueDate),
    dueLabel: isInvoice ? 'Due date' : 'Valid until',
    words: amountInWords(totals.total, draft.currency),
    payment: isInvoice
      ? filled([
          ['Bank', draft.payment?.bankName ?? ''],
          ['Account Name', draft.payment?.accountName ?? ''],
          ['Account No.', draft.payment?.accountNumber ?? ''],
          ['IFSC', draft.payment?.ifsc ?? ''],
          ['UPI', draft.payment?.upiId ?? ''],
        ])
      : [],
    qr,
    termsLabel: isInvoice ? 'Terms & Conditions' : 'Payment Terms',
    stamp: stampTone ? { label: stampTone === 'paid' ? 'Paid' : 'Cancelled', tone: stampTone } : null,
    money,
    qty: quantity,
    itemMeta: lineMeta(draft),
  };
}
