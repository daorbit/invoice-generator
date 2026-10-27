import { KIND_META } from '@/lib/documentMeta';
import type { DocumentDraft } from '@/types/document';
import classes from './DocumentPreview.module.css';

export function PreviewFooter({ draft }: { draft: DocumentDraft }) {
  const termsLabel = KIND_META[draft.kind].termsLabel;

  return (
    <div className={classes.footer}>
      <div>
        {draft.notes && (
          <>
            <div className={classes.label}>Notes</div>
            <div className={classes.text}>{draft.notes}</div>
          </>
        )}
        {draft.terms && (
          <>
            <div className={classes.label}>{termsLabel}</div>
            <div className={classes.text}>{draft.terms}</div>
          </>
        )}
      </div>
      <div className={classes.signature}>
        <span className={classes.muted}>For {draft.from.name || 'your business'}</span>
        <span className={classes.signLine}>Authorised signatory</span>
      </div>
    </div>
  );
}
