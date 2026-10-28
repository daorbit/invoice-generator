import type { LineItem } from '@/types/document';
import type { DocumentView, Row } from '../useDocumentView';
import { InlineText } from '../inline/InlineText';
import { CLIENT_ADDRESS, CLIENT_NAME, NOTES, TERMS, itemTarget } from '../inline/inlineTargets';
import { UpiQr } from './PageShell';
import classes from './Extras.module.css';

export function ItemText({ item, view }: { item: LineItem; view: DocumentView }) {
  const meta = view.itemMeta(item);
  return (
    <>
      <InlineText
        className={classes.itemName}
        target={itemTarget(item.id, 'description')}
        value={item.description}
        label="Item description"
        placeholder="Item"
      />
      {meta && <span className={classes.itemMeta}>{meta}</span>}
    </>
  );
}

export function ItemQty({ item, view }: { item: LineItem; view: DocumentView }) {
  return (
    <InlineText target={itemTarget(item.id, 'quantity')} value={String(item.quantity)} display={view.qty(item)} label="Quantity" />
  );
}

export function ItemRate({ item, view }: { item: LineItem; view: DocumentView }) {
  return (
    <InlineText target={itemTarget(item.id, 'rate')} value={String(item.rate)} display={view.money(item.rate)} label="Rate" />
  );
}

export function ClientName({ view, className }: { view: DocumentView; className?: string }) {
  return (
    <InlineText
      block
      className={className}
      target={CLIENT_NAME}
      value={view.client.name}
      fallback="Client name"
      label="Client name"
    />
  );
}

export function ClientAddress({ view, className }: { view: DocumentView; className?: string }) {
  return (
    <InlineText
      block
      multiline
      className={className}
      target={CLIENT_ADDRESS}
      value={view.client.address}
      label="Client address"
    />
  );
}

export function NoteText({ kind, value, className }: { kind: 'notes' | 'terms'; value: string; className?: string }) {
  return (
    <InlineText
      block
      multiline
      className={className}
      target={kind === 'notes' ? NOTES : TERMS}
      value={value}
      label={kind === 'notes' ? 'Notes' : 'Terms'}
    />
  );
}

export function DetailRows({ rows }: { rows: Row[] }) {
  return (
    <dl className={classes.rows}>
      {rows.map(([label, value]) => (
        <div key={label} className={classes.row}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function PaymentStrip({ view }: { view: DocumentView }) {
  if (!view.payment.length) return null;
  return (
    <div className={classes.payment}>
      <div>
        <div className={classes.label}>Payment details</div>
        <DetailRows rows={view.payment} />
      </div>
      <UpiQr src={view.qr} />
    </div>
  );
}

export function NotesAndSignature({ view }: { view: DocumentView }) {
  return (
    <div className={classes.notes}>
      <div>
        {view.draft.notes && (
          <>
            <div className={classes.label}>Notes</div>
            <NoteText kind="notes" value={view.draft.notes} className={classes.text} />
          </>
        )}
        {view.draft.terms && (
          <>
            <div className={classes.label}>{view.termsLabel}</div>
            <NoteText kind="terms" value={view.draft.terms} className={classes.text} />
          </>
        )}
      </div>
      <div className={classes.signature}>
        <span className={classes.signLine}>Authorised signatory</span>
      </div>
    </div>
  );
}

export function AmountWords({ view }: { view: DocumentView }) {
  return <div className={classes.words}>{view.words}</div>;
}
