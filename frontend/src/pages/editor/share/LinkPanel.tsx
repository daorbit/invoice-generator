import { ActionIcon, Button, CopyButton, Group, TextInput, Tooltip } from '@mantine/core';
import { Check, Copy, ExternalLink, Link2, Mail, MessageCircle, Unlink } from 'lucide-react';
import dayjs from 'dayjs';
import { KIND_META } from '@/lib/documentMeta';
import { mailtoLink, previewLink, whatsappLink } from '@/lib/shareLinks';
import type { useShareActions } from '@/hooks/useShareActions';
import type { DocumentActivity, DocumentDraft } from '@/types/document';
import classes from './Share.module.css';

interface Props {
  draft: DocumentDraft;
  activity: DocumentActivity | null;
  actions: ReturnType<typeof useShareActions>;
}

function viewsText(activity: DocumentActivity | null): string {
  const views = activity?.views;
  if (!views?.count || !views.lastAt) return 'Not opened yet';
  const times = views.count === 1 ? 'once' : `${views.count} times`;
  return `Opened ${times}, last on ${dayjs(views.lastAt).format('D MMM, h:mm A')}`;
}

export function LinkPanel({ draft, activity, actions }: Props) {
  const url = activity?.shareUrl;
  const label = KIND_META[draft.kind].singular.toLowerCase();
  const busy = actions.busy === 'link';
  const extra = draft.kind === 'quotation' ? ' Your client can also accept or decline it online.' : '';

  if (!url) {
    return (
      <div className={classes.panel}>
        <p className={classes.lead}>
          Anyone with the link can view and download this {label}.{extra}
        </p>
        <Group justify="flex-end">
          <Button leftSection={<Link2 size={15} />} loading={busy} onClick={() => void actions.createLink()}>
            Create link
          </Button>
        </Group>
      </div>
    );
  }

  return (
    <div className={classes.panel}>
      <TextInput
        label="Link"
        readOnly
        value={url}
        onFocus={(event) => event.currentTarget.select()}
        rightSection={
          <CopyButton value={url}>
            {({ copied, copy }) => (
              <Tooltip label={copied ? 'Copied' : 'Copy link'} withArrow>
                <ActionIcon variant="subtle" color="gray" onClick={copy} aria-label="Copy link">
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                </ActionIcon>
              </Tooltip>
            )}
          </CopyButton>
        }
      />
      <p className={classes.views}>{viewsText(activity)}</p>
      <div className={classes.shareButtons}>
        <Button
          variant="default"
          component="a"
          href={whatsappLink(draft, url)}
          target="_blank"
          rel="noopener noreferrer"
          leftSection={<MessageCircle size={15} />}
        >
          WhatsApp
        </Button>
        <Button
          variant="default"
          component="a"
          href={mailtoLink(draft, url)}
          leftSection={<Mail size={15} />}
        >
          Email app
        </Button>
        <Button
          variant="default"
          component="a"
          href={previewLink(url)}
          target="_blank"
          rel="noopener noreferrer"
          leftSection={<ExternalLink size={15} />}
        >
          Open
        </Button>
      </div>
      <div className={classes.footer}>
        <span className={classes.muted}>Opening it yourself with Open is not counted.</span>
        <Button
          variant="subtle"
          color="gray"
          size="compact-sm"
          leftSection={<Unlink size={14} />}
          loading={busy}
          onClick={() => void actions.removeLink()}
        >
          Turn off link
        </Button>
      </div>
    </div>
  );
}
