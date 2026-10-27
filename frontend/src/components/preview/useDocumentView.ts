import dayjs from 'dayjs';
import { useUpiQr } from '@/hooks/useUpiQr';
import { amountInWords } from '@/lib/amountInWords';
import { KIND_META } from '@/lib/documentMeta';
import { formatDate, formatMoney } from '@/lib/format';
import { computeTotals, type DraftTotals } from '@/lib/totals';
import type { DocumentDraft, LineItem, Party } from '@/types/document';

export type Row = [string, string];

export interface DocumentView {
  draft: DocumentDraft;
  isInvoice: boolean;
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
  words: string;
  payment: Row[];
  qr: string | null;
  termsLabel: string;
  stamp: { label: string; tone: 'paid' | 'cancelled' } | null;
  money: (value: number) => string;
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

export function useDocumentView(draft: DocumentDraft): DocumentView {
  const meta = KIND_META[draft.kind];
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

  const totalRows: Row[] = [['Sub Total', money(totals.subtotal)]];
  if (totals.discountAmount > 0) {
    const rate = draft.discountType === 'percentage' ? ` (${draft.discount}%)` : '';
    totalRows.push([`Discount${rate}`, `−${money(totals.discountAmount)}`]);
  }
  if (totals.taxAmount > 0) totalRows.push([`Tax (${draft.tax}%)`, money(totals.taxAmount)]);
  if (draft.shipping > 0) totalRows.push(['Shipping', money(draft.shipping)]);

  const headlineAmount = isInvoice ? totals.balanceDue : totals.total;
  const stampTone = isInvoice && (draft.status === 'paid' || draft.status === 'cancelled') ? draft.status : null;

  return {
    draft,
    isInvoice,
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
          ]
        : [
            ['Quote Date', formatDate(draft.issueDate)],
            ['Valid Until', formatDate(draft.dueDate)],
            ['Reference', draft.reference],
          ]
    ),
    items: draft.items.filter((item) => item.description || item.amount),
    totals,
    totalRows,
    headlineLabel: isInvoice ? 'Balance Due' : 'Quote Total',
    headline: money(headlineAmount),
    dueText: draft.dueDate ? `${isInvoice ? 'Due' : 'Valid until'} ${formatDate(draft.dueDate)}` : '',
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
  };
}
