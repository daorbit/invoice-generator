import { forwardRef } from 'react';
import type { DocumentDraft } from '@/types/document';
import { DocumentPreview } from './DocumentPreview';
import classes from './PdfSource.module.css';

export const PdfSource = forwardRef<HTMLDivElement, { draft: DocumentDraft }>(function PdfSource({ draft }, ref) {
  return (
    <div className={classes.source} aria-hidden>
      <DocumentPreview ref={ref} draft={draft} />
    </div>
  );
});
