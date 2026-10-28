import { useRef, type ClipboardEvent, type DragEvent } from 'react';
import { ActionIcon, Textarea, Tooltip } from '@mantine/core';
import { ArrowUp, Paperclip } from 'lucide-react';
import { notify } from '@/lib/notify';
import { readAttachment } from '@/lib/orbit/readAttachment';
import { FileChip } from './FileChip';
import type { OrbitStudioState } from './useOrbitStudio';
import classes from './OrbitStudio.module.css';

const ACCEPT = 'image/png,image/jpeg,image/webp,application/pdf';

export function OrbitComposer({ studio, placeholder }: { studio: OrbitStudioState; placeholder: string }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const empty = !studio.prompt.trim() && !studio.attachment;

  const accept = (file: File | undefined | null) => {
    if (!file) return;
    readAttachment(file)
      .then(studio.setAttachment)
      .catch((error: Error) => notify.error(error.message));
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    accept(event.dataTransfer.files?.[0]);
  };

  const onPaste = (event: ClipboardEvent) => {
    const file = Array.from(event.clipboardData.files).find((entry) => entry.type.startsWith('image/'));
    if (file) accept(file);
  };

  return (
    <div className={classes.composer} onDragOver={(event) => event.preventDefault()} onDrop={onDrop}>
      {studio.attachment && (
        <div className={classes.staged}>
          <FileChip
            name={studio.attachment.name}
            kind={studio.attachment.kind}
            onRemove={() => studio.setAttachment(null)}
          />
        </div>
      )}
      <Textarea
        variant="unstyled"
        autosize
        minRows={2}
        maxRows={6}
        px="sm"
        pt={6}
        placeholder={placeholder}
        value={studio.prompt}
        disabled={studio.busy}
        onChange={(event) => studio.setPrompt(event.currentTarget.value)}
        onPaste={onPaste}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            studio.send();
          }
        }}
        data-autofocus
      />
      <div className={classes.composerFoot}>
        <input
          ref={fileInput}
          type="file"
          accept={ACCEPT}
          hidden
          onChange={(event) => {
            accept(event.currentTarget.files?.[0]);
            event.currentTarget.value = '';
          }}
        />
        <Tooltip label="Attach a photo or PDF" withArrow>
          <ActionIcon
            variant="subtle"
            color="gray"
            radius="xl"
            disabled={studio.busy}
            onClick={() => fileInput.current?.click()}
            aria-label="Attach a photo or PDF"
          >
            <Paperclip size={16} />
          </ActionIcon>
        </Tooltip>
        <ActionIcon
          variant="filled"
          radius="xl"
          size="lg"
          disabled={empty || studio.busy}
          loading={studio.busy}
          onClick={() => studio.send()}
          aria-label="Send"
        >
          <ArrowUp size={16} />
        </ActionIcon>
      </div>
    </div>
  );
}
