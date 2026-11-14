import { Group, Skeleton } from '@mantine/core';
import { DocumentSheetSkeleton } from '@/components/preview/DocumentSheetSkeleton';
import type { DocumentKind } from '@/types/document';
import { EditorStep } from './EditorStep';
import canvas from './PreviewCanvas.module.css';
import classes from '../DocumentEditorPage.module.css';

const ITEM_ROWS = 2;

function InputBar({ width = '100%' }: { width?: string | number }) {
  return <Skeleton height={36} width={width} radius={10} />;
}

function HintBar() {
  return <Skeleton height={10} width={220} maw="100%" mt={6} radius="sm" />;
}

export function EditorSkeleton({ kind }: { kind: DocumentKind }) {
  const isInvoice = kind === 'invoice';

  return (
    <div className={classes.workspace} aria-busy="true" aria-label="Loading document">
      <div className={classes.steps}>
        <EditorStep index={1} title="Who is it for?" hint="Pick a customer, or add someone new.">
          <InputBar />
          <Group grow gap="sm">
            <InputBar />
            <InputBar />
          </Group>
        </EditorStep>

        <EditorStep index={2} title="What are you billing for?" hint={<HintBar />}>
          {Array.from({ length: ITEM_ROWS }).map((_, i) => (
            <Group key={i} gap="sm" wrap="nowrap">
              <InputBar />
              <InputBar width={72} />
              <InputBar width={96} />
            </Group>
          ))}
          <Skeleton height={30} width={110} radius={10} />
        </EditorStep>

        <EditorStep
          index={3}
          title={isInvoice ? 'When is it due?' : 'How long does the price stand?'}
          hint={isInvoice ? 'Pick payment terms, or set the dates yourself.' : 'Pick how long the quote is valid.'}
        >
          <Group gap="xs">
            {[64, 72, 72, 80].map((w, i) => (
              <Skeleton key={i} height={28} width={w} radius={10} />
            ))}
          </Group>
          <Group grow gap="sm">
            <InputBar />
            <InputBar />
          </Group>
        </EditorStep>

        <EditorStep index={4} title={<Skeleton height={14} width={170} radius="sm" mt={4} />} hint={<HintBar />}>
          <Group grow gap="sm">
            <InputBar />
            <InputBar />
          </Group>
        </EditorStep>

        <EditorStep index={5} title="Notes and terms" hint="Optional. Printed at the bottom of the document.">
          <Skeleton height={72} radius={10} />
        </EditorStep>
      </div>

      <section className={canvas.canvas} aria-hidden>
        <div className={canvas.scroll}>
          <DocumentSheetSkeleton />
        </div>
      </section>
    </div>
  );
}
