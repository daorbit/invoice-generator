import { useEffect, useState } from 'react';
import { Modal } from '@mantine/core';
import { Link2, Mail } from 'lucide-react';
import { SegmentedTabs } from '@/components/ui/SegmentedTabs';
import { KIND_META } from '@/lib/documentMeta';
import type { useShareActions } from '@/hooks/useShareActions';
import type { DocumentActivity, DocumentDraft } from '@/types/document';
import { EmailPanel } from './EmailPanel';
import { LinkPanel } from './LinkPanel';
import classes from './Share.module.css';

type Tab = 'email' | 'link';

interface Props {
  opened: boolean;
  onClose: () => void;
  draft: DocumentDraft;
  activity: DocumentActivity | null;
  dirty: boolean;
  actions: ReturnType<typeof useShareActions>;
}

const TABS = [
  {
    value: 'email' as const,
    label: (
      <>
        <Mail size={14} /> Email
      </>
    ),
  },
  {
    value: 'link' as const,
    label: (
      <>
        <Link2 size={14} /> Link
      </>
    ),
  },
];

export function ShareDialog({ opened, onClose, draft, activity, dirty, actions }: Props) {
  const [tab, setTab] = useState<Tab>('email');

  useEffect(() => {
    if (opened) setTab('email');
  }, [opened]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size={560}
      title={`Share ${KIND_META[draft.kind].singular.toLowerCase()} ${draft.number}`}
    >
      <div className={classes.tabs}>
        <SegmentedTabs ariaLabel="Share by" value={tab} onChange={setTab} data={TABS} fullWidth />
      </div>
      {dirty && <p className={classes.note}>Your latest changes will be saved first.</p>}
      {tab === 'email' ? (
        <EmailPanel draft={draft} activity={activity} actions={actions} onDone={onClose} onCancel={onClose} />
      ) : (
        <LinkPanel draft={draft} activity={activity} actions={actions} />
      )}
    </Modal>
  );
}
