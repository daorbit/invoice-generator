import { Button } from '@mantine/core';
import { Palette } from 'lucide-react';
import { ScaledPage } from '@/components/preview/ScaledPage';
import { DocumentPreview } from '@/components/preview/DocumentPreview';
import { ACCENT_OPTIONS, TEMPLATE_OPTIONS } from '@/lib/designOptions';
import type { DocumentDraft } from '@/types/document';
import classes from './PreviewCanvas.module.css';

export function PreviewCanvas({ draft, onDesign }: { draft: DocumentDraft; onDesign: () => void }) {
  const template = TEMPLATE_OPTIONS.find((option) => option.id === draft.template)?.label;
  const accent = ACCENT_OPTIONS.find((option) => option.id === draft.accent)?.label;

  return (
    <section className={classes.canvas} aria-label="Live preview">
      <div className={classes.toolbar}>
        <span className={classes.live}>
          <span className={classes.dot} aria-hidden />
          Live preview
        </span>
        <Button variant="transparent" className={classes.design} leftSection={<Palette size={14} />} onClick={onDesign}>
          {template} · {accent}
        </Button>
      </div>
      <div className={classes.scroll}>
        <ScaledPage>
          <DocumentPreview draft={draft} />
        </ScaledPage>
      </div>
    </section>
  );
}
