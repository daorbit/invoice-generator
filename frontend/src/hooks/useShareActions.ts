import { useCallback, useState } from 'react';
import dayjs from 'dayjs';
import { cancelScheduledEmail, emailDocument, shareDocument, unshareDocument } from '@/api/documents';
import { notify } from '@/lib/notify';
import type { DocumentKind, LoadedDocument } from '@/types/document';

export type ShareBusy = 'email' | 'link' | 'cancel' | null;

export interface EmailDraft {
  to: string[];
  cc: string[];
  subject: string;
  message: string;
  attachPdf: boolean;
  sendAt: string | null;
}

interface Options {
  kind: DocumentKind;
  ensureSaved: () => Promise<string | null>;
  renderPdf: () => Promise<string>;
  onLoaded: (loaded: LoadedDocument) => void;
  onShareUrl: (url: string | null) => void;
}

export function useShareActions({ kind, ensureSaved, renderPdf, onLoaded, onShareUrl }: Options) {
  const [busy, setBusy] = useState<ShareBusy>(null);

  const run = useCallback(async (key: Exclude<ShareBusy, null>, task: () => Promise<boolean>): Promise<boolean> => {
    setBusy(key);
    try {
      return await task();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Something went wrong');
      return false;
    } finally {
      setBusy(null);
    }
  }, []);

  const createLink = useCallback(
    () =>
      run('link', async () => {
        const id = await ensureSaved();
        if (!id) return false;
        const { shareUrl } = await shareDocument(kind, id);
        onShareUrl(shareUrl);
        return true;
      }),
    [run, ensureSaved, kind, onShareUrl]
  );

  const removeLink = useCallback(
    () =>
      run('link', async () => {
        const id = await ensureSaved();
        if (!id) return false;
        await unshareDocument(kind, id);
        onShareUrl(null);
        notify.success('Link turned off. The old link no longer opens.');
        return true;
      }),
    [run, ensureSaved, kind, onShareUrl]
  );

  const send = useCallback(
    (email: EmailDraft) =>
      run('email', async () => {
        const id = await ensureSaved();
        if (!id) return false;
        const pdf = email.attachPdf ? await renderPdf() : undefined;
        const sendAt = email.sendAt ? dayjs(email.sendAt).toISOString() : undefined;
        const loaded = await emailDocument(kind, id, {
          to: email.to,
          cc: email.cc,
          subject: email.subject,
          message: email.message,
          pdf,
          sendAt,
        });
        onLoaded(loaded);
        notify.success(sendAt ? `Scheduled for ${dayjs(sendAt).format('D MMM, h:mm A')}` : `Sent to ${email.to.join(', ')}`);
        return true;
      }),
    [run, ensureSaved, renderPdf, kind, onLoaded]
  );

  const cancelSchedule = useCallback(
    () =>
      run('cancel', async () => {
        const id = await ensureSaved();
        if (!id) return false;
        onLoaded(await cancelScheduledEmail(kind, id));
        notify.success('Scheduled email cancelled');
        return true;
      }),
    [run, ensureSaved, kind, onLoaded]
  );

  return { busy, createLink, removeLink, send, cancelSchedule };
}
