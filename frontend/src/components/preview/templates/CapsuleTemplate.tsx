import type { DocumentView } from '../useDocumentView';
import { pageClasses } from './PageShell';
import { AmountWords, NotesAndSignature, PaymentStrip } from './Extras';
import classes from './Capsule.module.css';

export function CapsuleTemplate({ view }: { view: DocumentView }) {
  const { from, client } = view;
  const brandMeta = [from.gstin ? `GSTIN ${from.gstin}` : '', from.email].filter(Boolean).join(' / ');

  return (
    <>
      <div className={classes.top}>
        <div className={classes.left}>
          <div className={classes.brandCard}>
            {view.logo && (
              <span className={classes.logoChip}>
                <img src={view.logo} alt="" className={classes.logo} />
              </span>
            )}
            <div className={classes.brandName}>{from.name || 'Your business'}</div>
            {brandMeta && <div className={classes.brandMeta}>{brandMeta}</div>}
          </div>
          <div className={classes.clientCard}>
            <div className={classes.label}>{view.isInvoice ? 'Invoice to:' : 'Quote for:'}</div>
            <div className={classes.clientName}>{client.name || 'Client name'}</div>
            {view.clientContact && <div className={classes.lines}>{view.clientContact}</div>}
            {client.address && <div className={classes.lines}>{client.address}</div>}
            {client.gstin && <div className={classes.lines}>GSTIN {client.gstin}</div>}
          </div>
        </div>
        <div className={classes.facts}>
          <div className={classes.fact}>
            <div className={classes.label}>{view.isInvoice ? 'Invoice number:' : 'Quote number:'}</div>
            <div className={classes.factValue}>Nº: {view.number}</div>
          </div>
          <div className={classes.fact}>
            <div className={classes.label}>Issued:</div>
            <div className={classes.factValue}>{view.issueDate}</div>
          </div>
          <div className={classes.dueBlock}>
            <div className={classes.label}>{view.headlineLabel}</div>
            <div className={classes.dueAmount}>{view.headline}</div>
            {view.dueDate && <div className={classes.due}>{view.dueDate}</div>}
          </div>
        </div>
      </div>

      <div className={classes.head}>
        <span>Description</span>
        <span className={classes.center}>Qty</span>
        <span className={classes.center}>Price</span>
        <span className={classes.right}>Total</span>
      </div>
      {view.items.map((item) => (
        <div key={item.id} className={classes.row}>
          <span className={classes.pill}>{item.description}</span>
          <span className={classes.ring}>{item.quantity}</span>
          <span className={classes.ring}>{view.money(item.rate)}</span>
          <span className={classes.solid}>{view.money(item.amount)}</span>
        </div>
      ))}

      {view.totalRows.length > 1 && (
        <div className={classes.breakdown}>
          {view.totalRows.map(([label, value]) => (
            <div key={label} className={classes.breakdownRow}>
              <span>{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
      )}
      <div className={classes.totalBar}>
        <span>{view.isInvoice ? 'Invoice total' : 'Quote total'}</span>
        <span className={classes.totalAmount}>{view.headline}</span>
      </div>
      <AmountWords view={view} />
      <PaymentStrip view={view} />

      <div className={pageClasses.push}>
        <NotesAndSignature view={view} />
      </div>
    </>
  );
}
