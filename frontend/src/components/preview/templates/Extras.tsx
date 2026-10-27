import type { DocumentView, Row } from '../useDocumentView';
import { UpiQr } from './PageShell';
import classes from './Extras.module.css';

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
            <div className={classes.text}>{view.draft.notes}</div>
          </>
        )}
        {view.draft.terms && (
          <>
            <div className={classes.label}>{view.termsLabel}</div>
            <div className={classes.text}>{view.draft.terms}</div>
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
