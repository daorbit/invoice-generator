import type { DocumentDraft } from '@/types/document';
import classes from './DocumentPreview.module.css';

function heading(draft: DocumentDraft): string {
  if (draft.kind === 'quotation') return 'Quotation';
  return draft.from.gstin ? 'Tax invoice' : 'Invoice';
}

export function PreviewHeader({ draft }: { draft: DocumentDraft }) {
  const { from } = draft;
  const contact = [from.email, from.phone, from.website].filter(Boolean).join(' · ');

  return (
    <div className={classes.header}>
      <div className={classes.brand}>
        {draft.logo && <img src={draft.logo} alt="" className={classes.logo} />}
        <div className={classes.business}>{from.name || 'Your business'}</div>
        {from.address && <div className={classes.muted}>{from.address}</div>}
        {from.gstin && <div className={classes.gstin}>GSTIN {from.gstin}</div>}
        {contact && <div className={classes.muted}>{contact}</div>}
      </div>
      <div className={classes.heading}>
        <div className={classes.kind}>{heading(draft)}</div>
        <div className={classes.number}>{draft.number || 'Draft'}</div>
      </div>
    </div>
  );
}
