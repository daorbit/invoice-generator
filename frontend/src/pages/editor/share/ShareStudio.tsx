import 'da-frame-set/styles.css';
import { useState } from 'react';
import { ActionIcon, Button, SegmentedControl } from '@mantine/core';
import { CalendarClock, Link2, Mail, Send, Share2, X } from 'lucide-react';
import { DeviceFrame, frameSize, getDevice, useFitScale } from 'da-frame-set';
import { StudioModal } from '@/components/studio/StudioModal';
import { StatusPill } from '@/components/ui/StatusPill';
import { DocumentScreen } from '@/components/preview/DocumentScreen';
import { DEVICE_FRAME, DeviceSwitch, type PreviewDevice } from '@/components/preview/DeviceSwitch';
import { useEmailForm } from '@/hooks/useEmailForm';
import type { useShareActions } from '@/hooks/useShareActions';
import { KIND_META, STATUS_META } from '@/lib/documentMeta';
import type { DocumentActivity, DocumentDraft } from '@/types/document';
import { EmailPanel } from './EmailPanel';
import { LinkPanel } from './LinkPanel';
import classes from './ShareStudio.module.css';

type Tab = 'email' | 'link';

const TABS: { value: Tab; label: string; Icon: typeof Mail }[] = [
  { value: 'email', label: 'Email', Icon: Mail },
  { value: 'link', label: 'Link', Icon: Link2 },
];

interface Props {
  opened: boolean;
  onClose: () => void;
  draft: DocumentDraft;
  activity: DocumentActivity | null;
  dirty: boolean;
  actions: ReturnType<typeof useShareActions>;
}

export default function ShareStudio({ opened, onClose, draft, activity, dirty, actions }: Props) {
  const [tab, setTab] = useState<Tab>('email');
  const [device, setDevice] = useState<PreviewDevice>('laptop');
  const form = useEmailForm(draft);
  const size = frameSize(getDevice(DEVICE_FRAME[device]));
  const { ref, scale, measured } = useFitScale({
    contentWidth: size.width,
    contentHeight: size.height,
    padding: { x: 48, y: 48 },
  });

  const meta = KIND_META[draft.kind];
  const label = meta.singular.toLowerCase();
  const status = STATUS_META[draft.status];
  const sending = actions.busy === 'email';
  const later = form.when === 'later';

  const send = async () => {
    if (await actions.send(form.payload())) onClose();
  };

  return (
    <StudioModal opened={opened} onClose={onClose}>
      <div className={classes.shell}>
        <aside className={classes.panel}>
          <header className={classes.panelHeader}>
            <span className={classes.headIcon}>
              <Share2 size={17} />
            </span>
            <div className={classes.headText}>
              <div className={classes.headTitleRow}>
                <span className={classes.headTitle}>Share {label}</span>
                <span className={classes.statusPill}>
                  <StatusPill tone={status.tone} label={status.label} />
                </span>
              </div>
              <span className={classes.headSubtitle}>
                {[draft.number, draft.client.name].filter(Boolean).join(' · ')}
              </span>
            </div>
            <ActionIcon variant="subtle" color="gray" size="lg" onClick={onClose} aria-label="Close">
              <X size={18} />
            </ActionIcon>
          </header>

          <div className={classes.tabs}>
            <SegmentedControl
              fullWidth
              value={tab}
              onChange={(value) => setTab(value as Tab)}
              data={TABS.map(({ value, label: name, Icon }) => ({
                value,
                label: (
                  <span className={classes.tabLabel}>
                    <Icon size={15} />
                    {name}
                  </span>
                ),
              }))}
            />
          </div>

          <div className={classes.panelBody}>
            {dirty && <p className={classes.note}>Your latest changes are saved before anything is sent.</p>}
            {tab === 'email' ? (
              <EmailPanel draft={draft} form={form} activity={activity} actions={actions} />
            ) : (
              <LinkPanel draft={draft} activity={activity} actions={actions} />
            )}
          </div>

          <footer className={classes.actionBar}>
            {tab === 'email' ? (
              <>
                <Button variant="default" onClick={onClose} disabled={sending}>
                  Cancel
                </Button>
                <Button
                  leftSection={later ? <CalendarClock size={15} /> : <Send size={15} />}
                  loading={sending}
                  disabled={!form.ready}
                  onClick={() => void send()}
                >
                  {later ? 'Schedule' : 'Send'}
                </Button>
              </>
            ) : (
              <Button variant="default" onClick={onClose}>
                Done
              </Button>
            )}
          </footer>
        </aside>

        <section className={classes.preview} aria-label="Preview">
          <div className={classes.previewHead}>
            <span className={classes.previewTitle}>Preview</span>
            <DeviceSwitch value={device} onChange={setDevice} />
          </div>
          <div className={classes.stage} ref={ref}>
            <DeviceFrame device={DEVICE_FRAME[device]} scale={scale} hidden={!measured}>
              <DocumentScreen draft={draft} device={device} />
            </DeviceFrame>
          </div>
          <p className={classes.caption}>
            {tab === 'email'
              ? `Live preview of the ${label} your client opens from the email.`
              : 'Live preview of the link destination.'}
          </p>
        </section>
      </div>
    </StudioModal>
  );
}
