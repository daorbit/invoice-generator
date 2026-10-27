import { KIND_META } from './documentMeta';
import { formatDate, formatMoney } from './format';
import { computeTotals } from './totals';
import type { DocumentDraft } from '@/types/document';

const INDIA_MOBILE_DIGITS = 10;

export function amountText(draft: DocumentDraft): string {
  const totals = computeTotals(draft);
  return formatMoney(draft.kind === 'invoice' ? totals.balanceDue : totals.total, draft.currency);
}

export function defaultSubject(draft: DocumentDraft): string {
  const label = KIND_META[draft.kind].singular;
  return [label, draft.number, draft.from.name ? `from ${draft.from.name}` : ''].filter(Boolean).join(' ');
}

export function defaultMessage(draft: DocumentDraft): string {
  const greeting = draft.client.name ? `Hi ${draft.client.name},` : 'Hello,';
  const sign = draft.from.name ? `Thank you,\n${draft.from.name}` : 'Thank you';
  const due = draft.dueDate ? formatDate(draft.dueDate) : '';
  const body =
    draft.kind === 'invoice'
      ? `Please find invoice ${draft.number} for ${amountText(draft)}${due ? `, due on ${due}` : ''}. You can view and download it with the button below.`
      : `Here is quotation ${draft.number} for ${amountText(draft)}${due ? `, valid until ${due}` : ''}. You can review it and accept it online with the button below.`;
  return `${greeting}\n\n${body}\n\n${sign}`;
}

function shareText(draft: DocumentDraft, url: string): string {
  const label = KIND_META[draft.kind].singular.toLowerCase();
  return `${draft.client.name ? `Hi ${draft.client.name}, here` : 'Here'} is ${label} ${draft.number} for ${amountText(draft)}: ${url}`;
}

function whatsappNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.length === INDIA_MOBILE_DIGITS ? `91${digits}` : digits;
}

export function whatsappLink(draft: DocumentDraft, url: string): string {
  const number = whatsappNumber(draft.client.phone);
  return `https://wa.me/${number}?text=${encodeURIComponent(shareText(draft, url))}`;
}

export function mailtoLink(draft: DocumentDraft, url: string): string {
  const subject = encodeURIComponent(defaultSubject(draft));
  const body = encodeURIComponent(`${shareText(draft, url)}\n\n${draft.from.name}`);
  return `mailto:${encodeURIComponent(draft.client.email)}?subject=${subject}&body=${body}`;
}

export function previewLink(url: string): string {
  return `${url}?preview=1`;
}
