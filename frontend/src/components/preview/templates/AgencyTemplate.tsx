import type { DocumentView } from '../useDocumentView';
import { pageClasses } from './PageShell';
import { AmountWords, PaymentStrip } from './Extras';
import classes from './Agency.module.css';

export function AgencyTemplate({ view }: { view: DocumentView }) {
  const { from, client, draft } = view;
  const brandMeta = [from.gstin ? `GSTIN ${from.gstin}` : '', from.phone].filter(Boolean).join(' / ');

  return (
    <>
      <div className={classes.top}>
        <div className={classes.brandCard}>
          <span className={classes.circleA} aria-hidden />
          <span className={classes.circleB} aria-hidden />
          {view.logo && (
            <span className={classes.logoChip}>
              <img src={view.logo} alt="" className={classes.logo} />
            </span>
          )}
          <div className={classes.brandName}>{from.name || 'Your business'}</div>
          {brandMeta && <div className={classes.brandMeta}>{brandMeta}</div>}
        </div>
        <div className={classes.side}>
          <div className={classes.dueCard}>
            <div className={classes.label}>{view.headlineLabel}</div>
            <div className={classes.dueAmount}>{view.headline}</div>
            {view.dueDate && <div className={classes.small}>{view.dueDate}</div>}
          </div>
          <div className={classes.client}>
            <div className={classes.label}>{view.isInvoice ? 'Invoice to:' : 'Quote for:'}</div>
            <div className={classes.clientName}>{client.name || 'Client name'}</div>
            {view.clientContact && <div className={classes.lines}>{view.clientContact}</div>}
            {client.address && <div className={classes.lines}>{client.address}</div>}
            {client.gstin && <div className={classes.lines}>GSTIN {client.gstin}</div>}
          </div>
        </div>
      </div>

      <div className={classes.sectionLabel}>{view.isInvoice ? 'Invoice details' : 'Quotation details'}</div>
      <div className={classes.details}>
        <div>
          <div className={classes.label}>{view.isInvoice ? 'Invoice number:' : 'Quote number:'}</div>
          <div className={classes.detailValue}>Nº: {view.number}</div>
        </div>
        <div>
          <div className={classes.label}>Issued:</div>
          <div className={classes.detailValue}>{view.issueDate}</div>
        </div>
        <div>
          <div className={classes.label}>{view.dueLabel}:</div>
          <div className={classes.detailValue}>{view.dueDate || '—'}</div>
        </div>
      </div>

      <table className={classes.table}>
        <thead>
          <tr>
            <th>Description</th>
            <th className={classes.num}>Qty</th>
            <th className={classes.num}>Price</th>
            <th className={classes.num}>Total</th>
          </tr>
        </thead>
        <tbody>
          {view.items.map((item) => (
            <tr key={item.id}>
              <td className={classes.strong}>{item.description}</td>
              <td className={classes.num}>{item.quantity}</td>
              <td className={classes.num}>{view.money(item.rate)}</td>
              <td className={`${classes.num} ${classes.strong}`}>{view.money(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={classes.totals}>
        <div className={classes.breakdown}>
          {view.totalRows.map(([label, value]) => (
            <div key={label} className={classes.breakdownRow}>
              <span>{label}</span>
              <span>{value}</span>
            </div>
          ))}
        </div>
        <div className={classes.label}>Total amount:</div>
        <div className={classes.grand}>{view.headline}</div>
      </div>
      <AmountWords view={view} />
      <PaymentStrip view={view} />

      <div className={pageClasses.push}>
        {(draft.terms || draft.notes) && (
          <div className={classes.terms}>
            <div className={classes.termsTitle}>{draft.terms ? `${view.termsLabel}:` : 'Notes:'}</div>
            <div className={classes.lines}>{draft.terms || draft.notes}</div>
          </div>
        )}
        <div className={classes.bar} />
      </div>
    </>
  );
}
