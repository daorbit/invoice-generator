import { useState } from 'react';
import dayjs from 'dayjs';
import { defaultMessage, defaultSubject } from '@/lib/shareLinks';
import type { DocumentDraft } from '@/types/document';
import type { EmailDraft } from './useShareActions';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_LEAD_MINUTES = 2;

export const MAX_RECIPIENTS = 5;

export type SendWhen = 'now' | 'later';

function invalid(list: string[]): string | undefined {
  const bad = list.find((entry) => !EMAIL.test(entry));
  return bad ? `${bad} is not a valid email` : undefined;
}

function nextMorning(): string {
  return dayjs().add(1, 'day').hour(9).minute(0).second(0).format('YYYY-MM-DD HH:mm:ss');
}

export function useEmailForm(draft: DocumentDraft) {
  const [to, setTo] = useState<string[]>(draft.client.email ? [draft.client.email] : []);
  const [cc, setCc] = useState<string[]>([]);
  const [subject, setSubject] = useState(() => defaultSubject(draft));
  const [message, setMessage] = useState(() => defaultMessage(draft));
  const [attachPdf, setAttachPdf] = useState(true);
  const [when, setWhen] = useState<SendWhen>('now');
  const [sendAt, setSendAt] = useState<string | null>(nextMorning);

  const toError = invalid(to);
  const ccError = invalid(cc);
  const laterInvalid = when === 'later' && (!sendAt || dayjs(sendAt).isBefore(dayjs().add(MIN_LEAD_MINUTES, 'minute')));
  const ready = to.length > 0 && !toError && !ccError && Boolean(subject.trim()) && !laterInvalid;

  const payload = (): EmailDraft => ({
    to,
    cc,
    subject: subject.trim(),
    message,
    attachPdf,
    sendAt: when === 'later' ? sendAt : null,
  });

  return {
    to,
    setTo,
    cc,
    setCc,
    subject,
    setSubject,
    message,
    setMessage,
    attachPdf,
    setAttachPdf,
    when,
    setWhen,
    sendAt,
    setSendAt,
    toError,
    ccError,
    laterInvalid,
    ready,
    payload,
  };
}

export type EmailForm = ReturnType<typeof useEmailForm>;
