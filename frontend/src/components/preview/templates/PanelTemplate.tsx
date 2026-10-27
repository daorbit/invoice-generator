import type { DocumentView } from '../useDocumentView';
import { pageClasses } from './PageShell';
import { AmountWords, PaymentStrip, ItemText } from './Extras';
import classes from './Panel.module.css';

export function PanelTemplate({ view }: { view: DocumentView }) {
  const { from, client, draft } = view;
  const facts: [string, string][] = [
    [view.isInvoice ? 'Invoice number:' : 'Quote number:', view.number],
    ['Issued:', view.issueDate],
  ];
  if (view.dueDate) facts.push([`${view.dueLabel}:`, view.dueDate]);

  return (
    <>
      <div className={classes.panel}>
        <div className={classes.panelTop}>
          <div className={classes.title}>{view.heading}</div>
          {view.logo ? (
            <img src={view.logo} alt="" className={classes.logo} />
          ) : (
            <span className={classes.brandText}>{from.name}</span>
          )}
        </div>
        <div className={classes.grid}>
          <div>
            <div className={classes.heading}>{view.isInvoice ? 'Invoice Details:' : 'Quote Details:'}</div>
            <dl className={classes.facts}>
              {facts.map(([label, value]) => (
                <div key={label} className={classes.factRow}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <div className={classes.heading}>{from.name || 'Your business'}</div>
            {from.phone && <div className={classes.lines}>{from.phone}</div>}
            {from.address && <div className={classes.lines}>{from.address}</div>}
            {from.gstin && <div className={classes.lines}>GSTIN {from.gstin}</div>}
          </div>
          <div className={classes.clientCard}>
            <div className={classes.heading}>{view.isInvoice ? 'Invoice To:' : 'Quote For:'}</div>
            <div className={classes.clientName}>{client.name || 'Client name'}</div>
            {client.address && <div className={classes.lines}>{client.address}</div>}
            {client.gstin && <div className={classes.lines}>GSTIN {client.gstin}</div>}
            {view.clientContact && <div className={classes.lines}>{view.clientContact}</div>}
          </div>
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
              <td><ItemText item={item} view={view} /></td>
              <td className={classes.num}>{view.qty(item)}</td>
              <td className={classes.num}>{view.money(item.rate)}</td>
              <td className={classes.num}>{view.money(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={classes.totals}>
        {view.totalRows.length > 1 &&
          view.totalRows.map(([label, value]) => (
            <div key={label} className={classes.breakdownRow}>
              <span>{label}</span>
              <span>{value}</span>
            </div>
          ))}
        <div className={classes.grandLabel}>{view.isInvoice ? 'Total amount:' : 'Quote total:'}</div>
        <div className={classes.grand}>{view.headline}</div>
      </div>
      <AmountWords view={view} />
      <PaymentStrip view={view} />

      {(draft.terms || draft.notes) && (
        <div className={classes.terms}>
          <div className={classes.termsTitle}>{draft.terms ? `${view.termsLabel}:` : 'Notes:'}</div>
          <div className={classes.termsText}>{draft.terms || draft.notes}</div>
        </div>
      )}

      <div className={`${classes.footer} ${pageClasses.push}`}>
        <div>
          <div className={classes.footName}>{from.name || 'Your business'}</div>
          {from.website && <div className={classes.lines}>{from.website}</div>}
          {view.fromContact && <div className={classes.lines}>{view.fromContact}</div>}
        </div>
        <span className={classes.signLine}>Authorised signatory</span>
      </div>
    </>
  );
}
