import type { DocumentView } from '../useDocumentView';
import { pageClasses } from './PageShell';
import { AmountWords, NotesAndSignature, PaymentStrip } from './Extras';
import classes from './Banner.module.css';

export function BannerTemplate({ view }: { view: DocumentView }) {
  const { from, client } = view;

  return (
    <>
      <div className={classes.hero}>
        <div>
          <div className={classes.title}>{view.heading}</div>
          <div className={classes.heroMeta}>Nº: {view.number}</div>
          <div className={classes.heroMeta}>Date: {view.issueDate}</div>
          {view.dueDate && (
            <div className={classes.heroMeta}>
              {view.dueLabel}: {view.dueDate}
            </div>
          )}
          {view.logo && (
            <span className={classes.logoChip}>
              <img src={view.logo} alt="" className={classes.logo} />
            </span>
          )}
        </div>
        <div>
          <div className={classes.partyName}>{from.name || 'Your business'}</div>
          {view.fromContact && <div className={classes.heroLines}>{view.fromContact}</div>}
          {from.address && <div className={classes.heroLines}>{from.address}</div>}
          {from.gstin && <div className={classes.heroLines}>GSTIN {from.gstin}</div>}
        </div>
        <div>
          <div className={classes.partyName}>{client.name || 'Client name'}</div>
          {view.clientContact && <div className={classes.heroLines}>{view.clientContact}</div>}
          {client.address && <div className={classes.heroLines}>{client.address}</div>}
          {client.gstin && <div className={classes.heroLines}>GSTIN {client.gstin}</div>}
        </div>
      </div>

      <div className={classes.body}>
        <table className={classes.table}>
          <thead>
            <tr>
              <th>Item</th>
              <th className={classes.num}>Quantity</th>
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
          {view.totalRows.map(([label, value]) => (
            <div key={label} className={classes.totalRow}>
              <span>{label}:</span>
              <span>{value}</span>
            </div>
          ))}
          <span className={classes.grandLabel}>{view.isInvoice ? 'Total due:' : 'Quote total:'}</span>
          <span className={classes.grand}>{view.headline}</span>
        </div>
        <AmountWords view={view} />
        <PaymentStrip view={view} />

        <div className={pageClasses.push}>
          <NotesAndSignature view={view} />
        </div>
      </div>
    </>
  );
}
