import { ScaledPage } from '@/components/preview/ScaledPage';
import { DocumentPreview } from '@/components/preview/DocumentPreview';
import { InlineEditProvider, type InlineCommit } from '@/components/preview/inline/InlineEditContext';
import type { DocumentDraft } from '@/types/document';
import classes from './PreviewCanvas.module.css';

export function PreviewCanvas({ draft, onCommit }: { draft: DocumentDraft; onCommit: InlineCommit }) {
  return (
    <section className={classes.canvas} aria-label="Live preview">
      <div className={classes.scroll}>
        <ScaledPage>
          <InlineEditProvider onCommit={onCommit}>
            <DocumentPreview draft={draft} />
          </InlineEditProvider>
        </ScaledPage>
      </div>
    </section>
  );
}
