import { ActionIcon, Button, CopyButton, TextInput, Tooltip } from '@mantine/core';
import { Check, Copy, ExternalLink } from 'lucide-react';
import dayjs from 'dayjs';
import { SettingRow, SettingsGroup, SettingsStack, SwitchRow } from '@/components/settings/SettingsGroup';
import { MailIcon, TelegramIcon, WhatsAppIcon } from '@/components/ui/SocialIcons';
import type { useShareActions } from '@/hooks/useShareActions';
import { KIND_META } from '@/lib/documentMeta';
import { mailtoLink, previewLink, telegramLink, whatsappLink } from '@/lib/shareLinks';
import type { DocumentActivity, DocumentDraft } from '@/types/document';
import { QrCard } from './QrCard';
import classes from './Share.module.css';

interface Props {
  draft: DocumentDraft;
  activity: DocumentActivity | null;
  actions: ReturnType<typeof useShareActions>;
}

function viewsText(activity: DocumentActivity | null): string {
  const views = activity?.views;
  if (!views?.count || !views.lastAt) return 'Not opened yet.';
  const times = views.count === 1 ? 'once' : `${views.count} times`;
  return `Opened ${times}, last on ${dayjs(views.lastAt).format('D MMM, h:mm A')}.`;
}

export function LinkPanel({ draft, activity, actions }: Props) {
  const url = activity?.shareUrl ?? '';
  const label = KIND_META[draft.kind].singular.toLowerCase();
  const busy = actions.busy === 'link';
  const extra = draft.kind === 'quotation' ? ' Your client can also accept or decline it online.' : '';

  const toggle = (next: boolean) => void (next ? actions.createLink() : actions.removeLink());

  const targets = url
    ? [
        { id: 'whatsapp', label: 'WhatsApp', Icon: WhatsAppIcon, href: whatsappLink(draft, url), external: true },
        { id: 'telegram', label: 'Telegram', Icon: TelegramIcon, href: telegramLink(draft, url), external: true },
        { id: 'email', label: 'Email app', Icon: MailIcon, href: mailtoLink(draft, url), external: false },
        { id: 'open', label: 'Open', Icon: ExternalLink, href: previewLink(url), external: true },
      ]
    : [];

  return (
    <SettingsStack>
      <SettingsGroup title="Visibility">
        <SwitchRow
          label="Share with a link"
          hint={
            url
              ? `Anyone with the link can view and download this ${label}.${extra}`
              : `Turn on to get a link to this ${label} you can send anywhere.`
          }
          checked={Boolean(url)}
          disabled={busy}
          onChange={toggle}
        />
      </SettingsGroup>

      {url && (
        <>
          <SettingsGroup title={`${KIND_META[draft.kind].singular} link`} hint={viewsText(activity)}>
            <SettingRow stacked>
              <TextInput
                readOnly
                value={url}
                onFocus={(event) => event.currentTarget.select()}
                classNames={{ input: classes.mono }}
                rightSectionWidth={36}
                rightSection={
                  <Tooltip label="Open link" withArrow>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      component="a"
                      href={previewLink(url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Open link"
                    >
                      <ExternalLink size={15} />
                    </ActionIcon>
                  </Tooltip>
                }
              />
              <CopyButton value={url}>
                {({ copied, copy }) => (
                  <Button
                    fullWidth
                    variant={copied ? 'default' : 'filled'}
                    onClick={copy}
                    leftSection={copied ? <Check size={15} /> : <Copy size={15} />}
                  >
                    {copied ? 'Link copied' : 'Copy link'}
                  </Button>
                )}
              </CopyButton>
            </SettingRow>
          </SettingsGroup>

          <SettingsGroup title="Share to" hint="Opens each app with the link filled in. Opening it yourself is not counted as a view.">
            <SettingRow stacked>
              <div className={classes.tiles}>
                {targets.map(({ id, label: name, Icon, href, external }) => (
                  <a
                    key={id}
                    href={href}
                    className={classes.tile}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    aria-label={name}
                  >
                    <span className={classes.tileIcon} data-brand={id}>
                      <Icon size={18} />
                    </span>
                    <span className={classes.tileLabel}>{name}</span>
                  </a>
                ))}
              </div>
            </SettingRow>
          </SettingsGroup>

          <SettingsGroup title="QR code" hint="For a printout or a screen at the counter. It opens the same link.">
            <SettingRow stacked>
              <QrCard url={url} name={draft.number || label} />
            </SettingRow>
          </SettingsGroup>
        </>
      )}
    </SettingsStack>
  );
}
