import { SegmentedControl, TagsInput, TextInput, Textarea } from '@mantine/core';
import { DateTimePicker } from '@mantine/dates';
import { CalendarClock } from 'lucide-react';
import dayjs from 'dayjs';
import { SettingRow, SettingsGroup, SettingsStack, SwitchRow } from '@/components/settings/SettingsGroup';
import { MAX_RECIPIENTS, type EmailForm, type SendWhen } from '@/hooks/useEmailForm';
import type { useShareActions } from '@/hooks/useShareActions';
import { KIND_META } from '@/lib/documentMeta';
import type { DocumentActivity, DocumentDraft } from '@/types/document';
import { ScheduledRow } from './ScheduledRow';

const SPLIT_CHARS = [',', ' ', ';'];
const MAX_SCHEDULE_DAYS = 90;

interface Props {
  draft: DocumentDraft;
  form: EmailForm;
  activity: DocumentActivity | null;
  actions: ReturnType<typeof useShareActions>;
}

export function EmailPanel({ draft, form, activity, actions }: Props) {
  const label = KIND_META[draft.kind].singular.toLowerCase();

  return (
    <SettingsStack>
      {activity?.scheduledEmail && (
        <ScheduledRow
          stamp={activity.scheduledEmail}
          cancelling={actions.busy === 'cancel'}
          onCancel={() => void actions.cancelSchedule()}
        />
      )}

      <SettingsGroup title="Recipients" hint={`Up to ${MAX_RECIPIENTS} addresses each. Replies go to your business email.`}>
        <SettingRow stacked>
          <TagsInput
            label="To"
            placeholder={form.to.length ? '' : 'client@company.com'}
            maxTags={MAX_RECIPIENTS}
            splitChars={SPLIT_CHARS}
            clearable
            error={form.toError}
            value={form.to}
            onChange={form.setTo}
          />
          <TagsInput
            label="Cc"
            placeholder={form.cc.length ? '' : 'Optional'}
            maxTags={MAX_RECIPIENTS}
            splitChars={SPLIT_CHARS}
            error={form.ccError}
            value={form.cc}
            onChange={form.setCc}
          />
        </SettingRow>
      </SettingsGroup>

      <SettingsGroup title="Message" hint={`A button to view the ${label} online is added below it.`}>
        <SettingRow stacked>
          <TextInput
            label="Subject"
            maxLength={200}
            value={form.subject}
            onChange={(event) => form.setSubject(event.currentTarget.value)}
          />
          <Textarea
            label="Message"
            autosize
            minRows={6}
            maxRows={12}
            maxLength={5000}
            value={form.message}
            onChange={(event) => form.setMessage(event.currentTarget.value)}
          />
        </SettingRow>
      </SettingsGroup>

      <SettingsGroup title="Delivery">
        <SwitchRow
          label="Attach PDF"
          hint={`The ${label} goes along as a PDF file.`}
          checked={form.attachPdf}
          onChange={form.setAttachPdf}
        />
        <SettingRow label="When" hint={form.when === 'later' ? 'Sent automatically at the time you pick.' : 'Sent as soon as you press Send.'}>
          <SegmentedControl
            size="xs"
            value={form.when}
            onChange={(value) => form.setWhen(value as SendWhen)}
            data={[
              { value: 'now', label: 'Now' },
              { value: 'later', label: 'Schedule' },
            ]}
          />
        </SettingRow>
        {form.when === 'later' && (
          <SettingRow stacked>
            <DateTimePicker
              aria-label="Send at"
              leftSection={<CalendarClock size={15} />}
              valueFormat="D MMM YYYY, h:mm A"
              minDate={dayjs().format('YYYY-MM-DD')}
              maxDate={dayjs().add(MAX_SCHEDULE_DAYS, 'day').format('YYYY-MM-DD')}
              timePickerProps={{ format: '12h' }}
              error={form.laterInvalid ? 'Pick a time in the future' : undefined}
              value={form.sendAt}
              onChange={form.setSendAt}
            />
          </SettingRow>
        )}
      </SettingsGroup>
    </SettingsStack>
  );
}
