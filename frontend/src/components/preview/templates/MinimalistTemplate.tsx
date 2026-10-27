import type { DocumentView } from '../useDocumentView';
import { UpiQr, pageClasses } from './PageShell';
import classes from './Minimalist.module.css';

export function MinimalistTemplate({ view }: { view: DocumentView }) {
  const { from, client } = view;

  return (
    <>
      <div className={classes.top}>
        <div>
          <div className={classes.title}>{view.heading}</div>
          <div className={classes.number}>{view.number}</div>
        </div>
        {view.logo && <img src={view.logo} alt="" className={classes.logo} />}
      </div>

      <div className={classes.columns}>
        <div>
          <div className={classes.label}>From</div>
          <div className={classes.name}>{from.name || 'Your business'}</div>
          {from.address && <div className={classes.lines}>{from.address}</div>}
          {from.gstin && <div className={classes.lines}>GSTIN {from.gstin}</div>}
          {view.fromContact && <div className={classes.lines}>{view.fromContact}</div>}
        </div>
        <div>
          <div className={classes.label}>{view.clientLabel}</div>
          <div className={classes.name}>{client.name || 'Client name'}</div>
          {client.address && <div className={classes.lines}>{client.address}</div>}
          {client.gstin && <div className={classes.lines}>GSTIN {client.gstin}</div>}
          {view.clientContact && <div className={classes.lines}>{view.clientContact}</div>}
        </div>
        <div>
          <div className={classes.label}>{view.headlineLabel}</div>
          <div className={classes.amount}>{view.headline}</div>
          {view.dueText && <div className={classes.due}>{view.dueText}</div>}
          <dl className={classes.meta}>
            {view.meta
              .filter(([label]) => label !== 'Due Date' && label !== 'Valid Until')
              .map(([label, value]) => (
                <div key={label} className={classes.metaRow}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
          </dl>
        </div>
      </div>

      <table className={classes.items}>
        <thead>
          <tr>
            <th>Description</th>
            <th className={classes.num}>Qty</th>
            <th className={classes.num}>Rate</th>
            <th className={classes.num}>Amount</th>
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
        {view.isInvoice && view.draft.amountPaid > 0 && (
          <div className={classes.totalRow}>
            <span>Paid</span>
            <span>−{view.money(view.draft.amountPaid)}</span>
          </div>
        )}
        <div className={`${classes.totalRow} ${classes.grandRow}`}>
          <span>{view.isInvoice && view.draft.amountPaid > 0 ? view.headlineLabel : 'Total'}</span>
          <span>{view.isInvoice ? view.headline : view.money(view.totals.total)}</span>
        </div>
      </div>
      <div className={classes.words}>{view.words}</div>

      {view.payment.length > 0 && (
        <div className={classes.payment}>
          <div>
            <div className={classes.label}>Payment details</div>
            <dl className={classes.meta}>
              {view.payment.map(([label, value]) => (
                <div key={label} className={classes.metaRow}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <UpiQr src={view.qr} />
        </div>
      )}

      <div className={`${classes.footer} ${pageClasses.push}`}>
        <div>
          {view.draft.notes && (
            <>
              <div className={classes.label}>Notes</div>
              <div className={classes.noteText}>{view.draft.notes}</div>
            </>
          )}
          {view.draft.terms && (
            <>
              <div className={classes.label}>{view.termsLabel}</div>
              <div className={classes.noteText}>{view.draft.terms}</div>
            </>
          )}
        </div>
        <div className={classes.signature}>
          <span className={classes.signLine}>Authorised signatory</span>
        </div>
      </div>
    </>
  );
}
