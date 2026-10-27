import type { DocumentView } from '../useDocumentView';
import { UpiQr } from './PageShell';
import { DetailRows } from './Extras';
import classes from './Soft.module.css';

export function SoftTemplate({ view }: { view: DocumentView }) {
  const { from, client, draft } = view;

  return (
    <div className={classes.stack}>
      <div className={`${classes.card} ${classes.head}`}>
        <span>
          <b>{view.heading}</b> #{view.number}
        </span>
        <span>
          <b>Date</b> {view.issueDate}
        </span>
      </div>

      <div className={classes.two}>
        <div className={classes.card}>
          <div className={classes.label}>To</div>
          <div className={classes.name}>{client.name || 'Client name'}</div>
          {client.address && <div className={classes.lines}>{client.address}</div>}
          {client.gstin && <div className={classes.lines}>GSTIN {client.gstin}</div>}
          {view.clientContact && <div className={classes.lines}>{view.clientContact}</div>}
        </div>
        <div className={classes.card}>
          <div className={classes.label}>From</div>
          <div className={classes.name}>{from.name || 'Your business'}</div>
          {from.address && <div className={classes.lines}>{from.address}</div>}
          {from.gstin && <div className={classes.lines}>GSTIN {from.gstin}</div>}
        </div>
      </div>

      <div className={`${classes.card} ${classes.due}`}>
        <span className={classes.dueAmount}>{view.headline}</span>{' '}
        {view.dueDate ? `${view.isInvoice ? 'due on' : 'valid until'} ${view.dueDate}` : view.headlineLabel.toLowerCase()}
      </div>

      <div className={`${classes.card} ${classes.items}`}>
        <table className={classes.table}>
          <thead>
            <tr>
              <th>Service</th>
              <th className={classes.num}>Qty</th>
              <th className={classes.num}>Rate</th>
              <th className={classes.num}>Line total</th>
            </tr>
          </thead>
          <tbody>
            {view.items.map((item) => (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td className={classes.num}>{item.quantity}</td>
                <td className={classes.num}>{view.money(item.rate)}</td>
                <td className={classes.num}>{view.money(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={classes.totals}>
          {view.totalRows.map(([label, value]) => (
            <div key={label} className={classes.totalRow}>
              <span>{label}</span>
              <span>{value}</span>
            </div>
          ))}
          <div className={classes.totalRow}>
            <span>Total</span>
            <span>{view.money(view.totals.total)}</span>
          </div>
          <div className={classes.totalRow}>
            <span>{view.isInvoice ? 'Amount due' : 'Quote total'}</span>
            <span>{view.headline}</span>
          </div>
        </div>
        <div className={classes.words}>{view.words}</div>
      </div>

      <div className={classes.two}>
        <div className={`${classes.card} ${classes.thanks}`}>
          <div className={classes.thanksTitle}>{draft.notes || 'Thank you for the business!'}</div>
          {draft.terms && <div className={classes.lines}>{draft.terms}</div>}
        </div>
        <div className={`${classes.card} ${classes.bank}`}>
          {view.payment.length ? <DetailRows rows={view.payment} /> : <span className={classes.lines}>Authorised signatory</span>}
          <UpiQr src={view.qr} />
        </div>
      </div>

      <div className={`${classes.card} ${classes.foot}`}>
        <span className={classes.brand}>
          {view.logo && <img src={view.logo} alt="" className={classes.brandLogo} />}
          {from.name || 'Your business'}
        </span>
        <span className={classes.contact}>
          {from.phone && <span>{from.phone}</span>}
          {from.email && <span>{from.email}</span>}
        </span>
      </div>
    </div>
  );
}
