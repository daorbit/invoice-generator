import { useState } from 'react';
import { Button, Group, Modal, TextInput, Textarea } from '@mantine/core';
import { CircleCheck, CircleX } from 'lucide-react';
import dayjs from 'dayjs';
import { replyToQuotation, type PublicDocument } from '@/api/public';
import { notify } from '@/lib/notify';
import type { ClientResponse } from '@/types/document';
import classes from './PublicDocument.module.css';

type Decision = ClientResponse['decision'];

interface Props {
  token: string;
  document: PublicDocument;
  onReplied: (document: PublicDocument) => void;
}

export function QuoteReply({ token, document, onReplied }: Props) {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [name, setName] = useState(document.draft.client.name);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const response = document.clientResponse;

  const submit = async () => {
    if (!decision) return;
    setSending(true);
    try {
      onReplied(await replyToQuotation(token, { decision, name: name.trim(), comment: comment.trim() }));
      setDecision(null);
      notify.success('Thanks, your reply was sent.');
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Could not send your reply');
    } finally {
      setSending(false);
    }
  };

  if (response) {
    const verb = response.decision === 'accepted' ? 'Accepted' : 'Declined';
    return (
      <div className={classes.reply} data-decision={response.decision}>
        {response.decision === 'accepted' ? <CircleCheck size={17} /> : <CircleX size={17} />}
        <span>
          {verb} by {response.name} on {dayjs(response.at).format('D MMM YYYY')}
        </span>
      </div>
    );
  }

  if (!document.canRespond) return null;

  return (
    <>
      <div className={classes.reply}>
        <span className={classes.replyText}>
          <b>Happy with this quotation?</b> Let {document.draft.from.name || 'the sender'} know.
        </span>
        <Group gap="sm">
          <Button variant="default" onClick={() => setDecision('rejected')}>
            Decline
          </Button>
          <Button leftSection={<CircleCheck size={15} />} onClick={() => setDecision('accepted')}>
            Accept
          </Button>
        </Group>
      </div>

      <Modal
        opened={decision !== null}
        onClose={() => setDecision(null)}
        size="sm"
        title={decision === 'accepted' ? 'Accept this quotation' : 'Decline this quotation'}
      >
        <div className={classes.replyForm}>
          <TextInput
            label="Your name"
            required
            data-autofocus
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
          <Textarea
            label={decision === 'accepted' ? 'Anything to add?' : 'Tell them why'}
            placeholder="Optional"
            autosize
            minRows={3}
            maxLength={1000}
            value={comment}
            onChange={(e) => setComment(e.currentTarget.value)}
          />
        </div>
        <Group justify="flex-end" gap="sm" mt="lg">
          <Button variant="default" onClick={() => setDecision(null)} disabled={sending}>
            Cancel
          </Button>
          <Button
            color={decision === 'rejected' ? 'red' : undefined}
            loading={sending}
            disabled={!name.trim()}
            onClick={() => void submit()}
          >
            {decision === 'accepted' ? 'Accept quotation' : 'Decline quotation'}
          </Button>
        </Group>
      </Modal>
    </>
  );
}
