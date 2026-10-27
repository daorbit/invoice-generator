import { useState } from 'react';
import { Button, Group, SegmentedControl, Switch, TagsInput, TextInput, Textarea } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { CalendarClock, Send } from 'lucide-react';
import dayjs from 'dayjs';
import { defaultMessage, defaultSubject } from '@/lib/shareLinks';
import type { useShareActions } from '@/hooks/useShareActions';
import type { DocumentActivity, DocumentDraft } from '@/types/document';
import { ScheduledRow } from './ScheduledRow';
import classes from './Share.module.css';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_RECIPIENTS = 5;

type When = 'now' | 'later';

interface Props {
  draft: DocumentDraft;
  activity: DocumentActivity | null;
  actions: ReturnType<typeof useShareActions>;
  onDone: () => void;
  onCancel: () => void;
}

function invalid(list: string[]): string | undefined {
  const bad = list.find((entry) => !EMAIL.test(entry));
  return bad ? `${bad} is not a valid email` : undefined;
}

function nextMorning(): string {
  return dayjs().add(1, 'day').hour(9).minute(0).second(0).format('YYYY-MM-DD HH:mm:ss');
}

export function EmailPanel({ draft, activity, actions, onDone, onCancel }: Props) {
  const [to, setTo] = useState<string[]>(draft.client.email ? [draft.client.email] : []);
  const [cc, setCc] = useState<string[]>([]);
  const [subject, setSubject] = useState(() => defaultSubject(draft));
  const [message, setMessage] = useState(() => defaultMessage(draft));
  const [attachPdf, setAttachPdf] = useState(true);
  const [when, setWhen] = useState<When>('now');
  const [sendAt, setSendAt] = useState<string | null>(nextMorning);

  const toError = invalid(to);
  const ccError = invalid(cc);
  const laterInvalid = when === 'later' && (!sendAt || dayjs(sendAt).isBefore(dayjs().add(2, 'minute')));
  const ready = to.length > 0 && !toError && !ccError && subject.trim() && !laterInvalid;
  const sending = actions.busy === 'email';

  const submit = async () => {
    const done = await actions.send({
      to,
      cc,
      subject: subject.trim(),
      message,
      attachPdf,
      sendAt: when === 'later' ? sendAt : null,
    });
    if (done) onDone();
  };

  return (
    <div className={classes.panel}>
      {activity?.scheduledEmail && (
        <ScheduledRow
          stamp={activity.scheduledEmail}
          cancelling={actions.busy === 'cancel'}
          onCancel={() => void actions.cancelSchedule()}
        />
      )}
      <TagsInput
        label="To"
        placeholder={to.length ? '' : 'client@company.com'}
        maxTags={MAX_RECIPIENTS}
        splitChars={[',', ' ', ';']}
        clearable
        error={toError}
        value={to}
        onChange={setTo}
      />
      <TagsInput
        label="Cc"
        placeholder={cc.length ? '' : 'Optional'}
        maxTags={MAX_RECIPIENTS}
        splitChars={[',', ' ', ';']}
        error={ccError}
        value={cc}
        onChange={setCc}
      />
      <TextInput label="Subject" maxLength={200} value={subject} onChange={(e) => setSubject(e.currentTarget.value)} />
      <Textarea
        label="Message"
        description="A button to view the document online is added below your message."
        autosize
        minRows={5}
        maxRows={10}
        maxLength={5000}
        value={message}
        onChange={(e) => setMessage(e.currentTarget.value)}
      />
      <div className={classes.whenRow}>
        <SegmentedControl
          size="xs"
          value={when}
          onChange={(value) => setWhen(value as When)}
          data={[
            { value: 'now', label: 'Send now' },
            { value: 'later', label: 'Schedule' },
          ]}
        />
        {when === 'later' && (
          <DateTimePicker
            aria-label="Send at"
            leftSection={<CalendarClock size={15} />}
            valueFormat="D MMM YYYY, h:mm A"
            minDate={dayjs().format('YYYY-MM-DD')}
            maxDate={dayjs().add(90, 'day').format('YYYY-MM-DD')}
            timePickerProps={{ format: '12h' }}
            error={laterInvalid ? 'Pick a time in the future' : undefined}
            value={sendAt}
            onChange={setSendAt}
            className={classes.whenPicker}
          />
        )}
      </div>
      <div className={classes.footer}>
        <Switch
          size="sm"
          label="Attach PDF"
          checked={attachPdf}
          onChange={(event) => setAttachPdf(event.currentTarget.checked)}
        />
        <Group gap="sm">
          <Button variant="default" onClick={onCancel} disabled={sending}>
            Cancel
          </Button>
          <Button
            leftSection={when === 'later' ? <CalendarClock size={15} /> : <Send size={15} />}
            loading={sending}
            disabled={!ready}
            onClick={() => void submit()}
          >
            {when === 'later' ? 'Schedule' : 'Send'}
          </Button>
        </Group>
      </div>
    </div>
  );
}
