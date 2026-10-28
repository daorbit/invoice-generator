import type { DocumentView } from '../useDocumentView';
import { UpiQr, pageClasses } from './PageShell';
import { ClientAddress, ClientName, ItemQty, ItemRate, ItemText, NoteText } from './Extras';
import { InlineText } from '../inline/InlineText';
import { NOTES } from '../inline/inlineTargets';
import classes from './Studio.module.css';

export function StudioTemplate({ view }: { view: DocumentView }) {
  const { from, client, draft } = view;
  const payment = draft.payment;

  return (
    <div className={classes.root}>
      <div className={classes.top}>
        <div className={classes.brand}>
          {view.logo && <img src={view.logo} alt="" className={classes.logo} />}
          <div>
            <div className={classes.name}>{from.name || 'Your business'}</div>
            {from.email && <div className={classes.lines}>{from.email}</div>}
            {from.phone && <div className={classes.lines}>{from.phone}</div>}
            {from.gstin && <div className={classes.lines}>GSTIN {from.gstin}</div>}
          </div>
        </div>
        <div>
          <div className={classes.title}>{view.heading}</div>
          <div className={classes.number}>#{view.number}</div>
        </div>
      </div>

      <div className={classes.facts}>
        <div>
          <div className={classes.label}>{view.clientLabel}</div>
          <ClientName view={view} className={classes.clientName} />
          <ClientAddress view={view} className={classes.lines} />
          {client.gstin && <div className={classes.lines}>GSTIN {client.gstin}</div>}
          {view.clientContact && <div className={classes.lines}>{view.clientContact}</div>}
        </div>
        <div>
          <div className={classes.dateBlock}>
            <div className={classes.label}>{view.isInvoice ? 'Invoice date' : 'Quote date'}</div>
            <div className={classes.date}>{view.issueDate}</div>
          </div>
          {view.dueDate && (
            <div className={classes.dateBlock}>
              <div className={classes.label}>{view.dueLabel}</div>
              <div className={classes.date}>{view.dueDate}</div>
            </div>
          )}
        </div>
        <div className={classes.dueBox}>
          <div className={classes.label}>{view.headlineLabel}</div>
          <span className={classes.highlight}>{view.headline}</span>
        </div>
      </div>

      <table className={classes.table}>
        <thead>
          <tr>
            <th className={classes.index}>#</th>
            <th>Title / Description</th>
            <th className={classes.num}>Qty</th>
            <th className={classes.num}>Rate</th>
            <th className={classes.num}>Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {view.items.map((item, index) => (
            <tr key={item.id}>
              <td className={classes.index}>{index + 1}</td>
              <td><ItemText item={item} view={view} /></td>
              <td className={classes.num}><ItemQty item={item} view={view} /></td>
              <td className={classes.num}><ItemRate item={item} view={view} /></td>
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
        <div className={`${classes.totalRow} ${classes.grand}`}>
          <span>Total</span>
          <span>{view.money(view.totals.total)}</span>
        </div>
      </div>
      <div className={classes.words}>{view.words}</div>
      {draft.terms && <NoteText kind="terms" value={draft.terms} className={classes.note} />}

      <div className={`${classes.footer} ${pageClasses.push}`}>
        <InlineText
          block
          multiline
          className={classes.thanks}
          target={NOTES}
          value={draft.notes}
          fallback="Thank you for the business!"
          label="Notes"
        />
        {view.payment.length > 0 && (
          <>
            <div className={`${classes.infoHead} ${classes.label}`}>Payment info</div>
            <div className={classes.info}>
              <div className={classes.infoCell}>
                <div className={classes.infoValue}>{payment?.accountName || from.name}</div>
                {from.address && <div className={classes.lines}>{from.address}</div>}
              </div>
              {payment?.bankName && (
                <div className={classes.infoCell}>
                  <div className={classes.infoLabel}>Bank name</div>
                  <div className={classes.infoValue}>{payment.bankName}</div>
                </div>
              )}
              {payment?.ifsc && (
                <div className={classes.infoCell}>
                  <div className={classes.infoLabel}>IFSC</div>
                  <div className={classes.infoValue}>{payment.ifsc}</div>
                </div>
              )}
              {payment?.accountNumber && (
                <div className={classes.infoCell}>
                  <div className={classes.infoLabel}>Account #</div>
                  <div className={classes.infoValue}>{payment.accountNumber}</div>
                </div>
              )}
              <UpiQr src={view.qr} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
