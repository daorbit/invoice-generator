import type { DocumentView } from '../useDocumentView';
import { UpiQr, pageClasses } from './PageShell';
import classes from './Grand.module.css';

export function GrandTemplate({ view }: { view: DocumentView }) {
  const { from, client } = view;

  return (
    <>
      <div className={classes.hero}>
        <div>
          {view.draft.logo && (
            <span className={classes.logoChip}>
              <img src={view.draft.logo} alt="" className={classes.logo} />
            </span>
          )}
          <div className={classes.orgName}>{from.name || 'Your business'}</div>
          {from.address && <div className={classes.heroLines}>{from.address}</div>}
          {from.gstin && <div>GSTIN {from.gstin}</div>}
          {view.fromContact && <div>{view.fromContact}</div>}
        </div>
        <div className={classes.heroRight}>
          <div className={classes.title}>{view.heading}</div>
          <div className={classes.number}># {view.number}</div>
          <div className={classes.heroLabel}>{view.headlineLabel}</div>
          <div className={classes.heroAmount}>{view.headline}</div>
          {view.dueText && <div className={classes.heroDue}>{view.dueText}</div>}
        </div>
      </div>

      <div className={classes.card}>
        <div>
          <div className={classes.label}>{view.clientLabel}</div>
          <div className={classes.clientName}>{client.name || 'Client name'}</div>
          {client.address && <div className={classes.lines}>{client.address}</div>}
          {client.gstin && <div className={classes.strong}>GSTIN {client.gstin}</div>}
          {view.clientContact && <div className={classes.lines}>{view.clientContact}</div>}
        </div>
        <dl className={classes.meta}>
          {view.meta.map(([label, value]) => (
            <div key={label} className={classes.metaRow}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <table className={classes.items}>
        <thead>
          <tr>
            <th className={classes.index}>#</th>
            <th>Item &amp; Description</th>
            <th className={classes.num}>Qty</th>
            <th className={classes.num}>Rate</th>
            <th className={classes.num}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {view.items.map((item, index) => (
            <tr key={item.id}>
              <td className={classes.index}>{String(index + 1).padStart(2, '0')}</td>
              <td>{item.description}</td>
              <td className={classes.num}>{item.quantity}</td>
              <td className={classes.num}>{view.money(item.rate)}</td>
              <td className={classes.num}>{view.money(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={classes.summary}>
        <div>
          <div className={classes.label}>Amount in words</div>
          <div className={classes.words}>{view.words}</div>
        </div>
        <div className={classes.totals}>
          {view.totalRows.map(([label, value]) => (
            <div key={label} className={classes.totalRow}>
              <span>{label}</span>
              <span>{value}</span>
            </div>
          ))}
          {view.isInvoice && view.draft.amountPaid > 0 && (
            <div className={classes.totalRow}>
              <span>Payment Made</span>
              <span>(−) {view.money(view.draft.amountPaid)}</span>
            </div>
          )}
          <div className={`${classes.totalRow} ${classes.grandRow}`}>
            <span>{view.headlineLabel}</span>
            <span>{view.headline}</span>
          </div>
        </div>
      </div>

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
          <span className={classes.lines}>For {from.name || 'your business'}</span>
          <span className={classes.signLine}>Authorised Signatory</span>
        </div>
      </div>
    </>
  );
}
