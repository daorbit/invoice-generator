import type { DocumentView } from '../useDocumentView';
import { UpiQr, pageClasses } from './PageShell';
import { ItemText } from './Extras';
import classes from './Spreadsheet.module.css';

export function SpreadsheetTemplate({ view }: { view: DocumentView }) {
  const { from, client } = view;

  return (
    <div className={classes.sheet}>
      <div className={classes.row}>
        <div className={classes.cell}>
          {view.logo && <img src={view.logo} alt="" className={classes.logo} />}
          <div className={classes.orgName}>{from.name || 'Your business'}</div>
          {from.address && <div className={classes.lines}>{from.address}</div>}
          {from.gstin && <div className={classes.strong}>GSTIN {from.gstin}</div>}
          {view.fromContact && <div className={classes.lines}>{view.fromContact}</div>}
        </div>
        <div className={`${classes.cell} ${classes.titleCell}`}>
          <div className={classes.title}>{view.heading}</div>
          <div className={classes.number}># {view.number}</div>
        </div>
      </div>

      <div className={classes.row}>
        <div className={classes.cell}>
          <div className={classes.label}>{view.clientLabel}</div>
          <div className={classes.clientName}>{client.name || 'Client name'}</div>
          {client.address && <div className={classes.lines}>{client.address}</div>}
          {client.gstin && <div className={classes.strong}>GSTIN {client.gstin}</div>}
          {view.clientContact && <div className={classes.lines}>{view.clientContact}</div>}
        </div>
        <div className={classes.cell}>
          <dl className={classes.meta}>
            {view.meta.map(([label, value]) => (
              <div key={label} className={classes.metaRow}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div className={classes.block}>
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
                <td className={classes.index}>{index + 1}</td>
                <td><ItemText item={item} view={view} /></td>
                <td className={classes.num}>{view.qty(item)}</td>
                <td className={classes.num}>{view.money(item.rate)}</td>
                <td className={classes.num}>{view.money(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={classes.summary}>
        <div className={classes.cell}>
          <div className={classes.label}>Total In Words</div>
          <div className={classes.words}>{view.words}</div>
        </div>
        <div className={classes.cell}>
          {view.totalRows.map(([label, value]) => (
            <div key={label} className={classes.totalRow}>
              <span>{label}</span>
              <span>{value}</span>
            </div>
          ))}
          <div className={`${classes.totalRow} ${classes.grandRow}`}>
            <span>Total</span>
            <span>{view.money(view.totals.total)}</span>
          </div>
          {view.isInvoice && view.draft.amountPaid > 0 && (
            <div className={classes.totalRow}>
              <span>Payment Made</span>
              <span>(−) {view.money(view.draft.amountPaid)}</span>
            </div>
          )}
          <div className={`${classes.totalRow} ${classes.dueRow}`}>
            <span>{view.headlineLabel}</span>
            <span>{view.headline}</span>
          </div>
        </div>
      </div>

      {view.payment.length > 0 && (
        <div className={`${classes.block} ${classes.cell} ${classes.paymentCell}`}>
          <div>
            <div className={classes.label}>Payment Details</div>
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

      <div className={`${classes.row} ${classes.footerRow} ${pageClasses.push}`}>
        <div className={classes.cell}>
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
        <div className={`${classes.cell} ${classes.signature}`}>
          <span className={classes.lines}>For {from.name || 'your business'}</span>
          <span className={classes.signLine}>Authorized Signatory</span>
        </div>
      </div>
    </div>
  );
}
